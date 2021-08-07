import firebase from "firebase/app"
import {
    client,
    getConversationPointer,
    getConversationPointers,
    getUser,
    CONVERSATION_COL,
    uploadFile,
    deleteFileFromDownloadURL,
} from "../firebase"
import { FirestoreModel } from "./FirestoreModel"
import { ConversationPointer } from "./ConversationPointer"
import { Conversation, ConversationInFirestore } from "./Conversation"

export interface UserInFirestore {
    // the user's email, obtained from firebase authentication
    email?: string
    // the uid obtained from firebase authentication
    id: string
    // link to profile photo, either obtained from google or uploaded
    imageUrl?: string
    // the display name of the user, obtained from google or manually set
    name?: string
    // a username generated from email
    username: string
}

interface ConstructorProps {
    email?: string
    id: string
    imageUrl?: string
    name?: string
    username: string
    ref: firebase.firestore.DocumentReference<UserInFirestore>
}

// Object representing a user document in firestore, with useful operations for dealing with conversation pointers
export class User implements FirestoreModel<UserInFirestore> {
    readonly id: string
    email?: string
    imageUrl?: string
    name?: string
    username: string
    ref: firebase.firestore.DocumentReference<UserInFirestore>

    // factory function with document snapshot, alternative to constructor
    static fromSnapshot(snap: firebase.firestore.DocumentSnapshot<UserInFirestore>) {
        const data = snap.data()
        if (data) {
            return new User({
                email: data.email,
                id: data.id,
                imageUrl: data.imageUrl,
                name: data.name,
                username: data.username,
                ref: snap.ref as any,
            })
        } else {
            throw new Error("User doesn't exist in firebase.")
        }
    }

    constructor({ email, id, imageUrl, name, username, ref }: ConstructorProps) {
        this.id = id
        this.email = email
        this.imageUrl = imageUrl
        this.name = name
        this.username = username
        this.ref = ref
    }

    async getConversationRef(other: string | User): Promise<ConversationPointer | null> {
        let recipientUid: string
        if (typeof other === "string") {
            recipientUid = other
        } else {
            recipientUid = other.id
        }
        return await getConversationPointer(this.id, recipientUid)
    }

    async getConversationPointers(): Promise<ConversationPointer[]> {
        return await getConversationPointers(this.id)
    }

    // Sets the activityMessage property of the conversation ref with "other" as well as updates the latestActivity prop
    async updateConversationActivity(other: User, activity: string): Promise<void> {
        await this.updateConvActivity(other, activity, true)
    }

    // Does it for this user
    private async updateConvActivity(other: User, activity: string, recurse: boolean): Promise<void> {
        const convPtr = await getConversationPointer(other.id, this.id)
        if (convPtr) {
            await convPtr.ref.update({
                activityMessage: activity,
                latestActivity: new Date(),
            })
            if (recurse) {
                await other.updateConvActivity(this, activity, false)
            }
        } else {
            throw new Error(
                `Conversation Reference is invalid for user ${this.username}'s conversation with ${other.username}`
            )
        }
    }

    // Creates a new conversation pointer in this user's conversations collection which points to the passed user and conversation
    async createConversationPointer(
        recipient: string | User,
        conversation: string | Conversation
    ): Promise<ConversationPointer> {
        if (typeof recipient === "string") {
            recipient = await getUser(recipient)
        }
        let conversationRef
        if (typeof conversation === "string") {
            conversationRef = client.firestore().collection(CONVERSATION_COL).doc(conversation)
        } else {
            conversationRef = conversation.ref
        }
        const conversationRefRef = this.ref.collection(CONVERSATION_COL).doc()
        // We're only going to create one reference to this. Once we send a message, cloud functions will create the other one.
        await conversationRefRef.set({
            recipientUid: recipient.id,
            activityMessage: "",
            latestActivity: new Date(),
            conversationRef: conversationRef,
        })
        return new ConversationPointer({
            recipient: recipient,
            activityMessage: "",
            latestActivity: new Date(),
            conversationRef: conversationRef as any,
            ref: conversationRefRef as any,
        })
    }

    // Creates a new conversation with this user and another user
    async createConversation(other: string | User): Promise<Conversation> {
        const firestore = client.firestore()
        let recipient: User
        if (typeof other === "string") {
            recipient = await getUser(other)
        } else {
            recipient = other
        }
        const conversations = firestore.collection(CONVERSATION_COL)
        const conversationRef = conversations.doc()
        const promises: Promise<any>[] = [
            conversationRef.set({
                id: conversationRef.id,
                users: [this.ref, recipient.ref],
                usersTyping: {
                    [this.ref.id]: false,
                    [recipient.ref.id]: false,
                },
                messageCount: 0,
            }),
            // We're only going to create one conversation ref for us. The other will be created on the first message send.
            this.createConversationPointer(recipient, conversationRef.id),
        ]
        // resolve promises / handle errors
        try {
            await Promise.all(promises)
            return new Conversation({
                id: conversationRef.id,
                users: [this, recipient],
                usersTyping: {
                    [this.ref.id]: false,
                    [recipient.ref.id]: false,
                },
                messageCount: 0,
                ref: conversationRef as firebase.firestore.DocumentReference<ConversationInFirestore>,
            })
        } catch (error) {
            console.error(`Failed to add conversation for user ${this.id}.`)
            throw error
        }
    }

    // Uploads the passed image file, sets the new imageUrl property, and removes the old image from the project's bucket, if it exists
    async uploadProfile(file: File): Promise<void> {
        const imageUrl = await uploadFile(file)
        if (this.imageUrl) {
            await deleteFileFromDownloadURL(this.imageUrl)
        }
        await this.ref.update({ imageUrl: imageUrl })
    }

    async save(): Promise<void> {
        await this.ref.set({
            email: this.email,
            imageUrl: this.imageUrl,
            id: this.id,
            name: this.name,
            username: this.username,
        })
    }

    async delete(): Promise<void> {
        await this.ref.delete()
    }
}
