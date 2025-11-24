import { useEffect, useState } from "react"
import type { SocialNetwork, User } from "../types"
import DevTreeLink from "./DevTreeLink"

type DevTreeProps = {
    data: User
}

export default function DevTree({ data }: DevTreeProps) {
    const [enabledLinks, setEnabledLinks] = useState<SocialNetwork[]>(
        (data.links as SocialNetwork[])
            .filter((item: SocialNetwork) => item.enabled)
            .sort((a: SocialNetwork, b: SocialNetwork) => a.id - b.id)
    )

    useEffect(() => {
        setEnabledLinks(
            (data.links as SocialNetwork[])
                .filter((item: SocialNetwork) => item.enabled)
                .sort((a: SocialNetwork, b: SocialNetwork) => a.id - b.id)
        )
    }, [data])

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
            <div className="mt-20 flex flex-col gap-5">
                {enabledLinks.map(link => (
                    <DevTreeLink key={link.name} link={link} />
                ))}
            </div>
        </>
    )
}
