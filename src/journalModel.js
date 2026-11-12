export const journalCategories = {
  athletes: ['Events', 'Tournaments', 'Community', 'Athlete stories', 'Behind the scenes'],
  steps: ['Step challenges', 'Walking', 'Community', 'Run clubs', 'Testimonials'],
};
export const journalOrigin = brand => brand === 'athletes' ? 'https://whereathletesbelong.com' : 'https://worldwidesteps.com';
export function publishedPosts(posts, now = new Date()) {
  return posts.filter(post => post.status === 'published' && !Number.isNaN(Date.parse(post.publishedAt)) && new Date(post.publishedAt) <= now).sort((a,b) => new Date(b.publishedAt)-new Date(a.publishedAt));
}
export function filterPosts(posts, { category='All stories', format='All formats', sport='All sports', query='' } = {}) {
  const search=query.trim().toLowerCase();
  return posts.filter(post => (category==='All stories'||post.category===category) && (format==='All formats'||post.format===format) && (sport==='All sports'||post.sport===sport) && (!search || [post.title,post.excerpt,post.category,post.sport,post.author].join(' ').toLowerCase().includes(search)));
}
export function safeMediaUrl(value) {
  if(typeof value!=='string')return '';
  if(/^\/(?!\/)[^\s]*$/.test(value))return value;
  try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}
}
export function videoEmbed(url) {
  try{const parsed=new URL(url);let id;
    if(['youtube.com','www.youtube.com','m.youtube.com'].includes(parsed.hostname))id=parsed.searchParams.get('v')||parsed.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
    if(parsed.hostname==='youtu.be')id=parsed.pathname.slice(1);
    if(id&&/^[\w-]{11}$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;
    if(['vimeo.com','www.vimeo.com'].includes(parsed.hostname)&&/^\/\d+$/.test(parsed.pathname))return `https://player.vimeo.com/video${parsed.pathname}`;
  }catch{/* Uploaded videos use the native player. */}
  return '';
}
export function postStructuredData(post, brand) {
  const origin=journalOrigin(brand),url=`${origin}/blog/${post.slug}`;
  const article={'@context':'https://schema.org','@type':'BlogPosting',headline:post.title,description:post.excerpt,datePublished:post.publishedAt,dateModified:post.updatedAt||post.publishedAt,author:{'@type':'Person',name:post.author},publisher:{'@type':'Organization',name:'Snows ProAm',url:'https://snowsproam.com',logo:{'@type':'ImageObject',url:`${origin}/snows-proam-logo.png`}},mainEntityOfPage:url,url,articleSection:post.category};
  if(safeMediaUrl(post.cover?.src))article.image=new URL(post.cover.src,origin).href;
  const v=post.video;
  if(v&&safeMediaUrl(v.url)&&safeMediaUrl(v.thumbnail)&&v.uploadDate&&v.title&&v.description){
    article.video={'@type':'VideoObject',name:v.title,description:v.description,thumbnailUrl:new URL(v.thumbnail,origin).href,uploadDate:v.uploadDate};
    const embed=videoEmbed(v.url);if(embed)article.video.embedUrl=embed;else article.video.contentUrl=new URL(v.url,origin).href;
    if(v.transcript)article.video.transcript=v.transcript;
    if(v.duration)article.video.duration=v.duration;
  }
  return article;
}
export function validatePosts(posts,brand) {
  const slugs=new Set();
  for(const p of posts){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug))throw Error('Each journal entry needs a unique lowercase slug.');slugs.add(p.slug);
    if(!['draft','published'].includes(p.status))throw Error(`${p.slug}: use draft or published status.`);
    if(p.status!=='published')continue;
    if(!p.title||!p.excerpt||!p.author||!p.publishedAt||Number.isNaN(Date.parse(p.publishedAt)))throw Error(`${p.slug}: published entries need title, excerpt, author and an ISO publication date.`);
    if(!journalCategories[brand].includes(p.category))throw Error(`${p.slug}: choose a category for this brand.`);
    if(!['Article','Film','Testimonial'].includes(p.format))throw Error(`${p.slug}: choose Article, Film or Testimonial.`);
    if(!Array.isArray(p.body)||!p.body.length)throw Error(`${p.slug}: add real article content.`);
    if(p.cover&&(!safeMediaUrl(p.cover.src)||!p.cover.alt))throw Error(`${p.slug}: cover images need a safe URL and descriptive alt text.`);
    for(const block of p.body){if(!['paragraph','heading','quote','image'].includes(block.type))throw Error(`${p.slug}: unsupported content block.`);if(block.type==='image'&&(!safeMediaUrl(block.src)||!block.alt))throw Error(`${p.slug}: images need a safe URL and alt text.`);if(block.type!=='image'&&!block.text)throw Error(`${p.slug}: text blocks cannot be empty.`);}
    if(p.video&&(!safeMediaUrl(p.video.url)||!p.video.title||!p.video.transcript))throw Error(`${p.slug}: videos need a safe URL, title and text transcript.`);
    if(p.format==='Testimonial'&&!p.permissionConfirmed)throw Error(`${p.slug}: confirm permission before publishing a testimonial.`);
    if(p.format==='Film'&&!p.video)throw Error(`${p.slug}: films need a video.`);
  }
  return true;
}
