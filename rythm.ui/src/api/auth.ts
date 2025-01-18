import axios from "axios";
import { SignUpRequest, SignInRequest, SignInResponse } from "../types/api";

const API_BASE_URL = "http://localhost:7000";

export const signUp = async (data: FormData) => {
  return axios.post(`${API_BASE_URL}/auth/signup`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const signIn = async (data: SignInRequest) => {
  return axios.post<SignInResponse>(`${API_BASE_URL}/auth/signin`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};