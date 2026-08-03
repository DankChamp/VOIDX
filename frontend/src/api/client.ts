const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => request<any>('/api/auth/me'),

  getDashboard: () => request<any>('/api/dashboard/'),

  getMessages: (limit = 50) =>
    request<any[]>(`/api/chat/messages?limit=${limit}`),

  sendMessage: (content: string) =>
    request<any>('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getThreads: () => request<any[]>('/api/forum/threads'),

  getThread: (id: number) => request<any>(`/api/forum/threads/${id}`),

  createThread: (title: string, content: string) =>
    request<any>('/api/forum/threads', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  replyToThread: (threadId: number, content: string) =>
    request<any>(`/api/forum/threads/${threadId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getPlans: () => request<any[]>('/api/plans/'),

  getPlan: (id: number) => request<any>(`/api/plans/${id}`),

  createPlan: (title: string, content: string) =>
    request<any>('/api/plans/', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  deletePlan: (id: number) =>
    request<void>(`/api/plans/${id}`, { method: 'DELETE' }),

  getAnnouncements: () => request<any[]>('/api/announcements/'),

  createAnnouncement: (title: string, content: string, isPinned = false) =>
    request<any>('/api/announcements/', {
      method: 'POST',
      body: JSON.stringify({ title, content, is_pinned: isPinned }),
    }),

  deleteAnnouncement: (id: number) =>
    request<void>(`/api/announcements/${id}`, { method: 'DELETE' }),

  getUsers: () => request<any[]>('/api/users/'),

  createUser: (username: string, password: string, chatAllowed = false) =>
    request<any>('/api/users/', {
      method: 'POST',
      body: JSON.stringify({ username, password, chat_allowed: chatAllowed }),
    }),

  updateUser: (id: number, data: { chat_allowed?: boolean }) =>
    request<any>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: number) =>
    request<void>(`/api/users/${id}`, { method: 'DELETE' }),

  wsUrl: () => {
    const token = localStorage.getItem('token');
    const base = API_BASE.replace(/^http/, 'ws');
    return `${base}/api/chat/ws?token=${encodeURIComponent(token || '')}`;
  },
};
