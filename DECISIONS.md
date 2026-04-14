# Documentação de Decisões Técnicas

## Estado e Reatividade
- O contexto da aplicação gerencia seus estados internos puramente nativos em memória, sem a ajuda formal do `Pinia` ou do `Redux`. As amarrações acontecem pelo ecossistema reativo clássico `ref()` injetando instâncias mutáveis.
- O pipeline inteiro de Search/Listing na tela Principal flui inteiramente por uma propriedade computada (`computed()`), servindo como derivado de leitura instântanea (`Read-only Derived State`). Ao invés de causar mutações diretas atreladas a re-requisições completas das fontes, calculamos nativamente uma verificação local (Trie Filter sobre `String` e `Boolean`, seguida do encadeamento `Array.prototype.sort`).

## Fluxo de Busca e Roteamento
- A barra de pesquisa (Search) possui um WebObserver indireto via `watch()`. Qualquer alteração na injeção atualiza integralmente a Query String no componente de `vue-router` instanciado (`router.replace`), executando o refresh no Virtual DOM sem recarregar a tela, operando O(N) nas instâncias cacheadas em memória.
- As consultas passadas alimentam de maneira performática apenas a cache baseada em `localStorage`, evitando requisições extras contra nossa API (CORS/REST) pela simples busca do histórico anterior.

## Modelação de Domínio (Datas e Blobs)
- A formatação de tráfego entre REST/Client lida com datas mantidas unicamente num timestamp primitivo padronizado na ISO-8601 (`YYYY-MM-DD`). O tratamento de locale brasileiro e conversão é tarefa delegada para rodagem no lado View do frontend mediante a biblioteca encarregada purista `date-fns`.
- Resolução de Arquivo: O Upload da imagem do formulário aciona uma transcrição síncrona `FileReader` processadas como String *Base64* (Data URI API). Essa premissa garante de forma simulada e barata a entrega do Payload e renderização real-time, evitando implantação de `Multer` ou conexões com Storage externo da AWS para este cenário controlado.
