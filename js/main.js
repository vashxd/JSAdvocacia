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

  /* --- 3. Botao flutuante some sobre a secao de contato ----------------- */
  var zap = document.getElementById('zap-flutuante');
  var contato = document.getElementById('contato');
  if (zap && contato && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      zap.dataset.oculto = entradas[0].isIntersecting ? 'true' : 'false';
    }, { threshold: 0.12 }).observe(contato);
  }

  /* --- 4. Formulario ----------------------------------------------------- */
  var form = document.getElementById('formulario');
  if (!form) { return; }

  var aviso = document.getElementById('aviso-form');
  var botao = form.querySelector('button[type="submit"]');
  var textoBotao = botao ? botao.textContent : '';

  var mostrarAviso = function (texto) {
    if (!aviso) { return; }
    aviso.textContent = texto;
    aviso.hidden = false;
  };

  var definirErro = function (idCampo, idErro, mensagem) {
    var campo = document.getElementById(idCampo);
    var erro = document.getElementById(idErro);
    if (campo) { campo.dataset.invalido = mensagem ? 'true' : 'false'; }
    if (erro) { erro.textContent = mensagem || ''; }
  };

  // Aceita telefone (>= 10 digitos) ou e-mail. Sem regex heroica: o objetivo
  // e pegar erro de digitacao obvio, nao validar o mundo.
  var contatoValido = function (valor) {
    var digitos = valor.replace(/\D/g, '');
    if (digitos.length >= 10 && digitos.length <= 13) { return true; }
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valor.trim());
  };

  var validar = function () {
    var ok = true;
    var nome = form.elements.nome;
    var cont = form.elements.contato;
    var consent = form.elements.consentimento;

    if (!nome.value.trim() || nome.value.trim().length < 2) {
      definirErro('campo-nome', 'erro-nome', 'Informe o seu nome.');
      ok = false;
    } else {
      definirErro('campo-nome', 'erro-nome', '');
    }

    if (!contatoValido(cont.value)) {
      definirErro('campo-contato', 'erro-contato', 'Informe um telefone com DDD ou um e-mail válido.');
      ok = false;
    } else {
      definirErro('campo-contato', 'erro-contato', '');
    }

    if (!consent.checked) {
      definirErro('campo-consentimento', 'erro-consentimento', 'É necessário autorizar o contato para enviar.');
      ok = false;
    } else {
      definirErro('campo-consentimento', 'erro-consentimento', '');
    }

    return ok;
  };

  ['nome', 'contato'].forEach(function (nomeCampo) {
    var campo = form.elements[nomeCampo];
    if (campo) {
      campo.addEventListener('blur', function () {
        if (campo.value.trim()) { validar(); }
      });
    }
  });

  form.addEventListener('submit', function (evento) {
    if (!validar()) {
      evento.preventDefault();
      var invalido = form.querySelector('[data-invalido="true"] input');
      if (invalido) { invalido.focus(); }
      return;
    }

    // Chave nao configurada: deixa o POST nativo acontecer para o erro
    // aparecer no lugar certo, em vez de fingir sucesso.
    var chave = form.elements.access_key;
    if (!chave || chave.value.indexOf('COLE-AQUI') === 0) { return; }

    evento.preventDefault();
    if (botao) { botao.disabled = true; botao.textContent = 'Enviando…'; }

    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (resposta) { return resposta.json(); })
      .then(function (dados) {
        if (dados && dados.success) {
          form.reset();
          mostrarAviso('Mensagem recebida. Retorno em até um dia útil, no contato informado.');
        } else {
          mostrarAviso('Não foi possível enviar agora. Se preferir, fale pelo WhatsApp ou pelo e-mail acima.');
        }
      })
      .catch(function () {
        mostrarAviso('Não foi possível enviar agora. Se preferir, fale pelo WhatsApp ou pelo e-mail acima.');
      })
      .then(function () {
        if (botao) { botao.disabled = false; botao.textContent = textoBotao; }
      });
  });
})();
