import { createContext, useContext } from "react"
import { User } from "./models"

interface LoginContextValue {
    currentUser: User | null
    setCurrentUser: (newUser: User | null) => void
}

/**
 * This context is a global state which is accessible by all components. In our case, the context will store the
 * current logged in user, and a function to change the logged in user.
 */
export const LoginContext = createContext<LoginContextValue>({
    currentUser: null,
    setCurrentUser: (newUser) => {},
})

/**
 * Custom hook that returns the current context object above.
 */
export function useAuth() {
    return useContext(LoginContext)
}
