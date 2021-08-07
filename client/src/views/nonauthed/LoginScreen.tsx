import { ChangeEvent, Fragment, KeyboardEvent, useState } from "react"
import { Link } from "react-router-dom"
import { client, googleProvider } from "../../firebase"
import { LoadingOverlay } from "../../components"
import styles from "./NonAuthedScreens.module.css"
import { ReactComponent as GoogleSvg } from "./search.svg"

interface LoginProps {
    onLogin: (b: boolean) => void
}

const allowedErrors = ["auth/cancelled-popup-request", "auth/popup-closed-by-user"]

export function LoginScreen(props: LoginProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [loggingIn, setLoggingIn] = useState(false)

    // Handlers for controlled textinputs
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)

    // Called on enter or on login click, calls google auth's email signin method
    const handleEmailLogin = async () => {
        if (email.length === 0) {
            setErrorMessage("Email is empty.")
        } else if (password.length === 0) {
            setErrorMessage("Password is empty.")
        } else {
            try {
                setLoggingIn(true)
                await client.auth().signInWithEmailAndPassword(email, password)
                setLoggingIn(false)
            } catch (error) {
                setErrorMessage(error.message)
            }
        }
    }

    // Called if we click the sign in with google button
    const handleGoogleLoginClick = async () => {
        try {
            setLoggingIn(true)
            await client.auth().signInWithRedirect(googleProvider)
            setLoggingIn(false)
        } catch (error) {
            if (!allowedErrors.includes(error.code)) {
                setErrorMessage(error.message)
            }
        }
    }

    const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleEmailLogin()
        }
    }

    return (
        <Fragment>
            {loggingIn && <LoadingOverlay message="Logging in" />}
            <h2 style={{ textAlign: "center" }}>Login</h2>
            {/* Inputs */}
            <div className={styles.inputBox}>
                <div className={styles.inputLabelGroup}>
                    <label className={styles.inputLabel} htmlFor="emailInput">
                        Email
                    </label>
                    <input
                        id="emailInput"
                        className={styles.textInput}
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onKeyDown={handleEnter}
                    />
                </div>
                <div className={styles.inputLabelGroup}>
                    <label className={styles.inputLabel} htmlFor="passwordInput">
                        Password
                    </label>
                    <input
                        id="passwordInput"
                        className={styles.textInput}
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyDown={handleEnter}
                    />
                </div>
            </div>
            {errorMessage && (
                <div className={styles.error}>
                    <p>Error: {errorMessage}</p>
                </div>
            )}
            <div className={styles.signupLinkContainer}>
                <Link to="/signup">No Account? Create One Here.</Link>
            </div>
            {/* Sign in buttons */}
            <div className={styles.buttons}>
                <button onClick={handleEmailLogin} className={styles.loginButton}>
                    Log In
                </button>
                <button onClick={handleGoogleLoginClick} className={styles.googleButton}>
                    <GoogleSvg className={styles.buttonSvg} />
                    Sign In With Google
                </button>
            </div>
        </Fragment>
    )
}
