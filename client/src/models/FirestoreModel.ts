import firebase from "firebase/app"
import "firebase/firestore"

// Base interface for all of the project's document models
// The generic type represents this implementer's true shape in firestore
export interface FirestoreModel<T> {
    // The reference to the implementer's document in firestore
    ref: firebase.firestore.DocumentReference<T>
    // A method that saves this implementer to firestore
    save(): Promise<void>
    // A method that deletes this implementer from firestore
    delete(): Promise<void>
}
