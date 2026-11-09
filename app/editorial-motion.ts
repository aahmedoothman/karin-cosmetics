'use client';
import {useEffect, type RefObject} from 'react';

export function prefersStill() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off';
}

export function useEditorialMotion(root: RefObject<HTMLDivElement | null>, route: string) {
  useEffect(() => {
    const container = root.current;
    if (!container || !('IntersectionObserver' in window) || typeof Element.prototype.animate !== 'function') return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const running = new Set<Animation>();
    const touch = matchMedia('(pointer:coarse)').matches;
    const reduce = () => preference.matches || document.documentElement.dataset.motion === 'off';
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reduce() || document.hidden || (touch && entry.target.matches('.k-product-card'))) continue;
        const order = Number((entry.target as HTMLElement).dataset.reveal || 0);
        const animation = entry.target.animate(
          [{opacity:.84, translate:'0 6px'}, {opacity:1, translate:'0 0'}],
          {duration:touch?200:340, delay:touch?0:Math.min(order % 4, 3)*30, easing:'cubic-bezier(.2,.75,.25,1)'},
        );
        running.add(animation);
        animation.finished.then(() => running.delete(animation), () => running.delete(animation));
      }
    }, {threshold:.12});
    container.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    const cancel = () => {if (reduce() || document.hidden) running.forEach(animation => animation.cancel());};
    const motionPreference = new MutationObserver(cancel);
    motionPreference.observe(document.documentElement, {attributes:true, attributeFilter:['data-motion']});
    preference.addEventListener('change', cancel);
    document.addEventListener('visibilitychange', cancel);
    return () => {
      observer.disconnect();
      motionPreference.disconnect();
      running.forEach(animation => animation.cancel());
      preference.removeEventListener('change', cancel);
      document.removeEventListener('visibilitychange', cancel);
    };
  }, [root, route]);
}
