import { test,expect,request,type APIRequestContext } from '@playwright/test';
import fs from 'node:fs/promises';
import { Pool,neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor=ws;
const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:15000});
let teacher:APIRequestContext,student:APIRequestContext,other:APIRequestContext;
let login:any,otherLogin:any;const ids:string[]=[];let releaseRows:any[]=[];
const suffix=Date.now().toString();
async function session(username:string,password:string){const ctx=await request.newContext({baseURL:'http://localhost:3000',extraHTTPHeaders:{Origin:'http://localhost:3000'}});const r=await ctx.post('/api/auth/login',{data:{username,password}});expect(r.status(),await r.text()).toBe(200);return ctx}
async function release(id:string){const r=await teacher.post('/api/teacher/release',{data:{lessonId:id,mode:'release'}});expect(r.status(),await r.text()).toBe(200)}
test.beforeAll(async()=>{
 const credentials=await fs.readFile('.admin-access.txt','utf8');teacher=await session('professor',credentials.match(/Senha: (.+)/)![1].trim());
 releaseRows=(await pool.query('SELECT * FROM releases WHERE lesson_id=ANY($1::text[])',[['entradas','variaveis']])).rows;
 for(const [name,username] of [['Teste Primeiro','qa_a_'+suffix],['Teste Segundo','qa_b_'+suffix]]){const r=await teacher.post('/api/teacher/students',{data:{name,username}});expect(r.status()).toBe(201);const creds=await r.json();if(!login)login=creds;else otherLogin=creds;ids.push((await pool.query('SELECT id FROM users WHERE username=$1',[username])).rows[0].id)}
 student=await session(login.username,login.pin);other=await session(otherLogin.username,otherLogin.pin);
});
test.afterAll(async()=>{
 for(const row of releaseRows)await pool.query('UPDATE releases SET released=$1,release_at=$2,updated_by=$3 WHERE class_id=$4 AND lesson_id=$5',[row.released,row.release_at,row.updated_by,row.class_id,row.lesson_id]);
 if(ids.length){for(const table of ['sessions','drafts','progress','attempts','hints','xp_events','submissions'])await pool.query(`DELETE FROM ${table} WHERE user_id=ANY($1::uuid[])`,[ids]);await pool.query('DELETE FROM audit_events WHERE actor_id=ANY($1::uuid[]) OR target=ANY($2::text[])',[ids,ids]);await pool.query('DELETE FROM users WHERE id=ANY($1::uuid[])',[ids])}
 await teacher?.dispose();await student?.dispose();await other?.dispose();await pool.end();
});
test('sessions, roles and closed lessons are enforced by the server',async()=>{
 const anonymous=await request.newContext({baseURL:'http://localhost:3000'});expect((await anonymous.get('/api/me')).status()).toBe(401);await anonymous.dispose();
 expect((await student.get('/api/teacher/students')).status()).toBe(403);
 expect((await student.get('/api/lessons/variaveis')).status()).toBe(403);
 expect((await student.get('/api/lessons/cap8-1')).status()).toBe(403);
 expect((await student.post('/api/profile',{headers:{Origin:'https://untrusted.example'},data:{avatar:'🐶',reduceMotion:false}})).status()).toBe(403);
 const payload=await(await student.get('/api/lessons/detetive')).json();expect(payload.lesson.solution).toBeUndefined();expect(payload.lesson.quiz[0].answer).toBeUndefined();expect(payload.lesson.quiz[0].explanation).toBeUndefined();
});
test('parallel rewards and repeated hints do not duplicate points',async()=>{
 await Promise.all(Array.from({length:6},()=>student.post('/api/lessons/setup/setup',{data:{item:0}})));
 expect(Number((await(await student.get('/api/me')).json()).user.score)).toBe(10);
 const first=await student.post('/api/lessons/detetive/quiz',{data:{questionId:'if',choice:1}});expect((await first.json()).gain).toBe(40);
 await Promise.all(Array.from({length:4},()=>student.post('/api/lessons/robo/solution',{data:{mission:1}})));
 expect(Number((await(await student.get('/api/me')).json()).user.score)).toBe(20);
 const trace={mission:1,events:['say'],words:['Olá, mundo!'],hasFor:false};
 const results=await Promise.all(Array.from({length:3},()=>student.post('/api/lessons/robo/practice',{data:trace})));
 expect((await Promise.all(results.map(r=>r.json()))).reduce((sum,r)=>sum+r.gain,0)).toBe(12.5);
 expect(Number((await(await student.get('/api/me')).json()).user.score)).toBe(32.5);
 await other.post('/api/lessons/robo/solution',{data:{mission:1}});expect(Number((await(await other.get('/api/me')).json()).user.score)).toBe(0);
 await student.post('/api/lessons/detetive/quiz',{data:{questionId:'igual',choice:0}});expect((await(await student.post('/api/lessons/detetive/quiz',{data:{questionId:'igual',choice:1}})).json()).gain).toBe(20);
});
test('release, optimistic draft conflicts, isolation and delivery feedback',async()=>{
 await release('entradas');expect((await student.get('/api/lessons/entradas')).status()).toBe(200);
 const r=await student.post('/api/lessons/entradas/draft',{data:{code:'print("Meu rascunho")',stdin:'Lia',version:0}});expect((await r.json()).version).toBe(1);
 expect((await student.post('/api/lessons/entradas/draft',{data:{code:'stale',stdin:'',version:0}})).status()).toBe(409);
 expect((await(await other.get('/api/lessons/entradas')).json()).draft).toBeNull();
 const content={code:'print("entrega")',stdin:'',output:'entrega',requestId:crypto.randomUUID()};await student.post('/api/lessons/entradas/submit',{data:content});await student.post('/api/lessons/entradas/submit',{data:content});
 const submissions=(await(await student.get('/api/lessons/entradas')).json()).submissions;expect(submissions).toHaveLength(1);
 await teacher.post('/api/teacher/feedback',{data:{id:submissions[0].id,feedback:'Bom começo. Agora experimente outras entradas.'}});
 expect((await(await student.get('/api/lessons/entradas')).json()).submissions[0].feedback).toContain('Bom começo');
 expect((await other.post('/api/teacher/feedback',{data:{id:submissions[0].id,feedback:'Tentativa indevida'}})).status()).toBe(403);
});
test('UI executes real Python with input in an isolated sandbox and persists edits',async({page})=>{
 await page.goto('/');await page.getByLabel('Usuário',{exact:true}).fill(login.username);await page.getByLabel('PIN de quatro dígitos').fill(login.pin);await page.getByRole('button',{name:'Entrar na minha trilha'}).click();await expect(page.getByRole('heading',{name:/Olá, Teste/})).toBeVisible();
 await page.screenshot({path:'.qa/trilha-desktop.png',fullPage:true});
 const chapter=page.locator('article.chapter-card').filter({has:page.getByRole('heading',{name:'Variáveis e entradas',exact:true})});await chapter.locator('summary').click();await chapter.getByRole('button',{name:'Seu programa escuta'}).click();
 await expect(page.getByRole('heading',{name:'Seu programa escuta'})).toBeVisible();
 await page.getByLabel('Seu código Python').fill('nome = input("Nome: ")\nhoras = int(input("Horas: "))\nprint(f"Olá, {nome}! Total: {horas * 25}")');
 await page.getByLabel('Entradas · uma resposta por linha').fill('Lia\n6');
 await expect(page.getByText('Salvo na conta',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Executar código',exact:true}).click();
 await expect(page.locator('.workspace .code-output').first()).toContainText('Olá, Lia! Total: 150',{timeout:110000});
 const frame=page.frames().find(f=>f.url().includes('/runner.html'))!;expect(frame).toBeTruthy();
 expect(await frame.evaluate(()=>{try{void parent.document.body;return true}catch{return false}})).toBe(false);
 await page.screenshot({path:'.qa/aula-desktop.png',fullPage:true});
 await page.getByLabel('Seu código Python').fill('while True:\n    pass');await page.getByRole('button',{name:'Executar código',exact:true}).click();await expect(page.getByRole('button',{name:'Parar',exact:true})).toBeVisible();await page.getByRole('button',{name:'Parar',exact:true}).click();await expect(page.getByRole('button',{name:'Executar código',exact:true})).toBeEnabled();
 await page.getByLabel('Seu código Python').fill('print("rascunho final")');await expect(page.getByText('Salvo na conta',{exact:true})).toBeVisible();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await page.screenshot({path:'.qa/aula-mobile.png',fullPage:true});
 await page.reload();await expect(page.getByRole('heading',{name:/Olá, Teste/})).toBeVisible();
 const savedDraft=(await(await student.get('/api/lessons/entradas')).json()).draft;expect(JSON.parse(savedDraft.code).work['1'].code).toBe('print("rascunho final")');
});
test('robot executes real Python and records a completed mission',async({page})=>{
 await page.goto('/');await page.getByLabel('Usuário',{exact:true}).fill(otherLogin.username);await page.getByLabel('PIN de quatro dígitos').fill(otherLogin.pin);await page.getByRole('button',{name:'Entrar na minha trilha'}).click();
 const chapter=page.locator('article.chapter-card').filter({has:page.getByRole('heading',{name:'Seu ponto de partida',exact:true})});await chapter.locator('summary').click();await chapter.getByRole('button',{name:'Laboratório do robô'}).click();
 await page.getByRole('button',{name:'💬 Falar',exact:true}).click();await page.getByRole('button',{name:'Executar Python',exact:true}).click();await expect(page.locator('.victory')).toContainText(/(12,5|50) XP/,{timeout:110000});
 await page.screenshot({path:'.qa/robo-desktop.png',fullPage:true});
});
test('resetting a PIN revokes old sessions',async()=>{
 const response=await teacher.post('/api/teacher/student-action',{data:{id:ids[1],action:'reset'}});expect(response.status()).toBe(200);
 expect((await other.get('/api/me')).status()).toBe(401);
 const newContext=await session(otherLogin.username,(await response.json()).pin);expect((await newContext.get('/api/me')).status()).toBe(200);await newContext.dispose();
});
