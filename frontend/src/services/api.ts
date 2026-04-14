import { Projeto } from '../types';

const API_URL = 'http://localhost:3001/api';

export const api = {
  getProjetos: async (): Promise<Projeto[]> => {
    const res = await fetch(`${API_URL}/projetos`);
    return res.json();
  },
  
  createProjeto: async (projeto: Partial<Projeto>): Promise<Projeto> => {
    const res = await fetch(`${API_URL}/projetos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projeto)
    });
    return res.json();
  },

  updateProjeto: async (id: string, projeto: Partial<Projeto>): Promise<Projeto> => {
    const res = await fetch(`${API_URL}/projetos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projeto)
    });
    return res.json();
  },

  toggleFavorite: async (id: string): Promise<Projeto> => {
    const res = await fetch(`${API_URL}/projetos/${id}/favorito`, {
      method: 'PATCH'
    });
    return res.json();
  },

  deleteProjeto: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/projetos/${id}`, {
      method: 'DELETE'
    });
  }
};
