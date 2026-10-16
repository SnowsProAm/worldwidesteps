import React, { useEffect, useRef, useState } from 'react';
import './proAmClothesRail.css';

const touchRailQuery = '(max-width: 760px), (hover: none), (pointer: coarse)';

// Separate dimensional front, back and side mockups keep the garment volume visible.
function Garment({ product, back = false, side = false }) {
  const [failed, setFailed] = useState(false);
  return <span className={`proam-rail-garment ${back ? 'shows-back' : ''} ${side ? 'shows-side' : ''}`}>
    <img className="proam-rail-side" src={`/store/rail-v3/${product.key}-side.webp`} alt="" decoding="async" onError={() => setFailed(true)}/>
    <span className="proam-rail-faces">
      <img className="proam-rail-front" src={`/store/rail-v3/${product.key}-front.webp`} alt="" decoding="async" onError={() => setFailed(true)}/>
      <img className="proam-rail-back" src={`/store/rail-v4/${product.key}-back.webp`} alt="" decoding="async" onError={() => setFailed(true)}/>
    </span>
    {failed && <span className="proam-rail-image-error">Preview unavailable. Product details below.</span>}
  </span>;
}

export default function ProAmClothesRail({ products }) {
  const [selectedKey, setSelectedKey] = useState(products[Math.floor(products.length / 2)]?.key);
  const [back, setBack] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectOnly, setSelectOnly] = useState(() => typeof window !== 'undefined' && window.matchMedia(touchRailQuery).matches);
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

  useEffect(() => {
    const mobile = window.matchMedia(touchRailQuery);
    const updateInteraction = () => {
      setSelectOnly(mobile.matches);
      if (mobile.matches) setOpen(false);
    };
    mobile.addEventListener('change', updateInteraction);
    return () => mobile.removeEventListener('change', updateInteraction);
  }, []);

  if (!selected) return null;
  const select = (product) => { if (product.key !== selected.key) { setSelectedKey(product.key); setBack(false); } };
  const turn = (product) => {
    setSelectedKey(product.key);
    setBack(product.key === selected.key ? !back : true);
  };
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
      <div className="proam-rail-caption"><span>THE PROAM RAIL</span><p id="proam-rail-instructions">{selectOnly ? 'Select a piece. Choose Front or Back.' : 'Click a piece to turn it around.'}</p></div>
      <div className="proam-rail-stage">
        <div className="proam-rail-bar" aria-hidden="true"/>
        {products.map((product, index) => {
          let offset = index - selectedIndex;
          if (products.length > 2) {
            if (offset > 1) offset -= products.length;
            if (offset < -1) offset += products.length;
          }
          const active = product.key === selected.key;
          return <button key={product.key} type="button" className={`proam-rail-piece ${active ? 'is-selected' : ''}`} style={{ '--rail-offset': offset, '--rail-slot': index - (products.length - 1) / 2 }} aria-label={selectOnly ? `Select ${product.colour} ${product.title}` : `Turn ${product.colour} ${product.title} to ${active && back ? 'front' : 'back'}`} aria-pressed={selectOnly ? active : undefined} aria-describedby="proam-rail-instructions" onClick={() => selectOnly ? select(product) : turn(product)} onPointerEnter={event => { if (event.pointerType === 'mouse' && !selectOnly) select(product); }}>
            <Garment product={product} back={active && back} side={!active}/>
          </button>;
        })}
        {!selectOnly && <button className="proam-rail-enlarge" type="button" onClick={() => setOpen(true)} aria-label={`Enlarge ${selected.colour} ${selected.title}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></svg><span>Closer look</span></button>}
      </div>
      {angles('Clothes rail preview angle')}
      <div className="proam-rail-selector" role="group" aria-label="Choose a garment">
        {products.map(product => <button key={product.key} type="button" aria-pressed={product.key === selected.key} onClick={() => select(product)}><span className={`proam-rail-swatch ${product.colour === 'White' ? 'is-white' : ''}`} aria-hidden="true"/>{product.colour} {product.title.includes('Hoodie') ? 'hoodie' : 'tee'}</button>)}
      </div>
      <div className="proam-rail-info" aria-live="polite" aria-atomic="true"><span className="proam-rail-count">{String(selectedIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</span><h3>{selected.title}</h3><span className="proam-sr-only">{back ? 'Back view' : 'Front view'}</span><p>{selected.colour} · {selected.material}</p></div>
      <button className="proam-rail-shop" type="button" onClick={chooseSize}>Choose size &amp; check availability <span aria-hidden="true">↗</span></button>
    </div>
    <dialog ref={dialog} className="proam-rail-dialog" aria-labelledby="proam-rail-dialog-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={event => { if (event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false); } }}>
      <button className="proam-dialog-close" type="button" onClick={() => setOpen(false)} aria-label="Close product preview" autoFocus>×</button>
      <button type="button" className="proam-rail-closeup" aria-label={`Turn enlarged ${selected.colour} ${selected.title} to ${back ? 'front' : 'back'}`} onClick={() => setBack(value => !value)}><Garment key={selected.key} product={selected} back={back}/></button>
      <div className="proam-rail-dialog-nav"><button type="button" onClick={() => step(-1)} aria-label="Previous garment">←</button><div aria-live="polite" aria-atomic="true"><span className="proam-rail-count">{String(selectedIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</span><h2 id="proam-rail-dialog-title">{selected.title}</h2><p>{selected.colour}</p></div><button type="button" onClick={() => step(1)} aria-label="Next garment">→</button></div>
      {angles('Large product preview angle')}
      <button className="proam-rail-shop" type="button" onClick={chooseSize}>Choose size &amp; check availability <span aria-hidden="true">↗</span></button>
    </dialog>
  </>;
}
