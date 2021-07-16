import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route } from "react-router-dom"
import Login from "./views/Login"
import "./App.css"

function App() {
    const [ authenticated, setAuthenticated ] = useState(false)

    useEffect(() => {
        setAuthenticated(false)
    }, [])

    if (!authenticated) {
        return <Login />
    }

    return (
        <Router>
            <Route exact path="/">
                {/* insert home */}
            </Route>
            <Route path="/user"></Route>
        </Router>
    )
}

export default App
