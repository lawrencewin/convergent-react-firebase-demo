import { Fragment, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ConversationPointer, User } from "../models"
import { diffSinceNow } from "../utils/date"
import styles from "./ConversationList.module.css"
import { ProfileImage } from "./ProfileImage"

interface ConversationListProps {
    conversationPointers: ConversationPointer[]
}

// List of conversation previews in the app sidebar. Organizes each conversation by date
export function ConversationList({ conversationPointers }: ConversationListProps) {
    const conversationListItems = conversationPointers.map(
        ({ recipient, activityMessage, latestActivity, conversationRef }, i) => {
            if (recipient) {
                return (
                    <ConversationListItem
                        key={i}
                        recipient={recipient}
                        activityMessage={activityMessage}
                        latestActivity={latestActivity}
                    />
                )
            } else {
                return null
            }
        }
    )

    return <Fragment>{conversationListItems}</Fragment>
}

interface ConversationListItemProps {
    recipient: User
    activityMessage: string
    latestActivity: Date
}

// Individual conversation item in sidebar, formats date and time from parent
function ConversationListItem({ recipient, activityMessage, latestActivity }: ConversationListItemProps) {
    const [time, setTime] = useState<number>(-1)
    const [unit, setUnit] = useState<string>("")

    useEffect(() => {
        const setDiff = () => {
            const [newTime, newUnit] = diffSinceNow(latestActivity)
            setTime(newTime)
            setUnit(newUnit)
        }
        setDiff()
        const interval = setInterval(setDiff, 5000)
        return () => clearInterval(interval)
    })

    return (
        <Link className={styles.link} to={`/user/${recipient.id}`}>
            <div className={styles.listItem}>
                <div className={styles.listItemPicture}>
                    <ProfileImage user={recipient} />
                </div>
                <div className={styles.listItemText}>
                    <h5 className={styles.listItemName}>{recipient.name ?? recipient.username}</h5>
                    <div className={styles.listItemPreview}>
                        <span className={styles.listItemMessagePreview}>{activityMessage}</span>
                        <span className={styles.listItemLastSent}>{`${time}${unit}`}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
