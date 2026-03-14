import { User, Exercise, WorkoutDay, DietDay, ProgressEntry } from "../types";

const API_URL = "/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    signup: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    login: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  user: {
    getProfile: async (): Promise<User> => {
      const res = await fetch(`${API_URL}/user/profile`, { headers: getHeaders() });
      return res.json();
    },
    updateProfile: async (data: Partial<User>) => {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  exercises: {
    getAll: async (params?: any): Promise<Exercise[]> => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/exercises?${query}`, { headers: getHeaders() });
      return res.json();
    },
  },
  plans: {
    getWorkout: async (): Promise<WorkoutDay[]> => {
      const res = await fetch(`${API_URL}/plans/workout`, { headers: getHeaders() });
      return res.json();
    },
    getDiet: async (): Promise<DietDay[]> => {
      const res = await fetch(`${API_URL}/plans/diet`, { headers: getHeaders() });
      return res.json();
    },
  },
  progress: {
    get: async (): Promise<ProgressEntry[]> => {
      const res = await fetch(`${API_URL}/progress`, { headers: getHeaders() });
      return res.json();
    },
    add: async (data: any) => {
      const res = await fetch(`${API_URL}/progress`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
};
