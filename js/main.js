/* ==========================================================================
   Joyce Santos, Advogada — comportamento da pagina
   Tudo aqui e progressive enhancement: sem JS a pagina continua legivel,
   navegavel e o formulario continua enviando (POST nativo + redirect).
   ========================================================================== */
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. Sombra do cabecalho ao rolar ---------------------------------- */
  var cabecalho = document.getElementById('cabecalho');
  if (cabecalho) {
    var marcarRolagem = function () {
      cabecalho.dataset.rolado = window.scrollY > 8 ? 'true' : 'false';
    };
    marcarRolagem();
    window.addEventListener('scroll', marcarRolagem, { passive: true });
  }

  /* --- 1b. Menu do mobile ------------------------------------------------ */
  var menuBotao = document.querySelector('.menu-botao');
  var menu = document.getElementById('menu');
  if (cabecalho && menuBotao && menu) {
    var menuTexto = menuBotao.querySelector('.menu-texto');
    var definirMenu = function (aberto) {
      cabecalho.dataset.menu = aberto ? 'aberto' : 'fechado';
      menuBotao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      if (menuTexto) { menuTexto.textContent = aberto ? 'Fechar' : 'Menu'; }
    };
    definirMenu(false);

    menuBotao.addEventListener('click', function () {
      definirMenu(cabecalho.dataset.menu !== 'aberto');
    });
    // Escolher um destino fecha o menu.
    menu.addEventListener('click', function (evento) {
      if (evento.target.closest('a')) { definirMenu(false); }
    });
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && cabecalho.dataset.menu === 'aberto') {
        definirMenu(false);
        menuBotao.focus();
      }
    });
    document.addEventListener('click', function (evento) {
      if (cabecalho.dataset.menu === 'aberto' && !cabecalho.contains(evento.target)) {
        definirMenu(false);
      }
    });
    // Voltando para o layout de desktop, o painel nao pode ficar preso aberto.
    var desktop = window.matchMedia('(min-width: 861px)');
    var aoMudar = function () { if (desktop.matches) { definirMenu(false); } };
    if (desktop.addEventListener) { desktop.addEventListener('change', aoMudar); }
    else if (desktop.addListener) { desktop.addListener(aoMudar); } // Safari < 14
  }

  /* --- 2. Revelacao das secoes ao rolar --------------------------------- */
  var aRevelar = document.querySelectorAll('.revela');
  if (semMovimento || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(aRevelar, function (el) { el.classList.add('visivel'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(aRevelar, function (el) { observador.observe(el); });
  }

  /* --- 3. Botao flutuante ------------------------------------------------ */
  // So aparece depois que os botoes do hero saem da tela, e some de novo
  // sobre o contato e o rodape: nunca disputa espaco com outro CTA nem
  // cobre o aviso do Provimento 205.
  var zap = document.getElementById('zap-flutuante');
  var vigiados = [
    document.querySelector('.timbre .acoes'),
    document.getElementById('contato'),
    document.querySelector('.rodape')
  ].filter(Boolean);
  if (zap && vigiados.length && 'IntersectionObserver' in window) {
    var naTela = [];
    zap.dataset.oculto = 'true';
    var observadorZap = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var i = naTela.indexOf(entrada.target);
        if (entrada.isIntersecting && i < 0) { naTela.push(entrada.target); }
        if (!entrada.isIntersecting && i >= 0) { naTela.splice(i, 1); }
      });
      zap.dataset.oculto = naTela.length ? 'true' : 'false';
    }, { threshold: 0 });
    vigiados.forEach(function (el) { observadorZap.observe(el); });
  }

  /* --- 4. Formulario: monta a mensagem e abre o WhatsApp --------------- */
  // Nada e enviado a servidor: o visitante revisa a mensagem no proprio
  // WhatsApp e decide enviar. Sem JS, o GET nativo abre o WhatsApp com a
  // saudacao padrao.
  var form = document.getElementById('formulario');
  if (!form) { return; }

  // "Falar sobre este assunto" nos cartoes de area ja deixa o assunto
  // escolhido no formulario.
  var assunto = document.getElementById('area');
  Array.prototype.forEach.call(document.querySelectorAll('.area-link[data-assunto]'), function (link) {
    link.addEventListener('click', function () {
      if (assunto) { assunto.value = link.dataset.assunto; }
    });
  });

  var campoNome = document.getElementById('campo-nome');
  var nome = document.getElementById('nome');
  var erroNome = document.getElementById('erro-nome');

  var validarNome = function () {
    var ok = nome.value.trim().length >= 2;
    campoNome.dataset.invalido = ok ? 'false' : 'true';
    erroNome.textContent = ok ? '' : 'Informe o seu nome.';
    return ok;
  };

  nome.addEventListener('blur', function () {
    if (nome.value.trim()) { validarNome(); }
  });

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    if (!validarNome()) { nome.focus(); return; }

    var mensagem = 'Olá, meu nome é ' + nome.value.trim() + '.\n' +
      'Gostaria de conversar sobre: ' + form.querySelector('#area').value + '.\n' +
      'Melhor horário para conversar: ' + form.querySelector('#horario').value + '.';
    var url = form.action + '?text=' + encodeURIComponent(mensagem);

    var janela = window.open(url, '_blank');
    if (janela) { janela.opener = null; } else { window.location.href = url; }
  });
})();
