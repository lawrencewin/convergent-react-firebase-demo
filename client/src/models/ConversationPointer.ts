import firebase from "firebase/app"
import { FirestoreModel } from "./FirestoreModel"
import { ConversationInFirestore } from "./Conversation"
import { User } from "./User"
import { getUser } from "../firebase"

// TODO: Figure out how to mark something as "unread" in this data model.
export interface ConversationPointerInFirestore {
    // The string id of the user we're talking to
    recipientUid: string
    // The message that shows as the conversation preview, usually the latest message sent
    activityMessage: string
    // The date of the last message / react sent, used as the sort key for this object
    latestActivity: firebase.firestore.Timestamp
    // The document reference to the conversation document in firestore
    conversationRef: firebase.firestore.DocumentReference<ConversationInFirestore>
}

interface ConstructorProps {
    activityMessage: string
    latestActivity: Date
    conversationRef: firebase.firestore.DocumentReference<ConversationInFirestore>
    ref: firebase.firestore.DocumentReference<ConversationPointerInFirestore>
    recipient: User
}

// A class that represents a preview of an entire conversation to a conversation participant
export class ConversationPointer implements FirestoreModel<ConversationPointerInFirestore> {
    recipient: User
    activityMessage: string
    latestActivity: Date
    conversationRef: firebase.firestore.DocumentReference<ConversationInFirestore>
    ref: firebase.firestore.DocumentReference<ConversationPointerInFirestore>

    // Javascript and Typescript don't allow for multiple constructors like Java, this is an alternative static factory method
    static async fromSnapshot(
        snap: firebase.firestore.DocumentSnapshot<ConversationPointerInFirestore>
    ): Promise<ConversationPointer> {
        const data = snap.data()
        if (data) {
            return new ConversationPointer({
                activityMessage: data.activityMessage,
                latestActivity: data.latestActivity.toDate(),
                conversationRef: data.conversationRef,
                ref: snap.ref,
                recipient: await getUser(data.recipientUid),
            })
        } else {
            throw new Error("Conversation reference doesn't exist in firestore.")
        }
    }

    constructor({ activityMessage, latestActivity, conversationRef, ref, recipient }: ConstructorProps) {
        this.activityMessage = activityMessage
        this.latestActivity = latestActivity
        this.conversationRef = conversationRef
        this.ref = ref
        this.recipient = recipient
    }

    async save(): Promise<void> {
        await this.ref.set({
            recipientUid: this.recipient.id,
            activityMessage: this.activityMessage,
            latestActivity: this.latestActivity as any,
            conversationRef: this.conversationRef,
        })
    }

    async delete(): Promise<void> {
        await this.ref.delete()
    }
}
