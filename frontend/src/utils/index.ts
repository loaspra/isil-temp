export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export const isValidUrl = (url: string): boolean => {
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
    return regex.test(url)
}
