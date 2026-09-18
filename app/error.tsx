"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="login-page"><section className="card"><h1>Vamos tentar novamente.</h1><p>Não foi possível carregar esta página. Seu trabalho já salvo continua na conta.</p><button className="primary" onClick={reset}>Tentar novamente</button></section></main>}
