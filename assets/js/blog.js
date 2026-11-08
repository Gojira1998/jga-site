/* Formulário de cadastro do blog: valida, grava o lead (Supabase REST, só INSERT) e libera o brinde. */
(function () {
  var form = document.getElementById("form-lead");
  var brinde = document.getElementById("brinde");
  var caixa = document.getElementById("liberar");
  if (!form || !brinde) return;
  var slug = form.getAttribute("data-slug") || "";
  var chave = "jga_lead_" + slug;
  var aberto = Date.now();

  function liberar() {
    brinde.hidden = false;
    if (caixa) caixa.hidden = true;
    brinde.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  var p = new URLSearchParams(location.search);
  try { if (localStorage.getItem(chave) === "1") { liberar(); return; } } catch (e) {}
  if (p.get("preview") === "1" && (location.hostname === "localhost" || location.protocol === "file:")) { liberar(); return; }

  var msg = document.getElementById("msg-erro");
  function erro(t) { msg.textContent = t || ""; }
  function soDigitos(s) { return (s || "").replace(/\D/g, ""); }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault(); erro("");
    var f = new FormData(form);
    if (f.get("site_url")) return;                       // armadilha de robô
    if (Date.now() - aberto < 3000) { erro("Aguarde um instante e envie de novo."); return; }
    var nome = (f.get("nome") || "").trim();
    var zap = soDigitos(f.get("whatsapp"));
    var email = (f.get("email") || "").trim().toLowerCase();
    if (nome.length < 2) { erro("Escreva o seu nome."); return; }
    if (zap.length < 10 || zap.length > 13) { erro("Confira o WhatsApp, com DDD. Exemplo: 31 99999-9999."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { erro("Confira o e-mail."); return; }
    if (!f.get("consentimento")) { erro("Marque a caixa de consentimento para liberar o brinde."); return; }
    var cfg = window.JGA_LEADS || {};
    if (!cfg.url || !cfg.anonKey) { erro("O cadastro está sendo ajustado. Chame no WhatsApp que eu libero o brinde pra você."); return; }

    var botao = form.querySelector("button[type=submit]");
    botao.disabled = true; botao.textContent = "Enviando...";
    var corpo = {
      nome: nome, whatsapp: zap, email: email, post_slug: slug,
      mentoria: !!f.get("mentoria"), consentimento: true,
      origem: (p.get("utm_source") || document.referrer || "direto").slice(0, 120)
    };
    fetch(cfg.url.replace(/\/$/, "") + "/rest/v1/" + (cfg.tabela || "leads"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": cfg.anonKey, "Authorization": "Bearer " + cfg.anonKey, "Prefer": "return=minimal" },
      body: JSON.stringify(corpo)
    }).then(function (r) {
      if (!r.ok && r.status !== 409) throw new Error("status " + r.status);   // 409 = já cadastrado neste post: libera igual
      try { localStorage.setItem(chave, "1"); } catch (e) {}
      liberar();
    }).catch(function () {
      erro("Não consegui enviar agora. Tente de novo ou chame no WhatsApp.");
      botao.disabled = false; botao.textContent = "Liberar meu brinde";
    });
  });
})();
