import firebase from "firebase/app"
import { client } from "./client"
import {
    ConversationInFirestore,
    MessageInFirestore,
    UserInFirestore,
    User,
    Message,
    Conversation,
    ConversationPointer,
    ConversationPointerInFirestore,
} from "../models"

// collection names
export const USER_COL = "users"
export const CONVERSATION_COL = "conversations"
export const MESSAGE_COL = "messages"

// Caches for object's we've already retreived
const USER_MAP = new Map<string, User>()
const CONVERSATION_REF_MAP = new Map<string, ConversationPointer>()
const CONVERSATION_MAP = new Map<string, Conversation>()
const MESSAGE_MAP = new Map<string, Message>()
const compoundKey = (...keys: string[]) => keys.join(",")

// Given an id, return a User object from firestore
export async function getUser(id: string): Promise<User> {
    // First check our local map
    if (USER_MAP.has(id)) {
        return USER_MAP.get(id)!
    }
    const users = client.firestore().collection(USER_COL)
    const snapshot = await users.doc(id).get()
    return User.fromSnapshot(snapshot as firebase.firestore.DocumentSnapshot<UserInFirestore>)
}

// Given a sender and recipient, return the sender's conversation ref with the recipient
export async function getConversationPointer(
    senderUid: string,
    recipientUid: string
): Promise<ConversationPointer | null> {
    const cacheKey = compoundKey(senderUid, recipientUid)
    if (CONVERSATION_REF_MAP.has(cacheKey)) {
        return CONVERSATION_REF_MAP.get(cacheKey)!
    }
    // look at firebase
    const querySnap = (await client
        .firestore()
        .collection(USER_COL)
        .doc(senderUid)
        .collection(CONVERSATION_COL)
        .where("recipientUid", "==", recipientUid)
        .get()) as firebase.firestore.QuerySnapshot<ConversationPointerInFirestore>
    // If a conversation with the recipient exists for this sender, there should only be one instance in the sender's collection
    if (querySnap.size === 0) {
        return null
    } else if (querySnap.size > 1) {
        throw new Error("Multiple conversations with the same person not allowed.")
    } else {
        const convPtr = await ConversationPointer.fromSnapshot(querySnap.docs[0])
        CONVERSATION_REF_MAP.set(cacheKey, convPtr)
        return convPtr
    }
}

// Get all of the sender's conversation pointers
export async function getConversationPointers(uid: string) {
    // look at firebase
    const querySnap = (await client
        .firestore()
        .collection(USER_COL)
        .doc(uid)
        .collection(CONVERSATION_COL)
        .orderBy("latestActivity", "desc")
        .get()) as firebase.firestore.QuerySnapshot<ConversationPointerInFirestore>
    const convPtrPromises = querySnap.docs.map(async (snap) => {
        const data = snap.data()
        if (data) {
            const convPtr = await ConversationPointer.fromSnapshot(snap)
            CONVERSATION_REF_MAP.set(compoundKey(uid, snap.id), convPtr)
            return convPtr
        } else {
            // This probably should never happen
            throw new Error("Conversation Ref doesn't exist.")
        }
    })
    return await Promise.all(convPtrPromises)
}

// Given a conversation ID, return an actual conversation object that points to messages
export async function getConversation(id: string): Promise<Conversation> {
    // check cache first
    if (CONVERSATION_MAP.has(id)) {
        return CONVERSATION_MAP.get(id)!
    }
    // Get conversation
    const firestore = client.firestore()
    const snapshot = (await firestore
        .collection(CONVERSATION_COL)
        .doc(id)
        .get()) as firebase.firestore.DocumentSnapshot<ConversationInFirestore>
    const data = snapshot.data()
    if (data) {
        // Set up return
        const ret = new Conversation({
            id: id,
            users: [], // we'll replace this below
            usersTyping: data.usersTyping,
            ref: snapshot.ref,
            messageCount: data.messageCount,
        })
        // Get users
        const promises = [getUser(data.users[0].id), getUser(data.users[1].id)]
        ret.users = await Promise.all(promises)
        // Save in cache
        CONVERSATION_MAP.set(id, ret)
        return ret
    } else {
        throw new Error("Conversation not found.")
    }
}

// Get a single message from a conversation
export async function getMessage(conversationId: string, messageId: string): Promise<Message> {
    // Check cache
    const cacheKey = compoundKey(conversationId, messageId)
    if (MESSAGE_MAP.has(cacheKey)) {
        return MESSAGE_MAP.get(cacheKey)!
    }
    // Get from firebase
    const snapPromise = client
        .firestore()
        .collection(CONVERSATION_COL)
        .doc(conversationId)
        .collection(MESSAGE_COL)
        .doc(messageId)
        .get() as Promise<firebase.firestore.DocumentSnapshot<MessageInFirestore>>
    const convPromise = getConversation(conversationId)
    const [snap, conversation] = await Promise.all([snapPromise, convPromise])
    return Message.fromSnapshot(conversation, snap)
}

// Get all messages from a conversation
export async function getMessages(conversationId: string): Promise<Message[]> {
    // Get from firebase
    const firestore = client.firestore()
    const collection = firestore
        .collection(CONVERSATION_COL)
        .doc(conversationId)
        .collection(MESSAGE_COL) as firebase.firestore.CollectionReference<MessageInFirestore>
    const promises: [Promise<firebase.firestore.QuerySnapshot<MessageInFirestore>>, Promise<Conversation>] = [
        collection.orderBy("sendDate", "desc").get(),
        getConversation(conversationId),
    ]
    const [querySnap, conversation] = await Promise.all(promises)
    return querySnap.docs.map((snap) => {
        const message = Message.fromSnapshot(conversation, snap)
        MESSAGE_MAP.set(message.id, message)
        return message
    })
}

/**
 * Below are functions that create document listeners that are called each time a part of the firestore db is written to.
 * These allow for real time updates to your data, but they can be expensive. You can have a maximum of 100 listeners before
 * performance starts to drop. Be careful with how you use these.
 */

// Create a listener that listens for changes to a user document with the passed user id.
// Returns a function that unsubscribes from changes
export function createUserSnapshotListener(
    uid: string,
    callback: (user?: User, error?: firebase.firestore.FirestoreError) => void
): () => void {
    const userRef = client
        .firestore()
        .collection(USER_COL)
        .doc(uid) as firebase.firestore.DocumentReference<UserInFirestore>
    return userRef.onSnapshot(
        (snap) => {
            const user = User.fromSnapshot(snap)
            callback(user)
        },
        (error) => callback(undefined, error)
    )
}

// Create a listener that listens for changes to a user's conversation pointers with the passed user id.
// Returns a function that unsubscribes from changes to the collection
export function createConversationPointersSnapshotListener(
    uid: string,
    callback: (convPtrs?: ConversationPointer[], error?: firebase.firestore.FirestoreError) => void
): () => void {
    const convPtrRef = client
        .firestore()
        .collection(USER_COL)
        .doc(uid)
        .collection(CONVERSATION_COL)
        .orderBy("latestActivity", "desc") as firebase.firestore.CollectionReference<ConversationPointerInFirestore>
    return convPtrRef.onSnapshot(
        async (querySnap) => {
            const convPtrPromises = querySnap.docs.map((snap) => {
                return ConversationPointer.fromSnapshot(snap)
            })
            const convPtrs = await Promise.all(convPtrPromises)
            callback(convPtrs)
        },
        (error) => callback(undefined, error)
    )
}

// Create a listener that listens for changes to a conversation document with the passed conversation id.
// Returns a function that unsubscribes from changes to the document
export function createConversationSnapshotListener(
    conversationId: string,
    callback: (conversation?: Conversation, error?: firebase.firestore.FirestoreError) => void
): () => void {
    const conversationRef = client
        .firestore()
        .collection(CONVERSATION_COL)
        .doc(conversationId) as firebase.firestore.DocumentReference<ConversationInFirestore>

    return conversationRef.onSnapshot(
        async (snap) => {
            const data = snap.data()
            if (data) {
                try {
                    const users = await Promise.all([getUser(data.users[0].id), getUser(data.users[1].id)])
                    const conversation = new Conversation({
                        id: data.id,
                        users: users,
                        usersTyping: data.usersTyping,
                        messageCount: data.messageCount,
                        ref: snap.ref as any,
                    })
                    callback(conversation)
                } catch (error) {
                    callback(undefined, error)
                }
            }
        },
        (error) => callback(undefined, error)
    )
}

// Create a listener that listens for changes to a conversation's message collection, given a conversation id.
// Returns a function that unsubscribes from changes
export function createConversationMessagesSnapshotListener(
    conversationId: string,
    callback: (messages?: Message[], error?: firebase.firestore.FirestoreError) => void
): () => void {
    const messagesRef = client
        .firestore()
        .collection(CONVERSATION_COL)
        .doc(conversationId)
        .collection(MESSAGE_COL)
        .orderBy("sendDate", "desc") as firebase.firestore.CollectionReference<MessageInFirestore>

    return messagesRef.onSnapshot(
        async (querySnap) => {
            try {
                const conversation = await getConversation(conversationId)
                const messages = querySnap.docs.map((messageSnap) => {
                    const message = Message.fromSnapshot(conversation, messageSnap)
                    MESSAGE_MAP.set(compoundKey(conversation.id, message.id), message)
                    return message
                })
                callback(messages)
            } catch (error) {
                callback(undefined, error)
            }
        },
        (error) => callback(undefined, error)
    )
}
