export type DevTreeLink = {
    name: string
    url: string
    enabled: boolean
    id: number
}

export type User = {
    handle: string
    name: string
    email: string
    _id: string
    description: string
    image: string
    links: DevTreeLink[]
}

export type RegisterForm = Pick<User, 'handle' | 'email' | 'name'> & {
    password: string
    password_confirmation: string
}

export type LoginForm = Pick<User, 'email'> & {
    password:string
}

export type ProfileForm = Pick<User, 'handle' | 'description'>

export type SocialNetwork = DevTreeLink
