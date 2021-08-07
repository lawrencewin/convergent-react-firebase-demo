import { User } from "../models"
import { ReactComponent as ProfileSvg } from "./profile.svg"

interface ProfileImageWithUserProps {
    user: User
    [prop: string]: any
}

interface ProfileImageWithDataProps {
    imageUrl?: string
    name?: string
    username: string
    [prop: string]: any
}

type ProfileImageProps = ProfileImageWithUserProps | ProfileImageWithDataProps

const profileStyle = {
    width: "100%",
    maxWidth: 128,
    borderRadius: 128,
}

const COLORS = ["69e55b", "fbd274", "fd9f79", "42dfa8", "e84d86", "2148ab", "7abfe9", "3d8ce1", "d7337f"]

// Color generation should be deterministic
function hexFromUsername(username: string): string {
    let sum = 0
    for (let i = 0; i < username.length; i++) {
        sum += username.charCodeAt(i)
    }
    const choice = sum % COLORS.length
    return "#" + COLORS[choice]
}

export function ProfileImage({ user, imageUrl, name, username, ...props }: ProfileImageProps) {
    if (user) {
        imageUrl = user.imageUrl
        name = user.name
        username = user.username
    }
    return (
        <div {...props}>
            {imageUrl ? (
                <img style={profileStyle} src={imageUrl} alt={name} />
            ) : (
                <ProfileSvg
                    style={{
                        ...profileStyle,
                        padding: "10%",
                        background: hexFromUsername(username),
                        fill: "#ffffff",
                    }}
                />
            )}
        </div>
    )
}
