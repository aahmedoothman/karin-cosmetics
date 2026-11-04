import {json,diagnostic} from '../../../lib/server';
import {publicCatalog} from '../../../lib/public-catalog';
export async function GET(){try{return json(await publicCatalog());}catch(e){diagnostic('catalog',e);return json({error:'CATALOG_UNAVAILABLE'},503);}}
