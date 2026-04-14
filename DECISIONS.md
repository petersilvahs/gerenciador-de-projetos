# Documentação de Decisões Técnicas

## Arquitetura
Optei por utilizar uma arquitetura dividida em dois blocos:
- **`frontend` (Vue + Vite + TypeScript)**: Para garantir alta performance local e uso modular de CSS (CSS Modules) oferecendo fidelidade ao design original, escolhemos Vite com Vue sem TailwindCSS (completamente Vanilla CSS moderno com variáveis nativas).
- **`api` (Node.js + Express + TypeScript)**: Para cumprir a exigência de construir uma API com framework TypeScript independente, foi construída uma API REST simples interagindo com um mock de banco de dados (`db.json`) em disco utilizando `fs` sync/async.

## Estado e Fetching
- Foram utilizados os hooks básicos `useState`, `useEffect` e `useMemo` do React. A listagem usa `useMemo` para não trigar rerenders na digitação, apenas computando buscas/filtros internamente de maneira otimizada.

## CSS Modules
- Utilização de Vanilla CSS escopado localmente, prevenindo colisão de nome de classes entre as páginas (ex: `styles.card` em vários escopos).
- Variáveis de tema foram definidas no `:root` no `index.css` de forma a facilitar manutenções se houvessem necessidades de dark mode no futuro.

## Funcionalidades Chave
- **Busca por texto com highlight**: Foi implementado utilizando um `RegExp` dinâmico montado com React elements (`<strong>`) que preserva a letra maiúscula original das palavras ao dar replace.
- **Histórico de Buscas**: Mantido em `localStorage` e renderizado em um dropdown interativo abaixo da busca, para proporcionar sensação State-Of-The-Art e alta usabilidade ao interagir com pesquisas passadas.
- **Data model**: Dates estão tipadas como strings ISO e são processadas como Data nativa no Frontend via `date-fns` por conta da formatação brasileira "dd de MMMM de yyyy" demandada pelo design. A capa é subida apenas lendo em base64 com `FileReader` minimizando complexidade no backend com storages e blobs enquanto validamos fidelidade da tela.
