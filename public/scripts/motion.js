(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || reducedMotion) {
    root.classList.remove("motion-pending");
    return;
  }

  // Whole blocks avoid thousands of character wrappers and forced layouts.
  const textSelector = [
    ".section-head h2", ".section-head p", ".approach-line-text",
    ".space-copy h2", ".space-copy > p", ".about-copy h2",
    ".about-copy > p", ".professional-heading h2",
    ".professional-heading p", ".professional-content h3",
    ".professional-content > p", ".gallery-heading h2",
    ".gallery-heading p", ".trust-top h2", ".trust-top p",
    ".faq-grid h2", ".faq .intro", ".location-copy h2",
    ".location-copy > p", ".contact-head h2", ".contact-head p",
  ].join(", ");
  const revealSelector = [
    textSelector,
    ".service-card", ".review-card", ".approach-item",
    ".questions details", ".space-image", ".doctor-portrait",
    ".professional-image", ".location-map", ".contact-photo",
    ".space-list", ".about-actions", ".location-copy .cta-standard",
    ".contact-form .field", ".contact-form > button",
    ".contact-form .form-note",
  ].join(", ");
  const items = [...document.querySelectorAll(revealSelector)];
  const heroText = document.querySelectorAll(".hero-title, .hero-intro");
  gsap.set(heroText, { autoAlpha: 0, y: 16 });
  gsap.set(items, { autoAlpha: 0, y: 18 });
  root.classList.remove("motion-pending");

  const show = (element) => {
    gsap.to(element, {
      autoAlpha: 1,
      y: 0,
      duration: 0.65,
      ease: "power2.out",
      clearProps: "transform,opacity,visibility",
    });
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        show(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach(show);
  }

  gsap.timeline({ defaults: { ease: "power2.out" } })
    .from(".site-header", { y: -16, autoAlpha: 0, duration: 0.42, clearProps: "transform,opacity,visibility" })
    .to(".hero-title", { y: 0, autoAlpha: 1, duration: 0.55 }, 0.08)
    .to(".hero-intro", { y: 0, autoAlpha: 1, duration: 0.5 }, 0.18)
    .from(".hero-cta", { y: 14, autoAlpha: 0, duration: 0.5 }, 0.24);
})();
