(() => {
document.getElementById("year").textContent = new Date().getFullYear();
      const addTextRoll = (control) => {
        const labelElement = control.querySelector(".booking-label");
        const textNodes = [...control.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
        const label = (labelElement
          ? labelElement.textContent
          : textNodes.map((node) => node.textContent).join(" "))
          .replace(/\s+/g, " ")
          .trim();
        if (!label) return;

        if (!control.hasAttribute("aria-label")) control.setAttribute("aria-label", label);
        const roll = document.createElement("span");
        roll.className = "roll-label";
        roll.setAttribute("aria-hidden", "true");
        const current = document.createElement("span");
        current.className = "roll-face roll-face--current";
        current.textContent = label;
        const next = document.createElement("span");
        next.className = "roll-face roll-face--next";
        next.textContent = label;
        roll.append(current, next);

        if (labelElement) {
          labelElement.replaceChildren(roll);
        } else {
          textNodes.forEach((node) => node.remove());
          control.insertBefore(roll, control.querySelector(".cta-arrow"));
        }
      };
      const addArrowRoll = (arrow) => {
        const svg = arrow.querySelector("svg");
        if (!svg) return;
        const track = document.createElement("span");
        track.className = "roll-arrow-track";
        const current = document.createElement("span");
        current.className = "roll-arrow-face roll-arrow-face--current";
        const next = document.createElement("span");
        next.className = "roll-arrow-face roll-arrow-face--next";
        current.append(svg);
        next.append(svg.cloneNode(true));
        track.append(current, next);
        arrow.replaceChildren(track);
      };
      document.querySelectorAll(".cta-standard, .booking-link, .nav-feature").forEach(addTextRoll);
      document.querySelectorAll(".cta-arrow, .booking-arrow, .service-more").forEach(addArrowRoll);
      document.getElementById("menu-year").textContent = new Date().getFullYear();
})();
