## Ferramentas Utilizadas

**Frontend**
- **Vue 3**: Utilizando _Composition API_ (`<script setup>`) pela sua possibilidade de componentização e reatividade rápida nas filtragens e atualizações de UI no lado do cliente.
- **Vite**: Bundler ultrarrápido focado na melhor experiência de desenvolvimento.
- **TypeScript**: Estabilidade com tipagens, reduzindo ao máximo a complexidade na inferência e integração do Payload entre os ciclos de front e backend.
- **Vue Router**: Para navegação nativa e reativa nas páginas mantendo status de uma _SPA_ (Single Page Application).
- **Date-fns**: Para modelagem leve de parsing e conversões do formato ISO das Datas cadastradas aos formatos nativos "ptBR".
- **Lucide Icons**: Biblioteca de SVG Icons implementada de forma otimizada para ecossistema.
- **Vanilla CSS Scoped**: Abstraída direto de tokens CSS locais globais (`index.css`).

**Backend**
- **Node.js** & **Express**: Web framework prático com middleware integrado focando na velocidade para endpoints cruciais da validação da regra de negócios.
- **TypeScript (Node)**: Para sinergia de transição e sintaxe entre a API e a Visualização.
- **CORS e APIs Nativas FS**: Utilizando `fs` assíncrono para abstrair as queries complexas com persistência puramente funcional escrevendo em um arquivo raiz `db.json` emulando a latência de tráfego a um Data Lake ou Banco tradicional para este ambiente mockado.

## Como as ferramentas operam de forma interativa

Injetadas validações nativas HTML5 para formulários, rastreio em `localStorage` para salvamento das buscas mais frequentes no tempo, transações instantâneas de rotas por observer (`watch`) de texto onde a página filtra debaixo dos olhos do cliente reativamente sem botões de submissões trancadas, e o backend em portas de segurança local `127.0.0.1` limitando a confusão de CORS em resolutores modernos de IPV6 no node nativo.

## Pré-requisitos

Certifique-se de que tenha instalado:
- **Node.js** (Versão `18` ou superior)
- Seu gerenciador de pacotes padrão configurado, preferencialmente **npm**.

## Como rodar o projeto localmente

Como o projeto é construído numa arquitetura Full Stack apartada no sistema, é estritamente exigido a execução de **dois terminais distintos**.

Abra o seu terminal na pasta raiz e siga as orientações:

### 1. Subindo a API (Backend)

```bash
# Entre na pasta api
cd api

# Instale todas as dependências do servidor REST
npm install

# Suba o servidor TypeScript em modo Watcher
npm run dev

# Se o processo der certo e imprimir "API running on http://127.0.0.1:3001/api", pode partir pro passo 2! 
```
*(O backend utilizará a porta automática `3001` rodando no modo local fixado (`127.0.0.1`) para sanar falhas cross-over do IPv6.)*

### 2. Subindo a Visualização (Frontend)

Com o terminal anterior rodando e deixado em "plano de fundo":

```bash
# Em um SEGUNDO terminal rodando na mesma pasta raiz:
cd frontend

# Instale os pacotes principais do framework e do bundler
npm install

# Inicie a aplicação com o Vue server 
npm run dev
```

Você perceberá que o frontend passará uma porta (normalmente a `5173` ou `5174`), basta dar um `Ctrl + Clique` ou colar no seu navegador!

Divirta-se criando os projetos e modelando layouts baseados aos inputs em tela!
