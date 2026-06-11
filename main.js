// PisoMaestro — main.js — v20260611
(function () {
  "use strict";

  /* ===== SAFE WRAPPER ===== */
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ===== NAV ===== */
  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");

    if (!nav || !toggle || !links) return;

    // Scrolled state
    const onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Close on link click
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ===== SMOOTH SCROLL ===== */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navH = 80;
      var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navH,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ===== REVEAL ===== */
  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -3% 0px" });

    els.forEach(function (el, i) {
      // Stagger sibling cards
      var parent = el.closest(".services-grid, .testimonials-grid, .stats-grid, .features-grid, .gallery-grid");
      if (parent) {
        var siblings = Array.from(parent.children);
        var idx = siblings.indexOf(el);
        if (idx > -1) el.style.transitionDelay = (idx * 80) + "ms";
      }
      io.observe(el);
    });

    // 6s safety net
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight + 200) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ===== CALCULATOR ===== */
  function initCalculator() {
    var input = document.getElementById("metros");
    var slider = document.getElementById("slider");
    var result = document.getElementById("resultado");
    var waBtn = document.getElementById("calcWaBtn");

    if (!input || !slider || !result) return;

    var PRICE = 4000;

    function fmt(n) {
      return "$" + Math.round(n).toLocaleString("es-CL");
    }

    function update(m) {
      var v = Math.max(1, Math.min(1000, parseInt(m) || 0));
      result.textContent = fmt(v * PRICE);

      // Slider gradient
      var pct = ((v - 1) / 299) * 100;
      slider.style.background = "linear-gradient(to right, var(--accent) " + pct + "%, var(--bg-3) " + pct + "%)";

      // WhatsApp message
      var msg = encodeURIComponent(
        "Hola Eduardo, quiero cotizar la instalación de pisos flotantes para " + v + " m². El estimado sería " + fmt(v * PRICE) + " CLP. ¿Podemos coordinar una visita?"
      );
      if (waBtn) waBtn.href = "https://wa.me/56954237953?text=" + msg;
    }

    input.addEventListener("input", function () {
      slider.value = Math.min(300, this.value);
      update(this.value);
    });

    slider.addEventListener("input", function () {
      input.value = this.value;
      update(this.value);
    });

    update(input.value);
  }

  /* ===== COUNT-UP STATS ===== */
  function initCountUp() {
    var stats = document.querySelectorAll(".stat-num[data-target]");
    if (!stats.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target;
        var target = parseInt(el.getAttribute("data-target"));
        if (target === 0) { el.textContent = "0"; return; }
        var start = 0;
        var duration = 1400;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var prog = Math.min((ts - startTime) / duration, 1);
          // ease-out cubic
          var eased = 1 - Math.pow(1 - prog, 3);
          el.textContent = Math.round(eased * target);
          if (prog < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });

    stats.forEach(function (el) { io.observe(el); });
  }

  /* ===== GALLERY LIGHTBOX ===== */
  function initGallery() {
    var items = document.querySelectorAll(".gallery-item");
    var lb = document.getElementById("lightbox");
    var lbImg = document.getElementById("lbImg");
    var lbCap = document.getElementById("lbCaption");
    var lbClose = document.getElementById("lbClose");
    var lbPrev = document.getElementById("lbPrev");
    var lbNext = document.getElementById("lbNext");

    if (!items.length || !lb) return;

    var current = 0;
    var total = items.length;

    function show(idx) {
      current = (idx + total) % total;
      var item = items[current];
      var img = item.querySelector("img");
      var cap = item.querySelector("figcaption");
      if (lbImg) {
        lbImg.src = img ? img.src : "";
        lbImg.alt = img ? img.alt : "";
      }
      if (lbCap) lbCap.textContent = cap ? cap.textContent : "";
    }

    function open(idx) {
      show(idx);
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if (lbClose) lbClose.focus();
    }

    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    items.forEach(function (item, i) {
      item.addEventListener("click", function () { open(i); });
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    if (lbClose) lbClose.addEventListener("click", close);
    if (lbPrev) lbPrev.addEventListener("click", function () { show(current - 1); });
    if (lbNext) lbNext.addEventListener("click", function () { show(current + 1); });

    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ===== GALLERY HOVER EFFECT ===== */
  function initGalleryHover() {
    if (!matchMedia("(hover: hover)").matches) return;
    var items = document.querySelectorAll(".gallery-item");
    items.forEach(function (el) {
      el.addEventListener("mouseover", function (e) {
        if (!el.contains(e.relatedTarget)) {
          el.querySelector("img") && (el.querySelector("img").style.willChange = "transform");
        }
      });
      el.addEventListener("mouseout", function (e) {
        if (!el.contains(e.relatedTarget)) {
          el.querySelector("img") && (el.querySelector("img").style.willChange = "auto");
        }
      });
    });
  }

  /* ===== BOOT ===== */
  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initCalculator, "initCalculator");
    safe(initCountUp, "initCountUp");
    safe(initGallery, "initGallery");
    safe(initGalleryHover, "initGalleryHover");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
