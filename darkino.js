// ==UserScript==
// @name         Darkino filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Filter Darkino file versions
// @author       Ilgazil
// @match        https://www2.darkino.io/*
// @match        https://www2.darkino.online/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=darkino.io
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function filter(badge) {
    const table = badge.closest('table.filament-tables-table');
    const version = badge.innerText;

    Array
      .from(table.querySelectorAll('.badge.bg-success'))
      .filter(({innerText}) => innerText != version)
      .forEach((badge) => {
        badge.closest('tr').style.display = 'none';
      });
  }

  Array
    .from(document.querySelectorAll('table.filament-tables-table .badge.bg-success'))
    .forEach((badge) => {
      badge.addEventListener('click', ({target}) => filter(target));
      badge.style.cursor = 'pointer';
    });

  const observer = new MutationObserver(
    () => Array
      .from(document.querySelectorAll('html > *:not(body, head)'))
      .forEach((element) => element.parentElement.removeChild(element)),
  );

  observer.observe(document.querySelector('html'), {childList: true});
})();
