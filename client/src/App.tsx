import { useState, useEffect } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { NonAuthedScreens, AuthedScreens } from "./views"
import { LoginContext } from "./context"
import { User } from "./models"
import { createUserSnapshotListener } from "./firebase"
import "./App.css"

/**
 * This is the main component that gets rendered.
 */
function App() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        if (user) {
            // Whenever we make changes to the user document in our firestore database, this
            // listener will automatically fetch those updates for us to ouse.
            const unsubscribe = createUserSnapshotListener(user.id, (updatedUser) => {
                if (updatedUser) {
                    setUser(updatedUser)
                }
            })
            return () => unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Here, we set up our context object, a global state, from src/context.ts and pass the user stored in
     * this component's state, as well as a function to change it. Because both AuthedScreens and NonAuthedScreens
     * are nested as children components, they will be able to make use of the context.
     */
    return (
        <Router>
            <LoginContext.Provider
                value={{
                    currentUser: user,
                    setCurrentUser: setUser,
                }}
            >
                {user !== null ? <AuthedScreens /> : <NonAuthedScreens />}
            </LoginContext.Provider>
        </Router>
    )
}

export default App
