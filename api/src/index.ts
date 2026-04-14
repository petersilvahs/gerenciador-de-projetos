import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, '../db.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

interface Project {
  id: string;
  nome: string;
  cliente: string;
  dataInicio: string;
  dataFinal: string;
  capaUrl: string;
  favorito: boolean;
  criadoEm: string;
}

const readDB = (): Project[] => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

const writeDB = (data: Project[]) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Get all projects
app.get('/api/projetos', (req: Request, res: Response) => {
  const projetos = readDB();
  res.json(projetos);
});

// Create project
app.post('/api/projetos', (req: Request, res: Response) => {
  const projetos = readDB();
  const novoProjeto: Project = {
    ...req.body,
    id: Date.now().toString(),
    criadoEm: new Date().toISOString(),
    favorito: req.body.favorito ?? false,
    capaUrl: req.body.capaUrl || '',
  };
  projetos.push(novoProjeto);
  writeDB(projetos);
  res.status(201).json(novoProjeto);
});

// Update project
app.put('/api/projetos/:id', (req: Request, res: Response) => {
  const projetos = readDB();
  const index = projetos.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  projetos[index] = { ...projetos[index], ...req.body };
  writeDB(projetos);
  res.json(projetos[index]);
});

// Toggle favorite
app.patch('/api/projetos/:id/favorito', (req: Request, res: Response) => {
  const projetos = readDB();
  const index = projetos.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  projetos[index].favorito = !projetos[index].favorito;
  writeDB(projetos);
  res.json(projetos[index]);
});

// Delete project
app.delete('/api/projetos/:id', (req: Request, res: Response) => {
  let projetos = readDB();
  const filtered = projetos.filter(p => p.id !== req.params.id);
  writeDB(filtered);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
