import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID, randomInt, createHmac } from "node:crypto";
import { z } from "zod";
import { query, transaction } from "@/lib/db";
import { COOKIE, requireUser, requireTeacher, type User } from "@/lib/auth";
import { digest, opaqueToken, passwordHash, passwordMatches, normalizeUsername, requireOrigin, HttpError, secret } from "@/lib/security";
import { chapters, lessons, lessonById, publicLesson } from "@/lib/course";
import type { PoolClient } from "@neondatabase/serverless";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const ok=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:60*60*12};
async function body(req:Request){const text=await req.text();if(text.length>65000)throw new HttpError(413,"O conteúdo ultrapassa o limite desta atividade.");try{return JSON.parse(text)}catch{throw new HttpError(400,"Dados inválidos.")}}
async function accessible(user:User,id:string){
 const lesson=lessonById(id);if(!lesson)throw new HttpError(404,"Aula não encontrada.");
 if(!lesson.published)throw new HttpError(403,"Esta aula ainda está em preparação.");
 if(user.role!=="teacher"){
  const r=await query("SELECT 1 FROM releases WHERE class_id=$1 AND lesson_id=$2 AND (released=true OR release_at<=now())",[user.class_id,id]);
  if(!r.rowCount)throw new HttpError(403,"Esta aula será liberada pelo professor.");
 }
 return lesson;
}
async function audit(c:PoolClient,user:User,action:string,target:string){await c.query('INSERT INTO audit_events(id,actor_id,action,target) VALUES($1,$2,$3,$4)',[randomUUID(),user.id,action,target])}
// Hold the user's row lock before checking or writing any award. Retries remain idempotent.
async function award(c:PoolClient,user:User,key:string,amount:number,reason:string){
 const locked=await c.query('SELECT score FROM users WHERE id=$1 FOR UPDATE',[user.id]);
 if((await c.query('SELECT 1 FROM xp_events WHERE user_id=$1 AND event_key=$2',[user.id,key])).rowCount)return 0;
 const actual=Math.max(-Number(locked.rows[0].score),amount);
 await c.query('INSERT INTO xp_events(id,user_id,event_key,amount,reason) VALUES($1,$2,$3,$4,$5)',[randomUUID(),user.id,key,actual,reason]);
 await c.query('UPDATE users SET score=score+$1 WHERE id=$2',[actual,user.id]);return actual;
}
async function consumeLoginLimit(username:string,req:Request){
 const ip=req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')?.split(',')[0]||'local';
 const keys=[['account:'+username,8],['origin:'+ip,50]] as const;
 return transaction(async c=>{
  let allowed=true;
  for(const [value,max] of keys){const key=createHmac('sha256',secret()).update(value).digest('hex');
   const r=await c.query(`INSERT INTO rate_limits(key,hits,reset_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.reset_at<=now() THEN 1 ELSE rate_limits.hits+1 END,reset_at=CASE WHEN rate_limits.reset_at<=now() THEN now()+interval '15 minutes' ELSE rate_limits.reset_at END RETURNING hits`,[key]);
   if(r.rows[0].hits>max)allowed=false;
  }
  return allowed;
 });
}
const robotSolutions=[`await robo.say("Olá, mundo!")`,`await robo.forward()\nawait robo.forward()\nawait robo.forward()`,`await robo.forward()\nawait robo.forward()\nawait robo.right()\nawait robo.forward()\nawait robo.forward()`,`for i in range(4):\n    await robo.forward()\n    await robo.right()`,`await robo.say("Olá, mundo!")\nfor i in range(2):\n    await robo.forward()`];
export async function GET(request:NextRequest,context:{params:Promise<{path:string[]}>}){return handle(request,context,false)}
export async function POST(request:NextRequest,context:{params:Promise<{path:string[]}>}){return handle(request,context,true)}
async function handle(req:NextRequest,context:{params:Promise<{path:string[]}>},write:boolean){
 try{
  const {path}=await context.params;const route=path.join('/');
  if(write)requireOrigin(req);
  if(route==='auth/login'&&write){
   const input=z.object({username:z.string().min(2).max(32),password:z.string().min(4).max(128)}).parse(await body(req));
   const username=normalizeUsername(input.username);
   if(!await consumeLoginLimit(username,req))throw new HttpError(429,'Muitas tentativas. Aguarde 15 minutos ou peça ajuda ao professor.');
   const result=await query('SELECT * FROM users WHERE username=$1 AND active=true',[username]);const found=result.rows[0];
   const dummy='scrypt:00000000000000000000000000000000:'+ '00'.repeat(64);
   const valid=await passwordMatches(input.password,found?.password_hash||dummy);
   if(!found||!valid)throw new HttpError(401,'Usuário ou senha incorretos. Confira e tente novamente.');
   const token=opaqueToken();
   await query(`INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '12 hours')`,[digest(token),found.id]);
   (await cookies()).set(COOKIE,token,cookieOptions);return ok({ok:true});
  }
  if(route==='auth/logout'&&write){const store=await cookies();const token=store.get(COOKIE)?.value;if(token)await query('DELETE FROM sessions WHERE token_hash=$1',[digest(token)]);store.delete(COOKIE);return ok({ok:true})}
  const user=await requireUser();
  if(route==='me'&&!write)return ok({user});
  if(route==='profile'&&write){const input=z.object({avatar:z.enum(['🐶','🤖','🐱','🌱','🚀']),reduceMotion:z.boolean()}).parse(await body(req));await query('UPDATE users SET avatar=$1,reduce_motion=$2 WHERE id=$3',[input.avatar,input.reduceMotion,user.id]);return ok({ok:true})}
  if(route==='password'&&write){const input=z.object({current:z.string().max(128),next:z.string().max(128)}).parse(await body(req));if(user.role==='student'?!/^\d{4}$/.test(input.next):input.next.length<12)throw new HttpError(400,user.role==='student'?'Use quatro números.':'Use uma senha de pelo menos 12 caracteres.');const row=(await query('SELECT password_hash FROM users WHERE id=$1',[user.id])).rows[0];if(!await passwordMatches(input.current,row.password_hash))throw new HttpError(400,'Senha atual incorreta.');const hash=await passwordHash(input.next);await transaction(async c=>{await c.query('UPDATE users SET password_hash=$1 WHERE id=$2',[hash,user.id]);await c.query('DELETE FROM sessions WHERE user_id=$1',[user.id]);await audit(c,user,'password_change',user.id)});(await cookies()).delete(COOKIE);return ok({ok:true,loginRequired:true})}
  if(route==='course'&&!write){
   const rows=await query(`SELECT l.id,l.chapter,l.position,l.title,l.published,(COALESCE(r.released,false) OR COALESCE(r.release_at<=now(),false)) AS released,r.release_at,COALESCE(p.completed,false) AS completed,p.updated_at FROM lessons l LEFT JOIN releases r ON r.lesson_id=l.id AND r.class_id=$1 LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=$2 ORDER BY l.position`,[user.class_id,user.id]);
   const className=(await query('SELECT name FROM classes WHERE id=$1',[user.class_id])).rows[0]?.name;
   return ok({chapters,lessons:rows.rows,className});
  }
  if(route==='history'&&!write)return ok({events:(await query('SELECT amount,reason,created_at FROM xp_events WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[user.id])).rows});
  if(path[0]==='lessons'&&path[1]){
   const id=path[1];const lesson=await accessible(user,id);
   if(path.length===2&&!write){
    await query('INSERT INTO progress(user_id,lesson_id) VALUES($1,$2) ON CONFLICT(user_id,lesson_id) DO UPDATE SET updated_at=now()',[user.id,id]);
    const draft=(await query('SELECT code,stdin,version FROM drafts WHERE user_id=$1 AND lesson_id=$2',[user.id,id])).rows[0]||null;
    const attempts=(await query('SELECT activity_id,answer,correct FROM attempts WHERE user_id=$1 AND lesson_id=$2 ORDER BY created_at',[user.id,id])).rows;
    const hints=(await query('SELECT activity_id FROM hints WHERE user_id=$1',[user.id])).rows.map(r=>r.activity_id);
    const rewards=(await query('SELECT event_key FROM xp_events WHERE user_id=$1',[user.id])).rows.map(r=>r.event_key);
    const submissions=(await query('SELECT id,code,stdin,output,feedback,status,created_at FROM submissions WHERE user_id=$1 AND lesson_id=$2 ORDER BY created_at DESC LIMIT 10',[user.id,id])).rows;
    return ok({lesson:publicLesson(id),draft,attempts,hints,rewards,submissions});
   }
   if(!write)throw new HttpError(404,'Página não encontrada.');
   if(path[2]==='draft'){
    const input=z.object({code:z.string().max(20000),stdin:z.string().max(5000),version:z.number().int().min(0)}).parse(await body(req));
    const result=await transaction(async c=>{
     await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);
     const existing=(await c.query('SELECT version FROM drafts WHERE user_id=$1 AND lesson_id=$2',[user.id,id])).rows[0];
     if((existing?.version||0)!==input.version)throw new HttpError(409,'Existe uma versão mais recente em outra aba. Copie seu código antes de recarregar.');
     return (await c.query('INSERT INTO drafts(user_id,lesson_id,code,stdin,version) VALUES($1,$2,$3,$4,1) ON CONFLICT(user_id,lesson_id) DO UPDATE SET code=$3,stdin=$4,version=drafts.version+1,updated_at=now() RETURNING version',[user.id,id,input.code,input.stdin])).rows[0];
    });return ok(result);
   }
   if(path[2]==='quiz'){
    const input=z.object({questionId:z.string(),choice:z.number().int().min(0).max(10)}).parse(await body(req));
    const question=lesson.quiz?.find(q=>q.id===input.questionId);if(!question||input.choice>=question.options.length)throw new HttpError(400,'Alternativa inválida.');
    const activity=id+':'+question.id;
    const result=await transaction(async c=>{
     await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);
     const past=(await c.query('SELECT correct FROM attempts WHERE user_id=$1 AND activity_id=$2',[user.id,activity])).rows;
     if(past.some(a=>a.correct))return {correct:true,gain:0,explanation:question.explanation};
     const correct=input.choice===question.answer;
     await c.query('INSERT INTO attempts(id,user_id,lesson_id,activity_id,answer,correct) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),user.id,id,activity,JSON.stringify({choice:input.choice}),correct]);
     const gain=correct?await award(c,user,'quiz:'+activity,past.length===0?40:20,'Quiz: '+lesson.title):0;
     return {correct,gain,explanation:correct?question.explanation:'Ainda não. Releia o exemplo e tente novamente.'};
    });return ok(result);
   }
   if(path[2]==='calculator'&&id==='detetive'){const input=z.object({expression:z.string().max(160).regex(/^[\d\s.+*\/%()-]+$/)}).parse(await body(req));if(!/[+*\/%-]/.test(input.expression))throw new HttpError(400,'Inclua uma operação aritmética.');return ok({gain:await transaction(c=>award(c,user,'calculator',15,'Primeira expressão aritmética (prática local)'))})}
   if(path[2]==='setup'&&id==='setup'){
    const input=z.object({item:z.number().int().min(0).max(5)}).parse(await body(req));return ok({gain:await transaction(c=>award(c,user,'setup:'+input.item,10,'Setup: passo '+(input.item+1)))})
   }
   if(path[2]==='solution'){
    const input=z.object({mission:z.number().int().min(1).max(5).optional()}).parse(await body(req));
    const activity=id==='robo'&&input.mission?'robo:'+input.mission:id;
    const solution=id==='robo'&&input.mission?robotSolutions[input.mission-1]:lesson.solution;
    if(!solution)throw new HttpError(400,'Esta atividade não tem solução para revelar.');
    const gain=user.role==='teacher'?0:await transaction(async c=>{
     await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);
     await c.query('INSERT INTO hints(user_id,activity_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[user.id,activity]);
     return award(c,user,'hint:'+activity,-30,'Solução revelada: '+lesson.title);
    });return ok({solution,gain});
   }
   if(path[2]==='practice'&&id==='robo'){
    // Practice trace is intentionally not an exam grade. Its origin is displayed in the UI.
    const input=z.object({mission:z.number().int().min(1).max(5),events:z.array(z.enum(['say','forward','right','left'])).max(80),words:z.array(z.string().max(500)).max(80),hasFor:z.boolean()}).parse(await body(req));
    let x=0,y=0,d=0;const visited=new Set(['0,0']);let forwards=0;
    for(const action of input.events){if(action==='right')d=(d+1)%4;if(action==='left')d=(d+3)%4;if(action==='forward'){const [dx,dy]=[[1,0],[0,1],[-1,0],[0,-1]][d];x+=dx;y+=dy;forwards++;if(x<0||x>4||y<0||y>4)throw new HttpError(400,'O robô saiu do tabuleiro.');visited.add(x+','+y)}}
    const hello=input.words.some(w=>w.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'')==='olamundo');
    const won=[hello,x===3&&y===0&&d===0&&forwards===3,x===2&&y===2&&input.events.includes('right'),input.hasFor&&x===0&&y===0&&d===0&&forwards===4&&visited.size===4&&[...visited].every(v=>['0,0','1,0','1,1','0,1'].includes(v)),hello&&input.hasFor&&x===2&&y===0&&forwards===2][input.mission-1];
    if(!won)return ok({correct:false,gain:0});
    const gain=await transaction(async c=>{await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);const used=(await c.query('SELECT 1 FROM hints WHERE user_id=$1 AND activity_id=$2',[user.id,'robo:'+input.mission])).rowCount;return award(c,user,'robot:'+input.mission,[50,75,100,150,200][input.mission-1]*(used?.25:1),'Prática local: desafio '+input.mission)});
    return ok({correct:true,gain});
   }
   if(path[2]==='submit'&&lesson.kind==='python'){
    const input=z.object({code:z.string().min(1).max(20000),stdin:z.string().max(5000),output:z.string().max(10000),requestId:z.uuid()}).parse(await body(req));
    await query('INSERT INTO submissions(id,user_id,lesson_id,code,stdin,output,request_id) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(user_id,request_id) DO NOTHING',[randomUUID(),user.id,id,input.code,input.stdin,input.output,input.requestId]);return ok({ok:true});
   }
   if(path[2]==='complete'){
    const required=(lesson.quiz||[]).map(q=>id+':'+q.id);
    if(required.length){const count=(await query('SELECT count(DISTINCT activity_id)::int AS n FROM attempts WHERE user_id=$1 AND correct=true AND activity_id=ANY($2::text[])',[user.id,required])).rows[0].n;if(count<required.length)throw new HttpError(400,'Conclua os quizzes desta aula primeiro.')}
    if(lesson.kind==='python'&&!(await query('SELECT 1 FROM submissions WHERE user_id=$1 AND lesson_id=$2',[user.id,id])).rowCount)throw new HttpError(400,'Envie sua atividade ao professor primeiro.');
    if(lesson.kind==='robot'&&(await query("SELECT count(*)::int AS n FROM xp_events WHERE user_id=$1 AND event_key LIKE 'robot:%'",[user.id])).rows[0].n<5)throw new HttpError(400,'Conclua os cinco desafios primeiro.');
    if(lesson.kind==='setup'&&(await query("SELECT count(*)::int AS n FROM xp_events WHERE user_id=$1 AND event_key LIKE 'setup:%'",[user.id])).rows[0].n<6)throw new HttpError(400,'Conclua os seis passos do setup primeiro.');
    await query('INSERT INTO progress(user_id,lesson_id,completed) VALUES($1,$2,true) ON CONFLICT(user_id,lesson_id) DO UPDATE SET completed=true,updated_at=now()',[user.id,id]);return ok({ok:true});
   }
  }
  if(path[0]==='teacher'){
   await requireTeacher();
   if(route==='teacher/students'&&!write){const students=(await query(`SELECT u.id,u.name,u.username,u.active,u.avatar,u.score,u.created_at,(SELECT count(*)::int FROM progress p WHERE p.user_id=u.id AND completed) AS completed,(SELECT max(updated_at) FROM progress p WHERE p.user_id=u.id) AS last_activity FROM users u WHERE class_id=$1 AND role='student' ORDER BY name`,[user.class_id])).rows;return ok({students})}
   if(route==='teacher/students'&&write){
    const input=z.object({name:z.string().trim().min(2).max(80),username:z.string().trim().regex(/^[a-zA-Z0-9_.-]{3,30}$/)}).parse(await body(req));
    const pin=String(randomInt(0,10000)).padStart(4,'0');const hash=await passwordHash(pin);const id=randomUUID();
    await transaction(async c=>{await c.query("INSERT INTO users(id,class_id,username,name,password_hash,role) VALUES($1,$2,$3,$4,$5,'student')",[id,user.class_id,normalizeUsername(input.username),input.name,hash]);await audit(c,user,'student_create',id)});return ok({username:normalizeUsername(input.username),pin},201);
   }
   if(route==='teacher/student-action'&&write){
    const input=z.object({id:z.uuid(),action:z.enum(['reset','activate','deactivate'])}).parse(await body(req));
    const pin=String(randomInt(0,10000)).padStart(4,'0');const hash=input.action==='reset'?await passwordHash(pin):null;
    await transaction(async c=>{const r=await c.query("SELECT id FROM users WHERE id=$1 AND class_id=$2 AND role='student' FOR UPDATE",[input.id,user.class_id]);if(!r.rowCount)throw new HttpError(404,'Aluno não encontrado.');if(hash)await c.query('UPDATE users SET password_hash=$1 WHERE id=$2',[hash,input.id]);else await c.query('UPDATE users SET active=$1 WHERE id=$2',[input.action==='activate',input.id]);await c.query('DELETE FROM sessions WHERE user_id=$1',[input.id]);await audit(c,user,'student_'+input.action,input.id)});return ok(input.action==='reset'?{pin}:{ok:true});
   }
   if(route==='teacher/release'&&write){
    const input=z.object({lessonId:z.string(),mode:z.enum(['release','block','schedule']),date:z.string().optional()}).parse(await body(req));const lesson=lessonById(input.lessonId);
    if(!lesson?.published)throw new HttpError(400,'Prepare o conteúdo desta aula antes de liberar.');
    const date=input.mode==='schedule'?new Date(input.date||''):null;
    if(date&&(isNaN(date.getTime())||date.getTime()<=Date.now()))throw new HttpError(400,'Escolha uma data futura.');
    await transaction(async c=>{await c.query('INSERT INTO releases(class_id,lesson_id,released,release_at,updated_by) VALUES($1,$2,$3,$4,$5) ON CONFLICT(class_id,lesson_id) DO UPDATE SET released=$3,release_at=$4,updated_by=$5',[user.class_id,input.lessonId,input.mode==='release',date,user.id]);await audit(c,user,'lesson_'+input.mode,input.lessonId)});return ok({ok:true});
   }
   if(route==='teacher/submissions'&&!write)return ok({submissions:(await query('SELECT s.*,u.name,u.username,l.title FROM submissions s JOIN users u ON u.id=s.user_id JOIN lessons l ON l.id=s.lesson_id WHERE u.class_id=$1 ORDER BY s.created_at DESC LIMIT 200',[user.class_id])).rows});
   if(route==='teacher/feedback'&&write){const input=z.object({id:z.uuid(),feedback:z.string().trim().min(1).max(3000)}).parse(await body(req));const r=await query("UPDATE submissions s SET feedback=$1,status='reviewed',reviewed_by=$2 FROM users u WHERE s.user_id=u.id AND s.id=$3 AND u.class_id=$4 RETURNING s.id",[input.feedback,user.id,input.id,user.class_id]);if(!r.rowCount)throw new HttpError(404,'Entrega não encontrada.');return ok({ok:true})}
  }
  throw new HttpError(404,'Página não encontrada.');
 }catch(error){
  if(error instanceof HttpError)return ok({error:error.message},error.status);
  if(error instanceof z.ZodError)return ok({error:'Confira os campos e os limites de tamanho.'},400);
  if((error as {code?:string}).code==='23505')return ok({error:'Esse usuário já existe. Escolha outro nome.'},409);
  console.error('API failure:',error instanceof Error?error.message:'unknown');
  return ok({error:'Não foi possível concluir. Tente novamente em instantes.'},503);
 }
}
