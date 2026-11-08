let authorized=true;
// No browser/customer database, network requests or actual shipments are used.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),ts=require('typescript');
const sqlite=new DatabaseSync(':memory:');
for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync('drizzle/'+f,'utf8'));
let batchTail=Promise.resolve(),passed=0;
function prepare(sql){const stmt=sqlite.prepare(sql);let args=[];return {bind(...a){args=a;return this;},async first(){return stmt.get(...args)||null;},async all(){return {results:stmt.all(...args)};},async run(){return {meta:{changes:Number(stmt.run(...args).changes)}};}};}
const DB={prepare,batch(statements){const task=batchTail.then(async()=>{sqlite.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}});batchTail=task.catch(()=>{});return task;}};
const cache={};
function load(file){file=path.resolve(file);if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;
  const source=fs.readFileSync(file,'utf8').replaceAll('import.meta.env.DEV','false');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const req=id=>id==='cloudflare:workers'?{env:{DB}}:id.includes('chatgpt-auth')?{getChatGPTUser:async()=>authorized?{email:'aahmedoothman@gmail.com',userId:'synthetic-admin'}:null}:id.startsWith('.')?load(path.resolve(path.dirname(file),id)+(fs.existsSync(path.resolve(path.dirname(file),id)+'.ts')?'.ts':'.tsx')):require(id);
  vm.runInNewContext('(function(require,module,exports){'+code+'})',{Request,Response,Headers,crypto,TextEncoder,TextDecoder,console,URL,URLSearchParams,Uint8Array,AbortSignal,Date},{filename:file})(req,m,m.exports);return m.exports;
}
const ok=(value,label)=>{assert.ok(value,label);passed++;};

const route=load('app/api/admin/route.ts');
const post=(data,origin='http://localhost')=>route.POST(new Request('http://localhost/api/admin',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)}));
const getSettings=async()=> (await load('lib/server.ts').settings());
(async()=>{
 authorized=false;ok((await post({action:'initialize'})).status===401,'anonymous denied');authorized=true;
 ok((await post({action:'initialize'},'https://other.invalid')).status===403,'foreign origin denied');
 ok((await post({action:'initialize'})).ok,'initialize existing shades');
 const state=await getSettings();const care={id:'care',ar:'عناية',en:'Care',kind:'care',active:true,contentState:'draft'};
 ok((await post({action:'settings',revision:state.revision,settings:{...state,families:[...state.families,care]}})).ok,'create collection');
 const product={id:'synthetic-care',ar:'اختبار',en:'Synthetic',price:100,image:'/assets/test.png',hex:'#123456',active:false,parentId:'care'};
 ok((await post({action:'product',revision:0,product})).ok,'archived product in collection');
 let current=await getSettings();let r=await post({action:'settings',revision:current.revision,settings:{...current,families:current.families.filter(f=>f.id!=='care')}});
 ok(r.status===409&&(await r.json()).error==='COLLECTION_IN_USE','clear error for collection in use');
 ok((await post({action:'product',revision:1,product:{...product,parentId:'karin-colour'}})).ok,'move product');
 ok((await post({action:'settings',revision:current.revision,settings:{...current,families:current.families.filter(f=>f.id!=='care')}})).ok,'remove empty collection');
 ok((await post({action:'product',revision:2,product})).status===400,'reject missing collection');
 const mutation={action:'product',revision:2,product:{...product,parentId:'karin-colour',price:110}};
 const results=await Promise.all([post(mutation),post(mutation)]);
 ok(results.filter(x=>x.ok).length===1&&results.some(x=>x.status===409),'concurrent revisions one winner');
 const histories=sqlite.prepare("SELECT * FROM revisions WHERE entity='product' AND entity_id='synthetic-care'").all();
 ok(histories.length===3,'only successful writes create audit');
 ok(sqlite.prepare('SELECT count(*) AS n FROM orders').get().n===0,'no customer records');
 console.log(JSON.stringify({passed,isolatedDatabase:true,module:'catalog-api'}));
})().catch(e=>{console.error(e);process.exit(1)});
