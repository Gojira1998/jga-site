// Home da JGA: abre o vídeo do estilo, descrição dos serviços, fila "como funciona", entrada das seções e deriva leve da folha.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- vídeo de amostra: toque num quadro abre o estilo em movimento, com o botão de pedir no WhatsApp ----
  const dados = JSON.parse($("#estilos-dados").textContent);
  const dlg = $("#player"), vid = $("#player-video");
  function abrir(id) {
    const e = dados[id]; if (!e) return;
    dlg.dataset.o = e.o;
    $("#player-nome").textContent = e.nome;
    $("#player-desc").textContent = e.desc;
    $("#player-pedir").href = window.JGA_WA + encodeURIComponent(window.JGA_MSG.replace("{nome}", e.nome));
    vid.poster = e.poster || `assets/frames/${id}-2.jpg`;
    vid.src = `assets/portfolio/${id}.mp4`;
    dlg.showModal();
    vid.play().catch(() => { /* o navegador pode pedir o toque no play */ });
  }
  document.addEventListener("click", (ev) => { const b = ev.target.closest("[data-estilo]"); if (b) abrir(b.dataset.estilo); });
  dlg.addEventListener("close", () => { vid.pause(); vid.removeAttribute("src"); vid.load(); });
  dlg.addEventListener("click", (ev) => { if (ev.target === dlg) dlg.close(); });
  $("#player-fecha").addEventListener("click", () => dlg.close());

  // ---- serviços: a descrição aparece num lugar fixo ----
  const desc = $("#servicos-desc"), padrao = "Passe o mouse num serviço para ver o que ele faz.";
  desc.textContent = padrao;
  $$(".grupo a").forEach((a) => {
    a.addEventListener("mouseenter", () => { desc.textContent = a.dataset.desc; });
    a.addEventListener("focus", () => { desc.textContent = a.dataset.desc; });
    a.addEventListener("mouseleave", () => { desc.textContent = padrao; });
    a.addEventListener("blur", () => { desc.textContent = padrao; });
  });

  // ---- como funciona: fila que arrasta, botões e barra de progresso ----
  const fila = $("#momentos"), barra = $("#p-barra");
  const progresso = () => { const max = fila.scrollWidth - fila.clientWidth; barra.style.width = (12 + 88 * (max > 0 ? fila.scrollLeft / max : 1)) + "%"; };
  fila.addEventListener("scroll", progresso, { passive: true }); progresso();
  $("#p-volta").addEventListener("click", () => fila.scrollBy({ left: -fila.clientWidth * 0.7, behavior: reduz ? "auto" : "smooth" }));
  $("#p-avanca").addEventListener("click", () => fila.scrollBy({ left: fila.clientWidth * 0.7, behavior: reduz ? "auto" : "smooth" }));

  // ---- entrada das partes de cada seção (o conteúdo só fica escondido se este script estiver rodando) ----
  if (!reduz && "IntersectionObserver" in window) {
    const alvos = [];
    $$(".sec > .intro, .processo-topo, .grupo, .estilo, .momentos, .faq-texto, .sec-cta p, .cta-linha").forEach((el, i) => {
      el.classList.add("rv"); el.style.setProperty("--d", String(Math.min(el.matches(".grupo, .estilo") ? (i % 4) : 0, 3))); alvos.push(el);
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    alvos.forEach((el) => io.observe(el));
  }

  // vídeo da chamada final: só baixa quando chega perto, toca mudo em loop e para quando sai da tela
  const cv = $(".cta-video video");
  if (cv && !reduz && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!cv.src) cv.src = cv.dataset.src; cv.play().catch(() => {}); } else cv.pause();
    }, { threshold: 0.35 }).observe(cv);
  }

  // vídeo em loop da folha: parado para quem pediu menos movimento
  if (reduz) $$(".quadro video").forEach((v) => { v.pause(); v.removeAttribute("autoplay"); });

  // ---- folha da primeira tela: a cada 5 s todos os quadros passam pro próximo vídeo da lista ----
  // Cada quadro tem um ponto de partida (data-b) diferente, então vizinhos nunca mostram o mesmo vídeo ao mesmo tempo.
  const lista = JSON.parse($("#folha-dados").textContent);
  const quadros = $$(".folha .quadro[data-b]");
  let passo = 0;
  const quadroDe = (q, p) => {
    const l = lista[q.dataset.o], n = l.length, i = (+q.dataset.b + p) % n;
    return { v: l[i], k: (Math.floor(p / n) % 4) + 1 };
  };
  // troca o quadro só depois que a mídia nova já carregou: nunca aparece quadro preto no meio da troca
  const aplicar = (q, p) => {
    const { v, k } = quadroDe(q, p), m = $("img, video", q);
    const volta = () => q.classList.remove("troca");
    const poe = () => { q.dataset.estilo = v.id; q.setAttribute("aria-label", "Ver o vídeo " + v.nome); $(".faixa", q).textContent = v.nome; };
    if (m.tagName === "VIDEO") {
      const ok = () => { m.removeEventListener("loadeddata", ok); volta(); };
      m.addEventListener("loadeddata", ok);
      poe(); m.poster = `assets/frames/${v.id}-1.jpg`; m.src = `assets/portfolio/${v.id}.mp4`; m.play().catch(() => {});
      setTimeout(volta, 1500); // se o vídeo demorar, mostra o quadro de capa mesmo assim
    } else {
      const url = `assets/frames/${v.id}-${k}.jpg`, im = new Image();
      im.onload = im.onerror = () => { m.src = url; poe(); volta(); };
      im.src = url;
    }
  };
  if (!reduz && quadros.length) {
    // carrega os quadros parados antes da troca, pra não piscar
    const pre = () => Object.values(lista).flat().forEach((v) => [1, 2, 3, 4].forEach((k) => { new Image().src = `assets/frames/${v.id}-${k}.jpg`; }));
    setTimeout(pre, 1500);
    const folha = $(".folha");
    let visivel = true;
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0 }).observe(folha);
    setInterval(() => {
      if (!visivel || document.hidden) return;
      passo++;
      quadros.forEach((q) => {
        q.classList.add("troca");
        setTimeout(() => aplicar(q, passo), 280);
      });
    }, 5000);
  }

  // ---- folha da primeira tela: cada coluna anda um pouco diferente ao rolar ----
  if (!reduz) {
    const cols = $$(".coluna"), fator = [0.05, 0.1, 0.04, 0.12, 0.07, 0.09];
    let tick = false;
    const move = () => { tick = false; const y = Math.min(scrollY, innerHeight); cols.forEach((c, i) => { c.style.transform = `translateY(${(-y * fator[i]).toFixed(1)}px)`; }); };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(move); } }, { passive: true });
  }
})();
