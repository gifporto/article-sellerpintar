import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (data: { username: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data: { username: string; password: string; role: string }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  profile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export const articleService = {
  getArticles: async (params?: { page?: number; limit?: number; title?: string; category?: string }) => {
    const response = await api.get("/articles", { params });

    return {
      data: response.data.data,
      totalData: response.data.total,
      currentPage: response.data.page,
      limitData: response.data.limit,
      totalPages: Math.ceil(response.data.total / response.data.limit),
    };
  },

  getArticleById: async (id: string) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  createArticle: async (data: {
    title: string;
    content: string;
    categoryId: string;
    imageUrl?: string;
  }) => {
    const response = await api.post("/articles", data);
    return response.data;
  },

  updateArticle: async (id: string, data: {
    title?: string;
    content?: string;
    categoryId?: string;
    imageUrl?: string;
  }) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data;
  },

  deleteArticle: async (id: string) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  },
};


export const uploadService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },
};

export const categoryService = {
  getCategories: async (params?: { page?: number; limit?: number; search?: string; }) => {
    const response = await api.get("/categories", { params });

    return {
      data: response.data.data,         // array kategori
      totalData: response.data.totalData,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  },

  createCategory: async (data: { name: string }) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  updateCategory: async (id: string, data: { name: string }) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};


