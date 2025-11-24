import type React from "react"
import { useEffect, useState } from "react"
import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput"
import { isValidUrl } from "../utils"
import { toast } from "sonner"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { getUser, updateProfile } from "../api/DevTreeApi"
import type { SocialNetwork, User } from "../types"

export default function LinkTreeView() {
    const [devTreeLinks, setDevTreeLinks] = useState<SocialNetwork[]>(social)
    const queryClient = useQueryClient()
    const existingUser = queryClient.getQueryData<User>(['user'])
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: getUser,
        initialData: existingUser,
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false
    })

    const { mutate: updateProfileMutation, isPending } = useMutation({
        mutationFn: updateProfile,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success('Actualizado Correctamente')
            queryClient.invalidateQueries({ queryKey: ['user'] })
        }
    })

    useEffect(() => {
        if (!user) return

        const userLinks = (user.links as SocialNetwork[]) || []

        const enabledSorted = userLinks
            .filter(link => link.enabled)
            .sort((a, b) => {
                if (a.id === b.id) return a.name.localeCompare(b.name)
                return a.id - b.id
            })
            .map((link, index) => ({ ...link, id: index + 1 }))

        const disabledExisting = userLinks
            .filter(link => !link.enabled)
            .map(link => ({ ...link, id: 0, enabled: false }))

        const missingNetworks = social
            .filter(item => !userLinks.some(link => link.name === item.name))
            .map(item => ({ ...item, id: 0, enabled: false }))

        setDevTreeLinks([...enabledSorted, ...disabledExisting, ...missingNetworks])
    }, [user])

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setDevTreeLinks(prev =>
            prev.map(link => link.name === name ? { ...link, url: value } : link)
        )
    }

    const handleEnableLink = (socialNetwork: string) => {
        setDevTreeLinks(prev => {
            const targetLink = prev.find(link => link.name === socialNetwork)
            if (!targetLink) return prev

            // Block enabling if URL is invalid or empty
            if (!targetLink.enabled && !isValidUrl(targetLink.url)) {
                toast.error('URL no válida')
                return prev
            }

            const toggled = prev.map(link =>
                link.name === socialNetwork ? { ...link, enabled: !link.enabled } : link
            )

            const enabledOrdered = toggled
                .filter(link => link.enabled)
                .sort((a, b) => {
                    const aId = a.id || Number.MAX_SAFE_INTEGER
                    const bId = b.id || Number.MAX_SAFE_INTEGER
                    return aId - bId
                })
                .map((link, index) => ({ ...link, id: index + 1 }))

            const finalLinks = toggled.map(link => {
                const match = enabledOrdered.find(item => item.name === link.name)
                return match ? match : { ...link, enabled: false, id: 0 }
            })

            queryClient.setQueryData(['user'], (prevUser?: User) => prevUser ? { ...prevUser, links: finalLinks } : prevUser)

            return finalLinks
        })
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user) return

        const cachedUser = queryClient.getQueryData<User>(['user'])
        const cachedLinks = (cachedUser?.links as SocialNetwork[]) || []
        const localMap = new Map(devTreeLinks.map(link => [link.name, link]))

        const payloadLinks = (cachedLinks.length ? cachedLinks : devTreeLinks).map(link => {
            const local = localMap.get(link.name)
            const merged = local ? { ...link, ...local } : link
            return {
                ...merged,
                id: merged.enabled ? merged.id : 0
            }
        })

        // Include any socials missing from cache (e.g., new defaults)
        devTreeLinks.forEach(link => {
            if (!payloadLinks.find(item => item.name === link.name)) {
                payloadLinks.push({ ...link, id: link.enabled ? link.id : 0 })
            }
        })

        updateProfileMutation({
            ...user,
            links: payloadLinks
        })
    }

    return (
        <form
            className="space-y-5"
            onSubmit={handleSubmit}
        >
            {devTreeLinks.map(item => (
                <DevTreeInput
                    key={item.name}
                    item={item}
                    handleUrlChange={handleUrlChange}
                    handleEnableLink={handleEnableLink}
                />
            ))}

            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50"
                disabled={isPending}
            >
                Guardar Cambios
            </button>
        </form>
    )
}
