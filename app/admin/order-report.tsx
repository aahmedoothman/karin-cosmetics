'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {statusLabels} from '../../lib/commerce';
import {currency, type Language} from '../../lib/storefront';
import {api} from '../ui';

type Report = {
  period: {from:string; to:string};
  summary: Record<string, number>;
  states: {status:string; count:number}[];
  days: {day:string; orders:number; value:number}[];
  top: {shadeId:string; ar:string; en:string; units:number; value:number}[];
  recent: {id:string; created:string; status:string; value:number}[];
};
const statuses = {
  pending:'Awaiting confirmation', confirmed:'Confirmed by phone', processing:'Preparing',
  shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled', returned:'Returned',
};

export default function OrderReport({detailed}: {detailed:boolean}) {
  const [lang, setLang] = useState<Language>('ar');
  const [query, setQuery] = useState('');
  const [reload, setReload] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState<Report|null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
  const t = (ar:string, en:string) => lang === 'ar' ? ar : en;
  const path = '/api/admin/workspace?view=' + (detailed ? 'reports' : 'overview');

  useEffect(() => {
    const controller = new AbortController();
    api(path + query, {signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)])})
      .then((next:Report) => {
        if (controller.signal.aborted) return;
        setReport(next);
        setFrom(next.period.from);
        setTo(next.period.to);
        setPending(false);
      })
      .catch((err:Error) => {
        if (controller.signal.aborted) return;
        setError(err.message);
        setPending(false);
      });
    return () => controller.abort();
  }, [path, query, reload]);

  function filter(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dates = new FormData(event.currentTarget);
    const next = '&' + new URLSearchParams({from:String(dates.get('from')??''),to:String(dates.get('to')??'')});
    setError('');
    setPending(true);
    if (next === query) setReload(value => value + 1);
    else setQuery(next);
  }

  const label = (key:string) => (lang==='ar' ? statusLabels : statuses as Record<string,string>)[key] || key;
  const n = new Intl.NumberFormat(lang==='ar' ? 'ar-EG' : 'en-EG');
  const date = new Intl.DateTimeFormat(lang==='ar' ? 'ar-EG' : 'en-EG', {
    dateStyle:'medium',timeZone:'Africa/Cairo',
  });
  const metrics = [
    ['orders',t('إجمالي الطلبات','Total orders'),false],
    ['pending',t('بانتظار التأكيد','Awaiting confirmation'),false],
    ['orderedValue',t('قيمة المنتجات المطلوبة','Recorded product value'),true],
    ['confirmedValue',t('الإجمالي المؤكد','Confirmed payable'),true],
    ['collected',t('التحصيل المسجّل','Recorded collections'),true],
    ['outstanding',t('المبلغ المتبقي للتحصيل','Outstanding balance'),true],
    ['average',t('متوسط قيمة المنتجات للطلب','Average product value per order'),true],
    ['confirmedShipping',t('رسوم الشحن المؤكدة','Confirmed shipping fees'),true],
  ] as const;

  return <section className="workspace-panel" lang={lang} dir={lang==='ar'?'rtl':'ltr'}>
    <div className="admin-actions">
      <h2>{detailed?t('تقارير المتجر','Store reports'):t('نظرة عامة','Overview')}</h2>
      <button className="secondary" onClick={()=>setLang(lang==='ar'?'en':'ar')}>{t('English','العربية')}</button>
    </div>
    <form className="form-grid" onSubmit={filter} noValidate>
      <label>{t('من تاريخ','Start date')}<input type="date" name="from" required disabled={pending} value={from} onChange={e=>setFrom(e.target.value)}/></label>
      <label>{t('إلى تاريخ','End date')}<input type="date" name="to" required disabled={pending} value={to} min={from||undefined} onChange={e=>setTo(e.target.value)}/></label>
      <div className="admin-actions">
        <button className="primary" type="submit" disabled={pending}>{t('تطبيق الفترة','Apply date range')}</button>
        {report&&!pending&&<a className="secondary" href={path+'&format=csv&'+new URLSearchParams({from:report.period.from,to:report.period.to})}>
          {t('تنزيل CSV','Download CSV')}
        </a>}
      </div>
    </form>
    {pending&&<p role="status">{t('جارٍ تحميل التقرير…','Loading report…')}</p>}
    {error&&<p className="error" role="alert">{error==='INVALID_DATE_RANGE'
      ?t('اختر فترة صحيحة لا تتجاوز ٣٦٦ يومًا.','Choose a valid range of no more than 366 days.')
      :t('تعذّر تحميل التقرير. تحقق من الاتصال وحاول مجددًا.','Could not load the report. Check your connection and try again.')}</p>}
    {report&&!pending&&<>
      <p><bdi>{report.period.from} – {report.period.to}</bdi> · {t('توقيت القاهرة، حسب تاريخ إنشاء الطلب','Cairo time, based on order creation')}</p>
      <div className="workspace-grid">{metrics.map(([key,title,money])=>
        <div className="workspace-metric" key={key}><strong>{money?currency(report.summary[key],lang):n.format(report.summary[key])}</strong>{title}</div>)}</div>
      <p>{t('قيمة المنتجات والإجمالي المؤكد يستبعدان الطلبات الملغاة والمرتجعة. التحصيل يعرض المبالغ المسجّلة، وقد يشمل طلبات مرتجعة.','Product value and confirmed payable exclude cancellations and returns. Recorded collections may include payments on returned orders.')}</p>
      <h3>{t('حالات الطلبات','Order statuses')}</h3>
      {Object.keys(statuses).map(status=><div className="summary-line" key={status}><span>{label(status)}</span><strong>{n.format(report.states.find(row=>row.status===status)?.count??0)}</strong></div>)}
      <h3>{t('أحدث الطلبات','Recent orders')}</h3>
      {report.recent.length===0?<p>{t('لا توجد طلبات في الفترة المختارة.','No orders in this period.')}</p>:<div className="table-scroll"><table>
        <thead><tr><th>{t('رقم الطلب','Order reference')}</th><th>{t('التاريخ','Date')}</th><th>{t('الحالة','Status')}</th><th>{t('قيمة المنتجات','Product value')}</th></tr></thead>
        <tbody>{report.recent.map(row=><tr key={row.id}><td><bdi>{row.id}</bdi></td><td>{date.format(new Date(row.created))}</td><td>{label(row.status)}</td><td>{currency(row.value,lang)}</td></tr>)}</tbody>
      </table></div>}
      <h3>{t('أكثر الدرجات طلبًا','Top shades by units ordered')}</h3>
      {report.top.length===0?<p>{t('لا توجد درجات في التقرير.','No shades in the report.')}</p>:<div className="table-scroll"><table>
        <thead><tr><th>{t('الدرجة','Shade')}</th><th>{t('العبوات','Units')}</th><th>{t('قيمة المنتجات','Product value')}</th></tr></thead>
        <tbody>{report.top.map(row=><tr key={row.shadeId}><td>{(lang==='ar'?row.ar:row.en)||row.shadeId}</td><td>{n.format(row.units)}</td><td>{currency(row.value,lang)}</td></tr>)}</tbody>
      </table></div>}
      {detailed&&<><h3>{t('الطلبات حسب اليوم','Orders by day')}</h3><div className="table-scroll"><table>
        <thead><tr><th>{t('اليوم','Day')}</th><th>{t('الطلبات','Orders')}</th><th>{t('قيمة المنتجات','Product value')}</th></tr></thead>
        <tbody>{report.days.map(row=><tr key={row.day}><td><bdi>{row.day}</bdi></td><td>{n.format(row.orders)}</td><td>{currency(row.value,lang)}</td></tr>)}</tbody>
      </table></div></>}
    </>}
  </section>;
}
