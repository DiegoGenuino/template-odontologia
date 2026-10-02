(() => {
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.querySelectorAll(".questions details").forEach((detail) => {
        const summary = detail.querySelector("summary");
        const answer = detail.querySelector(".faq-answer");
        let animating = false;
        summary.addEventListener("click", (event) => {
          if (!window.gsap || reduceMotion) return;
          event.preventDefault();
          if (animating) return;
          animating = true;
          if (detail.open) {
            gsap.to(answer, {
              height: 0,
              autoAlpha: 0,
              duration: 0.3,
              ease: "power2.inOut",
              onComplete: () => {
                detail.open = false;
                gsap.set(answer, { clearProps: "height,opacity,visibility,overflow" });
                animating = false;
              },
            });
          } else {
            detail.open = true;
            gsap.set(answer, { height: 0, autoAlpha: 0, overflow: "hidden" });
            gsap.to(answer, {
              height: "auto",
              autoAlpha: 1,
              duration: 0.42,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(answer, { clearProps: "height,opacity,visibility,overflow" });
                animating = false;
              },
            });
          }
        });
      });
})();
