import React, { useEffect, useId, useState } from 'react';

export default function ProAmReviews({ client, productId, session, onSignIn }) {
  const instance = useId();
  const [reviews, setReviews] = useState([]);
  const [eligible, setEligible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!client || !productId) return;
    let active = true;
    setState('loading'); setEligible(false);
    const load = async () => {
      try {
        const { data, error } = await client.from('proam_store_reviews').select('id,product_id,rating,review,created_at').eq('product_id', productId).order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        if (!active) return;
        setReviews(data || []); setState('ready');
        if (session) {
          const result = await client.functions.invoke('proam-store-checkout', { body: { action: 'review_state', product_id: productId } });
          if (!active) return;
          if (result.error) { setState('error'); return; }
          setEligible(result.data.eligible === true);
          if (result.data.own) { setRating(result.data.own.rating); setReview(result.data.own.review || ''); }
        }
      } catch { if (active) setState('error'); }
    };
    void load();
    return () => { active = false; };
  }, [client, productId, session?.user?.id, revision]);
  const save = async (event) => {
    event.preventDefault();
    if (!rating) { setMessage('Choose a star rating.'); return; }
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      const { data, error } = await client.functions.invoke('proam-store-checkout', { body: { action: 'submit_review', product_id: productId, rating, review } });
      if (error || !data?.ok) throw error;
      setMessage('Thank you — your verified review is published.'); setRevision(x => x + 1);
    } catch { setMessage('Your review wasn’t saved. Your text is still here; please try again.'); }
    finally { setBusy(false); }
  };
  const average = reviews.length ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1) : null;
  return <details className="proam-fit-guide proam-reviews">
    <summary>Reviews {average && <span className="proam-rating-summary">★ {average} ({reviews.length})</span>}</summary>
    {state === 'loading' && <p role="status">Loading reviews…</p>}
    {state === 'error' && <p role="alert">Reviews couldn’t load. <button className="proam-text-button" onClick={() => setRevision(x => x + 1)}>Try again</button></p>}
    {state === 'ready' && !reviews.length && <p>No reviews yet.</p>}
    {reviews.slice(0, 5).map(item => <div className="proam-review" key={item.id}><span className="proam-review-stars" aria-label={`${item.rating} out of 5 stars`}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span><span className="proam-verified">Verified purchase</span>{item.review && <p>{item.review}</p>}</div>)}
    {!session && <button className="proam-text-button" onClick={onSignIn}>Sign in to rate your purchase</button>}
    {session && state === 'ready' && !eligible && <p>Ratings are available after a verified purchase.</p>}
    {eligible && <form onSubmit={save} className="proam-review-form">
      <fieldset><legend>Your rating</legend><div className="proam-star-options">{[1,2,3,4,5].map(star => <label key={star}><input type="radio" name={`rating-${productId}-${instance}`} value={star} checked={rating === star} onChange={() => setRating(star)}/><span aria-hidden="true">{star <= rating ? '★' : '☆'}</span><span className="proam-sr-only">{star} {star === 1 ? 'star' : 'stars'}</span></label>)}</div></fieldset>
      <label htmlFor={`review-${productId}-${instance}`}>Your review <span>(optional)</span></label>
      <textarea id={`review-${productId}-${instance}`} value={review} onChange={event => setReview(event.target.value)} maxLength={1000} rows={3}/>
      <button className="proam-signin-button" disabled={busy}>{busy ? 'Saving…' : 'Save review'}</button>
    </form>}
    {message && <p role="status">{message}</p>}
  </details>;
}
