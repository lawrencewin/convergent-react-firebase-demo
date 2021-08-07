export function diffSinceNow(d: Date): [time: number, unit: "s" | "m" | "h" | "d" | "w" | "y"] {
    let curr = Math.abs(Date.now() - (d as any)) // as ms
    curr = Math.floor(curr / 1000) // as seconds
    if (curr < 60) {
        return [curr, "s"]
    }
    curr = Math.floor(curr / 60) // as minutes
    if (curr < 60) {
        return [curr, "m"]
    }
    curr = Math.floor(curr / 60) // as hours
    if (curr < 24) {
        return [curr, "h"]
    }
    curr = Math.floor(curr / 24) // as days
    if (curr < 7) {
        return [curr, "d"]
    }
    curr = Math.floor(curr / 7) // as weeks
    if (curr < 52) {
        return [curr, "w"]
    }
    return [curr, "y"]
}

export function timestampString(d: Date): string {
    return `${d.toLocaleTimeString("en", {
        hour: "numeric",
        minute: "2-digit",
    })}, ${d.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })}`
}
