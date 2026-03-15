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
  // Clear scene elements
  document.querySelectorAll(
    '.latest-scene-overlay, .latest-scene-summary, .scene-product, .scene-product-scent, .latest-scene-cta'
  ).forEach((el) => {
    (el as HTMLElement).style.opacity = '';
    (el as HTMLElement).style.transform = '';
  });
  // Clear home hero elements
  document.querySelectorAll(
    '.home-hero-tag, .hw, .home-hero-subtitle, .home-hero-actions > *, .float-pill'
  ).forEach((el) => {
    (el as HTMLElement).style.opacity = '';
    (el as HTMLElement).style.transform = '';
  });
} else {
  const isMobile = window.innerWidth < 768;

  // ==============================================
  //  ENTRANCE ANIMATIONS (play on page load)
  // ==============================================

  // --- Hero Entrance (cinematic sequenced reveal) ---
  document.querySelectorAll('[data-animate="hero-entrance"]').forEach((hero) => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const isPinned = hero.classList.contains('hero--pinned');

    const accentLine = hero.querySelector('.hero-accent-line');
    const tagPhrases = hero.querySelectorAll('.hero-tag-phrase');
    const titleWords = hero.querySelectorAll('.hero-word');
    const subtitle = hero.querySelector('.hero-subtitle');
    const actions = hero.querySelectorAll('.hero-actions > *');
    const glow = hero.querySelector('.hero-glow');

    // 1. Accent line draws in
    if (accentLine) {
      tl.to(accentLine, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.0);
    }

    // 2. Tag phrases masked reveal
    if (tagPhrases.length) {
      tl.to(tagPhrases, { y: 0, duration: 0.5, stagger: 0.3, ease: 'power3.out' }, 0.2);
    }

    // 3. Title words masked reveal
    if (titleWords.length) {
      tl.to(titleWords, { y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.7);
    }

    // 4. Buttons
    if (actions.length) {
      tl.to(actions, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 1.1);
    }

    // 5. Subtitle: only reveal on entrance if NOT pinned (pinned heroes reveal subtitle via scroll)
    if (subtitle && !isPinned) {
      tl.to(subtitle, { opacity: 1, y: 0, duration: 0.7 }, 1.0);
    }

    // 6. Ambient hero glow
    if (glow) {
      tl.to(glow, { opacity: 0.05, duration: 1.0, ease: 'power2.out' }, 1.5);
      tl.add(() => {
        gsap.to(glow, { opacity: 0.07, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    }

    // ==============================================
    //  SCENE 1: Hero Compression
    //  Pin hero, compress title, reveal subtitle,
    //  expand glow, next section rises over
    // ==============================================
    if (!isMobile && isPinned) {
      const heroTitle = hero.querySelector('.hero-title') as HTMLElement;

      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: '+=100%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;

          // Title compresses: scales down and drifts up (0 - 0.6)
          if (heroTitle) {
            const titleP = Math.min(p / 0.6, 1);
            gsap.set(heroTitle, {
              scale: 1 - titleP * 0.15,
              y: titleP * -25,
            });
          }

          // Subtitle fades in (0.15 - 0.45), then fades out (0.6 - 1.0)
          if (subtitle) {
            const fadeIn = gsap.utils.clamp(0, 1, (p - 0.15) / 0.3);
            const fadeOut = p > 0.6 ? gsap.utils.clamp(0, 1, (p - 0.6) / 0.4) : 0;
            gsap.set(subtitle, {
              opacity: fadeIn * (1 - fadeOut),
              y: (1 - fadeIn) * 20,
            });
          }

          // Glow expands (0.1 - 0.5)
          if (glow) {
            const glowP = gsap.utils.clamp(0, 1, (p - 0.1) / 0.4);
            gsap.set(glow, {
              scale: 1 + glowP * 0.3,
              opacity: 0.05 + glowP * 0.04,
            });
          }

          // Full content fades and blurs out (0.55 - 1.0)
          const content = hero.querySelector('.hero-content') as HTMLElement;
          if (content) {
            if (p > 0.55) {
              const exitP = (p - 0.55) / 0.45;
              gsap.set(content, {
                opacity: 1 - exitP * 0.85,
                filter: `blur(${exitP * 4}px)`,
              });
            } else {
              gsap.set(content, { opacity: 1, filter: 'blur(0px)' });
            }
          }
        },
      });

      // Next section rises over hero with depth shadow
      const nextSection = hero.nextElementSibling;
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
              end: '+=100%',
              scrub: true,
            },
          }
        );
      }
    } else {
      // Mobile / non-pinned: simple parallax exit
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const content = hero.querySelector('.hero-content') as HTMLElement;
          if (content) {
            gsap.set(content, {
              y: self.progress * -50,
              opacity: 1 - self.progress * 0.3,
            });
          }
        },
      });
    }
  });

  // --- Home Hero Entrance (image-driven, playful) ---
  document.querySelectorAll('.home-hero').forEach((hero) => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const tag = hero.querySelector('.home-hero-tag');
    const titleWords = hero.querySelectorAll('.hw');
    const subtitle = hero.querySelector('.home-hero-subtitle');
    const actions = hero.querySelectorAll('.home-hero-actions > *');
    const pills = hero.querySelectorAll('.float-pill');
    const bgImage = hero.querySelector('.home-hero-image') as HTMLElement;

    // 1. Tag fades in
    if (tag) {
      tl.to(tag, { opacity: 1, y: 0, duration: 0.5 }, 0.2);
    }

    // 2. Title words masked reveal
    if (titleWords.length) {
      tl.to(titleWords, { y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.4);
    }

    // 3. Subtitle
    if (subtitle) {
      tl.to(subtitle, { opacity: 1, y: 0, duration: 0.7 }, 0.9);
    }

    // 4. CTAs
    if (actions.length) {
      tl.to(actions, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 1.1);
    }

    // 5. Floating product pills stagger in with playful ease
    if (pills.length) {
      tl.to(pills, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)',
      }, 1.0);
    }

    // --- Home Hero Scroll Scene ---
    // Pin hero, bg zooms subtly, content fades up, pills drift apart,
    // next section rises over
    if (!isMobile) {
      const content = hero.querySelector('.home-hero-content') as HTMLElement;
      const floats = hero.querySelector('.home-hero-floats') as HTMLElement;

      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: '+=80%',
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;

          // Background image zooms in subtly (parallax depth)
          if (bgImage) {
            gsap.set(bgImage, {
              scale: 1 + p * 0.08,
              y: p * -30,
            });
          }

          // Content fades and drifts up
          if (content) {
            const fadeP = gsap.utils.clamp(0, 1, p / 0.7);
            gsap.set(content, {
              opacity: 1 - fadeP * 0.9,
              y: fadeP * -40,
              filter: `blur(${fadeP * 3}px)`,
            });
          }

          // Floating pills spread outward and fade
          if (floats) {
            const pillP = gsap.utils.clamp(0, 1, p / 0.8);
            gsap.set(floats, {
              opacity: 1 - pillP,
            });
            pills.forEach((pill, i) => {
              // Each pill drifts in a slightly different direction
              const angle = (i / pills.length) * Math.PI * 0.6 - 0.3;
              const drift = pillP * 60;
              gsap.set(pill, {
                x: Math.cos(angle) * drift,
                y: Math.sin(angle) * drift - pillP * 20,
              });
            });
          }
        },
      });

      // Next section rises over hero with depth shadow
      const nextSection = hero.nextElementSibling;
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
      // Mobile: simple parallax exit
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const content = hero.querySelector('.home-hero-content') as HTMLElement;
          if (content) {
            gsap.set(content, {
              y: self.progress * -40,
              opacity: 1 - self.progress * 0.3,
            });
          }
        },
      });
    }
  });

  // --- Standard Reveal Animations ---

  // Fade Up
  document.querySelectorAll('[data-animate="fade-up"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Fade In
  document.querySelectorAll('[data-animate="fade-in"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Scale Up
  document.querySelectorAll('[data-animate="scale-up"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Stagger Children
  document.querySelectorAll('[data-animate="stagger-children"]').forEach((el) => {
    const delay = parseFloat(el.getAttribute('data-stagger') || '0.15');
    gsap.to(el.children, {
      opacity: 1, y: 0, duration: 0.7, stagger: delay, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
    });
  });

  // Stagger From Right
  document.querySelectorAll('[data-animate="stagger-from-right"]').forEach((el) => {
    const delay = parseFloat(el.getAttribute('data-stagger') || '0.1');
    gsap.to(el.children, {
      opacity: 1, x: 0, duration: 0.7, stagger: delay, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 60%', toggleActions: 'play none none none' },
    });
  });

  // Scrub Up
  document.querySelectorAll('[data-animate="scrub-up"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 55%', scrub: 1 },
    });
  });

  // Parallax Image
  if (!isMobile) {
    document.querySelectorAll('[data-animate="parallax-image"]').forEach((el) => {
      const img = el.querySelector('img');
      if (!img) return;
      gsap.set(img, { scale: 1.15 });
      gsap.to(img, {
        scale: 1.04, y: -20, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // BoxCard image parallax (subtle)
    document.querySelectorAll('.box-card-image[data-animate-parallax]').forEach((el) => {
      const img = el.querySelector('img');
      if (!img) return;
      gsap.to(img, {
        y: -18, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  // ==============================================
  //  CINEMATIC SCROLL SCENES (desktop only)
  // ==============================================

  if (!isMobile) {

    // ============================================
    //  SCENE 2: Latest Box Reveal
    //  Pin the stage. Image settles, overlay fades
    //  in, products appear one by one with scent
    //  notes, CTA materializes.
    // ============================================
    document.querySelectorAll('.latest-box-scene').forEach((scene) => {
      const stage = scene.querySelector('.latest-scene-stage');
      const image = scene.querySelector('.latest-scene-image img') as HTMLElement;
      const overlay = scene.querySelector('.latest-scene-overlay') as HTMLElement;
      const summary = scene.querySelector('.latest-scene-summary') as HTMLElement;
      const products = scene.querySelectorAll('.scene-product');
      const scents = scene.querySelectorAll('.scene-product-scent');
      const cta = scene.querySelector('.latest-scene-cta') as HTMLElement;

      if (!stage) return;

      const sceneTl = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: '+=150%',
          pin: stage,
          pinSpacing: true,
          scrub: 0.6,
        },
      });

      // Image settles from slight zoom (0 - 0.2)
      if (image) {
        gsap.set(image, { scale: 1.08 });
        sceneTl.to(image, { scale: 1, duration: 0.2, ease: 'none' }, 0);
        // Continuous subtle parallax drift throughout
        sceneTl.to(image, { y: -20, duration: 1, ease: 'none' }, 0);
      }

      // Overlay (title, date) fades in (0.1 - 0.3)
      if (overlay) {
        sceneTl.to(overlay, { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, 0.1);
      }

      // Summary appears (0.25 - 0.4)
      if (summary) {
        sceneTl.to(summary, { opacity: 1, y: 0, duration: 0.15, ease: 'none' }, 0.25);
      }

      // Products appear one by one (0.35 - 0.7)
      if (products.length) {
        const span = 0.35;
        const perProduct = span / products.length;
        products.forEach((product, i) => {
          sceneTl.to(product, {
            opacity: 1, y: 0, duration: perProduct, ease: 'none',
          }, 0.35 + i * perProduct);
        });
      }

      // Scent notes fade in with slight delay after products (0.5 - 0.75)
      if (scents.length) {
        const span = 0.25;
        const perScent = span / scents.length;
        scents.forEach((scent, i) => {
          sceneTl.to(scent, {
            opacity: 1, duration: perScent, ease: 'none',
          }, 0.5 + i * perScent);
        });
      }

      // CTA button materializes (0.75 - 0.85)
      if (cta) {
        sceneTl.to(cta, { opacity: 1, y: 0, duration: 0.1, ease: 'none' }, 0.75);
      }
    });

    // ============================================
    //  SCENE 3: Archive Gentle Entrance
    //  Cards rise calmly with subtle opacity shift.
    //  No heavy spotlight or 3D effects — readable.
    // ============================================
    document.querySelectorAll('.archive-section .box-card').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0.4, y: 30 },
        {
          opacity: 1, y: 0, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            end: 'top 65%',
            scrub: 1,
          },
        }
      );
    });

    // ============================================
    //  AMBIENT EFFECTS (all pages, desktop)
    //  Gentle depth cues, not constant motion
    // ============================================

    // Heading parallax drift (gentle)
    document.querySelectorAll('.section-heading h2, .year-heading, .box-section h3').forEach((el) => {
      gsap.to(el, {
        y: -15, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Image Ken Burns (subtle)
    document.querySelectorAll('.box-card-image img, .gallery-image img, .group-shot img').forEach((img) => {
      gsap.fromTo(img,
        { scale: 1.06 },
        {
          scale: 1.0, ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });

    // Floating Glow Orbs
    document.querySelectorAll('[data-glow]').forEach((section) => {
      const glowType = section.getAttribute('data-glow');
      const orb = document.createElement('div');
      orb.className = `glow-orb glow-orb--${glowType}`;
      section.appendChild(orb);
      gsap.to(orb, {
        y: -100, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Border Draw-In
    document.querySelectorAll('.divider, .box-nav').forEach((el) => {
      el.classList.add('border-draw-in');
      gsap.to(el, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 70%', scrub: true },
      });
    });

    // CTA border-top draw-in
    document.querySelectorAll('.cta-block').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.borderTopColor = 'transparent';
      const borderLine = document.createElement('div');
      borderLine.style.cssText =
        'position:absolute;top:0;left:0;right:0;height:1px;background:var(--color-border);transform-origin:left;transform:scaleX(0);';
      htmlEl.appendChild(borderLine);
      gsap.to(borderLine, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 70%', scrub: true },
      });
    });

    // CTA Glow Intensify
    document.querySelectorAll('.cta-block').forEach((el) => {
      gsap.fromTo(el,
        { '--cta-glow': 0 },
        {
          '--cta-glow': 0.06, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true },
        }
      );
    });
  }

  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}
