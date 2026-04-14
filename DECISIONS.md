# Documentação de Decisões Técnicas

## Arquitetura
Optei por utilizar uma arquitetura totalmente desacoplada, separando as responsabilidades em dois blocos:
- **`frontend` (Vue 3 + Vite + TypeScript)**: Escolhi o ecosistema Vue 3 (Composition API) junto ao Vite para garantir o máximo de flexibilidade e performance local. A componentização isolada e nativa me permitiu focar nas energias na estruturação. Para estilização, priorizei o Vanilla CSS moderno através de `CSS Scoped` nativo do Vue. Isso garantiu modularidade das classes eliminando colisões de nomes globais, eliminou o overhead de frameworks externos como TailwindCSS e me deu total precisão matemática na hora de buscar alta fidelidade em pixels aos tokens de design propostos no Figma.
- **`api` (Node.js + Express + TypeScript)**: Para a construção independente da API via Typescript, implementei uma estrutura REST simples sobre Express. Com o objetivo de maximizar a portabilidade prático-avaliativa (para facilitar os testes de quem for avaliar a vaga), as rotas operam lendo e escrevendo um arquivo `.json` interno na pasta raiz.

## Estado e Reatividade
Toda a lógica de listagem e controle de estado é manipulada de maneira purista pela função de reatividade `.ref()` combinada diretamente à otimização do `.computed()` do Vue. Todos os filtros, ordenação e a busca formam uma estrutura derivada ("computed output") para proteger os dados originais brutos e manter a tela instântanea nas re-renderizações parciais. 

## UI / UX Design e Fidelidade
- **Layout Fiel a Dimensões Naturais**: Desde a estruturação das miniaturas (com os cartões atingindo sua área mínima robusta até esticarem sobre o _grid_) até elementos customizados complexos – como as interações de Modais, drop-shadows flutuantes e botões de `...` e Pointers de Popups, as unidades foram respeitadas seguindo a exatidão do wireframe estabelecido.
- **Micro Interações e UX Refinada**: Implementei tratamentos nativos no front, usando hooks do HTML5 (`:invalid`, `checkValidity()`). Quando os usuários enviam um formulário faltando as "Regras Obrigatórias", classes dinâmicas reativas geram imediatamente feedbacks de perigo visuais em vermelho (`var(--danger)`) para guiar a correção rapidamente.

## Funcionalidades Chave Adicionais
- **Pesquisa Progressiva e Real-Time**: Construí um Search global reativo. Em vez de obrigar o usuário a preencher e processar com `Enter`, a aplicação observa e rastreia o digitado injetando a informação dinâmicamente na rota principal em tempo real. As listas e `highlights` (destaques textuais visíveis usando expressões regulares injetadas nativamente) são processadas instantaneamente conforme você digita. 
- **Histórico Persistente (Storage)**: A busca engajadora emite os últimos 5 termos no `localStorage` permitindo que a janela recupere imediatamente atalhos fáceis nas próximas sessões.
- **Camada de Dados & Processamento Base64**: Datas utilizam formatações ISO na base e conversão em biblioteca leve focada de interface na frente (date-fns). Imagens submetidas utilizam processamento local simples sem fricção em FileReader (Base64), para garantir consistência simulada do Mockup em caso de armazenamento real postergado em ambientes s3. Imagens não selecionadas caem diretamente em um fallback planejado de Mock com overlays de ícones customizáveis da marca.
