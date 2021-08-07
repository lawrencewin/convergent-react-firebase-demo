import firebase from "firebase/app"
import "firebase/auth"

// This is not being used
// TODO: implement facebook authentication as a login method
export const facebookProvider = new firebase.auth.FacebookAuthProvider()
export const googleProvider = new firebase.auth.GoogleAuthProvider()
