const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file) {
  const source = fs.readFileSync(file, 'utf8');
  const {outputText} = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  });
  const module = {exports: {}};
  vm.runInNewContext(outputText, {exports: module.exports});
  return module.exports;
}

const {catalog} = load('lib/catalog.ts');
const {productImage} = load('lib/storefront.ts');
const files = new Set(fs.readdirSync('public/assets/bottles'));
const base = process.env.TEST_BASE_URL;
if (base && !/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) {
  throw new Error('Product image HTTP checks require an isolated local preview.');
}

function checkImage(bytes, url) {
  if (url.endsWith('.png')) {
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', url);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.ok(height / width > 2.5, url + ' must have tall bottle proportions');
  } else {
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', url);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', url);
  }
}

(async () => {
  assert.equal(catalog.length, 17);
  assert.equal(new Set(catalog.map(shade => shade.id)).size, 17);
  let images = 0;
  for (const shade of catalog) {
    assert.equal(shade.image, '/assets/bottles/' + shade.id + '.png');
    assert.ok(shade.ar.trim() && shade.en.trim(), shade.id + ' needs both names');
    for (const url of [shade.image, ...[320, 640, 960].map(width => productImage(shade.image, width))]) {
      assert.ok(files.has(path.basename(url)), 'Missing or incorrectly cased asset ' + url);
      checkImage(fs.readFileSync('public' + url), url);
      if (base) {
        const response = await fetch(base + url);
        assert.equal(response.status, 200, url);
        assert.match(response.headers.get('content-type') || '', /^image\/(png|webp)\b/, url);
        checkImage(Buffer.from(await response.arrayBuffer()), url);
      }
      images++;
    }
  }
  console.log(JSON.stringify({shades: catalog.length, images, localHttp: Boolean(base)}));
})().catch(error => {console.error(error);process.exitCode = 1;});
