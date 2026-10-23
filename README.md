# Auto Gestão — frontend da concessionária

Painel administrativo em Angular para a concessionária, integrado ao backend Spring Boot
[`luanadbrt/atividade2809`](https://github.com/luanadbrt/atividade2809).

Interface com identidade **Glassmorphism**, menu lateral recolhível, dashboard com dados reais,
CRUD completo de clientes e seletor de cidades ligado à API.

| Camada   | Tecnologias                                                                 |
| -------- | --------------------------------------------------------------------------- |
| Frontend | Angular 22 (standalone, signals, zoneless), PrimeNG 22 + tema Aura, Reactive Forms, HttpClient |
| Testes   | Vitest + jsdom (`@angular/build:unit-test`)                                 |
| Backend  | Spring Boot 2.7.18, Spring Data JPA, PostgreSQL (projeto separado)          |

---

## Como executar

### 1. Backend (projeto `atividade2809`)

1. Crie o banco `concessionaria` no PostgreSQL e rode `sql/01_pais.sql`, `02_estado.sql` e
   `03_cidade.sql` (veja o `sql/README.md` do backend).
2. Ajuste usuário/senha em `src/main/resources/application.properties` do backend.
3. Inicie `EstruturaDadosApiApplication`. A API sobe em `http://localhost:8080`.

> A porta 8080 precisa estar livre. Se outro servidor estiver usando (ex.: Payara/GlassFish),
> pare-o ou suba o backend em outra porta (`--server.port=8081`) e altere o `target` em
> `proxy.conf.json`.

### 2. Frontend

```bash
npm install
npm start
```

Abra `http://localhost:4200`. O dev server encaminha `/api/*` para `http://localhost:8080`
(arquivo [`proxy.conf.json`](proxy.conf.json)), então **não é preciso configurar CORS** no backend
para desenvolver.

### Outros comandos

| Comando                            | O que faz                                              |
| ---------------------------------- | ------------------------------------------------------ |
| `npm test`                         | Testes em modo observação                              |
| `npm run test:ci`                  | Testes uma vez (CI)                                     |
| `npm run build`                    | Build de produção em `dist/concessionaria`             |
| `npm run serve:ssr:concessionaria` | Serve o build (Node/Express) em `http://localhost:4000` |

---

## Funcionalidades

### Layout

- **Cabeçalho** de vidro com marca "Auto Gestão", título da tela atual e área de usuário.
- **Menu lateral** translúcido, controlado por uma **seta na borda do próprio menu**:
  - **Desktop:** começa expandido em telas ≥ 1280 px e como trilho de ícones entre 992 e 1279 px.
    A seta alterna entre trilho e menu completo, e o conteúdo ocupa o espaço liberado.
  - **Celular/tablet (< 992 px):** começa fechado; a seta vira uma aba na borda esquerda da tela
    que abre a gaveta. Fecha pela aba, pelo "X", pelo overlay, com **Esc** ou ao escolher uma
    rota. A rolagem do fundo fica travada enquanto a gaveta está aberta.
  - `aria-controls`, `aria-expanded`, foco preso na gaveta aberta, foco devolvido ao fechar, e
    menu fechado fora da navegação por teclado (`inert`).
- Link "Pular para o conteúdo", títulos de aba por rota ("Clientes · Auto Gestão") e página 404.

### Dashboard (`/dashboard`)

Indicadores calculados a partir de `GET /clientes/listar-clientes` — nenhum número inventado:
total de clientes, pessoas físicas, pessoas jurídicas, composição PF × PJ, cidades com mais
clientes, cadastros sem cidade e últimos cadastrados. Inclui estados de carregamento, vazio e erro.

### Clientes (`/clientes`, `/clientes/novo`, `/clientes/:id/editar`)

- **Listagem:** ID, nome, tipo, CPF/CNPJ, telefone, e-mail e cidade; busca por nome (ignora
  acentos) ou CPF/CNPJ (com ou sem pontuação), filtro por tipo, ordenação, paginação e coluna de
  ações sempre visível. Em telas pequenas, cada linha vira um cartão.
- **Cadastro/edição:** o mesmo formulário (Reactive Forms) para POST e PUT, com:
  - campos obrigatórios marcados e mensagem de erro própria em cada campo;
  - máscara dinâmica de CPF/CNPJ conforme o tipo de pessoa, e máscaras de telefone (fixo/celular)
    e CEP;
  - validação de CPF, de CNPJ numérico e **alfanumérico** (IN RFB 2.229/2024), de telefone, CEP,
    e-mail e tamanhos;
  - indicador de envio, bloqueio de envio duplicado, toast de sucesso/erro e dados preservados se
    a API falhar;
  - "Cancelar" pede confirmação quando há alterações.
- **Exclusão:** diálogo informando nome e documento; o `DELETE` só é feito após a confirmação.

### Cidades

Campo com busca na API: nome (mínimo 2 letras) via `/cidades/buscar-cidade-por-nome/{nome}` ou
código IBGE de 7 dígitos via `/cidades/buscar-codigo-ibge/{codigo}`. As opções mostram UF e IBGE,
para diferenciar cidades homônimas (há uma Cascavel no CE e outra no PR). O cliente é enviado com
`cidade: { id }`, que é o que o `@ManyToOne` do backend espera — nunca o nome em texto.

### Configurações (`/configuracoes`)

Preferências salvas no navegador (iniciar com menu recolhido, linhas por página) e teste de
conexão com a API, que mostra o tempo de resposta e o total de clientes.

---

## Estrutura

```
src/app/
  core/
    models/         Cliente, Cidade, Estado (espelham as entidades do backend)
    services/       ClienteService, CidadeService, Notificacao, Preferencias
    http/           tradução de erros HTTP em mensagens
    tema/           preset do PrimeNG (paleta) e tradução pt-BR
  layout/           MainLayout, Header, Sidebar, LayoutService, navegacao.ts
  components/       telas: dashboard, cliente (listar/cadastrar), cidade (seletor),
                    configuracoes, nao-encontrada
  shared/           componentes de UI, diretiva de máscara, pipes, validadores, utilitários
  testing/          dados usados apenas nos testes
src/environments/   apiUrl e licença PrimeUI por ambiente
```

As telas de cliente continuam em `components/cliente/` para preservar o histórico; só o serviço
foi movido (com `git mv`) para `core/services/`.

### Como adicionar um módulo (ex.: Veículos)

1. Crie o modelo em `core/models` e o serviço em `core/services`, usando os endpoints reais.
2. Crie a tela em `components/veiculo/` e a rota filha em `app.routes.ts` (`loadComponent`).
3. Inclua o item em `layout/navegacao.ts` e o ícone correspondente na `Sidebar`.

Veículos, Vendas, Ordens de Serviço e Marcas **não aparecem no menu** porque o backend ainda não
tem controllers para eles.

---

## Design system

Tokens em [`src/styles.css`](src/styles.css) (cores, espaçamento, raios, sombras, vidro) e no
preset [`core/tema/auto-gestao.preset.ts`](src/app/core/tema/auto-gestao.preset.ts) (PrimeNG).

| Token                 | Valor     | Uso                    |
| --------------------- | --------- | ---------------------- |
| `--ag-navy`           | `#17263B` | títulos, marca         |
| `--ag-primary`        | `#23599D` | ação principal         |
| `--ag-accent`         | `#3A6FB0` | destaques              |
| `--ag-bg`             | `#DCE7F2` | fundo                  |
| `--ag-text`           | `#1C344D` | texto principal        |
| `--ag-text-secondary` | `#62748A` | texto secundário       |

- Superfícies `.glass` (cabeçalho/menu, 55%) e `.glass-panel` (conteúdo, 76% — mais opaco para o
  texto manter contraste).
- **Fallback:** sem suporte a `backdrop-filter`, os painéis ficam quase opacos; com
  `prefers-reduced-transparency`, ficam sólidos.
- `prefers-reduced-motion` desliga animações e transições.
- No dashboard, PF usa `#3A6FB0` e PJ `#159A8C` (as mesmas cores dos selos da tabela). O par foi
  validado para luminosidade, croma, daltonismo e contraste; o azul-marinho foi descartado como cor
  de série por falhar nesses testes.

---

## Decisões técnicas

- **`@Service()` mantido.** No Angular 22 é um decorator público que registra o serviço no injetor
  raiz (equivale a `@Injectable({ providedIn: 'root' })`). Os serviços novos usam o mesmo padrão.
- **Renderização no navegador** (`RenderMode.Client` em `app.routes.server.ts`). Antes, o build
  pré-renderizava a página e quebrava com o erro do campo `cidade`. Como todas as telas dependem
  de dados ao vivo da API, pré-renderizar faria o build chamar o backend. A estrutura de SSR
  continua no projeto, e `security.allowedHosts` passou a liberar `localhost` (com a lista vazia,
  o servidor recusava todas as requisições).
- **Bootstrap removido** (era carregado por CDN só para o grid do formulário). Um único design
  system evita conflito de estilos com o PrimeNG e dispensa internet para o layout.
- **Máscaras próprias** (`shared/directives/mascara.directive.ts`). O campo mostra o valor
  formatado e o formulário guarda o valor sem pontuação, que é o que vai para a API. O
  `pInputMask` do PrimeNG não formatava valores carregados na edição e não aceita o CNPJ
  alfanumérico.
- **Normalização:** CPF/CNPJ, telefone e CEP são enviados sem máscara. Registros antigos salvos
  com máscara continuam sendo exibidos e editados corretamente.
- **Rótulos fixos acima dos campos** no lugar de float labels, por clareza e acessibilidade.
- **`@primeicons/angular`** declarado no `package.json`: já era usado no código, mas só existia
  como dependência indireta do PrimeNG.
- **Erros da API:** o backend responde HTTP 500 sem mensagem para erros de negócio, então
  `core/http/erro-api.ts` explica a causa mais provável de cada operação (ex.: CPF/CNPJ duplicado).

---

## Testes

`npm run test:ci` — 85 testes em 14 arquivos:

- serviços HTTP com `HttpTestingController` (URL, método e corpo de cada endpoint);
- CPF/CNPJ (inclusive alfanumérico), telefone, CEP, e-mail, máscara e normalização do payload;
- formulário: obrigatórios, troca CPF↔CNPJ, POST, PUT na edição, bloqueio de envio duplicado e
  dados preservados após erro;
- listagem: carregamento, filtros, estado vazio, erro com nova tentativa e exclusão só após
  confirmação;
- dashboard: indicadores, estado vazio e erro;
- menu: hambúrguer ausente no cabeçalho, seta na lateral, recolher/expandir no desktop e, no
  celular, gaveta com overlay, Esc, botão "X", trava de rolagem e fechamento ao navegar;
- rotas: redirecionamento para o dashboard, telas de cliente, títulos e página 404.

**Integração:** o CRUD completo (listar, cadastrar com cidade, editar, excluir), as buscas de
cidade por nome e IBGE e o teste de conexão foram feitos pela interface contra o backend Spring
Boot real, sem nenhuma alteração nele. O banco usado foi o **H2 em memória** (já é dependência do
backend), carregado com os mesmos estados e cidades dos scripts SQL. **A integração com o
PostgreSQL não foi verificada nesta máquina**: a senha local do PostgreSQL é diferente da que está
no `application.properties`.

---

## Pendências

### Backend (sugestões; nada foi alterado)

1. **CORS:** não há configuração. Em desenvolvimento o proxy resolve; para servir o build em
   outro endereço, libere a origem (`@CrossOrigin`/`WebMvcConfigurer`) ou publique a API atrás do
   mesmo domínio e use `apiUrl: '/api'` em `environment.ts`.
2. **Códigos HTTP:** cliente inexistente, CPF/CNPJ duplicado, código IBGE inexistente e exclusão
   de ID inexistente retornam **500**. O ideal seria 404/409 com mensagem (`@ControllerAdvice`).
3. **Busca de cidades:** diferencia acentos ("sao paulo" não encontra "São Paulo") e devolve 10
   resultados sem ordenação; a cidade exata pode não vir primeiro. Sugestão: `unaccent`, ordenar
   por nome e priorizar a correspondência exata.
4. **Validação no servidor:** só `nome` é obrigatório no banco. Recomenda-se Bean Validation
   (CPF/CNPJ, e-mail, tamanhos).
5. **Respostas de erro com stack trace** (`trace`) por causa do devtools — não expor em produção.
6. **Módulos futuros:** não há controllers para Marcas (só a entidade), Veículos, Vendas e Ordens
   de Serviço.
7. **Autenticação:** não existe; o cabeçalho mostra "Administrador · Acesso local" apenas como
   identificação visual.

### Frontend

1. **Licença PrimeUI:** o PrimeNG 22 mostra o selo "Invalid PrimeUI License" sem uma chave.
   Estudantes e pequenas equipes têm direito à licença Community gratuita; coloque a chave em
   `primeuiLicense` nos arquivos de `src/environments/`.
2. **Orçamento do bundle inicial:** o build avisa ~789 kB para um limite de 500 kB (antes das
   mudanças já eram 769 kB). O peso vem do PrimeNG, do tema e dos ícones; o código da aplicação
   tem ~110 kB e as telas são carregadas sob demanda.
3. Modo escuro não implementado (o projeto já usava `darkModeSelector: 'none'`).
4. Sair do formulário pelo menu não pede confirmação de descarte (só o botão "Cancelar" pede).
