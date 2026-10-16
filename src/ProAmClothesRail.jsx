import React, { useEffect, useRef, useState } from 'react';
import './proAmClothesRail.css';

// Use the actual catalogue photography on both sides of the turning garment.
function Garment({ product, back = false }) {
  const [failed, setFailed] = useState(false);
  return <span className={`proam-rail-garment ${back ? 'shows-back' : ''} ${product.title.includes('Hoodie') ? 'is-hoodie' : ''}`}>
    <svg className="proam-rail-hanger" viewBox="0 0 240 100" fill="none" aria-hidden="true">
      <path d="M120 28V21c0-9 14-8 14-17 0-13-22-13-22 0" stroke="#747c80" strokeWidth="3" strokeLinecap="round"/>
      <path d="M120 27 29 76c-7 4-5 12 3 12h176c8 0 10-8 3-12L120 27Z" fill="#927254" stroke="#6c513b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="m43 77 77-40 77 40" stroke="#c4a27c" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <span className="proam-rail-faces">
      <img className="proam-rail-front" src={product.image} alt="" decoding="async" onError={() => setFailed(true)}/>
      <img className="proam-rail-back" src={product.back} alt="" decoding="async" onError={() => setFailed(true)}/>
    </span>
    {failed && <span className="proam-rail-image-error">Preview unavailable. Product details below.</span>}
  </span>;
}

export default function ProAmClothesRail({ products }) {
  const [selectedKey, setSelectedKey] = useState(products[Math.floor(products.length / 2)]?.key);
  const [back, setBack] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const selected = products.find(product => product.key === selectedKey) || products[0];
  const selectedIndex = products.indexOf(selected);

  useEffect(() => {
    if (!dialog.current) return undefined;
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!selected) return null;
  const select = (product) => { if (product.key !== selected.key) { setSelectedKey(product.key); setBack(false); } };
  const step = (direction) => select(products[(selectedIndex + direction + products.length) % products.length]);
  const chooseSize = () => {
    setOpen(false);
    // Close first so the native dialog returns focus before moving it to the product.
    if (dialog.current.open) dialog.current.close();
    const title = document.getElementById(`${selected.key}-title`);
    title?.focus({ preventScroll: true });
    document.getElementById(selected.key)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  const angles = (label) => <div className="proam-rail-angles" role="group" aria-label={label}>
    <button type="button" aria-pressed={!back} onClick={() => setBack(false)}>Front</button>
    <button type="button" aria-pressed={back} onClick={() => setBack(true)}>Back</button>
  </div>;

  return <>
    <div className="proam-rail-showcase" role="region" aria-label="Explore the ProAm clothes rail">
      <div className="proam-rail-caption"><span>THE PROAM RAIL</span><p>Select a piece. Make it yours.</p></div>
      <div className="proam-rail-stage">
        <div className="proam-rail-bar" aria-hidden="true"/>
        {products.map((product, index) => {
          let offset = index - selectedIndex;
          if (products.length > 2) {
            if (offset > 1) offset -= products.length;
            if (offset < -1) offset += products.length;
          }
          const active = product.key === selected.key;
          return <button key={product.key} type="button" className={`proam-rail-piece ${active ? 'is-selected' : ''}`} style={{ '--rail-offset': offset, '--rail-slot': index - (products.length - 1) / 2, '--rail-turn': `${offset === 0 ? 0 : offset > 0 ? -58 : 58}deg` }} aria-label={`Preview ${product.colour} ${product.title}`} aria-pressed={active} onClick={() => select(product)} onPointerEnter={event => { if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 761px)').matches) select(product); }}>
            <Garment product={product} back={active && back}/>
          </button>;
        })}
        <button className="proam-rail-enlarge" type="button" onClick={() => setOpen(true)} aria-label={`Enlarge ${selected.colour} ${selected.title}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></svg><span>Closer look</span></button>
      </div>
      <div className="proam-rail-selector" role="group" aria-label="Choose a garment">
        {products.map(product => <button key={product.key} type="button" aria-pressed={product.key === selected.key} onClick={() => select(product)}><span className={`proam-rail-swatch ${product.colour === 'White' ? 'is-white' : ''}`} aria-hidden="true"/>{product.colour} {product.title.includes('Hoodie') ? 'hoodie' : 'tee'}</button>)}
      </div>
      <div className="proam-rail-info" aria-live="polite" aria-atomic="true"><span className="proam-rail-count">{String(selectedIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</span><h3>{selected.title}</h3><p>{selected.colour} · {selected.material}</p></div>
      {angles('Clothes rail preview angle')}
      <button className="proam-rail-shop" type="button" onClick={chooseSize}>Choose size &amp; check availability <span aria-hidden="true">↗</span></button>
    </div>
    <dialog ref={dialog} className="proam-rail-dialog" aria-labelledby="proam-rail-dialog-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={event => { if (event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false); } }}>
      <button className="proam-dialog-close" type="button" onClick={() => setOpen(false)} aria-label="Close product preview" autoFocus>×</button>
      <div className="proam-rail-closeup"><Garment key={selected.key} product={selected} back={back}/></div>
      <div className="proam-rail-dialog-nav"><button type="button" onClick={() => step(-1)} aria-label="Previous garment">←</button><div aria-live="polite" aria-atomic="true"><span className="proam-rail-count">{String(selectedIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</span><h2 id="proam-rail-dialog-title">{selected.title}</h2><p>{selected.colour}</p></div><button type="button" onClick={() => step(1)} aria-label="Next garment">→</button></div>
      {angles('Large product preview angle')}
      <button className="proam-rail-shop" type="button" onClick={chooseSize}>Choose size &amp; check availability <span aria-hidden="true">↗</span></button>
    </dialog>
  </>;
}
