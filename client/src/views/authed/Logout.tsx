import { useEffect } from "react"
import { useHistory } from "react-router-dom"
import firebase from "firebase/app"
import { ClipLoader } from "react-spinners"
import { useAuth } from "../../context"

export function LogoutScreen() {
    const { setCurrentUser } = useAuth()
    const history = useHistory()

    useEffect(() => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                setCurrentUser(null)
                history.replace("/")
            })
    })

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
                Logging out...
            </h6>
        </div>
    )
}
