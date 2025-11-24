import { useEffect, useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useQueryClient } from "@tanstack/react-query"
import type { SocialNetwork, User } from "../types"
import DevTreeLink from "./DevTreeLink"

type DevTreeProps = {
    data: User
}

export default function DevTree({ data }: DevTreeProps) {
    const queryClient = useQueryClient()
    const [enabledLinks, setEnabledLinks] = useState<SocialNetwork[]>(
        (data.links as SocialNetwork[])
            .filter((item: SocialNetwork) => item.enabled)
    )

    useEffect(() => {
        setEnabledLinks(
            (data.links as SocialNetwork[])
                .filter((item: SocialNetwork) => item.enabled)
        )
    }, [data])

    const syncOrderWithCache = (orderedLinks: SocialNetwork[]) => {
        const currentUser = queryClient.getQueryData<User>(['user'])
        if (!currentUser) return

        const reindexed = orderedLinks.map((link, index) => ({ ...link, id: index + 1 }))
        const disabledLinks = (currentUser.links as SocialNetwork[]).filter(link => !link.enabled)
        const mergedLinks = [...reindexed, ...disabledLinks]

        queryClient.setQueryData<User | undefined>(['user'], prev =>
            prev ? { ...prev, links: mergedLinks } : prev
        )
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setEnabledLinks(prev => {
            const prevIndex = prev.findIndex(link => link.id === active.id)
            const newIndex = prev.findIndex(link => link.id === over.id)

            if (prevIndex === -1 || newIndex === -1) return prev

            const reordered = arrayMove(prev, prevIndex, newIndex)
            const reindexed = reordered.map((link, index) => ({ ...link, id: index + 1 }))

            syncOrderWithCache(reindexed)
            return reindexed
        })
    }

    return (
        <>
            <p className="text-4xl text-center text-white">{data.handle}</p>
            {data.image && (
                <img
                    src={data.image}
                    alt="Imagen Perfil"
                    className="mx-auto max-w-[250px]"
                />
            )}
            <p className="text-center text-lg font-black text-white">{data.description}</p>
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="mt-20 flex flex-col gap-5">
                    <SortableContext
                        items={enabledLinks.map(link => link.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {enabledLinks.map(link => (
                            <DevTreeLink key={link.id} link={link} />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        </>
    )
}
