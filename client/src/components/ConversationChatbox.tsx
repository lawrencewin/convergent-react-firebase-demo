import { KeyboardEvent, useState, useEffect, useRef, ChangeEvent, Fragment } from "react"
import { FilePlus, Send } from "react-feather"
import styles from "./ConversationChatbox.module.css"

// Returns a base64 string that can be used as an image source
function fileToBase64(file: File): Promise<string> {
    const reader = new FileReader()
    return new Promise<string>((resolve, reject) => {
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
    })
}

interface ConversationChatboxProps {
    onMessageSend?: (text: string, file?: File) => void
    onTypingStart?: (text: string) => void
    onTypingStop?: (text: string) => void
}

// This component lays out the bottom of the chat window with an image uploader and a textbox for typing.
// Used by ConversationWindow view.
export function ConversationChatbox({ onMessageSend, onTypingStart, onTypingStop }: ConversationChatboxProps) {
    const [text, setText] = useState<string>("")
    const [file, setFile] = useState<File | undefined>()
    const [base64, setBase64] = useState<string>()

    const [timeoutHandle, setTimeoutHandle] = useState<any>(undefined)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // This makes the textarea element grow in height as we type more
        textareaRef.current!.style.height = "inherit"
        const scrollHeight = textareaRef.current!.scrollHeight
        textareaRef.current!.style.height = `${scrollHeight}px`
    }, [text]) // executes each time text changes (so each time we type)

    // Triggers the file input window
    const handleUploadClick = () => {
        fileInputRef.current!.click()
    }

    // Called when we select a file. We set our file in our state and generate a base64 url for preview
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0]
        setFile(file)
        setBase64(await fileToBase64(file))
    }

    // Listens for an enter press
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            handleSubmit()
            e.preventDefault()
        }
    }

    // This function tracks when typing starts and stops. This is used to show the recipient if we're typing or not
    const handleKeyUp = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (timeoutHandle === undefined && onTypingStart) {
            onTypingStart(text)
        } else {
            clearTimeout(timeoutHandle)
        }
        const handle = setTimeout(() => {
            if (onTypingStop) {
                onTypingStop(text)
            }
            setTimeoutHandle(undefined)
        }, 1000)
        setTimeoutHandle(handle)
    }

    // Pass our message text and file to the parent component
    const handleSubmit = () => {
        if (text.length > 0 && onMessageSend) {
            onMessageSend(text, file)
            setText("")
            if (file) {
                fileInputRef.current!.value = ""
                setFile(undefined)
            }
        }
    }

    return (
        <Fragment>
            <div className={styles.chatbox}>
                <button className={styles.uploadButton} onClick={handleUploadClick}>
                    <FilePlus />
                    {file && base64 && (
                        <Fragment>
                            <div className={styles.badge} />
                            <div className={styles.imgPreview}>
                                <img src={base64} alt="Upload Preview" />
                            </div>
                        </Fragment>
                    )}
                </button>
                <textarea
                    className={styles.chatInput}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    ref={textareaRef}
                    value={text}
                ></textarea>
                <button onClick={handleSubmit} className={styles.submitButton}>
                    <Send />
                </button>
                <input hidden onChange={handleFileChange} ref={fileInputRef} type="file" />
            </div>
        </Fragment>
    )
}
