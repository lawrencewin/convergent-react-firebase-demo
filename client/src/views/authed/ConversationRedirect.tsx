import { useEffect, useState } from "react"
import { useParams, Redirect } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import { useAuth } from "../../context"

export function ConversationRedirect() {
    const { uid } = useParams<{ uid: string }>()
    const { currentUser } = useAuth()

    const [convId, setConvId] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const asyncFunc = async () => {
            try {
                const convPtr = await currentUser!.getConversationRef(uid)
                let id: string
                if (!convPtr) {
                    const conversation = await currentUser!.createConversation(uid)
                    id = conversation.id
                } else {
                    id = convPtr.conversationRef.id
                }
                setConvId(id)
            } catch (error) {
                setErrorMessage(error.message)
            }
            setLoading(false)
        }
        asyncFunc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <ClipLoader size={50} color="#109fe0" />
                <h6
                    style={{
                        display: "block",
                        margin: "8px 0",
                    }}
                >
                    Loading...
                </h6>
            </div>
        )
    }

    return (
        <Redirect
            to={{
                pathname: convId ? `/conversation/${convId}` : "/error",
                state: errorMessage && { error: errorMessage },
            }}
        />
    )
}
