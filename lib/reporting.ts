const dayMs = 86_400_000;
const minuteMs = 60_000;
const cairoDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
});

function calendarDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const time = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
}

// Find the first instant in the local date, including dates with no local 00:00.
function cairoBoundary(day: string, utcDay: number) {
  let lo = utcDay / minuteMs - 12 * 60;
  let hi = utcDay / minuteMs + 12 * 60;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (cairoDay.format(mid * minuteMs) < day) lo = mid + 1;
    else hi = mid;
  }
  return new Date(lo * minuteMs).toISOString();
}

export function reportPeriod(params: URLSearchParams, now = new Date()) {
  const today = cairoDay.format(now);
  const from = params.get('from') ?? new Date(calendarDay(today) - 29 * dayMs).toISOString().slice(0, 10);
  const to = params.get('to') ?? today;
  const first = calendarDay(from);
  const last = calendarDay(to);
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first || last - first >= 366 * dayMs) return null;

  const boundaries: {day:string; start:string}[] = [];
  for (let ms = first; ms <= last + dayMs; ms += dayMs) {
    const day = new Date(ms).toISOString().slice(0, 10);
    boundaries.push({day, start: cairoBoundary(day, ms)});
  }
  const days = boundaries.slice(0, -1).map((day, i) => ({...day, end: boundaries[i + 1].start}));
  return {from, to, start: days[0].start, end: days[days.length - 1].end, days};
}

type Period = NonNullable<ReturnType<typeof reportPeriod>>;
type Row = Record<string, unknown>;
const active = "status NOT IN ('cancelled','returned')";
const subtotal = "coalesce(json_extract(data,'$.subtotal'),0)";
const collected = "coalesce(json_extract(data,'$.collected'),0)";
const confirmed = "coalesce(json_extract(data,'$.confirmedTotal'),0)";

export async function orderReport(db: D1Database, period: Period) {
  const range = 'created>=? AND created<?';
  const results = await db.batch<Row>([
    db.prepare(`SELECT count(*) AS orders,
      coalesce(sum(CASE WHEN ${active} THEN 1 ELSE 0 END),0) AS activeOrders,
      coalesce(sum(CASE WHEN ${active} THEN ${subtotal} ELSE 0 END),0) AS orderedValue,
      coalesce(sum(CASE WHEN ${active} THEN ${confirmed} ELSE 0 END),0) AS confirmedValue,
      coalesce(sum(${collected}),0) AS collected,
      coalesce(sum(CASE WHEN ${active} THEN max(0,${confirmed}-${collected}) ELSE 0 END),0) AS outstanding,
      coalesce(sum(CASE WHEN ${active} AND ${confirmed}>0 THEN coalesce(json_extract(data,'$.shippingFee'),0) ELSE 0 END),0) AS confirmedShipping
      FROM orders WHERE ${range}`).bind(period.start, period.end),
    db.prepare(`SELECT status,count(*) AS count FROM orders WHERE ${range} GROUP BY status ORDER BY status`).bind(period.start, period.end),
    db.prepare(`SELECT json_extract(d.value,'$.day') AS day,count(o.id) AS orders,
      coalesce(sum(CASE WHEN o.status NOT IN ('cancelled','returned') THEN ${subtotal} ELSE 0 END),0) AS value
      FROM json_each(?) d LEFT JOIN orders o
      ON o.created>=json_extract(d.value,'$.start') AND o.created<json_extract(d.value,'$.end')
      GROUP BY day ORDER BY day DESC`).bind(JSON.stringify(period.days)),
    db.prepare(`SELECT json_extract(item.value,'$.id') AS shadeId,
      max(json_extract(item.value,'$.ar')) AS ar,max(json_extract(item.value,'$.en')) AS en,
      sum(json_extract(item.value,'$.qty')) AS units,
      round(sum(json_extract(item.value,'$.qty')*json_extract(item.value,'$.price')),2) AS value
      FROM orders JOIN json_each(data,'$.items') item
      WHERE ${range} AND ${active} GROUP BY shadeId ORDER BY units DESC,shadeId LIMIT 10`).bind(period.start, period.end),
    db.prepare(`SELECT id,created,status,${subtotal} AS value
      FROM orders WHERE ${range} ORDER BY created DESC,id DESC LIMIT 8`).bind(period.start, period.end),
  ]);
  const summary = results[0].results[0];
  const states = results[1].results;
  return {
    period: {from: period.from, to: period.to, timezone: 'Africa/Cairo'},
    summary: {...summary, pending: Number(states.find(row => row.status === 'pending')?.count ?? 0),
      average: Number(summary.activeOrders) ? Number(summary.orderedValue) / Number(summary.activeOrders) : 0},
    states, days: results[2].results, top: results[3].results, recent: results[4].results,
  };
}

export function reportCsv(report: Awaited<ReturnType<typeof orderReport>>) {
  const columns = ['section','key','orders','units','amount_egp'];
  const rows = [
    ['period', report.period.from + ' to ' + report.period.to, '', '', ''],
    ...Object.entries(report.summary).map(([key, value]) => ['summary', key,
      ['orders','activeOrders','pending'].includes(key) ? value : '', '',
      ['orders','activeOrders','pending'].includes(key) ? '' : Number(value).toFixed(2)]),
    ...report.states.map(row => ['status', row.status, row.count, '', '']),
    ...report.days.map(row => ['day', row.day, row.orders, '', Number(row.value).toFixed(2)]),
    ...report.top.map(row => ['shade', row.shadeId, '', row.units, Number(row.value).toFixed(2)]),
  ];
  const quote = (value: unknown) => '"' + String(value ?? '').replace(/^\s*[=+@-]/, "'$&").replaceAll('"','""') + '"';
  return '\ufeff' + [columns, ...rows].map(row => row.map(quote).join(',')).join('\r\n');
}
