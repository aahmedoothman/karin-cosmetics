import {orderReport,reportCsv,reportPeriod} from '../../../../lib/reporting';
import {isAdmin,db,json} from '../../../../lib/server';export async function GET(req:Request){if(!await isAdmin())return json({error:'UNAUTHORIZED'},401);try{const u=new URL(req.url);if(u.searchParams.get('view')==='customers'){const page=Math.max(1,Math.floor(Number(u.searchParams.get('page')))||1),q=(u.searchParams.get('q')||'').slice(0,100);const where="WHERE json_extract(data,'$.customer.phone')<>'' AND (?='' OR instr(json_extract(data,'$.customer.name'),?)>0 OR instr(json_extract(data,'$.customer.phone'),?)>0)";const rows=await db().prepare("SELECT json_extract(data,'$.customer.phone') AS phone,max(json_extract(data,'$.customer.name')) AS name,max(json_extract(data,'$.customer.email')) AS email,count(*) AS orders,sum(json_extract(data,'$.subtotal')) AS orderedValue,max(created) AS lastOrder FROM orders "+where+" GROUP BY json_extract(data,'$.customer.phone') ORDER BY lastOrder DESC LIMIT 25 OFFSET ?").bind(q,q,q,(page-1)*25).all();const total=await db().prepare("SELECT count(DISTINCT json_extract(data,'$.customer.phone')) AS n FROM orders "+where).bind(q,q,q).first();return json({customers:rows.results,total:total?.n||0,page});}const period=reportPeriod(u.searchParams);
if(!period)return json({error:'INVALID_DATE_RANGE'},400);
const report=await orderReport(db(),period);
if(u.searchParams.get('format')==='csv')return new Response(reportCsv(report),{headers:{
  'Content-Type':'text/csv; charset=utf-8',
  'Content-Disposition':'attachment; filename="karin-report.csv"',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
}});
return json(report);
}catch{return json({error:'UNAVAILABLE'},503);}}
