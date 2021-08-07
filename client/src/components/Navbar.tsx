import { Fragment, useState } from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import algoliasearch from "algoliasearch/lite"
import { SearchInput } from "./SearchInput"
import { ProfileImage } from "./ProfileImage"
import { User } from "../models"
import { useAuth } from "../context"
import styles from "./Navbar.module.css"
import { ReactComponent as AlgoliaLogo } from "./algolia-logo.svg"
import convergentLogo from "./convergent_logo.png"

// Algolia API we'll use to get our search results, only works if you've set up cloud functions before
const algolia = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID!, process.env.REACT_APP_ALGOLIA_SEARCH_KEY!)
const index = algolia.initIndex("Accounts")

interface NavbarProps {
    profile?: User
    title?: string
    onSearch?: (text: string) => void
}

// Navbar component at the top of the screen, with embedded user search bar and link to profile page
// Handles algolia search for new conversations
export function Navbar({ profile, title }: NavbarProps) {
    const { currentUser } = useAuth()
    const [suggestions, setSuggestions] = useState<any[]>([]) // stores search suggestions

    const history = useHistory()
    const location = useLocation()

    // Each time we type a key, we update our search suggestions using our Algolia index
    const handleKeyDown = async (currentText: string) => {
        const results = await index.search<any>(currentText, { hitsPerPage: 8 })
        setSuggestions(
            results.hits
                .filter((v) => v.objectID !== currentUser!.id)
                .map((result) => {
                    return {
                        name: result.name,
                        username: result.username,
                        imageUrl: result.imageUrl,
                        uid: result.objectID,
                    }
                })
        )
    }

    // If we press enter, find the user matching our current string
    const handleSearch = async (text: string) => {
        history.push(`/user/${text}`)
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLogo}>
                <img src={convergentLogo} alt="Website Logo" />
            </div>
            <div className={styles.navTitle}>
                <h3>{title}</h3>
            </div>
            <div className={styles.navSearch}>
                {/* Suggestions passed into our search input from our state */}
                <SearchInput
                    limit={8}
                    onKeyDown={handleKeyDown}
                    onSearch={handleSearch}
                    suggestions={suggestions.map((props, i) => (
                        <NavbarSearchSuggestions key={i} onClick={() => setSuggestions([])} {...props} />
                    ))}
                />
            </div>
            <div className={styles.profileContainer}>
                <button>
                    <ProfileImage user={currentUser!} className={styles.profileImage} />
                </button>
                <menu className={styles.profileDropdown}>
                    <Link
                        to={{
                            pathname: "/profile",
                            state: { background: location },
                        }}
                        className={styles.dropdownItem}
                    >
                        Edit Profile
                    </Link>
                    <Link to="/logout" className={styles.dropdownItem}>
                        Logout
                    </Link>
                </menu>
            </div>
        </nav>
    )
}

interface NavbarSearchSuggestionsProps {
    name?: string
    username: string
    imageUrl?: string
    uid: string
    onClick: () => void
}

function NavbarSearchSuggestions({ name, username, imageUrl, uid, onClick }: NavbarSearchSuggestionsProps) {
    return (
        <Link onClick={onClick} to={`/user/${uid}`} className={styles.navSearchResult}>
            <div className={styles.navSearchResultImage}>
                <ProfileImage className={styles.profileImage} imageUrl={imageUrl} name={name} username={username} />
            </div>
            <div className={styles.navSearchResultText}>
                {name ? (
                    <Fragment>
                        <h5 className={styles.navSearchResultTitle}>{name}</h5>
                        <div className={styles.navSearchResultSubtitle}>{username}</div>
                    </Fragment>
                ) : (
                    <h5 className={styles.navSearchResultTitle}>{username}</h5>
                )}
            </div>
            <div className={styles.navSearchResultAlgolia}>
                {/* Logo here so we don't get sued */}
                <AlgoliaLogo />
            </div>
        </Link>
    )
}
