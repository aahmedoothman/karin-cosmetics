import {normalize,phoneNumber} from './commerce';
import {orderDateBoundaries} from './reporting';

export function orderSelection(params:URLSearchParams) {
  const query = (params.get('q') || '').slice(0,100);
  const status = params.get('status') || '';
  const dates = orderDateBoundaries(params.get('from') || '', params.get('to') || '');
  if (!dates) return null;

  const term = normalize(query);
  const digits = phoneNumber(query);
  const normalized = /^0[0-9]+$/.test(digits) ? digits : term;
  const clauses = ["(?='' OR status=?)", "(?='' OR instr(search_text,?)>0 OR instr(lower(id),?)>0 OR instr(data,?)>0)"];
  const args = [status,status,normalized,normalized,normalized,term];
  if (dates.start) {clauses.push('created>=?');args.push(dates.start);}
  if (dates.end) {clauses.push('created<?');args.push(dates.end);}
  return {where:'WHERE '+clauses.join(' AND '),args};
}
