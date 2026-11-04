import {endpointOrigin} from '../../lib/commerce';
export function GET(){return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /receipt/\nSitemap: '+endpointOrigin+'/sitemap.xml',{headers:{'Content-Type':'text/plain'}});}
