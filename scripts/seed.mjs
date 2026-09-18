import { Client, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;
import fs from 'node:fs/promises';
import { randomBytes, randomUUID, createHmac, scryptSync } from 'node:crypto';
const course=JSON.parse(await fs.readFile('content/course.json','utf8'));
if(!process.env.DATABASE_URL || !process.env.AUTH_SECRET || process.env.AUTH_SECRET.length<32)throw Error('Configure DATABASE_URL e AUTH_SECRET.');
const client=new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:15000});await client.connect();
try {
 await client.query('BEGIN');
 await client.query('SELECT pg_advisory_xact_lock(7843922)');
 await client.query("INSERT INTO classes(id,name) VALUES(1,'Turma Python · SENAI') ON CONFLICT DO NOTHING");
 for(const l of course.lessons){
  await client.query('INSERT INTO lessons(id,chapter,position,title,published) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,position=EXCLUDED.position,published=EXCLUDED.published',[l.id,l.chapter,l.position,l.title,l.published]);
  await client.query('INSERT INTO releases(class_id,lesson_id,released) VALUES(1,$1,$2) ON CONFLICT DO NOTHING',[l.id,l.chapter===0]);
 }
 if(!(await client.query("SELECT id FROM users WHERE role='teacher'")).rowCount){
  const password=randomBytes(18).toString('base64url');const salt=randomBytes(16).toString('hex');
  const hash=scryptSync(createHmac('sha256',process.env.AUTH_SECRET).update(password).digest('hex'),salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024}).toString('hex');
  await client.query("INSERT INTO users(id,class_id,username,name,password_hash,role) VALUES($1,1,'professor','Professor',$2,'teacher')",[randomUUID(),`scrypt:${salt}:${hash}`]);
  await fs.writeFile(process.env.ADMIN_ACCESS_FILE||'.admin-access.txt',`PythonBlock — acesso inicial privado\nUsuário: professor\nSenha: ${password}\nAltere a senha em Minha conta após entrar.\n`,{mode:0o600});
  console.log('Acesso inicial salvo em arquivo privado local (não versionar).');
 }
 await client.query('COMMIT');console.log('Turma e catálogo preparados. Liberações existentes preservadas.');
} catch(e){await client.query('ROLLBACK');throw e}finally{await client.end()}
