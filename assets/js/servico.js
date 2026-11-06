// Páginas de serviço: abre o vídeo da amostra no diálogo, toca o vídeo da chamada final só quando chega perto e entra com as seções.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- vídeo de amostra no diálogo, com o botão de pedir no WhatsApp ----
  const dados = JSON.parse($("#estilos-dados").textContent);
  const dlg = $("#player"), vid = $("#player-video");
  function abrir(id) {
    const e = dados[id]; if (!e) return;
    dlg.dataset.o = e.o;
    $("#player-nome").textContent = e.nome;
    $("#player-desc").textContent = e.desc;
    $("#player-pedir").href = window.JGA_WA + encodeURIComponent(window.JGA_MSG.replace("{nome}", e.nome));
    vid.poster = `../assets/frames/${id}-2.jpg`;
    vid.src = `../assets/portfolio/${id}.mp4`;
    dlg.showModal();
    vid.play().catch(() => { /* o navegador pode pedir o toque no play */ });
  }
  document.addEventListener("click", (ev) => { const b = ev.target.closest("[data-estilo]"); if (b) abrir(b.dataset.estilo); });
  dlg.addEventListener("close", () => { vid.pause(); vid.removeAttribute("src"); vid.load(); });
  dlg.addEventListener("click", (ev) => { if (ev.target === dlg) dlg.close(); });
  $("#player-fecha").addEventListener("click", () => dlg.close());

  // ---- vídeo da chamada final: só baixa quando chega perto; parado para quem pediu menos movimento ----
  const cv = $(".cta-video video");
  if (cv && !reduz && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!cv.src) cv.src = cv.dataset.src; cv.play().catch(() => {}); } else cv.pause();
    }, { threshold: 0.35 }).observe(cv);
  }

  // ---- entrada das seções (o conteúdo só fica escondido se este script estiver rodando) ----
  if (!reduz && "IntersectionObserver" in window) {
    const alvos = $$(".exemplos p, .s-texto > p, .beneficios li, .outros-lista details, .s-amostras .intro, .s-amostras .estilo, .folha-mini .mini, .sec-cta p, .cta-linha");
    alvos.forEach((el, i) => { el.classList.add("rv"); el.style.setProperty("--d", String(el.matches(".estilo, .mini, li, details") ? i % 4 : 0)); });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    alvos.forEach((el) => io.observe(el));
  }
})();
