// JGA Serviços de I.A — interações do site
// header dinâmico, menu com dropdown, scroll reveal, tilt nos cards e rede interativa no hero

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- progresso de scroll ---------- */
  var progressBar = document.getElementById('scroll-progress');
  var header = document.querySelector('header');

  function onScroll() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    if (header) header.classList.toggle('scrolled', scrollTop > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- menu mobile ---------- */
  var menuToggle = document.querySelector('.menu-toggle');
  var primaryNav = document.querySelector('.primary-nav');
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', function () {
      primaryNav.classList.toggle('open');
    });
  }

  var dropdownParent = document.querySelector('.has-dropdown');
  if (dropdownParent) {
    var dropdownTrigger = dropdownParent.querySelector('.nav-link');
    dropdownTrigger.addEventListener('click', function (e) {
      if (window.innerWidth <= 720) {
        e.preventDefault();
        dropdownParent.classList.toggle('open');
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- acordeão de oportunidades ---------- */
  document.querySelectorAll('.opp-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.opp');
      var expanded = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });

  /* ---------- tilt + glow nos cards de serviço ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.service-card, .example-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        var rx = ((y / rect.height) - 0.5) * -6;
        var ry = ((x / rect.width) - 0.5) * 6;
        card.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- rede interativa no hero ---------- */
  var canvas = document.getElementById('network-canvas');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var hero = canvas.closest('.hero');
    var nodes = [];
    var mouse = { x: null, y: null, active: false };
    var W, H, DPR;

    var NAVY = '20, 57, 94';
    var ACCENT = '242, 140, 40';

    function resize() {
      W = hero.offsetWidth;
      H = hero.offsetHeight;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      var count = Math.max(28, Math.min(70, Math.round((W * H) / 22000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1.6 + Math.random() * 1.6
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        if (mouse.active) {
          var dx = n.x - mouse.x, dy = n.y - mouse.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140 && d > 0.01) {
            var force = (140 - d) / 140 * 0.03;
            n.vx += (dx / d) * force;
            n.vy += (dy / d) * force;
          }
        }
        n.vx *= 0.995;
        n.vy *= 0.995;
        var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 0.6) { n.vx = (n.vx / speed) * 0.6; n.vy = (n.vy / speed) * 0.6; }
      }

      // conexões entre nós próximos
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var A = nodes[a], B = nodes[b];
          var ddx = A.x - B.x, ddy = A.y - B.y;
          var dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < 130) {
            ctx.strokeStyle = 'rgba(' + ACCENT + ', ' + (0.16 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.stroke();
          }
        }
        // conexão com o cursor
        if (mouse.active) {
          var mdx = nodes[a].x - mouse.x, mdy = nodes[a].y - mouse.y;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 160) {
            ctx.strokeStyle = 'rgba(' + ACCENT + ', ' + (0.35 * (1 - mdist / 160)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fill();
      }

      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + ACCENT + ', 0.9)';
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    hero.addEventListener('mouseleave', function () { mouse.active = false; });

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(step);
  }
})();
