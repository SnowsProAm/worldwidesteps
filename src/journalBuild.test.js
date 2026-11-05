import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import journalPlugin from '../scripts/journalPlugin.mjs';

test('a published story builds crawlable HTML, safe text, metadata and sitemap entries without publishing drafts',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'proam-journal-'));
 try{
  fs.mkdirSync(path.join(root,'content'));fs.mkdirSync(path.join(root,'public'));
  const post={slug:'verified-story',status:'published',title:'A real & verified story',excerpt:'People < sport',author:'ProAm team',category:'Community',format:'Article',publishedAt:'2026-01-01T10:00:00Z',body:[{type:'paragraph',text:'<script>unsafe()</script>'}]};
  fs.writeFileSync(path.join(root,'content/posts.json'),JSON.stringify([post,{...post,slug:'not-ready',status:'draft'}]));
  fs.writeFileSync(path.join(root,'public/sitemap.xml'),'<urlset></urlset>');
  const plugin=journalPlugin('athletes');plugin.configResolved({root});
  const template=fs.readFileSync(new URL('../blog/index.html',import.meta.url),'utf8');const emitted=[];
  plugin.generateBundle.call({emitFile:file=>emitted.push(file)},{},{'blog/index.html':{source:template}});
  const article=emitted.find(f=>f.fileName==='blog/verified-story/index.html');assert.ok(article);
  assert.ok(article.source.includes('<h1>A real &amp; verified story</h1>'));
  assert.ok(article.source.includes('&lt;script&gt;unsafe()&lt;/script&gt;'));
  assert.ok(article.source.includes('https://whereathletesbelong.com/blog/verified-story'));
  assert.ok(article.source.includes('BlogPosting'));assert.ok(article.source.includes('content="People &lt; sport"'));
  assert.equal(article.source.includes('The first stories are still to come.'),false);
  assert.equal(emitted.some(f=>f.fileName.includes('not-ready')),false);
  assert.ok(emitted.find(f=>f.fileName==='sitemap.xml').source.includes('/blog/verified-story'));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
