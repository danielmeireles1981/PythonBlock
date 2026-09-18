import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'PythonBlock · Sua trilha de Python',description:'Aprenda Python no seu ritmo com a equipe Pet Pallet e RH360.',icons:{icon:'/icon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
