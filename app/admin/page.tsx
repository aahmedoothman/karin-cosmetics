import {isAdmin} from '../../lib/server';
import {chatGPTSignInPath} from '../chatgpt-auth';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function Page(){const user=await isAdmin();if(!user)return <main className="access-page" dir="rtl"><a href="/">KARIN</a><h1>لوحة إدارة Karin</h1><p>هذه المساحة مخصّصة لإدارة المتجر. يُرجى تسجيل الدخول بالحساب المصرّح له.</p><a className="primary" href={chatGPTSignInPath('/admin')} target="_top">تسجيل الدخول الآمن</a></main>;return <Admin/>;}
