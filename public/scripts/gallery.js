(() => {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll(".gallery-viewport").forEach((viewport) => {
    const track = viewport.querySelector(".gallery-track");
    const original = track?.querySelector(".gallery-set");
    if (!track || !original || !original.children.length) return;

    const speed = Math.max(8, Math.min(160, Number(viewport.dataset.gallerySpeed) || 42));
    let animation;
    let distance = 0;
    let visible = true;
    let hovering = false;
    let dragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let frame = 0;

    const shouldPause = () =>
      motionPreference.matches || document.hidden || !visible || hovering || dragging ||
      viewport.contains(document.activeElement);

    const syncPlayback = () => {
      if (!animation) return;
      if (shouldPause()) animation.pause();
      else animation.play();
    };

    const rebuild = () => {
      frame = 0;
      animation?.cancel();
      animation = undefined;
      viewport.classList.remove("is-playing");
      track.querySelectorAll(".gallery-set[aria-hidden]").forEach((copy) => copy.remove());

      if (motionPreference.matches) return;

      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      distance = original.getBoundingClientRect().width + gap;
      if (!distance) return;

      // Há sempre conteúdo depois da borda visível, inclusive no instante da volta.
      while (track.scrollWidth < viewport.clientWidth + distance && track.children.length < 30) {
        const copy = original.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.inert = true;
        track.append(copy);
      }

      animation = track.animate(
        [{ transform: "translate3d(0, 0, 0)" }, { transform: `translate3d(-${distance}px, 0, 0)` }],
        { duration: (distance / speed) * 1000, iterations: Infinity, easing: "linear" },
      );
      viewport.scrollLeft = 0;
      viewport.classList.add("is-playing");
      syncPlayback();
    };

    const scheduleRebuild = () => {
      if (!frame) frame = requestAnimationFrame(rebuild);
    };

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(scheduleRebuild);
      resizeObserver.observe(viewport);
      resizeObserver.observe(original);
    } else {
      window.addEventListener("resize", scheduleRebuild, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      }, { rootMargin: "100px" });
      visibilityObserver.observe(viewport);
    }

    viewport.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") {
        hovering = true;
        syncPlayback();
      }
    });
    viewport.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") {
        hovering = false;
        syncPlayback();
      }
    });
    viewport.addEventListener("focusin", syncPlayback);
    viewport.addEventListener("focusout", () => requestAnimationFrame(syncPlayback));
    viewport.addEventListener("pointerdown", (event) => {
      if (!animation || motionPreference.matches) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartOffset = (((animation.currentTime || 0) / 1000) * speed) % distance;
      viewport.setPointerCapture(event.pointerId);
      syncPlayback();
    });
    viewport.addEventListener("pointermove", (event) => {
      if (!dragging || !animation) return;
      const offset = ((dragStartOffset - (event.clientX - dragStartX)) % distance + distance) % distance;
      animation.currentTime = (offset / speed) * 1000;
    });
    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (event.pointerType !== "mouse") viewport.blur();
      syncPlayback();
    };
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("keydown", (event) => {
      if (!animation || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const step = original.firstElementChild?.getBoundingClientRect().width || 180;
      const offset = ((((animation.currentTime || 0) / 1000) * speed) +
        (event.key === "ArrowRight" ? step : -step) + distance) % distance;
      animation.currentTime = (offset / speed) * 1000;
    });

    document.addEventListener("visibilitychange", syncPlayback);
    motionPreference.addEventListener("change", scheduleRebuild);
    scheduleRebuild();
  });
})();
