(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const result = document.getElementById("form-result");
  const prepared = document.getElementById("prepared-message");
  const copy = document.getElementById("copy-message");
  const whatsapp = document.getElementById("whatsapp-link");
  const format = (template, values) =>
    template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const values = Object.fromEntries(
      ["name", "email", "phone", "subject", "message"].map((key) => [
        key,
        String(data.get(key) || "").trim(),
      ]),
    );
    values.phoneSuffix = values.phone
      ? format(form.dataset.phoneSuffix || "", values)
      : "";
    prepared.textContent = format(form.dataset.messageTemplate || "", values);
    result.hidden = false;

    const number = (form.dataset.whatsappNumber || "").replace(/\D/g, "");
    if (form.dataset.deliveryMode === "whatsapp" && number) {
      whatsapp.href = `https://wa.me/${number}?text=${encodeURIComponent(prepared.textContent)}`;
      whatsapp.hidden = false;
    } else {
      whatsapp.hidden = true;
    }
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(prepared.textContent);
      copy.textContent = form.dataset.copiedLabel || "Copiado!";
    } catch {
      copy.textContent = form.dataset.copyFailureLabel || "Selecione e copie o texto acima";
    }
  });
})();
