"use client";
import { useEffect, useRef, useState } from "react";
export type RobotState={x:number;y:number;d:number;words:string[];visited:number[][]};
export function usePython(){
 const frame=useRef<HTMLIFrameElement|null>(null);const boot=useRef<Promise<void>|null>(null);
 const bootResolve=useRef<(()=>void)|null>(null);const bootReject=useRef<((e:Error)=>void)|null>(null);
 const pending=useRef<{resolve:(v:any)=>void;reject:(e:Error)=>void}|null>(null);
 const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);const ready=useRef(false);
 const [status,setStatus]=useState('Python será preparado ao executar.');const [running,setRunning]=useState(false);const [output,setOutput]=useState('');const [robot,setRobot]=useState<RobotState>({x:0,y:0,d:0,words:[],visited:[[0,0]]});
 function clearTimer(){if(timeout.current)clearTimeout(timeout.current)}
 function reset(message:string){frame.current?.contentWindow?.postMessage({type:'stop'},'*');frame.current?.remove();frame.current=null;boot.current=null;ready.current=false;clearTimer();bootReject.current?.(Error(message));bootReject.current=null;pending.current?.reject(Error(message));pending.current=null;setRunning(false);setStatus(message)}
 useEffect(()=>{
  const listener=(event:MessageEvent)=>{
   if(!frame.current || event.source!==frame.current.contentWindow)return;
   const data=event.data;
   if(data.type==='frame-ready')frame.current.contentWindow?.postMessage({type:'init'},'*');
   if(data.type==='ready'){clearTimer();ready.current=true;bootResolve.current?.();bootResolve.current=null;bootReject.current=null;setStatus('Python pronto · ambiente isolado')}
   if(data.type==='stdout')setOutput(o=>(o+String(data.text)).slice(0,10000));
   if(data.type==='robot'&&data.data&&typeof data.data.x==='number')setRobot(data.data);
   if(data.type==='result'){clearTimer();pending.current?.resolve(data.data);pending.current=null;setRunning(false)}
   if(data.type==='error'){const error=Error(String(data.message));setOutput(o=>o+'\n'+error.message);if(!ready.current)reset('Não foi possível carregar Python. Tente novamente.');else{clearTimer();pending.current?.reject(error);pending.current=null;setRunning(false)}}
  };
  window.addEventListener('message',listener);return()=>{window.removeEventListener('message',listener);frame.current?.remove();clearTimer();bootReject.current?.(Error('Aula encerrada'));pending.current?.reject(Error('Aula encerrada'))};
 },[]);
 async function prepare(){if(ready.current)return;if(boot.current)return boot.current;
  setStatus('Preparando Python… o primeiro carregamento pode levar um pouco.');
  boot.current=new Promise<void>((resolve,reject)=>{bootResolve.current=resolve;bootReject.current=reject;const iframe=document.createElement('iframe');iframe.sandbox.add('allow-scripts');iframe.src='/runner.html';iframe.title='Ambiente isolado de Python';iframe.hidden=true;frame.current=iframe;document.body.append(iframe);timeout.current=setTimeout(()=>reset('Carregamento interrompido. Confira sua conexão e tente novamente.'),90000)});return boot.current;
 }
 async function run(code:string,stdin:string,robotMode=false){if(running)throw Error('Aguarde a execução atual.');setRunning(true);setOutput('');setRobot({x:0,y:0,d:0,words:[],visited:[[0,0]]});try{await prepare();return await new Promise<any>((resolve,reject)=>{pending.current={resolve,reject};timeout.current=setTimeout(()=>reset('Execução interrompida: revise seus loops e tente novamente.'),45000);frame.current?.contentWindow?.postMessage({type:'run',code,stdin,robot:robotMode},'*')})}finally{setRunning(false)}}
 return {run,stop:()=>reset('Execução interrompida. Você pode tentar novamente.'),running,output,status,robot};
}
