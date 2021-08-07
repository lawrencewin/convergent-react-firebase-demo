import { client } from "./client"
import "firebase/storage"

const storage = client.storage()

const CHARS = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const EXTS: { [mime: string]: string } = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/gif": "gif",
}
function getRandomName(file: File, length: number = 30): string {
    let filename = ""
    for (let i = 0; i < length; i++) {
        const idx = Math.floor(Math.random() * CHARS.length)
        filename += CHARS[idx]
    }
    return filename + "." + EXTS[file.type]
}

export async function uploadFile(file: File): Promise<string> {
    const root = storage.ref()
    const path = `image/${getRandomName(file)}`
    const snap = await root.child(path).put(file)
    return await snap.ref.getDownloadURL()
}

export async function deleteFile(refPath: string): Promise<void> {
    const root = storage.ref()
    const ref = root.child(refPath)
    await ref.delete()
}

export async function deleteFileFromDownloadURL(url: string): Promise<void> {
    const projectName = "convergent-firebase-demo"
    // urls are in the format of: https://firebasestorage.googleapis.com/v0/b/<projectName>.appspot.com/o/<fileRefPath>?<queryparams>
    const narrowed = url.substring(url.indexOf(projectName), url.indexOf("?"))
    // narrowed is now <projectName>.appspot.com/o/<fileRefPath>
    const split = narrowed.split("/")
    // split into [<projectName>.appspot.com, o, <fileRefPath>]
    const refPath = decodeURIComponent(split[2]) // the ref path is urlencoded, this reverses it
    await deleteFile(refPath)
}
