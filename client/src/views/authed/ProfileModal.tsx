import { useState, useEffect, useRef, ChangeEvent } from "react"
import { useHistory } from "react-router-dom"
import firebase from "firebase/app"
import { X } from "react-feather"
import { useAuth } from "../../context"
import styles from "./ProfileModal.module.css"
import { ProfileImage } from "../../components"

export function ProfileModal() {
    const { currentUser, setCurrentUser } = useAuth()
    const history = useHistory()

    const [nameField, setNameField] = useState<string>(currentUser!.name || "")

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleModalClose = () => {
        history.goBack()
    }

    const handleNameChange = async () => {
        if (nameField.length > 0 && nameField.length < 128) {
            const user = currentUser!
            user.name = nameField
            await user.save()
        }
    }

    const handleProfileImageUploadClick = () => {
        fileInputRef.current!.click()
    }

    const handleProfileImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0]
        await currentUser!.uploadProfile(file)
    }

    const handleProfileDelete = async () => {
        const userIsSure = window.confirm(
            "Are you sure you want to delete your profile? This is an irreversible action!"
        )
        if (userIsSure) {
            await firebase.auth().signOut()
            const state = { uid: currentUser!.id }
            setCurrentUser(null)
            history.push("/delete", state)
        }
    }

    useEffect(() => {
        document.body.classList.add("overflow-hidden")
        return () => document.body.classList.remove("overflow-hidden")
    })

    const buttonIsDisabled = currentUser !== null && currentUser.name === nameField

    return (
        <div className={styles.modalOverlay}>
            <button onClick={handleModalClose} className={styles.closeOverlay}>
                <X size={32} />
            </button>
            <div className={styles.flexWrap}>
                <div className={styles.modal}>
                    <div className={styles.modalHead}>
                        <ProfileImage className={styles.modalHeadImage} user={currentUser!} />
                        <h3>{currentUser!.name || currentUser!.username}</h3>
                    </div>
                    <div className={styles.modalBody}>
                        <h6 className={styles.inputGroupHeader}>Current Name</h6>
                        <div className={styles.inputGroup}>
                            <input onChange={(e) => setNameField(e.target.value)} type="text" value={nameField} />
                            <button
                                className={styles.changeNameButton}
                                disabled={buttonIsDisabled}
                                onClick={handleNameChange}
                            >
                                Change Name
                            </button>
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="file" onChange={handleProfileImageUpload} ref={fileInputRef} hidden />
                            <button onClick={handleProfileImageUploadClick} className={styles.uploadProfileButton}>
                                Upload New Profile Photo
                            </button>
                            <button className={styles.deleteAccountButton} onClick={handleProfileDelete}>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
