import axios from 'axios'

//creamos una instancia de axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('AUTH_TOKEN')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api