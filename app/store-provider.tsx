'use client';

import {createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import type {Attempt, CheckoutDraft} from './checkout';
import {mergeCart, metric, readSession, writeSession, removeSession, type CartLine} from '../lib/browser';
import {maxOrderLines} from '../lib/storefront';
import {api} from './ui';

type StoreState = {
  cart: CartLine[]; ready: boolean; bagOpen: boolean; setBagOpen: (v: boolean) => void;
  attempt: Attempt | null; draft: CheckoutDraft; setDraft: (d: CheckoutDraft) => void;
  frozenCustomer: any; freeze: (c: any) => void; updateAttempt: (a: Attempt | null) => void;
  add: (p: any, qty: number) => boolean; quantity: (id: string, qty: number) => void;
  remove: (id: string) => void; undo: () => void; removed: CartLine | null;
  begin: (lang: 'ar'|'en', current: any, refresh: (fresh: any) => void) => Promise<void>; starting: boolean;
  error: string; reviewBag: (reason: string) => void; finished: (id: string, lang: 'ar'|'en') => void;
};
const Context = createContext<StoreState | null>(null);
const blankDraft = (): CheckoutDraft => ({customer: {addressType: 'apartment', whatsapp: false}, step: 0});

export function StoreProvider({children}: {children: ReactNode}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]), [ready, setReady] = useState(false);
  const [bagOpen, setBagOpen] = useState(false), [attempt, setAttempt] = useState<Attempt|null>(null);
  const [draft, setDraft] = useState<CheckoutDraft>(blankDraft), [removed, setRemoved] = useState<CartLine|null>(null);
  const [frozenCustomer, freeze] = useState<any>(null), [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false), finishedRef = useRef(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('karin-cart-v4') || localStorage.getItem('karin-cart-v3') || '[]');
      const map = new Map<string, CartLine>();
      if (Array.isArray(raw)) for (const item of raw) {
        if (typeof item?.id === 'string' && Number.isInteger(item.qty) && item.qty > 0)
          map.set(item.id, {id: item.id, qty: Math.min(20, item.qty + (map.get(item.id)?.qty || 0)), ar: item.ar, en: item.en});
      }
      setCart([...map.values()]);
    } catch {}
    try {
      const a = JSON.parse(readSession('karin-attempt-v4') || 'null');
      if (a && /^[a-f0-9-]{36}$/i.test(a.key) && /^[a-f0-9]{64}$/.test(a.token) &&
        Array.isArray(a.items) && a.items.length && a.items.every((i:any) => typeof i.id === 'string' &&
          Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 20 && Number.isFinite(i.price))) setAttempt(a);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {if (ready) try {localStorage.setItem('karin-cart-v4', JSON.stringify(cart));} catch {}}, [cart, ready]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (!finishedRef.current && (attempt?.uncertain || Object.entries(draft.customer).some(([k,v]) => k !== 'addressType' && typeof v === 'string' && v.trim()))) {
        e.preventDefault(); e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [draft, attempt]);
  const updateAttempt = useCallback((a: Attempt|null) => {
    setAttempt(a ? {...a} : null);
    if (a) writeSession('karin-attempt-v4', JSON.stringify(a));
    else {removeSession('karin-attempt-v4'); freeze(null);}
  }, []);
  function locked() {if (startingRef.current) return true; if (!attempt?.uncertain) return false; setError('ATTEMPT_PENDING'); setBagOpen(true); return true;}
  function changed() {finishedRef.current=false; if (attempt) updateAttempt(null); setError('');}
  function add(p:any, qty:number) {
    if (locked() || !p || !Number.isInteger(qty) || qty < 1 || qty > 20) return false;
    const next = mergeCart(cart, {id:p.id, qty, ar:p.ar, en:p.en});
    if (!next || next.length > maxOrderLines) {setError(next?'LINE_LIMIT':'QUANTITY_LIMIT'); setBagOpen(true); return false;}
    changed(); setCart(next); setRemoved(null); setBagOpen(true); return true;
  }
  function quantity(id:string, qty:number) {if (locked() || qty < 1 || qty > 20) return; changed(); setCart(c => c.map(x => x.id === id ? {...x,qty} : x));}
  function remove(id:string) {if (locked()) return; changed(); setRemoved(cart.find(x=>x.id===id)||null); setCart(c=>c.filter(x=>x.id!==id));}
  function undo() {if (!removed || locked()) return; const next=mergeCart(cart,removed); if (!next || next.length > maxOrderLines) {setError(next?'LINE_LIMIT':'QUANTITY_LIMIT');return;} changed();setCart(next);setRemoved(null);}
  async function begin(lang:'ar'|'en', current:any, refresh:(fresh:any)=>void) {
    if (!ready || startingRef.current) return;
    finishedRef.current=false;
    if (attempt?.uncertain) {setBagOpen(false);router.push('/'+lang+'/checkout');return;}
    startingRef.current=true;setStarting(true);setError('');
    try {
      const fresh=await api('/api/catalog');
      refresh(fresh);
      if (!fresh.settings.acceptOrders) throw Error('PAUSED');
      if (cart.length > maxOrderLines) throw Error('LINE_LIMIT');
      if (!cart.length || cart.some(x=>!fresh.products.some((p:any)=>p.id===x.id))) throw Error('PRODUCT_CHANGED');
      if (cart.some(x=>{const p=current.products.find((p:any)=>p.id===x.id),next=fresh.products.find((p:any)=>p.id===x.id);return p&&next.price!==p.price;})) throw Error('PRICE_CHANGED');
      const buffer=new Uint8Array(32);crypto.getRandomValues(buffer);
      updateAttempt({key:crypto.randomUUID(),token:[...buffer].map(x=>x.toString(16).padStart(2,'0')).join(''),
        items:cart.map(x=>{const p=fresh.products.find((p:any)=>p.id===x.id);return {id:x.id,qty:x.qty,price:p.price,ar:p.ar,en:p.en};}),uncertain:false});
      metric('checkout_start');
      setBagOpen(false); router.push('/'+lang+'/checkout');
    } catch(e:any) {setError(e.message || 'UNAVAILABLE');}
    finally {startingRef.current=false;setStarting(false);}
  }
  function finished(id:string, lang:'ar'|'en') {
    if (!attempt) return;
    const receipt=`/receipt/${id}?lang=${lang}#${attempt.token}`;
    finishedRef.current=true;writeSession('karin-last-receipt',receipt);
    setCart([]);try{localStorage.setItem('karin-cart-v4','[]');}catch{}
    setDraft(blankDraft());updateAttempt(null);location.assign(receipt);
  }
  return <Context.Provider value={{cart,ready,bagOpen,setBagOpen,attempt,draft,setDraft,frozenCustomer,freeze,updateAttempt,
    add,quantity,remove,undo,removed,begin,starting,error,reviewBag:reason=>{setError(reason);setBagOpen(true);},finished}}>{children}</Context.Provider>;
}
export function useStore() {const value=useContext(Context);if(!value)throw Error('Missing StoreProvider');return value;}
