import { useEffect } from "react"
import { useLocation, useHistory, Redirect } from "react-router-dom"

export function ErrorScreen() {
    const location = useLocation<{ error?: string } | undefined>()
    const history = useHistory<{ error?: string }>()

    useEffect(() => {
        return () => {
            // clear state
            const state = { ...history.location.state }
            delete state.error
            history.replace({ ...history.location, state })
        }
    })

    if (!location.state || (location.state && !location.state.error)) {
        return <Redirect to="/" />
    } else {
        return (
            <div
                style={{
                    display: "flex",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <h6 style={{ color: "#bf2b2b" }}>
                    Error: <strong>{location.state.error}</strong>
                </h6>
            </div>
        )
    }
}
