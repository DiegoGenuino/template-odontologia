(() => {
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!window.gsap || !window.ScrollTrigger || !window.SplitText || reduceMotion) {
        document.documentElement.classList.remove("split-pending");
      }
      if (
        window.gsap &&
        window.ScrollTrigger &&
        !reduceMotion
      ) {
        gsap.registerPlugin(ScrollTrigger);
        if (window.SplitText) gsap.registerPlugin(SplitText);

        // Cada caractere entra nítido em sequência; SplitText recalcula as linhas no resize.
        const splitReveal = (selector, options = {}) => {
          if (!window.SplitText) return;
          document.querySelectorAll(selector).forEach((element) => {
            gsap.set(element, { visibility: "hidden" });
            SplitText.create(element, {
              type: "lines,words,chars",
              autoSplit: true,
              aria: "auto",
              linesClass: "split-line",
              wordsClass: "split-word",
              charsClass: "split-char",
              onSplit(self) {
                gsap.set(element, { visibility: "hidden" });
                const heading = /^H[1-6]$/.test(element.tagName);
                const animation = gsap.fromTo(
                  self.chars,
                  { yPercent: 35, autoAlpha: 0, filter: "blur(8px)" },
                  {
                    yPercent: 0,
                    autoAlpha: 1,
                    filter: "blur(0px)",
                    duration: options.duration ?? (heading ? 0.75 : 0.6),
                    delay: options.delay ?? 0,
                    stagger: {
                      each: options.stagger ?? (heading ? 0.022 : 0.009),
                      from: "start",
                    },
                    ease: "power3.out",
                    ...(options.hero
                      ? {}
                      : {
                          scrollTrigger: {
                            trigger: element,
                            start: "top 88%",
                            once: true,
                          },
                        }),
                  },
                );
                gsap.set(element, { visibility: "visible" });
                return animation;
              },
            });
          });
        };
        splitReveal(".hero-title", {
          hero: true,
          delay: 0.3,
          stagger: 0.03,
          duration: 0.8,
        });
        splitReveal(".hero-intro", { hero: true, delay: 0.85, stagger: 0.012 });
        splitReveal(
          ".section-head h2, .section-head p, .approach-line-text, .space-copy h2, .space-copy > p, .about-copy h2, .about-copy > p, .professional-heading h2, .professional-heading p, .professional-content h3, .professional-content > p, .gallery-heading h2, .gallery-heading p, .trust-top h2, .trust-top p, .faq-grid h2, .faq .intro, .location-copy h2, .location-copy > p, .contact-head h2, .contact-head p",
        );
        document.documentElement.classList.remove("split-pending");

        const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
        hero
          .from(".site-header", { y: -28, autoAlpha: 0, duration: 0.6 })
          .from(".hero-cta", { y: 25, autoAlpha: 0, duration: 0.6 }, "-=.45");

        const staggerCards = (
          groupSelector,
          cardSelector,
          each,
          start = "top 86%",
        ) => {
          const group = document.querySelector(groupSelector);
          if (!group) return;
          const cards = group.querySelectorAll(cardSelector);
          gsap.fromTo(
            cards,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.72,
              ease: "power2.out",
              stagger: { each, from: "start" },
              scrollTrigger: { trigger: group, start, once: true },
            },
          );
        };
        staggerCards(".service-grid", ".service-card", 0.16);
        staggerCards(".review-track", ".review-card", 0.2);
        staggerCards(".approach-grid", ".approach-item", 0.16);
        staggerCards(".questions", "details", 0.12);

        const reveal = (selector, options = {}) => {
          document.querySelectorAll(selector).forEach((element) => {
            gsap.from(element, {
              y: options.y ?? 36,
              autoAlpha: 0,
              duration: options.duration ?? 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 88%", once: true },
            });
          });
        };
        reveal(".space-image, .doctor-portrait, .professional-image, .location-map, .contact-photo", {
          y: 42,
          duration: 1,
        });
        reveal(
          ".space-list, .about-actions, .location-copy .cta-standard, .contact-form .field, .contact-form > button, .contact-form .form-note",
          { y: 25, duration: 0.65 },
        );
      }
})();
