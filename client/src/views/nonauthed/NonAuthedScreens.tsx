import { useEffect } from "react"
import { Switch, Route } from "react-router-dom"
import { LoginScreen } from "./LoginScreen"
import { SignUpScreen } from "./SignUpScreen"
import { ErrorScreen } from "./ErrorScreen"
import { useAuth } from "../../context"
import { client, getUser, createUserSnapshotListener } from "../../firebase"
import styles from "./NonAuthedScreens.module.css"
import { DeleteScreen } from "./DeleteScreen"

/**
 * Component that renders all non authed routes, which mainly include the login and sign up pages
 *
 * Handles logic to redirect a user to the authed routes if a successful login occurs
 */
export function NonAuthedScreens() {
    const { setCurrentUser } = useAuth()

    useEffect(() => {
        // This onAuthStateChanged function calls the passed function whenever someone successfully signs up or logs in.
        // This also maintains login persistence, allowing a user to stay signed after multiple sessions.
        const unsubscribe = client.auth().onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userObject = await getUser(user.uid)
                    setCurrentUser(userObject)
                } catch (error) {
                    // User hasn't been created in firebase yet, wait until it is by binding a snapshot listener to the ref
                    // where it should exist
                    const firestoreUnsub = createUserSnapshotListener(user.uid, (newUser) => {
                        if (newUser) {
                            firestoreUnsub()
                            setCurrentUser(newUser)
                        }
                    })
                }
            }
        })
        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.container}>
            <main className={styles.window}>
                <Switch>
                    <Route exact path="/" component={LoginScreen} />
                    <Route path="/signup" component={SignUpScreen} />
                    <Route path="/error" component={ErrorScreen} />
                    <Route path="/delete" component={DeleteScreen} />
                </Switch>
            </main>
        </div>
    )
}
