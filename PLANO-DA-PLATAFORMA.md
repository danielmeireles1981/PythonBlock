# PythonBlock — plano da plataforma por capítulos

18/09/2026. Proposta de implementação. Banco e publicação ainda não implantados.

## Decisões confirmadas

Uma turma inicial; contas de aluno com usuário e PIN criadas pelo professor; liberação conforme as aulas; dados compartilhados em banco; hospedagem na Vercel.

## Organização pedagógica

Hierarquia: curso → capítulo → aula → atividade. A aula é a unidade de liberação. Um PPTX pode originar várias aulas curtas; não equivale necessariamente a um encontro do calendário.

| Capítulo | Material | Divisões propostas |
|---|---|---|
| 0. Preparação | Protótipo atual | Missão Pet Pallet/RH360, backend, setup, primeiros comandos |
| 1. Variáveis e entradas | 02 — Operadores — Variáveis | Tipos, nomes, operadores, strings iniciais, input e conversões |
| 2. Decisões | 03 — Estruturas Condicionais | if, else, elif e condições combinadas |
| 3. Repetições | 04 — Estruturas de Repetição | while, contadores, acumuladores, break e repetições aninhadas |
| 4. Coleções | 05 — Listas P1 a P4 | 4.1 Listas e cópias; 4.2 filas, pilhas, pesquisas, for/range/enumerate e listas aninhadas; 4.3 dicionários; 4.4 tuplas |
| 5. Textos | 06 — Guia de funções, Strings P1 e P2 | Consulta, pesquisa, transformação, validação, formatação e desafios |
| 6. Funções | 07 — P1 e P2 | def/return, escopo, recursão, parâmetros, lambda, exceções e módulos |
| 7. Arquivos | 08 — Principal e Extra | CSV, JSON, operações de cadastro e desafio integrador |
| 8. Bibliotecas | 10 — Bibliotecas | import/from/as, módulos próprios, biblioteca padrão, pacotes externos |

O arquivo de Bibliotecas identifica-se como módulo 09 nos slides. Listas P3 trata de dicionários e P4 de tuplas. Não foi identificada uma unidade dedicada a conjuntos nos textos dessas quatro partes; se desejada, será conteúdo complementar a elaborar. Não há material específico de POO entre os arquivos recebidos.

A sequência detalhada de for/range aparece em Listas P2. O loop do robô pode continuar como demonstração inicial, com formalização nessa aula. Strings começa no material 02 e é aprofundada no capítulo 5. O guia de funções de strings fica disponível como consulta do capítulo.

Recomenda-se arquivos principal antes do Extra, embora o Extra apareça primeiro na lista enviada. É um ajuste proposto, não uma mudança nos arquivos originais.

Cada aula: objetivo explícito, explicação curta, exemplo executável, prática guiada, exercício independente e resumo. Evolução do laboratório: blocos → completar código → editar Python → projeto com vários arquivos. Manter linguagem literal, navegação por teclado, movimento reduzido, ausência de cronômetros de pressão e retomada do trabalho.

## Liberação e acompanhamento

Professor: painel com toda a trilha e botão “Liberar para a turma”. Estados editoriais: rascunho, bloqueada, agendada ou liberada. Priorizar liberação manual na primeira versão; agendamento pode vir depois, exibindo America/Sao_Paulo e armazenando UTC.

Aluno: título dos próximos capítulos visível, conteúdo futuro bloqueado e botão “Continuar minha aula”. Aulas anteriores permanecem disponíveis. XP não impede acompanhar a aula seguinte. Publicação e conclusão são estados distintos: por aluno, uma aula pode estar não iniciada, em andamento ou concluída.

A autorização é verificada no servidor em cada acesso e envio. Enunciados, soluções e materiais bloqueados não são enviados antecipadamente ao navegador. Uma liberação modifica o banco, sem novo deploy. Datas agendadas podem ser verificadas no acesso, sem cron obrigatório. Bloquear novamente não apaga o histórico.

Professor cria/importa alunos, gera e redefine PINs, desativa contas, acompanha tentativas e entregas, oferece feedback e exporta progresso em CSV. Aluno salva rascunhos, executa Python, entrega atividades e consulta seu próprio progresso. Ranking público não é padrão.

## Arquitetura recomendada

Next.js + TypeScript na Vercel; PostgreSQL no Neon, integrado pelo Vercel Marketplace; Pyodide em Worker no navegador.

O servidor concentra login, autorização, liberação, persistência e pontuação. Credenciais do banco nunca ficam no HTML ou em variáveis públicas. LocalStorage passa a servir para preferências e recuperação temporária de rascunhos, sem ser a fonte oficial de contas ou XP.

A versão online evolui para projeto modular. O index.html permanece como protótipo de referência, pois a restrição de arquivo único não atende à nova separação entre interface, credenciais e dados compartilhados.

Pequenos arquivos de código e CSV/JSON podem ser guardados como texto no banco com limites. Se houver download de PPTX/PDF, usar armazenamento privado de arquivos, por exemplo Vercel Blob, com acesso autorizado. Não publicar automaticamente toda a pasta dos materiais.

## Contas e sessões

Cadastro público desativado. Usuário e PIN individuais criados pelo professor. PIN protegido com função apropriada de derivação de senha, salt e segredo do servidor, nunca texto puro. PIN de quatro dígitos tem somente 10 mil combinações: aplicar limite de tentativas persistente por conta e origem, mensagens genéricas e redefinição docente. O hash sozinho não resolve essa limitação.

Sessões revogáveis, cookie HttpOnly/Secure/SameSite, expiração, logout e revogação após redefinir o PIN. Conta docente usa autenticação mais forte, separada do PIN do aluno. Usar bibliotecas mantidas; não criar criptografia própria.

Toda operação verifica usuário, papel e vínculo com a turma. Cada estudante acessa apenas seu trabalho. Incluir entidade turma desde o início, embora exista uma só. Não coletar diagnósticos ou informações desnecessárias para a atividade.

## Dados

| Entidade | Finalidade |
|---|---|
| users, sessions | Identidade, credencial protegida, papel, avatar e sessões |
| classes, memberships | Turma e participantes |
| chapters, lessons | Ordem, objetivos, versão e referência aos slides |
| lesson_releases | Aula, turma, estado, data e professor responsável |
| activities | Enunciado, tipo, versão, critérios e pontuação |
| drafts, workspace_files | Código e arquivos, versão e data de salvamento |
| attempts, submissions | Tentativas e entregas imutáveis, resultados e origem da validação |
| progress | Estado por aluno/aula e ponto de retomada |
| hint_events, xp_events | Uso de apoio e histórico de créditos/débitos |
| feedback, audit_events | Retorno docente e mudanças administrativas |

Aplicar relações, índices, transações e unicidade. Rascunhos precisam de controle de versão para evitar sobrescrita silenciosa entre dispositivos.

## XP e avaliação

Preservar inicialmente as regras existentes. O servidor calcula os valores e impede repetição de recompensas; não aceita um saldo enviado pelo navegador. Revelação de solução, débito e mudança de regra acontecem na mesma transação. Guardar o débito efetivo quando o saldo não chega a 30, respeitando mínimo zero. Usar decimal exato para recompensas como 12,5 e 18,75 XP.

Quizzes podem ser corrigidos no servidor. Resultado de Python executado no navegador pode ser alterado pelo aluno: identificar como prática local. Para avaliação formal, começar com revisão docente. Correção automática confiável de código exigiria um serviço isolado de execução; não executar código arbitrário nas funções da aplicação.

Sugestão pedagógica futura: dica conceitual gratuita e penalidade apenas para solução completa. Essa sugestão não modifica automaticamente as regras atuais. XP e domínio do conteúdo devem aparecer como indicadores distintos.

## Laboratório necessário para as próximas aulas

- input(): inicialmente painel com entradas por linha, informando quando faltarem valores.
- Editor Python livre e execução interrompível, além dos desafios do robô.
- Salvamento automático, com estados “salvando”, “salvo” e “sem conexão”.
- Espaço de arquivos por atividade, com main.py, módulos e CSV/JSON.
- Sincronização explícita do sistema de arquivos virtual do Pyodide com o banco. open() não salva automaticamente na nuvem.
- Exportação de .py/.csv/.json, com limites e validação de nomes e caminhos.
- Bibliotecas testadas quanto à compatibilidade com Pyodide; preservar instruções de VS Code/.venv/pip para tarefas locais. Nem todo pacote funciona no navegador.

## Adaptação dos materiais

Leitura feita: texto estruturado dos 15 PPTX, totalizando 567 slides. Exemplos que existem apenas em capturas de tela ainda precisam de inspeção visual/transcrição antes de se tornarem exercícios executáveis. Originais preservados.

Ordens como “enviar no Classroom” dentro dos documentos são conteúdo das aulas, não autorização para enviar arquivos. Proposta: permitir exportação e introduzir entregas internas gradualmente, mantendo explícito o destino de cada atividade.

Revisar tecnicamente antes de adaptar: o slide 6 do material 02 restringe excessivamente nomes de variáveis, pois Python aceita underscore inicial e identificadores Unicode. Em Listas P1, slide 40, a restrição de extend a listas está incorreta; o método aceita iteráveis. Corrigir a nova explicação sem alterar silenciosamente o original.

Atividades terão IDs e versões estáveis. Atualizações de conteúdo não apagam entregas nem concedem XP novamente sem decisão explícita.

## Implementação e publicação

1. Fundação: projeto modular, banco, autenticação, turma, painel docente, mapa do curso e regras de liberação.
2. Primeiro conteúdo: migrar capítulo 0 e criar capítulo 1, incluindo input e salvamento de código.
3. Prévia Vercel: banco de teste separado; verificar duas contas de aluno e uma docente, bloqueio por URL/API, isolamento, recuperação em outro dispositivo, reset de PIN e idempotência de XP.
4. Produção: repositório privado, projeto Vercel, banco de produção, migrações, segredos por ambiente, política de backup e teste de restauração. Publicar com a primeira aula liberada e verificar o endereço final.
5. Expandir capítulos conforme calendário. Adicionar vários arquivos antes das aulas de módulos/arquivos.

Progresso do protótipo local não migra sozinho para o novo domínio. Se já houver uso real, oferecer exportação na origem e importação única, vinculada e revisada pelo professor. Não aceitar identidade, PIN ou pontuação de um arquivo local como dados autenticados. Se ainda não houve uso em aula, iniciar com contas novas.

A Vercel conectada foi consultada somente para leitura. A equipe usa Hobby e já existe python-interactive, sem evidência de ser este projeto. Proposta: projeto separado pythonblock, salvo decisão de reaproveitamento após inspeção. Nenhum recurso pago ou deploy foi criado.

Hobby é descrito pela Vercel como uso pessoal não comercial. Confirmar adequação ao uso institucional e limites/backup do plano do banco antes da produção. Não estimar custo fechado sem essa definição.

## Critérios de aceite

Professor cria conta e libera aula sem código; aluno recupera progresso em outro computador; conteúdos bloqueados e dados de colegas são inacessíveis por URL/API; ações repetidas não duplicam XP; reset revoga sessões; input funciona; loop infinito é interrompível; rascunhos não se perdem em erros ou conflitos; teclado/tela pequena/movimento reduzido funcionam; testes e produção têm bancos separados; existe procedimento de recuperação dos dados.

## Referências consultadas

- https://vercel.com/docs/marketplace-storage
- https://vercel.com/marketplace/neon
- https://vercel.com/docs/plans/hobby
- https://pyodide.org/en/stable/usage/file-system.html
- https://docs.python.org/3/reference/lexical_analysis.html#identifiers
- https://docs.python.org/3/library/stdtypes.html#mutable-sequence-types

## Situação após a implementação — 18/09/2026

Fundação e primeiros conteúdos implementados e publicados em https://pythonblock.vercel.app. Bancos Neon separados para teste e produção. Nove aulas prontas nos capítulos 0 e 1; demais capítulos ainda em preparação. Quatro testes unitários, seis testes completos e verificação no endereço público aprovados. As observações anteriores sobre recursos ainda não criados descrevem a etapa de planejamento, não a situação atual.

A publicação foi direta em produção após testes locais com banco separado; não houve uma publicação intermediária de prévia. O repositório remoto, a rotina automática de backup e o ensaio de restauração continuam pendentes e estão explicitados no GUIA-DE-USO.md. A expansão dos capítulos seguirá os materiais e o calendário das aulas.
