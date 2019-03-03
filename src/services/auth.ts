import axios from '@/utils/axios'

const URL = 'api/v1'

export const login = (data: {}) => axios.post(`${URL}/login`, data)

export const register = (data: {}) => axios.post(`${URL}/register`, data)