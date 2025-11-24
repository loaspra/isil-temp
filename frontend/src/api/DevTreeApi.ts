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

export async function updateProfile(formData: User) {
    try {
        const { data } = await api.put<string>('/user', formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}