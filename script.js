/* =========================================================
   Southern Gourmet Bites - interactions
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- header, progress bar, back-to-top ---------- */
  const header = $("#header");
  const progress = $("#progress");
  const toTop = $("#toTop");

  const onScroll = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- mobile menu ---------- */
  const menuBtn = $("#menuBtn");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    navLinks.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  };
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("a", navLinks).forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- active nav link on scroll ---------- */
  const sections = $$("main section[id]");
  const links = $$(".nav-links a:not(.nav-cta)");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- reveal on scroll ---------- */
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- animated counters ---------- */
  const countObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || "";
        const dur = 1600;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* ---------- hero particles (floating cocoa dust / gold sparks) ---------- */
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const count = Math.min(70, Math.floor((W * H) / 22000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.35 + 0.1),
      a: Math.random() * 0.5 + 0.2,
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(217,185,95,${p.a})`;
      ctx.shadowColor = "rgba(217,185,95,.8)";
      ctx.shadowBlur = 8;
      ctx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  };
  window.addEventListener("resize", resize);
  resize();
  draw();

  /* ---------- testimonial slider ---------- */
  const slides = $$(".slide");
  const dotsWrap = $("#dots");
  let idx = 0, timer;

  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Go to review " + (i + 1));
    b.addEventListener("click", () => { go(i); restart(); });
    dotsWrap.appendChild(b);
  });
  const dots = $$("button", dotsWrap);

  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 5000); };
  $("#prev").addEventListener("click", () => { go(idx - 1); restart(); });
  $("#next").addEventListener("click", () => { go(idx + 1); restart(); });
  $("#slider").addEventListener("mouseenter", () => clearInterval(timer));
  $("#slider").addEventListener("mouseleave", restart);
  go(0);
  restart();

  /* ---------- forms ---------- */
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const contactForm = $("#contactForm");
  const formNote = $("#formNote");
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const { name, email, message } = contactForm.elements;
    let ok = true;
    [name, email, message].forEach((f) => f.classList.remove("invalid"));
    if (!name.value.trim()) { name.classList.add("invalid"); ok = false; }
    if (!emailOk(email.value.trim())) { email.classList.add("invalid"); ok = false; }
    if (!message.value.trim()) { message.classList.add("invalid"); ok = false; }

    formNote.classList.toggle("error", !ok);
    if (!ok) {
      formNote.textContent = "Please fill in all fields with valid details.";
      return;
    }
    // Demo only: connect to your backend / Formspree / EmailJS here.
    formNote.textContent = "Thank you, " + name.value.trim() + "! We'll get back to you shortly.";
    contactForm.reset();
  });

  const subForm = $("#subscribeForm");
  const subNote = $("#subNote");
  subForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#subEmail").value.trim();
    if (!emailOk(v)) {
      subNote.className = "form-note center error";
      subNote.textContent = "Please enter a valid email address.";
      return;
    }
    subNote.className = "form-note center";
    subNote.textContent = "You're subscribed. Welcome to the Southern Gourmet family!";
    subForm.reset();
  });

  /* ---------- footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
