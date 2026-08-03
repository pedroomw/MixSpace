import axios from 'axios'

const API_URL = 'http://localhost:3000'

export const registerUser = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { email, password })
    return response.data
}

export const loginUser = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password })
    return response.data
}