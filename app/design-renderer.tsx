'use client';
import type {DesignDoc,DesignNode} from '../lib/design';
import {boundProduct,currency,productImage} from '../lib/storefront';
type Props={doc:DesignDoc;products:any[];locale:'ar'|'en';selected?:any;select?:(id:string)=>void;add?:(id?:string)=>void;
  preview?:boolean;onSelect?:(id:string)=>void;selectedNode?:string;acceptOrders?:boolean};
export default function DesignRenderer({doc,products,locale,selected,select,add,preview=false,onSelect,selectedNode,acceptOrders=true}:Props){
  const bindings=new Set<string>();
  function collect(nodes:DesignNode[]){for(const n of nodes){if(['product_price','shade_selector','buy_button'].includes(n.type)&&n.productId)bindings.add(n.productId);if(n.children)collect(n.children);}}
  collect(doc.nodes);
  const commerceProduct=bindings.size>1?undefined:boundProduct(products,selected||products[0],[...bindings][0]);
  const rgb=doc.theme.accent.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
  const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2],text=(n:DesignNode)=>locale==='ar'?n.textAr:n.textEn;
  const name=(p:any)=>locale==='ar'?p.ar:p.en;
  function render(n:DesignNode){
    const st=n.style||{},p=commerceProduct;
    const style:any={background:st.background,color:st.color,padding:st.padding,gap:st.gap,borderRadius:st.radius,fontSize:st.fontSize,textAlign:st.align,'--design-columns':st.columns||2,'--design-mobile-columns':st.mobileColumns||1};
    let content;
    switch(n.type){
      case 'container':case 'grid':content=n.children?.map(render);break;
      case 'heading':content=<h2 style={{fontSize:st.fontSize}}>{text(n)||'Karin'}</h2>;break;
      case 'text':content=<p>{text(n)}</p>;break;
      case 'image':content=n.url?<img src={n.url} alt={(locale==='ar'?n.altAr:n.altEn)||''} loading="lazy"/>:<p>صورة — اختر ملفًا</p>;break;
      case 'video':content=n.url?<video src={n.url} controls playsInline preload="none"/>:<p>فيديو — اختر ملفًا</p>;break;
      case 'button':content=<a className="primary" href={preview?undefined:n.url||'/'+locale+'/shop'}>{text(n)||'Shop Karin'}</a>;break;
      case 'product_grid':content=<div className="product-grid">{products.map(p=><a className="product-card" key={p.id} href={preview?undefined:'/'+locale+'/products/'+p.id}><div className="card-image"><img src={productImage(p.image,640)} alt={name(p)} width={640} height={640} loading="lazy"/></div><div className="card-copy"><span>{name(p)}</span><strong>{currency(p.price,locale)}</strong></div></a>)}</div>;break;
      case 'product_price':content=<strong className="price">{p?currency(p.price,locale):locale==='ar'?'غير متاح':'Unavailable'}</strong>;break;
      case 'shade_selector':content=<div className="shade-names">{products.map(x=><button key={x.id} className="secondary" aria-pressed={p?.id===x.id} onClick={()=>!preview&&select?.(x.id)}>{name(x)}</button>)}</div>;break;
      case 'buy_button':content=<button className="primary" disabled={!p||!acceptOrders} onClick={()=>!preview&&add?.(p?.id)}>{locale==='ar'?'أضف إلى الحقيبة':'Add to bag'}</button>;break;
    }
    return <div key={n.id} data-design-id={n.id} className={'design-node design-'+n.type+(st.hideMobile?' design-hide-mobile':'')+(st.hideDesktop?' design-hide-desktop':'')+(selectedNode===n.id?' design-selected':'')} style={style} onClick={preview?e=>{e.preventDefault();e.stopPropagation();onSelect?.(n.id);}:undefined}>{content}</div>;
  }
  return <div className="design-root" style={{'--design-bg':doc.theme.background,'--design-ink':doc.theme.ink,'--design-button-ink':luminance>.179?'#000000':'#ffffff',background:'var(--design-bg)',color:'var(--design-ink)',fontFamily:doc.theme.font,'--button':doc.theme.accent,'--accent':doc.theme.accent} as any}>{doc.nodes.map(render)}</div>;
}
