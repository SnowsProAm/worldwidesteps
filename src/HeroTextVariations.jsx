import { Children, cloneElement, isValidElement, useEffect, useState } from 'react';
import './heroTextVariations.css';

const options = [
  { name: 'Clear', title: 'World Wide', slogan: <>Small steps.<br/>Worldwide impact.</> },
  { name: 'Modern', title: 'Worldwide', slogan: <>Every step counts.<br/>Together, they add up.</> },
  { name: 'Bold', title: 'World Wide', slogan: <>Small steps.<br/>Worldwide impact.</> },
  { name: 'Editorial', title: 'World Wide', slogan: <>One community.<br/>Every step.</> },
  { name: 'Friendly', title: 'World Wide', slogan: <>Moving together.<br/>Across the world.</> },
];
const initialView = () => Math.min(5, Math.max(1, Math.floor(Number(new URLSearchParams(location.search).get('view'))) || 5));

export default function HeroTextVariations({ children }) {
  const [view, setView] = useState(initialView);
  const option = options[view - 1];
  useEffect(() => {
    const restore = () => setView(initialView());
    addEventListener('popstate', restore);
    return () => removeEventListener('popstate', restore);
  }, []);
  const choose = next => {
    setView(next);
    const url = new URL(location.href);
    url.searchParams.set('view', next);
    history.pushState({}, '', url);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  };
  const copy = Children.map(children, child => {
    if (!isValidElement(child)) return child;
    if (child.props.className === 'hero-slogan') return cloneElement(child, {}, option.slogan);
    return child;
  });
  return <div className={`hero-text-preview hero-text-option-${view}`}>
    <div className="hero-text-copy">{copy}</div>
    <div className="hero-text-picker" aria-label="Compare left-hand text options">
      <p role="status">Text option {view} — {option.name}</p>
      <div>{options.map((item, index) => <button type="button" key={item.name} aria-label={`${index + 1}. ${item.name}`} aria-pressed={view === index + 1} onClick={() => choose(index + 1)}>{index + 1}</button>)}</div>
    </div>
  </div>;
}
