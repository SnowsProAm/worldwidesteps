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


test('story sharing uses its cover for Open Graph and Twitter, or the landing preview when there is no cover',()=>{
 for(const brand of ['steps','athletes']){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'proam-social-'));
  try{
   fs.mkdirSync(path.join(root,'content'));fs.mkdirSync(path.join(root,'public'));
   const post={slug:'story-with-cover',status:'published',title:'A community story',excerpt:'An editorial excerpt.',author:'ProAm team',category:'Community',format:'Article',publishedAt:'2026-01-01T10:00:00Z',body:[{type:'paragraph',text:'The full story.'}],cover:{src:'/stories/cover.webp',alt:'People walking together.'}};
   fs.writeFileSync(path.join(root,'content/posts.json'),JSON.stringify([post,{...post,slug:'story-without-cover',cover:undefined}]));
   fs.writeFileSync(path.join(root,'public/sitemap.xml'),'<urlset></urlset>');
   const template=fs.readFileSync(new URL('../blog/index.html',import.meta.url),'utf8');
   const plugin=journalPlugin(brand);plugin.configResolved({root});const emitted=[];
   plugin.generateBundle.call({emitFile:file=>emitted.push(file)},{},{'blog/index.html':{source:template}});
   const html=emitted.find(f=>f.fileName==='blog/story-with-cover/index.html').source;
   const origin=brand==='steps'?'https://worldwidesteps.com':'https://whereathletesbelong.com';
   assert.ok(html.includes(`<meta property="og:image" content="${origin}/stories/cover.webp"/>`));
   assert.ok(html.includes(`<meta name="twitter:image" content="${origin}/stories/cover.webp"/>`));
   assert.ok(html.includes('<meta property="og:image:alt" content="People walking together."/>'));
   assert.ok(html.includes('<meta name="twitter:image:alt" content="People walking together."/>'));
   assert.equal(html.includes('property="og:image:width"'),false);
   assert.equal(html.includes('property="og:image:type"'),false);
   const fallback=emitted.find(f=>f.fileName==='blog/story-without-cover/index.html').source;
   assert.ok(fallback.includes('-social-20261105.png'));
   assert.ok(fallback.includes('content="summary_large_image"'));
  }finally{fs.rmSync(root,{recursive:true,force:true});}
 }
});
