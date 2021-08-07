import { Fragment } from "react"
import { useLocation, Redirect } from "react-router-dom"

export function ErrorScreen() {
    const { state } = useLocation<any>()
    if (!state) {
        return <Redirect to="/" />
    }
    return (
        <Fragment>
            <h3>Error</h3>
            <p>{state.error ?? "Something messed up ¯_(ツ)_/¯."}</p>
        </Fragment>
    )
}
