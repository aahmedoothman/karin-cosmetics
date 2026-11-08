import {publicCatalog} from '../../lib/public-catalog';
import {endpointOrigin} from '../../lib/commerce';
export async function GET(){const {products}=await publicCatalog();const paths=['/ar','/en','/ar/shop','/en/shop','/ar/how-to-use','/en/how-to-use',...products.flatMap(p=>['/ar/products/'+p.id,'/en/products/'+p.id])];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>'<url><loc>'+endpointOrigin+p+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml'}});}
