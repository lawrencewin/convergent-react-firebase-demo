import { auth, config, firestore } from "firebase-functions"
import firebase from "firebase-admin"
import algoliasearch from "algoliasearch"
import { ConversationPointerInFirestore, UserInFirestore } from "../../client/src/models"

const USER_COL = "users"
const CONVERSATION_COL = "conversations"
const MESSAGE_COL = "messages"

firebase.initializeApp()

const algolia = algoliasearch(config().algolia.appid, config().algolia.apikey)
const index = algolia.initIndex("Accounts")

export const authOnUserCreate = auth.user().onCreate(async (user) => {
    const firestore = firebase.app().firestore()
    const userObject: UserInFirestore = {
        id: user.uid,
        email: user.email!,
        username: user.email!.substring(0, user.email!.indexOf("@")),
        name: user.displayName,
        imageUrl: user.photoURL,
    }
    try {
        await firestore.collection(USER_COL).doc(user.uid).set(userObject)
        // Add name, username, and photo into algolia index
        await index.saveObject({
            objectID: userObject.id,
            username: userObject.username,
            name: userObject.name,
            imageUrl: userObject.imageUrl,
        })
    } catch (error) {
        console.error(`Failed to add user with uid ${user.uid}`)
    }
})

export const firestoreOnUserUpdate = firestore.document(`${USER_COL}/{userId}`).onUpdate(async (snap) => {
    const data = snap.after.data() as UserInFirestore
    // update index
    await index.partialUpdateObject({
        objectID: data.id,
        username: data.username,
        name: data.name,
        imageUrl: data.imageUrl,
    })
})

export const firestoreOnUserDelete = firestore.document(`${USER_COL}/{userId}`).onDelete(async (snap, context) => {
    const uid = context.params.userId
    console.log("Now deleting for user " + uid)
    // Remove name / username from algolia index
    await index.deleteObject(uid)
    console.log("Deleting user conversations")
    await deleteUserConversations(uid)
    console.log("Conversations deleted, deleting auth user")
    // delete auth user
    try {
        await firebase.auth().deleteUser(uid)
    } catch (error) {
        console.log(JSON.stringify(error, undefined, 2))
    }
})

// Returns a bulkWriter with my preferred settings and logging
function getBulkWriter() {
    const bulkWriter = firebase.app().firestore().bulkWriter()
    const MAX_RETRIES = 3
    bulkWriter.onWriteError((err) => {
        if (err.failedAttempts > MAX_RETRIES) {
            console.log("Stopping retry for", err.documentRef.path)
            return false
        } else {
            console.log("Retrying for", err.documentRef.path)
            return true
        }
    })
    bulkWriter.onWriteResult((res) => {
        console.log("Successfully deleted", res.path)
    })
    return bulkWriter
}

// Handles the delete of all dangling conversations and conversation pointers for a deleted user
async function deleteUserConversations(uid: string) {
    const firestore = firebase.app().firestore()
    const userCol = firestore.collection(USER_COL)
    const referencesToDelete: firebase.firestore.DocumentReference[] = []
    const queriesToResolve: Promise<firebase.firestore.QuerySnapshot>[] = []
    // Get our conversation refs. These will point to the conversations to delete, as well as users who have conversation refs we also need to delete.
    const ourConversationPointers = await userCol.doc(uid).collection(CONVERSATION_COL).get()
    for (const snap of ourConversationPointers.docs) {
        // push this reference for deletion
        referencesToDelete.push(snap.ref)
        // also push the conversation itself for deletion
        const data = snap.data() as ConversationPointerInFirestore
        referencesToDelete.push(data.conversationRef as any)
        // need to use query to get the opposing conversation ref to delete, will resolve later
        const recipientConversationQuery = userCol
            .doc(data.recipientUid)
            .collection(CONVERSATION_COL)
            .where("recipientUid", "==", uid)
            .get()
        queriesToResolve.push(recipientConversationQuery)
        // same for the conversation messages
        const conversationMessagesQuery = data.conversationRef.collection(MESSAGE_COL).get()
        queriesToResolve.push(conversationMessagesQuery as any)
    }
    // Now resolve the queries we sent and add the references to the delete queue
    const queries = await Promise.all(queriesToResolve)
    for (const query of queries) {
        for (const snap of query.docs) {
            referencesToDelete.push(snap.ref)
        }
    }
    // Set up a bulk writer for deletion. This makes our deletes run in parallel, making for faster execution.
    // It also lets us retry if any of the deletes go bad
    const bulkWriter = getBulkWriter()
    // Now start deleting
    for (const ref of referencesToDelete) {
        bulkWriter.delete(ref)
    }
    // Wait for everything to finish
    await bulkWriter.close()
    // We're done
    console.log("Bulk writer committed")
}

async function dropFirestore () {
    const firestore = firebase.app().firestore()
    const refsToDelete: firebase.firestore.DocumentReference[] = []
    // enqueue all refs in refsToDelete using bfs
    const collectionQueue = await firestore.listCollections()
    while (collectionQueue.length > 0) {
        // dequeue the current collection
        const currentCollection = collectionQueue.shift()!
        const query = await currentCollection.get()
        // add resulting references to refsToDelete and queue nested collections in the collectionQueue
        for (const snap of query.docs) {
            refsToDelete.push(snap.ref)
            const nestedCollections = await snap.ref.listCollections()
            for (const collection of nestedCollections) {
                collectionQueue.push(collection)
            }
        }
    }
    // go to town with our bulk writer
    const bulkWriter = getBulkWriter()
    for (const ref of refsToDelete) {
        bulkWriter.delete(ref)
    }
    await bulkWriter.close()
    console.log("Firestore database dropped.")
}