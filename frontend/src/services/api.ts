import { Projeto } from '../types';

const API_URL = 'http://localhost:3001/api';

const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Fetch failed, retrying... (${retries} left)`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

export const api = {
  getProjetos: async (): Promise<Projeto[]> => {
    const res = await fetchWithRetry(`${API_URL}/projetos?t=${Date.now()}`);
    return res.json();
  },
  
  createProjeto: async (projeto: Partial<Projeto>): Promise<Projeto> => {
    const res = await fetchWithRetry(`${API_URL}/projetos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projeto)
    });
    return res.json();
  },

  updateProjeto: async (id: string, projeto: Partial<Projeto>): Promise<Projeto> => {
    const res = await fetchWithRetry(`${API_URL}/projetos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projeto)
    });
    return res.json();
  },

  toggleFavorite: async (id: string): Promise<Projeto> => {
    const res = await fetchWithRetry(`${API_URL}/projetos/${id}/favorito`, {
      method: 'PATCH'
    });
    return res.json();
  },

  deleteProjeto: async (id: string): Promise<void> => {
    await fetchWithRetry(`${API_URL}/projetos/${id}`, {
      method: 'DELETE'
    });
  }
};
