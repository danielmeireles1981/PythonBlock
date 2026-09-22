import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'PythonBlock · Sua trilha de Python',description:'Aprenda Python no seu ritmo com explicações, blocos de código e atividades práticas.',icons:{icon:'/icon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
