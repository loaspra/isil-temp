export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export const isValidUrl = (url: string): boolean => {
    const trimmed = url.trim()
    try {
        const parsed = new URL(trimmed)
        const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:'
        const hasHostnameDot = parsed.hostname.includes('.')
        return isHttp && hasHostnameDot
    } catch {
        return false
    }
}
