import firebase from "firebase/app"
import { Conversation } from "./Conversation"
import { FirestoreModel } from "./FirestoreModel"
import { User, UserInFirestore } from "./User"

// For now, we'll only be able to upload images, but this can change in the future
export interface Media {
    imageSource: string
}

export enum Reaction {
    Angry = "angry",
    Love = "love",
}

export interface MessageInFirestore {
    // The random id given to this message
    id: string
    // The message text itself
    message: string
    // An object containing information about an attached upload, only supports images for now
    media?: Media
    // The user that sent this message
    sender: firebase.firestore.DocumentReference<UserInFirestore>
    // The date this message was sent
    sendDate: firebase.firestore.Timestamp
    // The sentiment score of this message, updated through cloud functions
    sentiment?: number
    // The reaction given to this message, if any
    reaction?: Reaction | null
}

interface ConstructorProps {
    parent: Conversation
    id: string
    message: string
    media?: Media
    sender: User
    sendDate: Date
    sentiment?: number
    reaction?: Reaction | null
    ref: firebase.firestore.DocumentReference<MessageInFirestore>
}

//
export class Message implements FirestoreModel<MessageInFirestore> {
    readonly id: string
    conversation: Conversation
    message: string
    media?: Media
    sender: User
    sendDate: Date
    sentiment?: number
    reaction?: Reaction | null
    ref: firebase.firestore.DocumentReference<MessageInFirestore>

    // static factory function from a document snapshot
    static fromSnapshot(parent: Conversation, snap: firebase.firestore.DocumentSnapshot<MessageInFirestore>): Message {
        if (snap.exists) {
            const data = snap.data()!
            const sender = data.sender.id === parent.users[0].id ? parent.users[0] : parent.users[1]
            return new Message({
                parent: parent,
                id: data.id,
                message: data.message,
                media: data.media,
                sender: sender,
                sendDate: data.sendDate.toDate(),
                sentiment: data.sentiment,
                reaction: data.reaction,
                ref: snap.ref,
            })
        } else {
            throw new Error("Message snapshot doesn't exist.")
        }
    }

    constructor({ parent, id, message, media, sender, sendDate, sentiment, reaction, ref }: ConstructorProps) {
        this.conversation = parent
        this.id = id
        this.message = message
        this.media = media
        this.sender = sender
        this.sendDate = sendDate
        this.sentiment = sentiment
        this.reaction = reaction
        this.ref = ref
    }

    // Sets the reaction property for this document
    async addReaction(reaction: Reaction | null, reactor: User): Promise<void> {
        const promises = [
            this.ref.update({
                reaction: reaction,
            }),
        ]
        if (reaction !== null) {
            const reactVerb = reaction === Reaction.Angry ? "hated" : "loved"
            const updateMessage = `${reactor.name ?? reactor.username} ${reactVerb} a message.`
            promises.push(this.conversation.updateActivity(updateMessage))
        }
        await Promise.all(promises)
    }

    // Sets the reaction property to "angry"
    async angryReact(reactor: User): Promise<void> {
        let react: Reaction | null
        if (this.reaction === Reaction.Angry) {
            react = null
        } else {
            react = Reaction.Angry
        }
        await this.addReaction(react, reactor)
    }

    // Sets the reaction property to "love"
    async loveReact(reactor: User): Promise<void> {
        let react: Reaction | null
        if (this.reaction === Reaction.Love) {
            react = null
        } else {
            react = Reaction.Love
        }
        await this.addReaction(react, reactor)
    }

    async save(): Promise<void> {
        await this.ref.set({
            id: this.id,
            message: this.message,
            media: this.media,
            sender: this.sender.ref,
            sendDate: this.sendDate as any,
            sentiment: this.sentiment,
            reaction: this.reaction,
        })
    }

    async delete(): Promise<void> {
        await this.ref.delete()
    }
}
