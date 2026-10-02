(() => {
const menu = document.querySelector(".menu-button"),
        nav = document.querySelector(".menu-panel"),
        backdrop = document.querySelector(".menu-overlay"),
        navHub = document.querySelector(".nav-hub"),
        navFeature = document.querySelector(".nav-feature"),
        booking = document.querySelector(".site-header > .booking-link"),
        main = document.querySelector("main"),
        footer = document.querySelector(".site-footer");
      const menuBackground = [
        ...main.querySelectorAll(":scope > section:not(.hero)"),
        document.querySelector(".hero-copy"),
        document.querySelector(".site-header .brand"),
        booking,
        footer,
      ];
      const updateMenuCurrent = () => {
        const current = location.hash || nav.dataset.defaultCurrent || "#inicio";
        nav.querySelectorAll(".menu-links a").forEach((link) => {
          const selected = link.getAttribute("href") === current;
          link.classList.toggle("is-current", selected);
          if (selected) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      };
      const updateMenuViewport = () => {
        navHub.style.setProperty("--menu-viewport-height", `${Math.floor(window.visualViewport?.height || window.innerHeight)}px`);
      };
      let menuCloseTimer;
      const setMenuOpen = (open, restoreFocus = true) => {
        clearTimeout(menuCloseTimer);
        if (open) {
          updateMenuCurrent();
          if (!document.body.classList.contains("menu-closing")) {
            const header = navHub.getBoundingClientRect();
            navHub.style.setProperty("--menu-header-top", `${header.top}px`);
            navHub.style.setProperty("--menu-closed-width", `${header.width}px`);
          }
          updateMenuViewport();
          document.body.classList.remove("menu-closing");
          document.body.classList.add("menu-open");
        } else {
          document.body.classList.add("menu-closing");
          document.body.classList.remove("menu-open");
          menuCloseTimer = setTimeout(() => {
            document.body.classList.remove("menu-closing");
            navHub.style.removeProperty("--menu-header-top");
            navHub.style.removeProperty("--menu-closed-width");
            navHub.style.removeProperty("--menu-viewport-height");
          }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600);
        }
        backdrop.classList.toggle("is-open", open);
        if (open) nav.removeAttribute("inert");
        else nav.setAttribute("inert", "");
        nav.setAttribute("aria-hidden", String(!open));
        menuBackground.forEach((element) => { element.inert = open; });
        menu.setAttribute("aria-expanded", String(open));
        menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        if (open) menu.focus({ preventScroll: true });
        else if (restoreFocus) menu.focus({ preventScroll: true });
      };
      menu.addEventListener("click", () => setMenuOpen(!document.body.classList.contains("menu-open")));
      navFeature.addEventListener("click", () => { if (document.body.classList.contains("menu-open")) setMenuOpen(false, false); });
      window.addEventListener("resize", () => { if (document.body.classList.contains("menu-open")) updateMenuViewport(); });
      window.visualViewport?.addEventListener("resize", () => { if (document.body.classList.contains("menu-open")) updateMenuViewport(); });
      backdrop.addEventListener("click", () => setMenuOpen(false));
      nav.addEventListener("click", (event) => {
        if (event.target.closest("a[href^='#']")) setMenuOpen(false, false);
      });
      document.addEventListener("keydown", (event) => {
        if (!document.body.classList.contains("menu-open")) return;
        if (event.key === "Escape") {
          event.preventDefault();
          setMenuOpen(false);
        }
        if (event.key === "Tab") {
          const focusable = [menu, navFeature, ...nav.querySelectorAll("a,button")]
            .filter((element) => element.getClientRects().length);
          const current = focusable.indexOf(document.activeElement);
          event.preventDefault();
          focusable[(current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
        }
      });
})();
