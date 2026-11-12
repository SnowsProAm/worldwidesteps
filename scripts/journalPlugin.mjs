import fs from 'node:fs';
import path from 'node:path';
import { journalOrigin, postStructuredData, publishedPosts, safeMediaUrl, validatePosts, videoEmbed } from '../src/journalModel.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=v=>JSON.stringify(v).replace(/</g,'\\u003c');
function readablePost(post){
  const blocks=post.body.map(b=>b.type==='image'?`<figure><img src="${esc(safeMediaUrl(b.src))}" alt="${esc(b.alt)}"/>${b.caption?`<figcaption>${esc(b.caption)}</figcaption>`:''}</figure>`:b.type==='heading'?`<h2>${esc(b.text)}</h2>`:b.type==='quote'?`<blockquote><p>${esc(b.text)}</p>${b.attribution?`<cite>${esc(b.attribution)}</cite>`:''}</blockquote>`:`<p>${esc(b.text)}</p>`).join('');
  const v=post.video;const embed=v&&videoEmbed(v.url);
  const video=v?`<figure>${embed?`<iframe src="${esc(embed)}" title="${esc(v.title)}" loading="lazy" allowfullscreen></iframe>`:`<video controls preload="metadata" aria-label="${esc(v.title)}" src="${esc(safeMediaUrl(v.url))}"></video>`}<figcaption>${esc(v.description||v.title)}</figcaption><details><summary>Video transcript</summary><p>${esc(v.transcript)}</p></details></figure>`:'';
  return `<main id="main-content"><article class="journal-entry"><a href="/blog">← Back to the journal</a><header><p>${esc(post.category)} / ${esc(post.format)}</p><h1>${esc(post.title)}</h1><p>${esc(post.excerpt)}</p><p>By ${esc(post.author)} · <time datetime="${esc(post.publishedAt)}">${esc(new Date(post.publishedAt).toLocaleDateString('en-IE',{day:'numeric',month:'long',year:'numeric'}))}</time></p></header>${post.cover?`<figure><img src="${esc(safeMediaUrl(post.cover.src))}" alt="${esc(post.cover.alt)}"/></figure>`:''}${video}<div class="journal-body">${blocks}</div></article></main>`;
}
export default function journalPlugin(brand){
  let root,posts;
  return {name:'proam-journal-static-pages',
    configResolved(config){root=config.root;posts=JSON.parse(fs.readFileSync(path.join(root,'content/posts.json'),'utf8'));validatePosts(posts,brand);},
    configureServer(server){server.middlewares.use((req,res,next)=>{const pathname=(req.url||'').split('?')[0].replace(/\/$/,'');if(['/blog','/ambassadors','/shop','/schools'].includes(pathname)&&fs.existsSync(path.join(root,pathname.slice(1),'index.html')))req.url=pathname+'/index.html';else if(/^\/blog\/(?!index\.html)[^?]+/.test(req.url||'')&&!/\.[a-z0-9]+(?:\?|$)/.test(req.url||''))req.url='/blog/index.html';next();});},
    generateBundle(_options,bundle){
      const index=bundle['blog/index.html'];if(!index)return;
      const template=String(index.source),origin=journalOrigin(brand),published=publishedPosts(posts);
      for(const post of published){
        const url=`${origin}/blog/${post.slug}`;
        let html=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(post.title)} | ${brand==='athletes'?'Where Athletes Belong':'World Wide Steps'}</title>`)
          .replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${esc(post.excerpt)}"/>`)
          .replace(/<link rel="canonical" href="[^"]*"\s*\/>/,`<link rel="canonical" href="${esc(url)}"/>`)
          .replace(/<meta property="og:title" content="[^"]*"\s*\/>/,`<meta property="og:title" content="${esc(post.title)}"/>`)
          .replace(/<meta property="og:description" content="[^"]*"\s*\/>/,`<meta property="og:description" content="${esc(post.excerpt)}"/>`)
          .replace(/<meta property="og:url" content="[^"]*"\s*\/>/,`<meta property="og:url" content="${esc(url)}"/>`)
          .replace(/<meta property="og:type" content="website"\s*\/>/,'<meta property="og:type" content="article"/>')
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${json(postStructuredData(post,brand))}</script>`)
          .replace(/<div id="root">[\s\S]*?<\/nav><\/main><\/div>/,`<div id="root">${readablePost(post)}</div>`);
        if(post.cover){
          const image=new URL(post.cover.src,origin).href;
          for(const [attribute,key] of [['property','og:image'],['property','og:image:secure_url'],['name','twitter:image']]){
            html=html.replace(new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*\\/>`),`<meta ${attribute}="${key}" content="${esc(image)}"/>`);
          }
          for(const [attribute,key] of [['property','og:image:alt'],['name','twitter:image:alt']]){
            html=html.replace(new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*\\/>`),`<meta ${attribute}="${key}" content="${esc(post.cover.alt)}"/>`);
          }
          // Cover images can be JPEG, WebP or another size. Do not inherit the
          // landing preview's fixed PNG format and dimensions.
          html=html.replace(/<meta property="og:image:(?:width|height|type)" content="[^"]*"\s*\/>/g,'');
        }
        this.emitFile({type:'asset',fileName:`blog/${post.slug}/index.html`,source:html});
      }
      const sitemapPath=path.join(root,'public/sitemap.xml');let sitemap=fs.readFileSync(sitemapPath,'utf8');
      sitemap=sitemap.replace('</urlset>',published.map(p=>`  <url><loc>${esc(origin)}/blog/${esc(p.slug)}</loc><lastmod>${esc(p.updatedAt||p.publishedAt)}</lastmod></url>`).join('\n')+'\n</urlset>');
      this.emitFile({type:'asset',fileName:'sitemap.xml',source:sitemap});
    },
  };
}
