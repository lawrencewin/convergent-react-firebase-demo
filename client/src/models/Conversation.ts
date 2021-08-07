import firebase from "firebase/app"
import { getMessages, uploadFile, MESSAGE_COL } from "../firebase"
import { FirestoreModel } from "./FirestoreModel"
import { Message, MessageInFirestore } from "./Message"
import { User, UserInFirestore } from "./User"

// The actual conversation document model in firestore
export interface ConversationInFirestore {
    // The random id assigned to this conversation
    id: string
    // Reference objects to the conversation participants in firestore
    users: firebase.firestore.DocumentReference<UserInFirestore>[]
    // A map of users that are currently typing a message in this conversation
    usersTyping: { [uid: string]: boolean }
    // The number of messages sent
    messageCount: number
}

interface ConstructorProps {
    id: string
    users: User[]
    usersTyping: { [uid: string]: boolean }
    messageCount: number
    ref: firebase.firestore.DocumentReference<ConversationInFirestore>
}

// A class that represents a conversation document in firestore and contains useful operations on the document
// and its message subcollection
export class Conversation implements FirestoreModel<ConversationInFirestore> {
    readonly id: string
    users: User[]
    usersTyping: { [uid: string]: boolean }
    messageCount: number
    ref: firebase.firestore.DocumentReference<ConversationInFirestore>

    constructor({ id, users, usersTyping: userIsTyping, messageCount, ref }: ConstructorProps) {
        this.id = id
        this.users = users
        this.usersTyping = userIsTyping
        this.messageCount = messageCount
        this.ref = ref
    }

    // Given a message, creates a new message document in its nested collection and, if provided, uploads the passed file to
    // the project's storage bucket
    async addMessage(sender: User, message: string, file?: File): Promise<Message> {
        const messageRef = this.ref
            .collection(MESSAGE_COL)
            .doc() as firebase.firestore.DocumentReference<MessageInFirestore>
        const sendDate = new Date()
        const body: MessageInFirestore = {
            id: messageRef.id,
            message: message,
            sender: sender.ref,
            sendDate: sendDate as any,
        }
        if (file) {
            body.media = {
                imageSource: await uploadFile(file),
            }
        }
        const promises = [
            messageRef.set(body),
            this.ref.update({
                messageCount: firebase.firestore.FieldValue.increment(1),
            }),
            this.updateActivity(message),
        ]
        if (this.messageCount === 0) {
            promises.push(this.createMissingConversationPointers(sender))
        }
        await Promise.all(promises)
        return new Message({
            parent: this,
            id: messageRef.id,
            message: message,
            sender: sender,
            sendDate: sendDate,
            ref: messageRef,
        })
    }

    // This is called when the first message is sent in a new conversation. For each recipient, a new conversation ref
    // is created, which will show in their message sidebar
    async createMissingConversationPointers(sender: User): Promise<void> {
        const promises = []
        for (const user of this.users) {
            if (user.id !== sender.id) {
                // create new
                promises.push(user.createConversationPointer(sender, this))
            }
        }
        await Promise.all(promises)
    }

    async getMessages(): Promise<Message[]> {
        return await getMessages(this.id)
    }

    // Updates the latest activity date for all conversation pointers with an activity message that'll show as a preview to the conversation in the sidebar
    async updateActivity(activity: string): Promise<void> {
        await this.users[0].updateConversationActivity(this.users[1], activity)
    }

    async setUserTyping(user: User, isTyping: boolean) {
        await this.ref.update({
            [`usersTyping.${user.id}`]: isTyping,
        })
    }

    async save(): Promise<void> {
        await this.ref.set({
            id: this.id,
            usersTyping: this.usersTyping,
            users: this.users.map((user) => user.ref),
            messageCount: this.messageCount,
        })
    }

    async delete(): Promise<void> {
        await this.ref.delete()
    }
}
