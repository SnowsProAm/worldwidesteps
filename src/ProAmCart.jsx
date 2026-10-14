import React, { useEffect, useRef, useState } from 'react';
const money = cents => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export default function ProAmCart({ open, onClose, cart, onChange, client, session, onSignIn }) {
  const dialog = useRef(null);
  const requestId = useRef(null);
  const [countries, setCountries] = useState([]);
  const [address, setAddress] = useState({ name: '', line1: '', city: '', postal_code: '', country: 'Ireland' });
  const [discount, setDiscount] = useState('');
  const [quote, setQuote] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    else if (!open && dialog.current.open) dialog.current.close();
    if (!open) return;
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  useEffect(() => {
    if (!open || !client) return;
    let active = true;
    client.functions.invoke('proam-store-checkout', { body: { action: 'countries' } }).then(({ data, error }) => {
      if (active && !error) setCountries(data.countries || []);
    });
    return () => { active = false; };
  }, [open, client]);
  useEffect(() => {
    requestId.current = null; setQuote(null);
    if (!open || !session || !cart.length) return;
    let active = true;
    setLoadingQuote(true); setMessage('');
    const timer = setTimeout(async () => {
      try {
        const result = await client.functions.invoke('proam-store-checkout', { body: { action: 'quote', items: cart, address, discount_code: discount } });
        if (result.error) {
          let details; try { details = await result.error.context?.json(); } catch { /* Offline errors have no response. */ }
          throw new Error(details?.error || 'Couldn’t update your total. Check your connection and try again.');
        }
        if (active) setQuote(result.data);
      } catch (error) { if (active) setMessage(error.message); }
      finally { if (active) setLoadingQuote(false); }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [open, session?.user?.id, cart, address.country, discount, revision]);
  const checkout = async event => {
    event.preventDefault();
    if (!session) { onSignIn(); return; }
    if (!quote || busy) return;
    setBusy(true); setMessage('');
    requestId.current ||= crypto.randomUUID();
    try {
      const result = await client.functions.invoke('proam-store-checkout', { body: { action: 'create', checkout_id: requestId.current, items: cart, address, discount_code: discount, origin: window.location.origin } });
      if (result.error || !result.data?.checkout_url) {
        let details; try { details = await result.error?.context?.json(); } catch { /* Keep entered details on a connection failure. */ }
        throw new Error(details?.error || 'Checkout couldn’t open. Your details are saved here; please try again.');
      }
      window.location.assign(result.data.checkout_url);
    } catch (error) { setMessage(error.message); setBusy(false); }
  };
  const changeQuantity = (index, quantity) => onChange(cart.flatMap((item, i) => i === index ? quantity > 0 ? [{ ...item, quantity }] : [] : [item]));
  return <dialog ref={dialog} className="proam-account-dialog proam-cart-dialog" aria-labelledby="proam-bag-title" onCancel={onClose} onClose={onClose}>
    <button className="proam-dialog-close" onClick={onClose} aria-label="Close bag">×</button>
    <h2 id="proam-bag-title">Your bag</h2>
    {!cart.length ? <><p>Your bag is empty.</p><button className="proam-signin-button" onClick={onClose}>Explore the collection</button></> : <>
      <ul className="proam-bag-items">{cart.map((item, index) => <li key={`${item.product_id}-${item.colour}-${item.size}`}><img src={item.image} alt=""/><div><strong>{item.name}</strong><p>{item.colour} / {item.size}</p><label>Quantity<select value={item.quantity} onChange={e => changeQuantity(index, Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n}>{n}</option>)}</select></label><button className="proam-text-button" type="button" onClick={() => changeQuantity(index, 0)}>Remove</button></div></li>)}</ul>
      {!session ? <><p>Sign in with your ProAm account to continue.</p><button className="proam-signin-button" onClick={onSignIn}>Sign in to checkout</button></> : <form className="proam-checkout-form" onSubmit={checkout}>
        <h3>Delivery</h3>
        {[['name','Full name','name'],['line1','Address','street-address'],['city','City / town','address-level2'],['postal_code','Postcode / Eircode','postal-code']].map(([key,label,autocomplete]) => <label key={key} htmlFor={`delivery-${key}`}>{label}<input id={`delivery-${key}`} autoComplete={autocomplete} required maxLength={200} value={address[key]} onChange={e => setAddress(current => ({...current,[key]:e.target.value}))}/></label>)}
        <label htmlFor="delivery-country">Country<select id="delivery-country" autoComplete="country-name" required value={address.country} onChange={e => setAddress(current => ({...current,country:e.target.value}))}>{(countries.length ? countries : ['Ireland']).map(country => <option key={country}>{country}</option>)}</select></label>
        <details className="proam-fit-guide"><summary>Have a member discount code?</summary><label htmlFor="store-discount-code">Discount code<input id="store-discount-code" value={discount} onChange={e => setDiscount(e.target.value.toUpperCase())} maxLength={60} autoComplete="off"/></label></details>
        {loadingQuote && <p role="status">Updating your total…</p>}
        {quote && <dl className="proam-order-totals"><div><dt>Items</dt><dd>{money(quote.subtotal_cents)}</dd></div><div><dt>Delivery</dt><dd>{money(quote.delivery_cents)}</dd></div>{quote.discount_cents > 0 && <div><dt>Discount</dt><dd>−{money(quote.discount_cents)}</dd></div>}<div className="total"><dt>Total</dt><dd>{money(quote.total_cents)}</dd></div></dl>}
        {message && <p className="proam-checkout-error" role="alert">{message} <button type="button" className="proam-text-button" onClick={() => setRevision(n => n + 1)}>Refresh total</button></p>}
        <button className="proam-signin-button" type="submit" disabled={busy || loadingQuote || !quote}>{busy ? 'Opening secure checkout…' : 'Continue to Stripe'}</button>
        <p className="proam-checkout-note">Your order is confirmed after payment. <a href="https://snowsproam.com/privacy-policy" target="_blank" rel="noreferrer">Privacy</a> · <a href="mailto:support@snowsproam.com">Need help?</a></p>
      </form>}
    </>}
  </dialog>;
}
