/* =========================================================
   Cha Khaben — Main script
   Handles: hero video, scroll-linked hero fade, scroll-driven
   frame animation, reveal-on-scroll, nav, custom cursor +
   playful biscuit easter egg (desktop pointer devices only).
   ========================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ===== Load hero video ===== */
  var video = document.getElementById('heroVideo');
  if (video) {
    video.addEventListener('error', function () {
      // Graceful fallback: hide video, keep poster/background color
      video.style.display = 'none';
    });
    // Autoplay can be blocked by the browser; that's fine, poster image covers it.
    video.play().catch(function () {});
  }

  /* ===== Position steam emitter relative to viewport ===== */
  var steamBox = document.getElementById('steamBox');
  function positionSteam() {
    if (!steamBox) return;
    steamBox.style.left = (window.innerWidth * 0.52) + 'px';
    steamBox.style.top = (window.innerHeight * 0.32) + 'px';
  }
  positionSteam();
  window.addEventListener('resize', positionSteam);

  /* ===== DOM references ===== */
  var smokeLabel = document.getElementById('smokeLabel');
  var smokeHeading = document.getElementById('smokeHeading');
  var smokeBottom = document.getElementById('smokeBottom');
  var scrollHint = document.getElementById('scrollHint');
  var mainNav = document.getElementById('mainNav');
  var overlayWarm = document.getElementById('overlayWarm');
  var overlayTop = document.getElementById('overlayTop');
  var overlayLeft = document.getElementById('overlayLeft');
  var overlayBottom = document.getElementById('overlayBottom');

  /* ===== Frame animation setup ===== */
  var START_FRAME = 10;
  var END_FRAME = 160;
  var TOTAL_FRAMES = END_FRAME - START_FRAME;
  var frameSection = document.getElementById('frameSection');
  var frameSpacer = document.getElementById('frameSpacer');
  var frameImg = document.getElementById('frameImg');
  var frameProgressBar = document.getElementById('frameProgressBar');
  var frameOverlayLabel = document.getElementById('frameOverlayLabel');
  var frameTextOverlay = document.getElementById('frameTextOverlay');
  var frameTextTitle = document.getElementById('frameTextTitle');
  var frameTextSubtitle = document.getElementById('frameTextSubtitle');
  var philosophySection = document.getElementById('philosophySection');
  var hasAutoScrolled = false;
  var currentFrameIndex = START_FRAME;

  var SCROLL_PER_FRAME = Math.max(window.innerHeight * 0.05, 40);
  if (frameSpacer) {
    frameSpacer.style.height = (TOTAL_FRAMES * SCROLL_PER_FRAME) + 'px';
  }

  function padFrame(n) {
    return String(n).padStart(3, '0');
  }

  /* Preload frames in batches so the browser isn't hit with 150 requests at once */
  var preloadedFrames = [];
  function preloadBatch(start, end, delay) {
    setTimeout(function () {
      for (var i = start; i <= end; i++) {
        if (!preloadedFrames[i]) {
          var img = new Image();
          img.src = 'frame/ezgif-frame-' + padFrame(i) + '.jpg';
          preloadedFrames[i] = img;
        }
      }
    }, delay);
  }
  preloadBatch(10, 30, 0);
  preloadBatch(31, 70, 400);
  preloadBatch(71, 130, 900);
  preloadBatch(131, 160, 1400);

  /* ===== Smoke-vanish helper for hero text ===== */
  function applySmoke(el, staggerOffset, progress, preserveHeading) {
    if (!el) return;
    var adjusted = Math.max(0, Math.min(1, (progress - staggerOffset) / (1 - staggerOffset)));
    var e = 1 - Math.pow(1 - adjusted, 2.5);

    if (e === 0) {
      el.style.filter = '';
      el.style.opacity = '';
      el.style.transform = '';
      var btns0 = el.querySelectorAll('button');
      for (var b0 = 0; b0 < btns0.length; b0++) btns0[b0].style.pointerEvents = 'auto';
      return;
    }

    var blur = e * 28;
    var opacity = 1 - e;
    var brightness = 1 + e * 0.7;
    var contrast = 1 - e * 0.4;
    var saturate = 1 - e * 0.6;
    var scale = 1 + e * 0.04;
    var y = e * -50;
    var skewX = e * 1.5;

    el.style.filter = 'blur(' + blur + 'px) brightness(' + brightness + ') contrast(' + contrast + ') saturate(' + saturate + ')';
    el.style.opacity = opacity;

    el.style.transform = preserveHeading
      ? 'translateY(calc(-50% + ' + y + 'px)) scale(' + scale + ') skewX(' + skewX + 'deg)'
      : 'translateY(' + y + 'px) scale(' + scale + ') skewX(' + skewX + 'deg)';

    var btns = el.querySelectorAll('button');
    for (var b = 0; b < btns.length; b++) {
      btns[b].style.pointerEvents = e > 0.5 ? 'none' : 'auto';
    }
  }

  /* ===== Frame animation update ===== */
  function updateFrameAnimation() {
    if (!frameSection || !frameImg) return;
    var sectionRect = frameSection.getBoundingClientRect();
    var spacerHeight = TOTAL_FRAMES * SCROLL_PER_FRAME;

    var progress = -sectionRect.top / spacerHeight;
    progress = Math.max(0, Math.min(1, progress));

    var frameIndex = START_FRAME + Math.min(TOTAL_FRAMES, Math.floor(progress * (TOTAL_FRAMES + 1)));

    if (frameIndex !== currentFrameIndex) {
      currentFrameIndex = frameIndex;
      frameImg.src = 'frame/ezgif-frame-' + padFrame(frameIndex) + '.jpg';
      updateFrameText(frameIndex);
    }

    if (frameProgressBar) frameProgressBar.style.width = (progress * 100) + '%';

    var imgScale = 1.06 - progress * 0.06;
    frameImg.style.transform = 'scale(' + imgScale + ')';

    var isVisible = progress > 0.01 && progress < 0.99;
    if (frameOverlayLabel) frameOverlayLabel.classList.toggle('visible', isVisible);
    if (frameTextOverlay) frameTextOverlay.style.opacity = isVisible ? '1' : '0';

    if (frameIndex >= END_FRAME && !hasAutoScrolled && philosophySection) {
      hasAutoScrolled = true;
      setTimeout(function () {
        philosophySection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }, 350);
    }

    if (frameIndex < END_FRAME - 2) {
      hasAutoScrolled = false;
    }
  }

  /* ===== Main scroll update ===== */
  function updateScrollAnimations() {
    var scrollY = window.scrollY;
    var vh = window.innerHeight;
    var progress = Math.min(1, Math.max(0, scrollY / vh));
    var eased = 1 - Math.pow(1 - progress, 2.5);

    if (video) {
      video.style.transform = 'translateY(' + (-scrollY * 0.35) + 'px) scale(' + (1 + progress * 0.08) + ')';
      video.style.filter = 'brightness(' + (1 - eased * 0.4) + ') saturate(' + (1 - eased * 0.3) + ')';
    }

    if (overlayWarm) overlayWarm.style.opacity = 1 - eased;
    if (overlayTop) overlayTop.style.opacity = 1 - eased;
    if (overlayLeft) overlayLeft.style.opacity = 1 - eased;
    if (overlayBottom) overlayBottom.style.opacity = 1 - eased;
    if (steamBox) steamBox.style.opacity = 1 - eased;

    if (scrollHint) {
      var hintProgress = Math.min(1, scrollY / (vh * 0.25));
      scrollHint.style.opacity = 1 - hintProgress;
      scrollHint.style.transform = 'translateX(-50%) translateY(' + (-hintProgress * 20) + 'px)';
    }

    applySmoke(smokeLabel, 0, progress, false);
    applySmoke(smokeHeading, 0.04, progress, true);
    applySmoke(smokeBottom, 0.08, progress, false);

    if (mainNav) mainNav.classList.toggle('scrolled', scrollY > 30);

    updateFrameAnimation();
  }

  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateScrollAnimations();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  updateScrollAnimations();

  if (mainNav) {
    mainNav.addEventListener('animationend', function () {
      this.style.animation = 'none';
      this.style.transform = 'translateX(-50%) translateY(0)';
      this.style.opacity = '1';
    });
  }

  /* ===== Reveal on scroll ===== */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* ===== Navigation actions ===== */
  function scrollToEl(el) {
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  var brandHome = document.getElementById('brandHome');
  if (brandHome) {
    brandHome.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  var blendsSection = document.getElementById('blendsSection');
  var ctaExplore = document.getElementById('ctaExplore');
  if (ctaExplore) ctaExplore.addEventListener('click', function () { scrollToEl(blendsSection); });

  var navCollection = document.getElementById('navCollection');
  if (navCollection) navCollection.addEventListener('click', function () { scrollToEl(blendsSection); });

  var ctaWatch = document.getElementById('ctaWatch');
  if (ctaWatch) ctaWatch.addEventListener('click', function () { scrollToEl(frameSection); });

  var navStory = document.getElementById('navStory');
  if (navStory) navStory.addEventListener('click', function () { scrollToEl(frameSection); });

  /* ===== Frame text captions ===== */
  var frameTexts = [
    { start: 10, end: 39, title: 'The Pour Begins', subtitle: 'Warm water meets leaves — the first moment of transformation.' },
    { start: 39, end: 69, title: 'A Steady Flow', subtitle: 'Patience pours in. The aroma starts to unfold, leaf by leaf.' },
    { start: 69, end: 109, title: 'Steam Awakens', subtitle: 'Heat gives rise to vapor — the soul of tea begins to speak.' },
    { start: 109, end: 149, title: 'The Ritual Deepens', subtitle: 'Each pour is a meditation. Time slows. The world fades.' },
    { start: 149, end: 169, title: 'A Moment of Stillness', subtitle: 'The cup rests. The steam rises. Everything is exactly as it should be.' }
  ];
  var currentTextIndex = -1;

  function updateFrameText(frameIndex) {
    if (!frameTextTitle || !frameTextSubtitle) return;
    var newIndex = -1;
    for (var i = 0; i < frameTexts.length; i++) {
      if (frameIndex >= frameTexts[i].start && frameIndex <= frameTexts[i].end) {
        newIndex = i;
        break;
      }
    }
    if (newIndex === -1 && frameIndex < 10) newIndex = 0;
    if (newIndex === -1 && frameIndex > 169) newIndex = frameTexts.length - 1;

    if (newIndex !== currentTextIndex) {
      currentTextIndex = newIndex;
      frameTextTitle.classList.remove('visible');
      frameTextSubtitle.classList.remove('visible');
      setTimeout(function () {
        if (currentTextIndex >= 0 && currentTextIndex < frameTexts.length) {
          frameTextTitle.textContent = frameTexts[currentTextIndex].title;
          frameTextSubtitle.textContent = frameTexts[currentTextIndex].subtitle;
        }
        frameTextTitle.classList.add('visible');
        frameTextSubtitle.classList.add('visible');
      }, 300);
    }
  }

  /* ===== Recalculate frame spacer on resize ===== */
  window.addEventListener('resize', function () {
    SCROLL_PER_FRAME = Math.max(window.innerHeight * 0.05, 40);
    if (frameSpacer) frameSpacer.style.height = (TOTAL_FRAMES * SCROLL_PER_FRAME) + 'px';
  });

  /* =========================================================
     Decorative-only extras below: custom cursor, cursor
     smoke trail, and the "click biscuit" easter egg.
     These never block copy/paste/right-click/devtools —
     that kind of blocking breaks accessibility and doesn't
     actually protect content, so it's intentionally left out.
     Skipped entirely for touch devices and reduced-motion users.
     ========================================================= */
  if (isFinePointer) {
    document.body.classList.add('use-custom-cursor');
    initCustomCursor();
    initClickBiscuit();
  }

  function initCustomCursor() {
    var cursorEl = document.createElement('div');
    cursorEl.className = 'custom-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursorEl);

    var dotEl = document.createElement('div');
    dotEl.className = 'custom-cursor-dot';
    dotEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dotEl);

    var mouseX = -100, mouseY = -100;
    var cursorX = -100, cursorY = -100;
    var dotX = -100, dotY = -100;
    var lastSmokeTime = 0;
    var smokeInterval = 40;
    var isMouseOnPage = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      var now = Date.now();
      if (now - lastSmokeTime > smokeInterval) {
        lastSmokeTime = now;
        spawnSmoke(mouseX, mouseY);
      }
    });

    document.addEventListener('mouseenter', function () {
      cursorEl.style.opacity = '1';
      dotEl.style.opacity = '1';
      isMouseOnPage = true;
    });

    document.addEventListener('mouseleave', function () {
      cursorEl.style.opacity = '0';
      dotEl.style.opacity = '0';
      isMouseOnPage = false;
    });

    setInterval(function () {
      if (!isMouseOnPage) return;
      var now = Date.now();
      if (now - lastSmokeTime > smokeInterval) {
        lastSmokeTime = now;
        spawnSmoke(mouseX, mouseY);
      }
    }, smokeInterval);

    var hoverables = document.querySelectorAll('button, a, .nav-btn, .cta-btn, .cta-secondary, .blend-link, .blend-card, #brandHome');
    hoverables.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorEl.classList.add('hovering'); });
      el.addEventListener('mouseleave', function () { cursorEl.classList.remove('hovering'); });
    });

    function spawnSmoke(x, y) {
      var p = document.createElement('div');
      p.className = 'smoke-trail';
      p.setAttribute('aria-hidden', 'true');
      var size = 10 + Math.random() * 10;
      var dx = (Math.random() - 0.5) * 50;
      var dy = -(15 + Math.random() * 45);
      var dur = 1.2 + Math.random() * 1;
      var endScale = 2.5 + Math.random() * 2;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (x - size / 2) + 'px';
      p.style.top = (y - size / 2) + 'px';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.setProperty('--dur', dur + 's');
      p.style.setProperty('--delay', '0s');
      p.style.setProperty('--end-scale', endScale);
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, dur * 1000 + 100);
    }

    (function animate() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      cursorEl.style.left = cursorX + 'px';
      cursorEl.style.top = cursorY + 'px';
      dotEl.style.left = dotX + 'px';
      dotEl.style.top = dotY + 'px';
      requestAnimationFrame(animate);
    })();
  }

  function initClickBiscuit() {
    var gridPositions = [
      '0% 0%', '50% 0%', '100% 0%',
      '0% 50%', '50% 50%', '100% 50%',
      '0% 100%', '50% 100%', '100% 100%'
    ];

    function spawnBiscuit(e) {
      if (e.target.closest('button') || e.target.closest('a')) return;
      var b = document.createElement('div');
      b.className = 'click-biscuit';
      b.setAttribute('aria-hidden', 'true');
      var randomPos = gridPositions[Math.floor(Math.random() * 9)];
      var stay = 1 + Math.random() * 2;
      b.style.left = e.clientX + 'px';
      b.style.top = e.clientY + 'px';
      b.style.backgroundPosition = randomPos;
      b.style.setProperty('--stay', stay + 's');
      b.addEventListener('click', function (ev) { ev.stopPropagation(); breakBiscuit(b); });
      document.body.appendChild(b);
      setTimeout(function () { if (b.parentNode) b.remove(); }, stay * 1000 + 100);
    }

    function getEdgeIndex(p) {
      var x = p[0], y = p[1], eps = 1;
      if (y < eps && x >= eps && x <= 100 - eps) return 0;
      if (x > 100 - eps && y >= eps && y <= 100 - eps) return 1;
      if (y > 100 - eps && x >= eps && x <= 100 - eps) return 2;
      if (x < eps && y >= eps && y <= 100 - eps) return 3;
      if (y < 50 && x < 50) return 0;
      if (y < 50 && x >= 50) return 1;
      if (y >= 50 && x >= 50) return 2;
      return 3;
    }

    function rayToEdge(ox, oy, dx, dy) {
      var tMin = Infinity, eps = 0.001;
      if (Math.abs(dx) > eps) {
        var t = -ox / dx;
        if (t > eps) { var y2 = oy + dy * t; if (y2 >= -eps && y2 <= 100 + eps && t < tMin) tMin = t; }
        t = (100 - ox) / dx;
        if (t > eps) { var y3 = oy + dy * t; if (y3 >= -eps && y3 <= 100 + eps && t < tMin) tMin = t; }
      }
      if (Math.abs(dy) > eps) {
        var t2 = -oy / dy;
        if (t2 > eps) { var x2 = ox + dx * t2; if (x2 >= -eps && x2 <= 100 + eps && t2 < tMin) tMin = t2; }
        t2 = (100 - oy) / dy;
        if (t2 > eps) { var x3 = ox + dx * t2; if (x3 >= -eps && x3 <= 100 + eps && t2 < tMin) tMin = t2; }
      }
      return [Math.max(0, Math.min(100, ox + dx * tMin)), Math.max(0, Math.min(100, oy + dy * tMin))];
    }

    function buildFragmentPolygons(p1, p2) {
      var corners = [[0, 0], [100, 0], [100, 100], [0, 100]];
      var e1 = getEdgeIndex(p1), e2 = getEdgeIndex(p2);
      var arc1 = [], arc2 = [], c;
      c = (e1 + 1) % 4;
      while (true) { arc1.push(corners[c]); if (c === e2) break; c = (c + 1) % 4; }
      c = (e2 + 1) % 4;
      while (true) { arc2.push(corners[c]); if (c === e1) break; c = (c + 1) % 4; }
      var polyA = [p1].concat(arc1, [p2]);
      var polyB = [p2].concat(arc2, [p1]);
      return [
        polyA.map(function (p) { return p[0].toFixed(1) + '% ' + p[1].toFixed(1) + '%'; }).join(', '),
        polyB.map(function (p) { return p[0].toFixed(1) + '% ' + p[1].toFixed(1) + '%'; }).join(', ')
      ];
    }

    function generateBreakClipPaths() {
      for (var attempt = 0; attempt < 10; attempt++) {
        var angle = (20 + Math.random() * 140) * Math.PI / 180;
        var cx = 35 + Math.random() * 30, cy = 35 + Math.random() * 30;
        var dx = Math.cos(angle), dy = Math.sin(angle);
        var p1 = rayToEdge(cx, cy, dx, dy);
        var p2 = rayToEdge(cx, cy, -dx, -dy);
        if (getEdgeIndex(p1) !== getEdgeIndex(p2)) {
          return { clips: buildFragmentPolygons(p1, p2), p1: p1, p2: p2, cx: cx, cy: cy };
        }
      }
      return { clips: ['0% 0%, 48% 0%, 42% 100%, 0% 100%', '48% 0%, 100% 0%, 100% 100%, 42% 100%'], p1: [48, 0], p2: [42, 100], cx: 50, cy: 50 };
    }

    function breakBiscuit(el) {
      var rect = el.getBoundingClientRect();
      var bgPos = el.style.backgroundPosition;
      el.remove();
      try { new Audio('Creack.MP3').play().catch(function () {}); } catch (e2) {}
      var data = generateBreakClipPaths();
      var clips = data.clips, p1 = data.p1, p2 = data.p2;
      var bcx = rect.left + rect.width * data.cx / 100;
      var bcy = rect.top + rect.height * data.cy / 100;

      var flash = document.createElement('div');
      flash.className = 'break-flash';
      flash.style.left = bcx + 'px'; flash.style.top = bcy + 'px';
      flash.style.width = '45px'; flash.style.height = '45px';
      document.body.appendChild(flash);
      setTimeout(function () { flash.remove(); }, 400);

      var nd = 4 + Math.floor(Math.random() * 5);
      for (var d = 0; d < nd; d++) {
        (function () {
          var dust = document.createElement('div');
          dust.className = 'break-dust';
          var ds = 14 + Math.random() * 28;
          dust.style.width = ds + 'px'; dust.style.height = ds + 'px';
          dust.style.left = bcx + 'px'; dust.style.top = bcy + 'px';
          dust.style.setProperty('--ddx', ((Math.random() - 0.5) * 90) + 'px');
          dust.style.setProperty('--ddy', ((Math.random() - 0.5) * 70) + 'px');
          dust.style.setProperty('--ddur', (0.45 + Math.random() * 0.4) + 's');
          dust.style.setProperty('--ddelay', (Math.random() * 0.06) + 's');
          dust.style.setProperty('--dscale', (1.5 + Math.random() * 2.5) + '');
          document.body.appendChild(dust);
          setTimeout(function () { dust.remove(); }, 1000);
        })();
      }

      clips.forEach(function (cp, i) {
        var piece = document.createElement('div');
        piece.className = 'break-fragment';
        piece.style.left = rect.left + 'px'; piece.style.top = rect.top + 'px';
        piece.style.backgroundPosition = bgPos;
        piece.style.clipPath = 'polygon(' + cp + ')';
        var side = (i === 0) ? -1 : 1;
        piece.style.setProperty('--fx', (side * (25 + Math.random() * 70)) + 'px');
        piece.style.setProperty('--fy', (60 + Math.random() * 200) + 'px');
        piece.style.setProperty('--frot', (side * (15 + Math.random() * 75)) + 'deg');
        piece.style.setProperty('--fscale', (0.45 + Math.random() * 0.35) + '');
        piece.style.setProperty('--fdur', (0.65 + Math.random() * 0.45) + 's');
        piece.style.setProperty('--fdelay', (i * 0.025 + Math.random() * 0.03) + 's');
        document.body.appendChild(piece);
        setTimeout(function () { piece.remove(); }, 1200);
      });

      var nc = 14 + Math.floor(Math.random() * 16);
      for (var c = 0; c < nc; c++) {
        (function () {
          var crumb = document.createElement('div');
          crumb.className = 'break-crumb';
          var cs = 1.5 + Math.random() * 5.5;
          var round = Math.random() > 0.35;
          crumb.style.width = cs + 'px';
          crumb.style.height = (round ? cs : cs * (0.4 + Math.random() * 0.9)) + 'px';
          crumb.style.borderRadius = round ? '50%' : (1 + Math.random() * 2) + 'px';
          var shade = 135 + Math.floor(Math.random() * 85);
          crumb.style.background = 'rgb(' + shade + ',' + (95 + Math.floor(Math.random() * 65)) + ',' + (55 + Math.floor(Math.random() * 45)) + ')';
          var t = Math.random();
          var sx = rect.left + rect.width * (p1[0] + (p2[0] - p1[0]) * t) / 100 + (Math.random() - 0.5) * rect.width * 0.35;
          var sy = rect.top + rect.height * (p1[1] + (p2[1] - p1[1]) * t) / 100 + (Math.random() - 0.5) * rect.height * 0.35;
          crumb.style.left = sx + 'px'; crumb.style.top = sy + 'px';
          crumb.style.setProperty('--cx', ((Math.random() - 0.5) * 280) + 'px');
          crumb.style.setProperty('--cy', (-(15 + Math.random() * 180)) + 'px');
          crumb.style.setProperty('--crot', ((Math.random() - 0.5) * 1080) + 'deg');
          crumb.style.setProperty('--cdur', (0.4 + Math.random() * 0.55) + 's');
          crumb.style.setProperty('--cdelay', (Math.random() * 0.12) + 's');
          document.body.appendChild(crumb);
          setTimeout(function () { crumb.remove(); }, 1200);
        })();
      }
    }

    document.addEventListener('click', spawnBiscuit);
  }
})();
