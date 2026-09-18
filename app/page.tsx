import { currentUser } from '@/lib/auth';
import Platform from '@/components/platform';
export const dynamic='force-dynamic';
export default async function Page(){let user=null;let configured=!!process.env.DATABASE_URL&&!!process.env.AUTH_SECRET;try{if(configured)user=await currentUser()}catch{configured=false}return <Platform initialUser={user} configured={configured}/>}
