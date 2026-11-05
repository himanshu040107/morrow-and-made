import api from "./axios";

export const login = async({ email, password })=>{
    const response=await api.post("/auth/login",{email,password});
    return response.data;
}

export const register = async({ name, email, password, confirmPassword, role })=>{
    const response=await api.post("/auth/register",{name,email,password,confirmPassword,role});
    return response.data;
}

export const refreshSession = async () => (await api.post("/auth/refresh-token")).data;
export const getMe = async (accessToken) => (await api.get("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } })).data;
export const logout = async (accessToken) => (await api.post("/auth/logout", {}, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} })).data;
