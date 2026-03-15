import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Respect reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Clear all initial hidden states so everything is visible
  document.querySelectorAll('[data-animate]').forEach((el) => {
    (el as HTMLElement).style.opacity = '';
    (el as HTMLElement).style.transform = '';
    el.querySelectorAll('*').forEach((child) => {
      (child as HTMLElement).style.opacity = '';
      (child as HTMLElement).style.transform = '';
    });
  });
} else {
  const isMobile = window.innerWidth < 768;

  // --- Hero Entrance (above-the-fold timeline, not scroll-triggered) ---
  document.querySelectorAll('[data-animate="hero-entrance"]').forEach((hero) => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const tag = hero.querySelector('.hero-tag');
    const title = hero.querySelector('.hero-title');
    const subtitle = hero.querySelector('.hero-subtitle');
    const actions = hero.querySelectorAll('.hero-actions > *');

    if (tag) tl.to(tag, { opacity: 1, y: 0, duration: 0.8 }, 0.2);
    if (title) tl.to(title, { opacity: 1, y: 0, duration: 1.0 }, tag ? 0.35 : 0.2);
    if (subtitle) tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, tag ? 0.5 : 0.35);
    if (actions.length) {
      tl.to(actions, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, tag ? 0.6 : 0.45);
    }

    // Scroll exit: parallax + fade as user scrolls past hero
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const content = hero.querySelector('.hero-content') as HTMLElement;
        if (content) {
          gsap.set(content, {
            y: progress * -50,
            opacity: 1 - progress * 0.3,
          });
        }
      },
    });
  });

  // --- Fade Up ---
  document.querySelectorAll('[data-animate="fade-up"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- Fade In (opacity only) ---
  document.querySelectorAll('[data-animate="fade-in"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- Scale Up ---
  document.querySelectorAll('[data-animate="scale-up"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- Stagger Children ---
  document.querySelectorAll('[data-animate="stagger-children"]').forEach((el) => {
    const staggerDelay = parseFloat(el.getAttribute('data-stagger') || '0.15');
    const children = el.children;

    gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: staggerDelay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- Stagger From Right ---
  document.querySelectorAll('[data-animate="stagger-from-right"]').forEach((el) => {
    const staggerDelay = parseFloat(el.getAttribute('data-stagger') || '0.1');
    const children = el.children;

    gsap.to(children, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      stagger: staggerDelay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- Scrub Up (latest box card rises into place) ---
  document.querySelectorAll('[data-animate="scrub-up"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        end: 'top 55%',
        scrub: 1,
      },
    });
  });

  // --- Parallax Image ---
  if (!isMobile) {
    document.querySelectorAll('[data-animate="parallax-image"]').forEach((el) => {
      const img = el.querySelector('img');
      if (!img) return;

      gsap.set(img, { scale: 1.15 });

      gsap.to(img, {
        scale: 1.04,
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // BoxCard image parallax (subtle)
    document.querySelectorAll('.box-card-image[data-animate-parallax]').forEach((el) => {
      const img = el.querySelector('img');
      if (!img) return;

      gsap.to(img, {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}
