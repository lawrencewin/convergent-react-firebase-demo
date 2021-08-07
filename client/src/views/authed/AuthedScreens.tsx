import { useState, useEffect } from "react"
import { Route, Switch, useLocation } from "react-router-dom"
import { Navbar, ConversationList } from "../../components"
import { ConversationPointer } from "../../models"
import { ConversationWindow } from "./ConversationWindow"
import { useAuth } from "../../context"
import { ConversationRedirect } from "./ConversationRedirect"
import { ErrorScreen } from "./ErrorScreen"
import { createConversationPointersSnapshotListener } from "../../firebase"
import { ProfileModal } from "./ProfileModal"
import { LogoutScreen } from "./Logout"
import styles from "./AuthedScreens.module.css"

// Component that encompasses all of the authenticated routes, shows after you log in
export function AuthedScreens() {
    const { currentUser } = useAuth()

    const [conversationPointers, setConversationPointers] = useState<ConversationPointer[]>([])

    const location = useLocation<{ background: Location }>()
    const modalBackground = location.state && location.state.background

    // When we log in, we want to listen to the logged in user's conversation pointers to watch for new messages
    useEffect(() => {
        const unsubscribe = createConversationPointersSnapshotListener(currentUser!.id, (convPtr, error) => {
            if (convPtr) {
                setConversationPointers(convPtr)
            } else {
            }
        })
        return () => unsubscribe()
    }, [currentUser])

    return (
        <div className={styles.baseWrapper}>
            <Navbar title="Convergent Chat" profile={currentUser!} />
            <div className={styles.conversationWrapper}>
                {/* Sidebar */}
                <aside className={styles.conversationBar}>
                    <ConversationList conversationPointers={conversationPointers} />
                </aside>
                <main className={styles.conversationWindow}>
                    {/* Most routes are encompassed within this switch to ensure that only one is showing at any time */}
                    <Switch location={(modalBackground || location) as any}>
                        {/* Both the conversation and user routes have a variable route, marked by the variable names, :conversationId and :uid.
                            These are obtained through the useParams() hook. */}
                        <Route path="/conversation/:conversationId" component={ConversationWindow} />
                        <Route path="/user/:uid" component={ConversationRedirect} />
                        <Route path="/error" component={ErrorScreen} />
                        <Route exact path="/">
                            <p
                                style={{
                                    alignSelf: "center",
                                    height: "50%",
                                }}
                            >
                                Nothing's here.
                            </p>
                        </Route>
                        <Route path="/logout" component={LogoutScreen} />
                    </Switch>
                    {/* This route is not encompassed within the switch, as this profile modal will overlay over the contents of the current route instead of replace. */}
                    <Route path="/profile" component={ProfileModal} />
                </main>
            </div>
        </div>
    )
}
