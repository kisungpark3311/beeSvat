import axios from 'axios';
import type {
  RegisterResponse,
  LoginResponse,
  RefreshResponse,
  MeResponse,
} from '@contracts/auth.contract';

// FEAT-0: Authentication API service

const api = axios.create({
  baseURL: '/api/v1/auth',
  headers: { 'Content-Type': 'application/json' },
});

export async function registerUser(email: string, password: string, nickname: string) {
  const { data } = await api.post<{ data: RegisterResponse }>('/register', {
    email,
    password,
    nickname,
  });
  return data.data;
}

export async function loginUser(email: string, password: string) {
  const { data } = await api.post<{ data: LoginResponse }>('/login', { email, password });
  return data.data;
}

export async function refreshToken(token: string) {
  const { data } = await api.post<{ data: RefreshResponse }>('/refresh', {
    refreshToken: token,
  });
  return data.data;
}

export async function logoutUser(token: string) {
  await api.post('/logout', { refreshToken: token });
}

export async function getMe(accessToken: string) {
  const { data } = await api.get<{ data: MeResponse }>('/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
