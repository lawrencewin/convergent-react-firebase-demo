import { useState } from "react"
import { Box, Grid, Typography, Paper, TextField, Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
    loginBox: {
        width: "90%",
        maxWidth: "600px",
        marginTop: "30vh"
    }
})

export default function Login (props) {
    const [ username, setUsername ] = useState("")
    const [ password, setPassword ] = useState("")

    const styles = useStyles()

    const handleUsernameChange = (e) => setUsername(e.target.value)
    const handlePasswordChange = (e) => setPassword(e.target.value)
    const handleLogin = (e) => {
        console.log(username, password)
    }

    return (
        <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item className={styles.loginBox}>
                <Paper>
                    <Grid container spacing={2} justifyContent="center" direction="column">
                        <Grid item>
                            <Box px={2}>
                                <Typography variant="h5" align="center">Login</Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box px={2}>
                                <TextField fullWidth variant="filled" label="Username" value={username} onChange={handleUsernameChange} />
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box px={2}>
                                <TextField fullWidth variant="filled" label="Password" type="password" value={password} onChange={handlePasswordChange} />
                            </Box>
                        </Grid>
                        
                        <Grid item>
                            <Box px={8}>
                                <Grid container spacing={2} direction="column" justifyContent="space-evenly" alignItems="stretch">
                                    <Grid item>
                                        <Button fullWidth variant="contained" color="primary">Login</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button fullWidth variant="contained">Login with Google</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button fullWidth variant="contained">Login with Facebook</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    )
        
}