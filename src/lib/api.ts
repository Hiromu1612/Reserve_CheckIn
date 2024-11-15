const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  auth: {
    signup: async (email: string, password: string, name: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!response.ok) throw new Error('Signup failed');
      return response.json();
    },

    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },

    verifyPassword: async (userId: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      if (!response.ok) throw new Error('Password verification failed');
      return response.json();
    }
  },

  reservations: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/reservations`);
      if (!response.ok) throw new Error('Failed to fetch reservations');
      return response.json();
    },

    create: async (reservation: any) => {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation)
      });
      if (!response.ok) throw new Error('Failed to create reservation');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete reservation');
      return response.json();
    }
  }
};