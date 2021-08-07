import { useState, useEffect } from "react"
import { useParams, Redirect } from "react-router-dom"
import { ConversationMessageBatch, ConversationChatbox } from "../../components"
import { createConversationSnapshotListener, createConversationMessagesSnapshotListener } from "../../firebase"
import { Conversation, Message, User } from "../../models"
import { useAuth } from "../../context"
import styles from "./ConversationWindow.module.css"

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif"]

/**
 * Turns a 1-d array of messages into a 2d array of messages grouped by user
 * e.g. given a conversation with user's a and b, and given the message list: [a, a, b, a, b, b]
 * the resulting array should be sorted into: [[a, a], [b], [a], [b, b]]
 */
function deepen(messages: Message[]): Message[][] {
    const ret: Message[][] = []
    let curr: Message[] = []
    let currId = ""
    for (const message of messages) {
        if (currId && currId !== message.sender.id) {
            // switch
            ret.push(curr)
            curr = [message]
        } else {
            // add to curr
            curr.unshift(message)
        }
        currId = message.sender.id
    }
    if (curr.length > 0) {
        ret.push(curr)
    }
    return ret
}

// The main window where conversation messages are being streamed, rendered by AuthedScreens
export function ConversationWindow() {
    // conversationId is retrieved from the URL
    const { conversationId } = useParams<{ conversationId: string }>()

    // Retrieved from the App component
    const { currentUser } = useAuth()

    const [recipient, setRecipient] = useState<User | null>(null)
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loadingError, setLoadingError] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [recipientIsTyping, setRecipientIsTyping] = useState<boolean>(false)
    const [redirectWithoutError, setRedirectWithoutError] = useState<boolean>(false)

    // On component mounting, we start listening to both changes to this conversation document (when a user is typing) and
    // new documents from the nested collection of messages
    useEffect(() => {
        const unsubscribeToConversation = createConversationSnapshotListener(conversationId, (conv, error) => {
            if (conv) {
                if (conv.users.findIndex((user) => user.id === currentUser!.id) > -1) {
                    const recipient = conv.users.find((user) => user.id !== currentUser!.id)!
                    setRecipient(recipient)
                    setConversation(conv)
                    setRecipientIsTyping(conv.usersTyping[recipient.id] === true)
                } else {
                    setLoadingError("Forbidden conversation.")
                }
            } else {
                if (error) {
                    setLoadingError(error!.message)
                } else {
                    // TODO: This is intended to be called when a conversation deletes itself, but it is never actually called.
                    // How should we go about fixing this?
                    setRedirectWithoutError(true)
                }
            }
        })
        const unsubscribeToMessages = createConversationMessagesSnapshotListener(conversationId, (messages, error) => {
            if (messages) {
                setMessages(messages)
            } else {
                setLoadingError(error!.message)
            }
        })
        // Stop listening once this component stops rendering
        return () => {
            unsubscribeToConversation()
            unsubscribeToMessages()
        }
    }, [currentUser, conversationId])

    // Redirect if there's an error set during snapshot update
    if (loadingError !== null) {
        return (
            <Redirect
                to={{
                    pathname: "/error",
                    state: { error: loadingError },
                }}
            />
        )
    }

    // We redirect if the conversation we're listening to is deleted
    if (redirectWithoutError) {
        return <Redirect to="/" />
    }

    if (conversation === null) {
        // set loading
        return null
    }

    // passed into ConversationChatbox component, called when a user submits their message
    const handleMessageSend = (message: string, file?: File) => {
        if (message.length === 0 && !file) {
            setError("Cannot send empty message.")
        } else if (file && !ALLOWED_TYPES.includes(file.type)) {
            setError("Invalid file type.")
        } else {
            conversation.addMessage(currentUser!, message, file)
        }
    }

    // passed into ConvergentChatbox
    const handleTypingStart = async () => {
        await conversation.setUserTyping(currentUser!, true)
    }

    // passed into ConvergentChatbox
    const handleTypingStop = async () => {
        await conversation.setUserTyping(currentUser!, false)
    }

    return (
        <div className={styles.conversationWindowContainer}>
            <div className={styles.conversationWindow}>
                {/* Render message stream here */}
                {conversation ? (
                    deepen(messages).map((messageBatch, i) => {
                        return <ConversationMessageBatch key={i} messages={messageBatch} />
                    })
                ) : (
                    <p>No messages yet.</p>
                )}
            </div>
            <div className={styles.notificationBar}>
                {recipientIsTyping && (
                    <div className={styles.typingText}>{recipient!.name ?? recipient!.username} is typing</div>
                )}
                {error !== null && <div className={styles.notificationError}>{error}</div>}
            </div>
            {/* Render chatbox here */}
            <ConversationChatbox
                onMessageSend={handleMessageSend}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
            />
        </div>
    )
}
