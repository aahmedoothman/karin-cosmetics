import {normalize,phoneNumber} from './commerce';
export const orderWhere="(?='' OR status=?) AND (?='' OR instr(search_text,?)>0 OR instr(lower(id),?)>0 OR instr(data,?)>0)";
export function orderFilter(query:string,status:string){const term=normalize(query.slice(0,100));const digits=phoneNumber(query);const normalized=/^0[0-9]+$/.test(digits)?digits:term;return [status,status,normalized,normalized,normalized,term];}
