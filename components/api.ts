export async function api(path:string,body?:unknown){
 const response=await fetch('/api/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 const data=await response.json();if(!response.ok){if(response.status===401&&path!=='auth/login')window.location.assign('/');throw Object.assign(new Error(data.error||'Não foi possível concluir.'),{status:response.status})}return data;
}
export const xp=(value:number|string)=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:2});
