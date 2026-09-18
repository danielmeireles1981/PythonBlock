# PythonBlock — guia de uso

Publicado em https://pythonblock.vercel.app em 18/09/2026.

## Primeiro acesso

1. Abra o site e marque **Sou professor**.
2. Use o usuário `professor` e a senha no arquivo local privado `.admin-access.production.txt`.
3. Em **Minha conta**, altere a senha. A alteração encerra as sessões e pede novo login.
4. Em **Painel do professor → Alunos**, informe nome e usuário. O sistema gera um PIN de quatro dígitos, exibido para entrega individual ao aluno.
5. Em **Aulas e liberações**, libere, bloqueie ou agende cada aula. Agendamentos usam o horário de Brasília. Essas ações não exigem nova publicação.
6. Acompanhe as atividades em **Entregas**, registre feedback e exporte o resumo de progresso na aba **Alunos**.

O aluno entra com usuário e PIN. Rascunhos, respostas, entregas e pontos ficam vinculados à conta no banco de dados. A redefinição de PIN encerra sessões anteriores. Não compartilhe o arquivo de acesso do professor com a turma.

## Conteúdo desta versão

- Capítulo 0: missão, backend, preparação do ambiente, laboratório do robô e quiz detetive. Inicialmente liberado.
- Capítulo 1: variáveis, operadores, entradas e primeiros textos. Quatro aulas prontas, inicialmente bloqueadas para liberação pelo professor.
- Capítulos 2 a 8: mapa organizado na sequência dos materiais fornecidos, com atividades ainda **em preparação**. Não podem ser liberadas antes de receber conteúdo.

Python real roda no navegador em ambiente isolado. Para `input()`, preencha uma resposta por linha no campo de entradas. É possível parar a execução e exportar o código `.py`. A primeira execução precisa baixar o interpretador. O resultado executado no navegador é prática, não correção formal automática.

O protótipo original `index.html` foi preservado. Contas e pontos antigos do armazenamento local não são importados automaticamente.

## Dados e manutenção

- Aplicação: Next.js na Vercel, projeto `pythonblock`, funções na região de São Paulo.
- Banco: Neon Postgres. Produção e desenvolvimento/prévia usam bancos separados.
- Senhas/PIN: hashes com salt e segredo por ambiente; sessão em cookie protegido.
- `.env.local`: somente banco de teste; `.env.production.local`: produção, privado. Não versionar, publicar ou enviar esses arquivos.
- `.admin-access.txt`: professor de testes. `.admin-access.production.txt`: professor de produção. Alterar a senha pelo site torna o registro inicial desatualizado.
- O código é publicado pelo CLI. Integração com repositório Git remoto ainda não foi configurada.
- Não há monitoramento contínuo nem rotina externa automática de backup configurados nesta entrega. Exportar o progresso em CSV não substitui backup completo.

Antes de importar uma turma real, estabeleça a rotina de recuperação: no painel Neon, confira a janela de restauração disponível no plano contratado; crie uma cópia/branch de recuperação antes de mudanças de estrutura; valide essa cópia em ambiente separado e somente então altere a conexão de produção. Não teste restaurações sobre o banco ativo. Preserve também `AUTH_SECRET` em armazenamento seguro: ele é necessário para validar os hashes de acesso. A restauração de backup ainda não foi ensaiada nesta entrega.

## Desenvolvimento

Instale dependências com `npm ci`. Configure `.env.local` seguindo `.env.example`, utilizando somente o banco de testes. Execute `npm run db:migrate` e `npm run db:seed` e inicie com `npm run dev`.

Verificações: `npm test`, `npm run build` e, com servidor local ativo, `npx playwright test`. Os testes completos criam contas fictícias no banco de testes e as removem ao terminar; nunca aponte essa rotina para produção.

Para acrescentar aulas, adapte e revise `content/course.json`, mantenha IDs estáveis, marque conteúdo pronto como `published: true`, execute o seed no ambiente correspondente e publique o código atualizado. O seed preserva liberações existentes. A liberação cotidiana ocorre pelo painel do professor.

## Validação da publicação inicial

Compilação concluída; quatro testes unitários e seis testes completos aprovados. Cobertura: isolamento de contas, proteção de aulas e respostas, pontos sem duplicação, conflito entre rascunhos, entregas e feedback, revogação de sessões, Python com entradas, interrupção de loop infinito e tela móvel.

No endereço público foram verificados login do professor, painel, formulário de aluno, entregas, execução real de Python, largura móvel e logout. Nenhum erro de JavaScript foi detectado nessa verificação, e a consulta aos registros de execução da Vercel não retornou erros no período verificado. Isso não equivale a auditoria completa de acessibilidade ou segurança.
