import api from "./axios.js";

export const getProducts = async () => (await api.get("/products")).data.products;
export const getProduct = async (id) => (await api.get(`/products/${id}`)).data.product;
export const createProduct = async (formData) => (await api.post("/products", formData)).data.product;
export const updateProduct = async (id, formData) => (await api.put(`/products/${id}`, formData)).data.product;
export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data;
