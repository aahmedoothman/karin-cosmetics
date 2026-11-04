import {allProducts,settings,json} from '../../../lib/server';
export async function GET(){try{return json({products:(await allProducts()).filter(p=>p.active),settings:await settings()});}catch{return json({error:'CATALOG_UNAVAILABLE'},503);}}
