import { useQuery } from "@tanstack/react-query"
import { Navigate, useParams } from "react-router-dom"
import { getUserByHandle } from "../api/DevTreeApi"
import DevTree from "../components/DevTree"

export default function HandleView() {
    const { handle } = useParams()
    
    const { data, isLoading, error } = useQuery({
        queryKey: ['handle', handle],
        queryFn: () => getUserByHandle(handle!),
        retry: 1,
        refetchOnWindowFocus: false
    })

    if (isLoading) return <div className="text-center text-white text-2xl mt-20">Cargando...</div>
    if (error) return <Navigate to="/auth/login" />

    if (data) {
        return (
            <div className="bg-gray-900 min-h-screen py-10">
                <div className="max-w-5xl mx-auto px-5">
                    <DevTree data={data} />
                </div>
            </div>
        )
    }
}
