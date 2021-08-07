import { Fragment } from "react"
import { Trash2 } from "react-feather"
import { Message, Reaction } from "../models"
import { timestampString } from "../utils/date"
import { useAuth } from "../context"
import styles from "./ConversationMessage.module.css"
import { ProfileImage } from "./ProfileImage"

interface ConversationMessageBatchProps {
    messages: Message[]
}

export function ConversationMessageBatch({ messages }: ConversationMessageBatchProps) {
    const { currentUser } = useAuth()

    const handleMessageLove = (message: Message) => {
        message.loveReact(currentUser!)
    }

    const handleMessageHate = (message: Message) => {
        message.angryReact(currentUser!)
    }

    const handleMessageDelete = (message: Message) => {
        message.delete()
    }

    const user = messages[0].sender
    const isCurrentUser = user.id === currentUser!.id
    return (
        <div className={`${styles.conversationContainer} ${!isCurrentUser ? styles.left : ""}`}>
            {user && (
                <div className={styles.conversationProfile}>
                    <ProfileImage user={user} />
                </div>
            )}
            <div className={styles.conversationBubbleContainer}>
                {messages.map((message, i) => {
                    const { message: messageText, media, reaction, sendDate } = message
                    const operations = isCurrentUser
                        ? {
                              onDelete: () => handleMessageDelete(message),
                          }
                        : {
                              onLove: () => handleMessageLove(message),
                              onHate: () => handleMessageHate(message),
                          }
                    return (
                        <Fragment key={i}>
                            {media && (
                                <div className={styles.conversationMedia}>
                                    <img className={styles.conversationImage} src={media.imageSource} alt="" />
                                </div>
                            )}
                            <ConversationMessageBubble message={messageText} reaction={reaction} {...operations} />
                            {i === messages.length - 1 && (
                                <div className={styles.conversationTimestamp}>{timestampString(sendDate)}</div>
                            )}
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

interface ConversationMessageBubbleProps {
    message: string
    reaction?: Reaction | null
    sentiment?: number
    onLove?: () => void
    onHate?: () => void
    onDelete?: () => void
}

function ConversationMessageBubble({
    message,
    reaction,
    sentiment,
    onLove,
    onHate,
    onDelete,
}: ConversationMessageBubbleProps) {
    return (
        <div className={styles.bubbleContainer}>
            <div className={styles.conversationBubble}>
                <span className={styles.bubbleMessage}>{message}</span>
                {reaction &&
                    (reaction === Reaction.Angry ? (
                        <button onClick={onHate} className={styles.bubbleReaction}>
                            {"😡"}
                        </button>
                    ) : (
                        <button onClick={onLove} className={styles.bubbleReaction}>
                            {"😍"}
                        </button>
                    ))}
                {sentiment && <div className={styles.sentimentBubble}>Sentiment: {sentiment}</div>}
            </div>
            <div className={styles.bubbleOperations}>
                {onLove && (
                    <button onClick={onLove} className={styles.emojiOperation}>
                        😍
                    </button>
                )}
                {onHate && (
                    <button onClick={onHate} className={styles.emojiOperation}>
                        😡
                    </button>
                )}
                {onDelete && (
                    <button onClick={onDelete}>
                        <Trash2 size={16} color="#606060" />
                    </button>
                )}
            </div>
        </div>
    )
}
