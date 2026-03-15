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

  // --- Hero Entrance (cinematic sequenced reveal) ---
  document.querySelectorAll('[data-animate="hero-entrance"]').forEach((hero) => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const accentLine = hero.querySelector('.hero-accent-line');
    const tagPhrases = hero.querySelectorAll('.hero-tag-phrase');
    const titleWords = hero.querySelectorAll('.hero-word');
    const subtitle = hero.querySelector('.hero-subtitle');
    const actions = hero.querySelectorAll('.hero-actions > *');
    const glow = hero.querySelector('.hero-glow');

    // 1. Accent line draws in (0.0s)
    if (accentLine) {
      tl.to(accentLine, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.0);
    }

    // 2. Tag phrases — masked reveal with stagger (0.2s)
    if (tagPhrases.length) {
      tl.to(tagPhrases, { y: 0, duration: 0.5, stagger: 0.3, ease: 'power3.out' }, 0.2);
    }

    // 3. Title words — masked reveal with stagger (0.7s)
    if (titleWords.length) {
      tl.to(titleWords, { y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.7);
    }

    // 4. Buttons — scale + fade (1.1s)
    if (actions.length) {
      tl.to(actions, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 1.1);
    }

    // 5. Subtitle if present
    if (subtitle) {
      tl.to(subtitle, { opacity: 1, y: 0, duration: 0.7 }, 1.0);
    }

    // 6. Ambient hero glow — fade in then pulse (1.5s)
    if (glow) {
      tl.to(glow, { opacity: 0.05, duration: 1.0, ease: 'power2.out' }, 1.5);
      tl.add(() => {
        gsap.to(glow, {
          opacity: 0.07,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      });
    }

    // 4a. Sticky Hero: pin hero, content fades/scales, next section rises over
    if (!isMobile && hero.classList.contains('hero--pinned')) {
      const nextSection = hero.nextElementSibling;

      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: '+=80%',
        pin: true,
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const content = hero.querySelector('.hero-content') as HTMLElement;
          if (content) {
            gsap.set(content, {
              y: progress * -60,
              scale: 1 - progress * 0.05,
              opacity: 1 - progress * 0.6,
              filter: `blur(${progress * 3}px)`,
            });
          }
        },
      });

      // Next section rises over with shadow
      if (nextSection) {
        gsap.set(nextSection, { position: 'relative', zIndex: 2 });
        gsap.fromTo(nextSection,
          { boxShadow: '0 -20px 60px rgba(0, 0, 0, 0)' },
          {
            boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.5)',
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: '+=80%',
              scrub: true,
            },
          }
        );
      }
    } else {
      // Mobile / minimal: simple parallax exit
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
    }
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

  // =============================================
  //  Phase 2 — Continuous Scroll-Linked Motion
  //  All effects desktop-only, scrub: true
  // =============================================

  if (!isMobile) {
    // --- 1. Heading Parallax Drift ---
    document.querySelectorAll('.section-heading h2, .year-heading, .box-section h3').forEach((el) => {
      gsap.to(el, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // --- 2. Card Viewport Spotlight ---
    document.querySelectorAll('.box-card').forEach((el) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
      tl.fromTo(el,
        { scale: 0.96, opacity: 0.7 },
        { scale: 1.0, opacity: 1.0, ease: 'none', duration: 0.5 }
      );
      tl.to(el,
        { scale: 0.98, opacity: 0.85, ease: 'none', duration: 0.5 }
      );
    });

    // --- 3. Continuous Image Ken Burns ---
    document.querySelectorAll('.box-card-image img, .gallery-image img, .group-shot img').forEach((img) => {
      gsap.fromTo(img,
        { scale: 1.08 },
        {
          scale: 1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });

    // --- 4. Floating Glow Orbs ---
    document.querySelectorAll('[data-glow]').forEach((section) => {
      const glowType = section.getAttribute('data-glow');
      const orb = document.createElement('div');
      orb.className = `glow-orb glow-orb--${glowType}`;
      section.appendChild(orb);

      gsap.to(orb, {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // --- 5. Section Crossfade Exit ---
    document.querySelectorAll('.section .container, .cta-block .cta-inner').forEach((el) => {
      const section = el.closest('.section, .cta-block');
      if (!section) return;
      // Skip hero section
      if (section.querySelector('[data-animate="hero-entrance"]')) return;

      gsap.to(el, {
        opacity: 0.6,
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // --- 6. Grid Horizontal Convergence ---
    document.querySelectorAll('.grid--2').forEach((grid) => {
      const children = Array.from(grid.children) as HTMLElement[];
      children.forEach((child, i) => {
        const fromX = i % 2 === 0 ? -15 : 15;
        gsap.fromTo(child,
          { x: fromX },
          {
            x: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: child,
              start: 'top bottom',
              end: 'center center',
              scrub: true,
            },
          }
        );
      });
    });

    // --- 7. Border Draw-In ---
    document.querySelectorAll('.divider, .box-nav').forEach((el) => {
      el.classList.add('border-draw-in');
      gsap.to(el, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          end: 'top 70%',
          scrub: true,
        },
      });
    });

    // CTA border-top draw-in
    document.querySelectorAll('.cta-block').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.borderTopColor = 'transparent';
      const borderLine = document.createElement('div');
      borderLine.style.cssText = 'position:absolute;top:0;left:0;right:0;height:1px;background:var(--color-border);transform-origin:left;transform:scaleX(0);';
      htmlEl.appendChild(borderLine);

      gsap.to(borderLine, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          end: 'top 70%',
          scrub: true,
        },
      });
    });

    // --- 8. CTA Glow Intensify ---
    document.querySelectorAll('.cta-block').forEach((el) => {
      gsap.fromTo(el,
        { '--cta-glow': 0 },
        {
          '--cta-glow': 0.06,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'center center',
            scrub: true,
          },
        }
      );
    });

    // --- 9. Split-Rate Parallax on Latest Box (4b) ---
    document.querySelectorAll('.latest-box').forEach((el) => {
      const imageContainer = el.querySelector('.latest-box-image') as HTMLElement;
      const infoPanel = el.querySelector('.latest-box-info') as HTMLElement;
      const pills = el.querySelectorAll('.product-pill');

      if (imageContainer) {
        gsap.to(imageContainer, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (infoPanel) {
        gsap.to(infoPanel, {
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (pills.length) {
        gsap.to(pills, {
          y: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    });

    // --- 10. Product Pill Scroll Reveal (4c) ---
    document.querySelectorAll('.latest-box-products').forEach((container) => {
      const pills = container.querySelectorAll('.product-pill--scroll-reveal');
      if (!pills.length) return;

      gsap.to(pills, {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          end: 'top 55%',
          scrub: 1,
        },
      });
    });

    // --- 11. Section Depth Transitions (4d) ---
    document.querySelectorAll('.section').forEach((section) => {
      // Skip hero sections
      if (section.querySelector('[data-animate="hero-entrance"]')) return;

      // Exit: blur as section scrolls up
      gsap.to(section, {
        filter: 'blur(2px)',
        opacity: 0.7,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Enter: slight scale-up
      gsap.fromTo(section,
        { scale: 0.98 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 60%',
            scrub: true,
          },
        }
      );
    });

    // --- 12. Enhanced Archive Card 3D Entrance (4e) ---
    document.querySelectorAll('.box-card').forEach((el) => {
      gsap.fromTo(el,
        { rotateX: 2, transformPerspective: 800 },
        {
          rotateX: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'top 60%',
            scrub: true,
          },
        }
      );
    });
  }

  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}
