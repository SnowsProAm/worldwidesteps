import React, { useEffect, useState } from 'react';
import WorldJournalHeader from './WorldJournalHeader.jsx';
import WorldSiteFooter from './WorldSiteFooter.jsx';
import posts from '../content/posts.json';
import { filterPosts, journalCategories, journalOrigin, publishedPosts, safeMediaUrl, videoEmbed } from './journalModel.js';
import './journal.css';

function JournalHero() {
  return <section className="journal-hero" aria-labelledby="journal-title">
    <div className="journal-hero-copy">
      <h1 id="journal-title">Journal</h1>
      <p>Stories, interviews and videos from the Worldwide Steps community.</p>
    </div>
    <div className="steps-journal-art" aria-hidden="true">
      <svg viewBox="0 0 160 160" fill="none">
        <circle cx="80" cy="80" r="64" fill="#e5efdf"/>
        <ellipse cx="80" cy="80" rx="30" ry="64" stroke="#97b38b"/>
        <path d="M20 58h120M16 84h128M23 110h114M80 16v128" stroke="#97b38b"/>
        <path d="M30 112c12-54 74-5 96-66" stroke="#0868ce" strokeWidth="2" strokeDasharray="4 6"/>
        <circle cx="30" cy="112" r="4" fill="#0868ce"/>
        <circle cx="126" cy="46" r="4" fill="#0868ce"/>
      </svg>
    </div>
  </section>;
}
function PostVideo({video}){const embed=videoEmbed(video.url);return <figure className="journal-video">{embed?<iframe src={embed} title={video.title} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<video controls preload="metadata" playsInline poster={safeMediaUrl(video.thumbnail)} aria-label={video.title}><source src={safeMediaUrl(video.url)}/>{video.captions&&<track kind="captions" src={safeMediaUrl(video.captions)} srcLang="en" label="English" default/>}</video>}<figcaption>{video.description||video.title}</figcaption>{video.transcript&&<details><summary>Read the video transcript</summary><p>{video.transcript}</p></details>}</figure>;}
function Entry({post,brand}){
  useEffect(()=>{document.title=`${post.title} | ${brand==='athletes'?'Where Athletes Belong':'World Wide Steps'}`;const description=document.querySelector('meta[name="description"]');if(description)description.content=post.excerpt;const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=`${journalOrigin(brand)}/blog/${post.slug}`;},[post,brand]);
  return <article className="journal-entry"><a className="journal-back" href="/blog">← Back to the journal</a><header><p className="journal-kicker">{post.category} / {post.format}{post.sport?` / ${post.sport}`:''}</p><h1>{post.title}</h1><p className="journal-excerpt">{post.excerpt}</p><p className="journal-byline">By {post.author} <span>·</span> <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString('en-IE',{day:'numeric',month:'long',year:'numeric'})}</time></p></header>{post.cover&&<figure className="journal-cover"><img src={safeMediaUrl(post.cover.src)} alt={post.cover.alt}/>{post.cover.caption&&<figcaption>{post.cover.caption}</figcaption>}</figure>}{post.video&&<PostVideo video={post.video}/>}<div className="journal-body">{post.body.map((block,i)=>block.type==='heading'?<h2 key={i}>{block.text}</h2>:block.type==='quote'?<blockquote key={i}><p>{block.text}</p>{block.attribution&&<cite>{block.attribution}</cite>}</blockquote>:block.type==='image'?<figure key={i}><img src={safeMediaUrl(block.src)} alt={block.alt} loading="lazy"/>{block.caption&&<figcaption>{block.caption}</figcaption>}</figure>:<p key={i}>{block.text}</p>)}</div><div className="journal-entry-end"><p>More from Worldwide Steps</p><a href={brand==='athletes'?'/ambassadors':'/blog'}>{brand==='athletes'?'Become an ambassador':'Back to the journal'} ↗</a></div></article>;
}
export default function Journal({brand='steps'}) {
  const [category,setCategory]=useState('All stories');
  const [format,setFormat]=useState('All formats');
  const [query,setQuery]=useState('');
  const published=publishedPosts(posts);
  const filtered=filterPosts(published,{category,format,query});
  const slug=window.location.pathname.replace(/^\/blog\/?/,'').replace(/\/$/,'');
  const isEntry=slug&&slug!=='index.html';
  const post=isEntry?published.find(p=>p.slug===slug):null;
  const clear=()=>{setCategory('All stories');setFormat('All formats');setQuery('');};
  const hasFilters=category!=='All stories'||format!=='All formats'||query;

  return <div className={`journal-page journal-${brand}`}>
    <WorldJournalHeader/>
    <main id="main-content">
      {isEntry ? (post ? <Entry post={post} brand={brand}/> :
        <section className="journal-not-found">
          <h1>This story is not available.</h1>
          <p>It may not have been published yet, or the link may have changed.</p>
          <a href="/blog" className="journal-primary">Back to the journal</a>
        </section>
      ) : <>
        <JournalHero/>
        <section id="journal-stories" className="journal-stories" aria-labelledby="journal-list-title">
          <div className="journal-section-title">
            <div>
              <h2 id="journal-list-title">Latest stories</h2>
              {published.length>0&&<p className="journal-result-count">{published.length} published {published.length===1?'story':'stories'}</p>}
            </div>
            <a href="mailto:team@snowsproam.com?subject=A%20story%20for%20Worldwide%20Steps" className="journal-primary">Share a story</a>
          </div>
          <>
            <div className="journal-categories" role="group" aria-label="Filter stories by topic">
              {['All stories',...journalCategories[brand]].map(c=><button key={c} onClick={()=>setCategory(c)} aria-pressed={category===c}>{c}</button>)}
            </div>
            <div className="journal-tools">
              <label className="journal-search" htmlFor="story-search"><span className="journal-field-label">Search the journal</span><input id="story-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a story…"/></label>
              <label htmlFor="story-format"><span className="journal-field-label">Format</span><select id="story-format" value={format} onChange={e=>setFormat(e.target.value)}>{['All formats','Article','Film','Testimonial'].map(f=><option key={f}>{f}</option>)}</select></label>
            </div>
          </>
          {filtered.length ? <>
            <p className="journal-result-count" role="status">{filtered.length} {filtered.length===1?'story':'stories'} found</p>
            <div className="journal-posts">{filtered.map(p=><a className="journal-post" key={p.slug} href={`/blog/${p.slug}`}>
              {p.cover&&<img src={safeMediaUrl(p.cover.src)} alt={p.cover.alt} loading="lazy"/>}
              <div><p className="journal-kicker">{p.category} / {p.format}</p><h3>{p.title}</h3><p>{p.excerpt}</p><span>Read the story ↗</span></div>
            </a>)}</div>
          </> : <div className="journal-empty" role="status">
            <div>
              <h3>{published.length?'No matching stories.':'No stories published yet.'}</h3>
              {published.length>0&&<p>Try a different topic, format or search.</p>}
              {hasFilters&&<button className="journal-outline" onClick={clear}>Clear filters</button>}
            </div>
          </div>}
        </section>
      </>}
    </main>
    <WorldSiteFooter compact/>
  </div>;
}
