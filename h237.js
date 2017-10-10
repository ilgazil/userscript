// ==UserScript==
// @name         h237
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  h237 killer
// @author       Monk
// @match        https://www.protect-lien.com/*
// @match        https://www.protect-zt.com/*
// ==/UserScript==

(function() {
    'use strict';

    $('body').append('<style>' + [
        '#h237, .content center > a, .header, .footer { display: none !important; }',
        '#h237 ~ .content { display: inherit !important; margin-top: 0; }'
    ].join(' ') + '</style>');
})();
