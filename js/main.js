/* Goran Petkovic Portfolio — Easter eggs */

/* --- Animated project cards (hover to show GIF or WebM) --- */
document.querySelectorAll("[data-animated-card]").forEach(card => {
  const media = card.querySelector(".card-media");
  const img = card.querySelector("img");
  if (!img) return;

  const staticSrc = card.getAttribute("data-static");
  const animatedSrc = card.getAttribute("data-animated");
  const isWebm = animatedSrc && animatedSrc.toLowerCase().endsWith(".webm");
  const video = card.querySelector(".card-video");

  card.addEventListener("mouseenter", () => {
    if (isWebm && video) {
      video.src = animatedSrc;
      video.style.display = "block";
      video.play().catch(() => {});
    } else {
      img.src = animatedSrc;
    }
  });

  card.addEventListener("mouseleave", () => {
    if (isWebm && video) {
      video.style.display = "none";
      video.pause();
      video.removeAttribute("src");
      video.load();
    } else {
      img.src = staticSrc;
    }
  });
});

/* --- Portrait coin flip --- */
(() => {
  const flipBtn = document.querySelector("[data-portrait-flip]");
  if (!flipBtn) return;

  const coin = flipBtn.querySelector(".portrait-coin");
  const backImg = coin.querySelector(".portrait-back");
  let flipping = false;
  let side = 0;

  const alternates = [
    "/assets/cat1.png",
    "/assets/cat2.png"
  ];

  // Mouse-following "Flip!" chip
  const chip = document.createElement("div");
  chip.className = "flip-cursor";
  chip.textContent = "Flip!";
  document.body.appendChild(chip);

  flipBtn.addEventListener("mouseenter", () => {
    chip.classList.add("visible");
  });

  flipBtn.addEventListener("mouseleave", () => {
    chip.classList.remove("visible");
  });

  flipBtn.addEventListener("mousemove", (e) => {
    chip.style.left = e.clientX + "px";
    chip.style.top = (e.clientY - 22) + "px";
  });

  flipBtn.addEventListener("click", () => {
    if (flipping) return;
    flipping = true;

    // Pick random alternate image when flipping to back side
    if (side === 0) {
      const randomAlt = alternates[Math.floor(Math.random() * alternates.length)];
      backImg.src = randomAlt;
    }

    const duration = 750;
    const totalSpin = 540;
    const arcHeight = 70;
    const startAngle = side * 180;
    const endAngle = startAngle + totalSpin;
    side = side === 0 ? 1 : 0;

    const start = performance.now();

    function tick(now) {
      let t = (now - start) / duration;
      if (t > 1) t = 1;

      // Two-phase ease: fast spin at start, dramatic slow-down for last turn
      // First 60% of time covers 80% of spin (fast), last 40% covers 20% (slow landing)
      let ease;
      if (t < 0.55) {
        // Fast phase — quadratic in
        const p = t / 0.55;
        ease = 0.75 * p * p;
      } else {
        // Slow dramatic landing — smooth out
        const p = (t - 0.55) / 0.45;
        ease = 0.75 + 0.25 * (1 - Math.pow(1 - p, 3));
      }

      // Rotation
      const angle = startAngle + totalSpin * ease;

      // Vertical arc: parabola peaking at t=0.4
      const peakT = 0.4;
      const arc = t < peakT
        ? -arcHeight * (t / peakT)
        : -arcHeight * (1 - ((t - peakT) / (1 - peakT)));

      // Small bounce at the end
      let bounceY = 0;
      if (t > 0.85) {
        const bt = (t - 0.85) / 0.15; // 0→1 in last 15%
        bounceY = Math.sin(bt * Math.PI) * 4; // tiny 4px bounce
      }

      coin.style.transform =
        `translateY(${(arc - bounceY).toFixed(1)}px) rotateY(${angle.toFixed(1)}deg)`;

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        // Snap to clean final angle
        coin.style.transform = `translateY(0) rotateY(${endAngle}deg)`;
        flipping = false;
      }
    }

    requestAnimationFrame(tick);
  });
})();

/* --- Turn off gravity --- */
(() => {
  const btn = document.querySelector("[data-gravity-toggle]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    btn.style.display = "none";
    document.body.classList.add("gravity-active");

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    setTimeout(showReset, 2400);

    requestAnimationFrame(() => requestAnimationFrame(() => run()));
  }, { once: true });

  /* ---------- reset overlay ---------- */

  function showReset() {
    const overlay = document.createElement("div");
    overlay.className = "gravity-reset";
    overlay.innerHTML = `
      <p class="gravity-reset-text">Ahh, I told you not to press that...<br>Do you want to <button class="gravity-reset-btn" type="button" onclick="location.reload()">rebuild everything</button>?</p>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("visible"));
  }

  /* ---------- helpers ---------- */

  function shrinkWrap(el) {
    // Temporarily let the element size to its content
    el.style.width = "fit-content";
    el.style.height = "auto";
    el.style.display = "inline-block";
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height, left: r.left, top: r.top };
  }

  function extractEl(el, opts) {
    const origRect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const isImg = el.tagName === "IMG";

    // Insert spacer before changing anything
    if (cs.position !== "fixed") {
      const ph = document.createElement("div");
      ph.setAttribute("aria-hidden", "true");
      ph.style.cssText = `width:${origRect.width}px;height:${origRect.height}px;visibility:hidden;pointer-events:none;flex-shrink:0;display:${cs.display === "inline" ? "inline-block" : cs.display};`;
      el.parentNode.insertBefore(ph, el);
    }

    // For non-image elements, shrink-wrap to content width
    let rect;
    if (!isImg && !opts.keepWidth) {
      rect = shrinkWrap(el);
    } else {
      rect = { w: origRect.width, h: origRect.height, left: origRect.left, top: origRect.top };
    }

    const z = 800 + Math.floor(Math.random() * 400);

    el.style.position = "fixed";
    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";
    el.style.width = rect.w + "px";
    el.style.height = rect.h + "px";
    el.style.margin = "0";
    el.style.zIndex = z;
    el.style.willChange = "transform";
    el.style.pointerEvents = "auto";
    el.style.transformOrigin = opts.origin || "center center";

    return {
      el,
      x: 0,
      y: 0,
      w: rect.w,
      h: rect.h,
      left0: rect.left,
      top0: rect.top,
      vx: opts.vx ?? (Math.random() - 0.5) * 400,
      vy: opts.vy ?? -(120 + Math.random() * 250),
      angle: 0,
      va: opts.va ?? (Math.random() - 0.5) * 6,
      hinge: opts.hinge || null
    };
  }

  /* ---------- main ---------- */

  function run() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const bodies = [];

    // -- Hero pieces (shrink-wrapped to content) --
    [".hero-top", ".portrait-flip", ".bio", ".links-row"].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > H + 50) return;
      bodies.push(extractEl(el, {}));
    });

    // -- Project cards: split label and image --
    document.querySelectorAll(".project-card").forEach(card => {
      const r = card.getBoundingClientRect();
      if (r.top > H + 100) return;

      const label = card.querySelector(".card-label");
      const img = card.querySelector("img");

      if (label) {
        label.style.display = "block";
        bodies.push(extractEl(label, {
          vx: (Math.random() - 0.5) * 500,
          vy: -(80 + Math.random() * 260),
          va: (Math.random() - 0.5) * 10
        }));
      }

      if (img) {
        img.style.borderRadius = "16px";
        img.style.border = "1px solid #eaeaea";
        bodies.push(extractEl(img, {
          vx: (Math.random() - 0.5) * 300,
          vy: -(60 + Math.random() * 200),
          va: (Math.random() - 0.5) * 5
        }));
      }
    });

    // -- Footer divider line (bookshelf hinge from right) --
    const footerRow = document.querySelector(".footer-row");
    if (footerRow) {
      const frRect = footerRow.getBoundingClientRect();
      const line = document.createElement("div");
      line.style.cssText = `position:fixed;left:${frRect.left}px;top:${frRect.top}px;width:${frRect.width}px;height:1px;background:#eaeaea;margin:0;z-index:1200;will-change:transform;transform-origin:right center;pointer-events:none;`;
      line.setAttribute("aria-hidden", "true");
      document.body.appendChild(line);
      footerRow.style.borderTop = "none";

      bodies.push({
        el: line, x: 0, y: 0,
        w: frRect.width, h: 1,
        left0: frRect.left, top0: frRect.top,
        vx: 0, vy: 0, angle: 0, va: 0,
        hinge: "right"
      });
    }

    // -- Footer copyright (extract individual children so they're small) --
    const footerEl = document.querySelector(".site-footer");
    if (footerEl) {
      footerEl.querySelectorAll("p, button").forEach(child => {
        const r = child.getBoundingClientRect();
        if (r.top > H + 50) return;
        // How close to the bottom? Bigger kick the lower it is.
        const distFromBottom = H - r.bottom;
        const upKick = -(350 + Math.max(0, 300 - distFromBottom * 2));
        bodies.push(extractEl(child, {
          vx: (Math.random() - 0.5) * 400,
          vy: upKick,
          va: (Math.random() - 0.5) * 8
        }));
      });
    }

    // -- Bottom nav pill (strongest upward kick) --
    const nav = document.querySelector(".bottom-nav");
    if (nav) {
      bodies.push(extractEl(nav, {
        keepWidth: true,
        vx: (Math.random() - 0.5) * 450,
        vy: -(550 + Math.random() * 350),
        va: (Math.random() - 0.5) * 10
      }));
    }

    if (bodies.length === 0) return;

    /* ---------- physics ---------- */

    const GRAVITY = 1500;
    const BOUNCE = 0.58;
    const GROUND_FRIC = 0.88;
    const AIR_FRIC = 0.9988;
    const ROT_DAMP = 0.92;
    const HINGE_GRAVITY = 280;
    const HINGE_DAMP = 0.97;
    const MIN_V = 0.2;

    let prev = null;

    function step(ts) {
      if (prev === null) { prev = ts; requestAnimationFrame(step); return; }
      const dt = Math.min((ts - prev) / 1000, 0.033);
      prev = ts;

      let alive = 0;

      for (const b of bodies) {

        /* Hinge body */
        if (b.hinge === "right") {
          if (b.angle > -90) {
            b.va -= HINGE_GRAVITY * dt;
            b.va *= HINGE_DAMP;
            b.angle += b.va * dt;
            if (b.angle <= -90) { b.angle = -90; b.va = 0; }
          }
          b.el.style.transform = `rotate(${b.angle.toFixed(2)}deg)`;
          if (b.angle > -90) alive++;
          continue;
        }

        /* Normal body */
        b.vy += GRAVITY * dt;

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.angle += b.va * dt;

        const sL = b.left0 + b.x;
        const sT = b.top0 + b.y;
        const sR = sL + b.w;
        const sB = sT + b.h;

        // Floor
        if (sB > H) {
          b.y = H - b.h - b.top0;
          // Only scatter on real impact, not when resting
          if (Math.abs(b.vy) > 15) {
            b.vy = -Math.abs(b.vy) * BOUNCE;
            b.vx += (Math.random() - 0.5) * 120;
            b.vx *= GROUND_FRIC;
            b.va += (Math.random() - 0.5) * 3;
            b.va *= ROT_DAMP;
          } else {
            b.vy = 0;
          }
        }

        // Ceiling
        if (sT < 0) {
          b.y = -b.top0;
          b.vy = Math.abs(b.vy) * BOUNCE;
        }

        // Left wall
        if (sL < 0) {
          b.x = -b.left0;
          if (Math.abs(b.vx) > 5) {
            b.vx = Math.abs(b.vx) * BOUNCE;
            b.va += (Math.random() - 0.5) * 2;
            b.va *= ROT_DAMP;
          } else {
            b.vx = 0;
          }
        }

        // Right wall
        if (sR > W) {
          b.x = W - b.w - b.left0;
          if (Math.abs(b.vx) > 5) {
            b.vx = -Math.abs(b.vx) * BOUNCE;
            b.va += (Math.random() - 0.5) * 2;
            b.va *= ROT_DAMP;
          } else {
            b.vx = 0;
          }
        }

        // Air drag
        b.vx *= AIR_FRIC;
        b.va *= 0.998;

        // Ground friction
        const onFloor = (b.top0 + b.y + b.h) >= H - 1;
        if (onFloor) {
          b.vx *= 0.92;
          if (Math.abs(b.vx) < MIN_V) b.vx = 0;
          if (Math.abs(b.va) < 0.03) b.va = 0;
        }

        b.el.style.transform = `translate3d(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px,0) rotate(${b.angle.toFixed(2)}deg)`;

        if (Math.abs(b.vx) > MIN_V || Math.abs(b.vy) > MIN_V || Math.abs(b.va) > 0.03) {
          alive++;
        }
      }

      if (alive > 0) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }
})();
