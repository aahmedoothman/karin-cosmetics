'use client';
import {useEffect, type RefObject} from 'react';

export function useEditorialMotion(root: RefObject<HTMLDivElement | null>, route: string) {
  useEffect(() => {
    const container = root.current;
    if (!container || !('IntersectionObserver' in window)) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const running = new Set<Animation>();
    const reduce = () => preference.matches || document.documentElement.dataset.motion === 'off';
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reduce()) continue;
        const order = Number((entry.target as HTMLElement).dataset.reveal || 0);
        const animation = entry.target.animate(
          [{opacity:.62, translate:'0 10px'}, {opacity:1, translate:'0 0'}],
          {duration:460, delay:Math.min(order % 4, 3)*40, easing:'cubic-bezier(.2,.75,.25,1)', fill:'backwards'},
        );
        running.add(animation);
        animation.finished.then(() => running.delete(animation), () => running.delete(animation));
      }
    }, {threshold:.12});
    container.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    const cancel = () => {if (reduce()) running.forEach(animation => animation.cancel());};
    preference.addEventListener('change', cancel);
    return () => {
      observer.disconnect();
      running.forEach(animation => animation.cancel());
      preference.removeEventListener('change', cancel);
    };
  }, [root, route]);
}
