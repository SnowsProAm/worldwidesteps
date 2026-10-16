import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import WorldSiteFooter from './WorldSiteFooter.jsx';
import ProAmMovement from './ProAmMovement.jsx';
import ProAmReviews from './ProAmReviews.jsx';
import ProAmCart from './ProAmCart.jsx';
import ProAmHeroBackdrop from './ProAmHeroBackdrop.jsx';
import ProAmClothesRail from './ProAmClothesRail.jsx';
import './proAmShop.css';

const SHOP_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SHOP_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const shopSupabase = SHOP_SUPABASE_URL && SHOP_SUPABASE_KEY
  ? createClient(SHOP_SUPABASE_URL, SHOP_SUPABASE_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    })
  : null;

const SIZE_ORDER = ['S', 'M', 'L', 'XL'];
const PRODUCTS = [
  { key: 'white-tee', title: 'ProAm Dri-Fit T-Shirt', colour: 'White', badge: 'THE COMMUNITY CLASSIC', image: '/store/white-front-smooth.webp', back: '/store/white-back-smooth.webp', material: '96% polyester / 4% spandex performance fabric', match: (item) => /t-?shirt/i.test(item.product_type || item.name) },
  { key: 'black-tee', title: 'ProAm Dri-Fit T-Shirt', colour: 'Black', badge: 'MADE TO MOVE', image: '/store/black-front-smooth.webp', back: '/store/black-back-smooth.webp', material: '96% polyester / 4% spandex performance fabric', match: (item) => /t-?shirt/i.test(item.product_type || item.name) },
  { key: 'black-hoodie', title: 'ProAm Performance Hoodie', colour: 'Black', badge: 'FOR EVERY SEASON', image: '/store/hoodie-front.webp', back: '/store/hoodie-back.webp', material: '85% cotton / 15% polyester fabric', match: (item) => /hoodie/i.test(item.product_type || item.name) },
];

const displayPrice = (value) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));

function ProductCard({ product, item, session, stockAlerts, onAlertSaved, onAlertRemoved, onSignIn, onAddToCart }) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSize, setAlertSize] = useState('M');
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [view, setView] = useState('back');
  const sizes = item?.sizes?.[product.colour] || {};
  const soldOut = !item || item.visible === false || item.image_urls?.[product.colour]?.outOfStock === true || SIZE_ORDER.every((size) => Number(sizes[size] || 0) <= 0);
  const selectedAvailable = !soldOut && Number(sizes[alertSize] || 0) > 0;
  const frontImage = product.image;
  const backImage = product.back;
  const currentImage = view === 'back' ? backImage : frontImage;
  const price = item?.price;
  const activeAlerts = stockAlerts.filter((alert) => alert.product_id === item?.id && alert.colour === product.colour);
  const activeAlert = activeAlerts.find((alert) => alert.size === alertSize);

  const toggleAlert = async (event) => {
    event.preventDefault();
    if (!session?.user?.id) {
      if (!shopSupabase || !item?.id || alertBusy) return;
      setAlertBusy(true); setAlertMessage('');
      try {
        const { data, error } = await shopSupabase.functions.invoke('proam-store-stock-notifications', { body: { action: 'subscribe', email: guestEmail.trim(), product_id: item.id, colour: product.colour, size: alertSize } });
        if (error || !data?.ok) throw error;
        setAlertMessage(`Alert saved. We’ll email you when ${product.colour.toLowerCase()} / ${alertSize} is back.`);
      } catch { setAlertMessage('We couldn’t save your alert. Check your email and try again.'); }
      finally { setAlertBusy(false); }
      return;
    }
    if (!shopSupabase || !item?.id || alertBusy) return;
    setAlertBusy(true); setAlertMessage('');
    if (activeAlert?.status === 'processing') { setAlertBusy(false); setAlertMessage('Your notification is being prepared. Please try again shortly.'); return; }
    if (activeAlert?.size === alertSize) {
      const { data: removed, error } = await shopSupabase.from('proam_store_stock_notifications').delete().eq('product_id', item.id).eq('colour', product.colour).eq('size', alertSize).eq('profile_id', session.user.id).eq('status', 'waiting').select('id');
      setAlertBusy(false);
      if (error || !removed?.length) { setAlertMessage('We could not cancel that alert. Refresh and try again.'); return; }
      onAlertRemoved(item.id, product.colour, alertSize);
      setAlertMessage(`Your ${alertSize} alert has been cancelled.`);
      return;
    }
    const { error } = await shopSupabase.from('proam_store_stock_notifications').insert({ profile_id: session.user.id, product_id: item.id, colour: product.colour, size: alertSize });
    setAlertBusy(false);
    if (error && error.code !== '23505') { setAlertMessage('We could not save your alert. Please try again.'); return; }
    onAlertSaved(item.id, product.colour, alertSize);
    setAlertMessage(`We’ll email your ProAm account when the ${product.colour.toLowerCase()} ${alertSize} returns.`);
  };

  return (
    <article id={product.key} className="proam-product-card" aria-labelledby={`${product.key}-title`}>
      <div className={`proam-product-image ${product.colour === 'Black' ? 'is-black' : ''}`}>
        <span className="proam-product-badge">{product.badge}</span>
        <div className="proam-viewer-controls" role="group" aria-label={`${product.title} preview angle`}>
          <button type="button" onClick={() => setView('front')} aria-pressed={view === 'front'}>Front</button>
          <button type="button" onClick={() => setView('back')} aria-pressed={view === 'back'}>Back</button>
        </div>
        <img key={view} className={`proam-viewer-image view-${view}`} src={currentImage} alt={`${product.colour} Snows ProAm ${product.title.includes('Hoodie') ? 'hoodie' : 'Dri-Fit T-shirt'}, ${view} view`} loading="lazy" decoding="async" />
        {soldOut && <span className="proam-soldout-stamp">Sold out</span>}
      </div>
      <div className="proam-product-copy">
        <div className="proam-product-heading">
          <div>
            <h3 id={`${product.key}-title`} tabIndex={-1}>{product.title}</h3>
            <p>{product.colour}</p>
          </div>
          <strong className="proam-product-price">{price ? displayPrice(price) : '—'}</strong>
        </div>
        <div className="proam-size-heading"><span>Sizes</span><span>S–XL</span></div>
        <ul className="proam-size-list" aria-label={`${product.colour} ${product.title} sizes`}>
          {SIZE_ORDER.map((size) => {
            const unavailable = soldOut || Number(sizes[size] || 0) <= 0;
            return <li key={size} className={unavailable ? 'size-unavailable' : 'size-available'}><button type="button" aria-label={`${size}, ${unavailable ? 'sold out; set a restock alert' : 'available'}`} aria-pressed={alertSize === size} onClick={() => { setAlertSize(size); if (unavailable) setAlertOpen(true); }}><span>{size}</span><span className="proam-size-sold">{unavailable ? 'Sold out' : 'Available'}</span></button></li>;
          })}
        </ul>
        <details className="proam-fit-guide">
          <summary>Size &amp; fit guide</summary>
          <p>For your best fit, we recommend going one size up.</p>
          <table className="proam-size-chart"><caption>Size recommendation</caption><thead><tr><th scope="col">Your usual size</th><th scope="col">Choose ProAm</th></tr></thead><tbody>{[['XS','S'],['S','M'],['M','L'],['L','XL']].map(([usual,recommended]) => <tr key={usual}><th scope="row">{usual}</th><td>{recommended}</td></tr>)}</tbody></table>
        </details>
        <details className="proam-fit-guide"><summary>Product details</summary><p>{product.material}. The Snows ProAm logo features on the chest, with our community mark on the back.</p></details>
        <ProAmReviews client={shopSupabase} productId={item?.id} session={session} onSignIn={onSignIn} />
        {!selectedAvailable ? (
          <>
            <button className="proam-product-button" type="button" onClick={() => { setAlertOpen((open) => !open); setAlertMessage(''); }} aria-expanded={alertOpen} aria-controls={`${product.key}-alert`}>
              <span><svg className="proam-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round"/></svg> Notify me when available</span><span aria-hidden="true">{alertOpen ? '−' : '+'}</span>
            </button>
            {alertOpen && <form className="proam-alert-form" id={`${product.key}-alert`} onSubmit={toggleAlert}>
              <label htmlFor={`${product.key}-alert-size`}>Choose a size</label>
              <select id={`${product.key}-alert-size`} value={alertSize} onChange={(event) => setAlertSize(event.target.value)}>
                {['S', 'M', 'L', 'XL'].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
              {!session && <><label htmlFor={`${product.key}-guest-email`}>Email address</label><input className="proam-guest-email" id={`${product.key}-guest-email`} type="email" autoComplete="email" value={guestEmail} onChange={event => setGuestEmail(event.target.value)} required placeholder="you@example.com"/><p className="proam-alert-consent">One restock alert for this size. Unsubscribe any time.</p></>}
              <button type="submit" disabled={alertBusy}>{alertBusy ? 'Saving…' : activeAlert?.size === alertSize ? 'Cancel this alert' : 'Save restock alert'}</button>
            {!session && <button className="proam-guest-account-link" type="button" onClick={onSignIn}>Have a ProAm account? Sign in</button>}
            </form>}
            <p className="proam-product-availability" id={`${product.key}-availability`} role="status" aria-live="polite">
              {alertMessage || (activeAlerts.length ? `Alert${activeAlerts.length === 1 ? '' : 's'} saved for ${activeAlerts.map((alert) => alert.size).join(', ')}.` : '')}
            </p>
          </>
        ) : <button className="proam-product-button" type="button" onClick={() => onAddToCart(item, product, alertSize)}>Add to bag <span aria-hidden="true">+</span></button>}
      </div>
    </article>
  );
}

function MemberAccount({ open, onClose, session }) {
  const dialog = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    else if (!open && dialog.current.open) dialog.current.close();
    if (!open) setPassword('');
  }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const signIn = async (event) => {
    event.preventDefault();
    if (!shopSupabase || loading) return;
    setLoading(true); setMessage('');
    try {
      const { error } = await shopSupabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setMessage('We couldn’t sign you in. Check your email and password, then try again.'); return; }
      setPassword(''); onClose();
    } catch { setMessage('Connection lost. Your email is saved — please try again.'); }
    finally { setLoading(false); }
  };
  const signOut = async () => {
    setLoading(true); setMessage('');
    try {
      const { error } = await shopSupabase.auth.signOut();
      if (error) setMessage('We couldn’t sign you out. Please try again.');
      else onClose();
    } catch { setMessage('Check your connection and try again.'); }
    finally { setLoading(false); }
  };
  return <dialog ref={dialog} className="proam-account-dialog" aria-labelledby="proam-account-title" onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }}>
    <button className="proam-dialog-close" type="button" onClick={onClose} aria-label="Close account dialog">×</button>
    <img className="proam-dialog-logo" src="/snows-proam-logo.png" alt="Snows ProAm"/>
    <h2 id="proam-account-title">{session ? 'Your ProAm account' : 'Welcome back.'}</h2>
    {session ? <><p className="proam-dialog-intro">{session.user.email}</p><button className="proam-signin-button" onClick={signOut} disabled={loading}>{loading ? 'Signing out…' : 'Sign out'}</button></> : <>
      <p className="proam-dialog-intro">Sign in with your ProAm app account to save restock alerts.</p>
      <form className="proam-signin-form" onSubmit={signIn} aria-describedby="proam-signin-message">
        <label htmlFor="proam-email">Email address</label>
        <input id="proam-email" type="email" name="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)}/>
        <label htmlFor="proam-password">Password</label>
        <input id="proam-password" type="password" name="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}/>
        <button className="proam-signin-button" type="submit" disabled={loading || !shopSupabase}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </>}
    <p id="proam-signin-message" className="proam-signin-message" role="alert">{!shopSupabase ? 'Sign-in is temporarily unavailable. Please try again shortly.' : message}</p>
  </dialog>;
}

export default function ProAmShop() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [session, setSession] = useState(null);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [unsubscribeMessage, setUnsubscribeMessage] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkoutRetry, setCheckoutRetry] = useState(0);
  const checkoutId = new URLSearchParams(window.location.search).get('checkout');
  const closeCart = useCallback(() => setCartOpen(false), []);
  const addToCart = (item, product, size) => {
    setCart(current => {
      const existing = current.find(row => row.product_id === item.id && row.colour === product.colour && row.size === size);
      return existing ? current.map(row => row === existing ? { ...row, quantity: Math.min(10, row.quantity + 1) } : row) : [...current, { product_id: item.id, colour: product.colour, size, quantity: 1, name: product.title, image: product.image }];
    });
    setCartOpen(true);
  };
  useEffect(() => {
    if (!checkoutId || !session || !shopSupabase) return;
    let active = true, timer;
    let attempts = 0;
    const check = async () => {
      setCheckoutMessage('Checking your payment…');
      try {
        const cancelled = new URLSearchParams(window.location.search).has('cancelled');
        const { data, error } = await shopSupabase.functions.invoke('proam-store-checkout', { body: { action: cancelled ? 'cancel' : 'status', checkout_id: checkoutId } });
        if (!active) return;
        if (error) throw error;
        if (data.status === 'paid') { setCheckoutMessage(data.test ? 'Test payment confirmed. No real order was placed.' : `Payment confirmed. Your order reference is ${data.order_id?.slice(0, 8).toUpperCase()}. Your receipt will arrive by email.`); setCart([]); }
        else if (data.status === 'expired') setCheckoutMessage('Checkout cancelled. No order was placed.');
        else { setCheckoutMessage('Your payment is still being checked. You can safely return here to check again.'); if (++attempts < 8) timer = setTimeout(check, 3000); }
      } catch { if (active) setCheckoutMessage('We couldn’t check your payment yet. Please check again before starting another payment.'); }
    };
    void check();
    return () => { active = false; clearTimeout(timer); };
  }, [checkoutId, session?.user?.id, checkoutRetry]);
  const unsubscribeToken = new URLSearchParams(window.location.search).get('unsubscribe');
  const unsubscribe = async () => {
    setUnsubscribeMessage('Removing your alert…');
    try {
      const { data, error } = await shopSupabase.functions.invoke('proam-store-stock-notifications', { body: { action: 'unsubscribe', token: unsubscribeToken } });
      if (error || !data?.ok) throw error;
      setUnsubscribeMessage('You’re unsubscribed from this restock alert.');
    } catch { setUnsubscribeMessage('We couldn’t remove the alert. Please try again.'); }
  };
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  useEffect(() => {
    if (!shopSupabase) return undefined;
    let active = true;
    shopSupabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session); });
    const { data } = shopSupabase.auth.onAuthStateChange((_event, next) => { if (active) setSession(next); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const loadItems = useCallback(async () => {
    if (!shopSupabase) { setStatus('error'); return; }
    const { data, error } = await shopSupabase.from('proam_store').select('id,name,category,product_type,price,visible,colours,sizes,image_urls').eq('category', 'Apparel').eq('visible', true);
    if (error) { setStatus('error'); return; }
    setItems(data || []);
    setStatus('ready');
  }, []);

  useEffect(() => { document.title = 'ProAm Store | World Wide Steps'; void loadItems(); const refresh = () => { if (document.visibilityState === 'visible') void loadItems(); }; window.addEventListener('focus', refresh); return () => window.removeEventListener('focus', refresh); }, [loadItems]);

  useEffect(() => {
    if (!session?.user?.id || !shopSupabase) { setStockAlerts([]); return; }
    let active = true;
    shopSupabase.from('proam_store_stock_notifications').select('product_id,colour,size,status').eq('profile_id', session.user.id).in('status', ['waiting', 'processing']).then(({ data, error }) => {
      if (active && !error) setStockAlerts(data || []);
    });
    return () => { active = false; };
  }, [session?.user?.id]);

  const visibleProducts = PRODUCTS.filter(product => items.some(product.match));

  const alertSaved = (productId, colour, size) => setStockAlerts((current) => current.some((alert) => alert.product_id === productId && alert.colour === colour && alert.size === size) ? current : [...current, { product_id: productId, colour, size, status: 'waiting' }]);
  const alertRemoved = (productId, colour, size) => setStockAlerts((current) => current.filter((alert) => !(alert.product_id === productId && alert.colour === colour && alert.size === size)));

  return (
    <div className="proam-shop-page">
      <header className="proam-shop-header">
        <a className="proam-shop-brand" href="/" aria-label="World Wide Steps home"><img src="/snows-proam-logo.png" alt=""/><span><strong>WORLD WIDE STEPS</strong><small>POWERED BY SNOWS PROAM</small></span></a>
        <nav aria-label="Store navigation"><a href="/">Global community</a><a href="/schools">Schools</a><a className="active" href="/shop" aria-current="page">ProAm Store</a></nav>
        <div className="proam-header-actions"><button className="proam-header-account" type="button" onClick={() => setCartOpen(true)}>Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})</button><button className="proam-header-account" type="button" onClick={() => setAccountOpen(true)}>{session ? 'My account' : 'Sign in'}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg></button></div>
      </header>

      <main>
        {checkoutId && <section className="proam-unsubscribe"><h2>Your checkout</h2><p role="status">{session ? checkoutMessage : 'Sign in to check your payment and order.'}</p><button onClick={() => session ? setCheckoutRetry(n => n + 1) : setAccountOpen(true)}>{session ? 'Check payment status' : 'Sign in'}</button></section>}
        {unsubscribeToken && <section className="proam-unsubscribe"><h2>Manage your restock alert</h2><button type="button" onClick={unsubscribe}>Unsubscribe from this alert</button><p role="status">{unsubscribeMessage}</p></section>}
        <section className="proam-shop-hero" aria-labelledby="proam-shop-title">
          <div className="proam-hero-copy">
            <span className="proam-kicker">PROAM STORE / THE FIRST COLLECTION</span>
            <h1 id="proam-shop-title">Wear the<br/><span>movement.</span></h1>
            <p>For the training days. The rest days. And everyone moving the world forward.</p>
            <a className="proam-hero-cta" href="#collection">Explore the collection <span aria-hidden="true">↓</span></a>
            <ProAmMovement />

          </div>
          <div className="proam-hero-visual" aria-label="Snows ProAm apparel collection">
            <ProAmHeroBackdrop />

            <img className="proam-hero-shirt" src="/store/white-back-smooth.webp" alt="White Snows ProAm Dri-Fit T-shirt, back view with Where Athletes Belong logo" fetchPriority="high"/>
            <img className="proam-hero-hoodie" src="/store/hoodie-front.webp" alt="Black Snows ProAm hoodie with blue chest logo" fetchPriority="high"/>
            <span className="proam-hero-coordinates">WHERE ATHLETES BELONG.</span>
          </div>
        </section>

        <section className="proam-collection" id="collection" aria-labelledby="proam-collection-title">
          <div className="proam-section-heading"><div><span className="proam-kicker">THE COLLECTION</span><h2 id="proam-collection-title">Your everyday lineup.</h2></div><p>Three essentials. One community.</p></div>
          {status === 'loading' && <p className="proam-catalog-status" role="status">Loading the ProAm collection…</p>}
          {status === 'error' && <div className="proam-catalog-error" role="alert"><p>We couldn’t load current prices and availability.</p><button type="button" onClick={loadItems}>Try again</button></div>}
          {status === 'ready' && <>{visibleProducts.length > 0 && <ProAmClothesRail products={visibleProducts}/>}<div className="proam-products-grid">{visibleProducts.map((product) => <ProductCard key={product.key} product={product} item={items.find(product.match)} session={session} stockAlerts={stockAlerts} onAlertSaved={alertSaved} onAlertRemoved={alertRemoved} onSignIn={() => setAccountOpen(true)} onAddToCart={addToCart}/>)}</div></>}
          {status === 'ready' && !visibleProducts.length && <p className="proam-catalog-status" role="status">The collection is being updated. Please check back soon.</p>}
        </section>

        <ProAmCart open={cartOpen} onClose={closeCart} cart={cart} onChange={setCart} client={shopSupabase} session={session} onSignIn={() => setAccountOpen(true)} />
        <MemberAccount open={accountOpen} onClose={closeAccount} session={session} />
      </main>
      <WorldSiteFooter />
    </div>
  );
}
