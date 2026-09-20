/* Índice de cheatsheets: filtro por texto e por tag, sem dependências.
   Suporta deep-link /cheatsheets/#tag=active-directory */
(function () {
  'use strict';

  var search  = document.getElementById('cs-search');
  var cloud   = document.getElementById('cs-tagcloud');
  var results = document.getElementById('cs-results');
  var empty   = document.getElementById('cs-empty');
  if (!results) return;

  var cards  = Array.prototype.slice.call(results.querySelectorAll('.cs-card'));
  var groups = Array.prototype.slice.call(results.querySelectorAll('[data-group]'));

  var state = { text: '', tag: '' };

  function apply() {
    var termo = state.text.trim().toLowerCase();
    var visiveis = 0;

    cards.forEach(function (card) {
      var texto = (card.getAttribute('data-text') || '').toLowerCase();
      var tags  = (card.getAttribute('data-tags') || '').split(',');

      var okTexto = !termo || texto.indexOf(termo) !== -1;
      var okTag   = !state.tag || tags.indexOf(state.tag) !== -1;
      var mostra  = okTexto && okTag;

      card.hidden = !mostra;
      if (mostra) visiveis++;
    });

    // esconde o cabeçalho de categorias que ficaram sem itens
    groups.forEach(function (g) {
      var algum = g.querySelector('.cs-card:not([hidden])');
      g.hidden = !algum;
    });

    if (empty) empty.hidden = visiveis !== 0;
  }

  if (search) {
    search.addEventListener('input', function () {
      state.text = search.value;
      apply();
    });
  }

  if (cloud) {
    cloud.addEventListener('click', function (e) {
      var btn = e.target.closest('.cs-tagbtn');
      if (!btn) return;
      state.tag = btn.getAttribute('data-tag') || '';
      Array.prototype.forEach.call(cloud.querySelectorAll('.cs-tagbtn'), function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      apply();
    });
  }

  function lerHash() {
    var m = /(?:^|[#&])tag=([^&]+)/.exec(window.location.hash || '');
    if (!m) return;
    var tag = decodeURIComponent(m[1]);
    var btn = cloud && cloud.querySelector('.cs-tagbtn[data-tag="' + tag + '"]');
    if (btn) btn.click();
  }

  window.addEventListener('hashchange', lerHash);
  lerHash();
  apply();
})();
