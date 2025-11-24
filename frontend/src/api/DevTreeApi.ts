import { isAxiosError } from "axios";
import api from '../config/axios'
import type { User } from "../types";

export async function getUser(){
    try{
        //tenemos que hacer la petición hacia una URL
        const {data} = await api<User>(`/user`)
        return data
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response?.data.error)
        }
    }
}

export async function getUserByHandle(handle: string){
    try{
        const {data} = await api<User>(`/${handle}`)
        return data
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response?.data.error)
        }
    }
}

export async function updateProfile(formData: Partial<User>) {
    try {
        const { data } = await api.put<string>('/user', formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

export async function uploadImage(file: File) {
    try {
        const formData = new FormData()
        formData.append('file', file)

        const { data } = await api.post<{ image: string }>('/user/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return data.image
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}
