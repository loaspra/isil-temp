import { useEffect, useState } from "react"
import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput"
import { isValidUrl } from "../utils"
import { toast } from "sonner"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { updateProfile } from "../api/DevTreeApi"
import type { SocialNetwork, User } from "../types"

export default function LinkTreeView() {
    const [devTreeLinks, setDevTreeLinks] = useState(social)
    const queryClient = useQueryClient()
    const user: User = queryClient.getQueryData(['user'])!

    const { mutate: updateProfileMutation } = useMutation({
        mutationFn: updateProfile,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success('Actualizado Correctamente')
        }
    })

    useEffect(() => {
        const updatedData = devTreeLinks.map(item => {
            const userLink = (user.links as SocialNetwork[]).find((link: SocialNetwork) => link.name === item.name)
            if (userLink) {
                return { ...item, url: userLink.url, enabled: userLink.enabled }
            }
            return item
        })
        setDevTreeLinks(updatedData)
    }, [])

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedLinks = devTreeLinks.map(link =>
            link.name === e.target.name ? { ...link, url: e.target.value } : link
        )
        setDevTreeLinks(updatedLinks)
    }

    const handleEnableLink = (socialNetwork: string) => {
        const targetLink = devTreeLinks.find(link => link.name === socialNetwork)
        
        // Block enabling if URL is invalid
        if (targetLink && !targetLink.enabled && !isValidUrl(targetLink.url)) {
            toast.error('URL no válida')
            return
        }

        const updatedLinks = devTreeLinks.map(link => {
            if (link.name === socialNetwork) {
                return { ...link, enabled: !link.enabled }
            }
            return link
        })

        setDevTreeLinks(updatedLinks)

        // Build from current state - get currently enabled count to determine next ID
        const currentEnabledCount = updatedLinks.filter(link => link.enabled && link.name !== socialNetwork).length
        const toggledLink = updatedLinks.find(link => link.name === socialNetwork)
        
        let updatedItems: SocialNetwork[] = []
        
        if (toggledLink?.enabled) {
            // Enabling: assign next sequential ID
            const newId = currentEnabledCount + 1
            updatedItems = updatedLinks.map(link => ({
                name: link.name,
                url: link.url,
                enabled: link.enabled,
                id: link.enabled ? (link.name === socialNetwork ? newId : link.id || 0) : 0
            })).filter(link => link.url) // Only include links with URLs
        } else {
            // Disabling: rebuild all IDs sequentially
            let nextId = 1
            updatedItems = updatedLinks.map(link => ({
                name: link.name,
                url: link.url,
                enabled: link.enabled,
                id: link.enabled ? nextId++ : 0
            })).filter(link => link.url)
        }

        // Update cache with array
        queryClient.setQueryData(['user'], (prevData: User) => {
            return {
                ...prevData,
                links: updatedItems
            }
        })
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        // Build payload from current devTreeLinks state, only including enabled links with sequential IDs
        const enabledLinks = devTreeLinks
            .filter(link => link.enabled)
            .map((link, index) => ({
                name: link.name,
                url: link.url,
                enabled: link.enabled,
                id: index + 1 // Sequential IDs: 1, 2, 3...
            }))
        
        // Include disabled links with id: 0
        const disabledLinks = devTreeLinks
            .filter(link => !link.enabled && link.url)
            .map(link => ({
                name: link.name,
                url: link.url,
                enabled: link.enabled,
                id: 0
            }))
        
        const allLinks = [...enabledLinks, ...disabledLinks]
        
        const updatedUser = {
            ...user,
            links: allLinks
        }
        
        updateProfileMutation(updatedUser)
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
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
            >
                Guardar Cambios
            </button>
        </form>
    )
}
