import { ChangeEvent, KeyboardEvent, useState } from "react"
import { Search } from "react-feather"
import styles from "./SearchInput.module.css"

interface SearchInputProps {
    limit?: number
    onKeyDown?: (currentText: string) => void
    onSearch: (text: string) => void
    suggestions?: (string | JSX.Element)[]
}

// Search input with built in functionality to display a dropdown, keeps track of text internally
export function SearchInput({ limit, onKeyDown, onSearch, suggestions = [] }: SearchInputProps) {
    const [text, setText] = useState("") // Changes each time we type
    const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)
    // When we press enter, clear what we have
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch(text)
            setText("")
        } else if (onKeyDown) {
            onKeyDown(text)
        }
    }
    return (
        <div className={styles.inputContainer}>
            {/* Actual text input */}
            <input
                className={styles.input}
                placeholder="Search For Users"
                type="search"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
            />
            <button className={styles.inputSearchBtn} onClick={() => onSearch(text)}>
                <Search />
            </button>
            {/* display suggestions here if passed */}
            <div className={styles.searchSuggestions}>
                {suggestions.slice(0, Math.min(limit || 8, suggestions.length)).map((suggestion, i) => {
                    return (
                        <div key={i} onClick={() => setText("")} className={styles.searchItem}>
                            {typeof suggestion === "string" ? (
                                <div style={{ padding: 8 }}>{suggestion}</div>
                            ) : (
                                suggestion
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
