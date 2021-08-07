import { useEffect } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import { getUser } from "../../firebase"

export function DeleteScreen() {
    const location = useLocation<{ uid?: string }>()
    const history = useHistory()

    useEffect(() => {
        getUser(location.state.uid!)
            .then((user) => {
                return user.delete()
            })
            .then(() => {
                history.replace("/", {})
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
