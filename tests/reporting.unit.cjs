const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {DatabaseSync} = require('node:sqlite');
const ts = require('typescript');

const moduleObject = {exports:{}};
const {outputText} = ts.transpileModule(fs.readFileSync('lib/reporting.ts','utf8'), {
  compilerOptions: {module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
});
vm.runInNewContext(outputText,{exports:moduleObject.exports,URLSearchParams,Intl,Date});
const {orderReport,reportPeriod,reportCsv} = moduleObject.exports;
const sqlite = new DatabaseSync(':memory:');
for (const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()) {
  sqlite.exec(fs.readFileSync('drizzle/'+file,'utf8'));
}
const db = {
  prepare(sql) {
    const stmt = sqlite.prepare(sql);
    return {bind(...args){return {execute:()=>({results:stmt.all(...args)})};}};
  },
  async batch(statements){return statements.map(s=>s.execute());},
};
let passed = 0;
const ok = (value,label) => {assert.ok(value,label);passed++;};
const params = text => new URLSearchParams(text);
const line = (id,qty,price) => ({id,ar:id,en:id,qty,price});
const insert = sqlite.prepare('INSERT INTO orders (id,request_key,status,created,data) VALUES (?,?,?,?,?)');
function order(id,status,created,items,financials={}) {
  const subtotal = items.reduce((total,item)=>total+item.qty*item.price,0);
  insert.run(id,id,status,created,JSON.stringify({subtotal,items,...financials}));
}

(async()=>{
  ok(reportPeriod(params('from=2025-02-30&to=2025-03-01'))===null,'reject invalid calendar date');
  ok(reportPeriod(params('from=2026-01-02&to=2026-01-01'))===null,'reject reversed range');
  ok(reportPeriod(params('from=2025-01-01&to=2026-01-02'))===null,'bound report range');
  const spring = reportPeriod(params('from=2025-04-25&to=2025-04-25'));
  ok(Date.parse(spring.end)-Date.parse(spring.start)===23*3600000,'Cairo DST boundary uses the actual 23-hour day');
  const period = reportPeriod(params('from=2026-01-10&to=2026-01-11'));
  ok(period.start==='2026-01-09T22:00:00.000Z'&&period.end==='2026-01-11T22:00:00.000Z','inclusive Cairo calendar dates');
  order('before','delivered','2026-01-09T21:59:59.999Z',[line('blue',99,100)]);
  order('pending','pending',period.start,[line('blue',1,100)]);
  order('paid','delivered','2026-01-10T12:00:00.000Z',[line('blue',2,100)],{confirmedTotal:235,shippingFee:35,collected:235});
  order('partial','confirmed','2026-01-10T22:00:00.000Z',[line('green',1,90)],{confirmedTotal:125,shippingFee:35,collected:25});
  order('return','returned','2026-01-11T09:00:00.000Z',[line('blue',5,100)],{confirmedTotal:535,shippingFee:35,collected:50});
  order('cancel','cancelled','2026-01-11T10:00:00.000Z',[line('green',9,100)]);
  order('after','delivered',period.end,[line('blue',99,100)]);
  const report = await orderReport(db,period);
  const s = report.summary;
  ok(s.orders===5&&s.pending===1&&s.activeOrders===3,'date endpoints and status counts');
  ok(s.orderedValue===390&&s.confirmedValue===360&&s.collected===310&&s.outstanding===100,'separate recorded, confirmed, collected and outstanding values');
  ok(s.confirmedShipping===70&&s.average===130,'shipping fees and active order average');
  ok(report.top.length===2&&report.top[0].shadeId==='blue'&&report.top[0].units===3&&report.top[0].value===300,'group top shades across historical line items and exclude closed orders');
  ok(report.days[0].day==='2026-01-11'&&report.days[0].orders===3&&report.days[0].value===90,'group daily orders across Cairo midnight');
  ok(report.recent[0].id==='cancel'&&report.recent.length===5,'recent order references scoped to report');
  const empty = await orderReport(db,reportPeriod(params('from=2026-02-01&to=2026-02-01')));
  ok(empty.summary.orders===0&&empty.summary.average===0&&empty.days[0].orders===0,'empty reports have zero totals and preserve calendar day');
  const csv = reportCsv(report);
  ok(csv.startsWith('\ufeff')&&csv.includes('"summary","outstanding","","","100.00"')&&csv.includes('"shade","blue","","3","300.00"'),'CSV values match the report');
  console.log(JSON.stringify({passed,isolatedDatabase:true}));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>sqlite.close());
