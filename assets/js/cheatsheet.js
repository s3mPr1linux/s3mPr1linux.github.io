/* Página de cheatsheet: índice automático + botão de copiar nos blocos de código. */
(function () {
  'use strict';

  var content = document.getElementById('cs-content');
  if (!content) return;

  /* ── índice a partir dos h2/h3 ───────────────────────── */
  var toc = document.getElementById('cs-toc');
  if (toc) {
    var list = toc.querySelector('.cs-toc__list');
    var heads = content.querySelectorAll('h2, h3');
    var n = 0;

    Array.prototype.forEach.call(heads, function (h) {
      if (!h.id) {
        h.id = 'sec-' + (++n);
      }
      var li = document.createElement('li');
      if (h.tagName === 'H3') li.className = 'cs-toc--h3';
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      list.appendChild(li);
    });

    if (heads.length > 1) toc.hidden = false;
  }

  /* ── botão copiar ────────────────────────────────────── */
  var blocks = content.querySelectorAll('pre');
  Array.prototype.forEach.call(blocks, function (pre) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-copy';
    btn.textContent = 'copiar';
    btn.setAttribute('aria-label', 'Copiar bloco de código');

    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = (code || pre).innerText;

      var done = function (ok) {
        btn.textContent = ok ? 'copiado' : 'falhou';
        btn.classList.toggle('is-done', ok);
        setTimeout(function () {
          btn.textContent = 'copiar';
          btn.classList.remove('is-done');
        }, 1600);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); },
                                                 function () { done(false); });
      } else {
        // fallback para http:// e navegadores antigos
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      }
    });

    pre.appendChild(btn);
  });
})();
