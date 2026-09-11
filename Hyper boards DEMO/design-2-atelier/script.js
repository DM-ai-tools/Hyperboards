/* Atelier: native-first interactions and progressively enhanced motion. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const menu = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-navigation]");
  const header = document.querySelector(".site-header");
  const closeMenu = (returnFocus = false) => {
    if (!menu || !nav) return;
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    if (returnFocus) menu.focus();
  };
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav?.classList.toggle("is-open", open);
  });
  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu?.getAttribute("aria-expanded") === "true"
    )
      closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (header && !header.contains(event.target)) closeMenu();
  });
  window
    .matchMedia("(min-width: 901px)")
    .addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  const updateHeader = () =>
    header?.classList.toggle("scrolled", window.scrollY > 15);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!motionQuery.matches && "IntersectionObserver" in window) {
    const reveals = [...document.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
      { threshold: 0.07 },
    );
    // Attach observers before enabling hidden initial states.
    reveals.forEach((node) => observer.observe(node));
    document.documentElement.classList.add("motion-ready");
    motionQuery.addEventListener("change", (event) => {
      if (event.matches) {
        document.documentElement.classList.remove("motion-ready");
        observer.disconnect();
      }
    });
  }

  const visual = document.querySelector("[data-depth]");
  if (visual && window.matchMedia("(pointer: fine)").matches) {
    let frame = 0;
    visual.addEventListener("pointermove", (event) => {
      if (motionQuery.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = visual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        visual.style.setProperty("--ry", `${x * 4}deg`);
        visual.style.setProperty("--rx", `${y * -3}deg`);
      });
    });
    visual.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      visual.style.setProperty("--ry", "0deg");
      visual.style.setProperty("--rx", "0deg");
    });
  }

  document.querySelectorAll("[data-sector-group]").forEach((group) => {
    const items = [...group.querySelectorAll("[data-sector-item]")];
    const section = group.closest(".sector-section");
    items.forEach((item) =>
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
        const title = item.querySelector("strong")?.textContent || "";
        const rationale = item.querySelector("p")?.textContent || "";
        const number = item.querySelector(".number")?.textContent || "";
        section.querySelector("[data-sector-title]").textContent = title;
        section.querySelector("[data-sector-copy]").textContent = rationale;
        section.querySelector("[data-sector-number]").textContent = number;
      }),
    );
  });

  const form = document.querySelector("[data-owner-form]");
  const formStatus = document.querySelector("[data-form-status]");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || form.dataset.sending === "true") return;
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    form.dataset.sending = "true";
    button.disabled = true;
    button.textContent = "Sending introduction…";
    formStatus.textContent = "Sending your private introduction…";
    formStatus.dataset.state = "loading";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      if (window.location.protocol === "file:") throw new Error("file-preview");
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams(new FormData(form)),
        signal: controller.signal,
      });
      const result = await response.json();
      if (response.ok && result.ok === true) {
        formStatus.textContent =
          result.message || "Your confidential introduction has been received.";
        formStatus.dataset.state = "success";
        form.reset();
      } else {
        formStatus.textContent =
          result.message ||
          "Your introduction could not be accepted. Please email hello@hyperboards.com.";
        formStatus.dataset.state = "error";
      }
    } catch (error) {
      formStatus.dataset.state = "error";
      formStatus.textContent =
        error.name === "AbortError"
          ? "We could not confirm delivery before the connection timed out. Please contact hello@hyperboards.com before resending."
          : "Online submission is unavailable here. Please email hello@hyperboards.com. Your entries have been kept.";
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.innerHTML = originalText;
      delete form.dataset.sending;
    }
  });
})();
