import type { SocialNetwork } from "../types"

type DevTreeLinkProps = {
    link: SocialNetwork
}

export default function DevTreeLink({ link }: DevTreeLinkProps) {
    return (
        <li className="bg-white px-5 py-2 flex items-center gap-5">
            <div
                className="w-12 h-12 bg-cover"
                style={{ backgroundImage: `url('/social/icon_${link.name}.svg')` }}
            />
            <a 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="capitalize flex-1"
            >
                Visita mi: <span className="font-bold">{link.name}</span>
            </a>
        </li>
    )
}
