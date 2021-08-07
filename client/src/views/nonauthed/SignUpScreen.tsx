import { ChangeEvent, Fragment, useState } from "react"
import { client } from "../../firebase"
import styles from "./NonAuthedScreens.module.css"

const MIN_PASS_LENGTH = 8

export function SignUpScreen(props: any) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
    const handleConfirmedPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setConfirmedPassword(e.target.value)
    const handleSignUp = async () => {
        if (email.length === 0) {
            setErrorMessage("Email must be filled out.")
        } else if (password.length < MIN_PASS_LENGTH) {
            setErrorMessage(`Password must have at least ${MIN_PASS_LENGTH} characters.`)
        } else if (password.search(/\d/) === -1) {
            setErrorMessage("Password must contain at least one number.")
        } else if (password.search(/[a-z]/) === -1) {
            setErrorMessage("Password must contain at least one lowercase letter.")
        } else if (password.search(/[A-Z]/) === -1) {
            setErrorMessage("Password must contain at least one uppercase letter.")
        } else if (password.search(/[!@#$%^&*()?]/) === -1) {
            setErrorMessage("Password must contain at least one special character.")
        } else if (password !== confirmedPassword) {
            setErrorMessage("Passwords do not match.")
        } else {
            try {
                // create account and automatically sign user in
                await client.auth().createUserWithEmailAndPassword(email, password)
            } catch (error) {
                setErrorMessage(error.message)
            }
        }
    }

    return (
        <Fragment>
            <h2 style={{ textAlign: "center" }}>Sign Up</h2>
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
                    />
                </div>
                <div className={styles.inputLabelGroup}>
                    <label className={styles.inputLabel} htmlFor="passwordInput">
                        Confirm Password
                    </label>
                    <input
                        id="passwordInput"
                        className={styles.textInput}
                        type="password"
                        value={confirmedPassword}
                        onChange={handleConfirmedPasswordChange}
                    />
                </div>
            </div>
            {errorMessage && (
                <div className={styles.error}>
                    <p>Error: {errorMessage}</p>
                </div>
            )}
            <div className={styles.buttons}>
                <button onClick={handleSignUp} className={styles.loginButton}>
                    Sign Up Now
                </button>
            </div>
        </Fragment>
    )
}
