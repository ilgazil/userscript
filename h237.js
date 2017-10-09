// ==UserScript==
// @name         h237
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  h237 antiadd killer
// @author       Monk
// @match        https://www.protect-lien.com/*
// @match        https://www.protect-zt.com/*
// ==/UserScript==

(function() {
    'use strict';

    var interval = setInterval(function () {
        var h237 = document.getElementById('h237');

        console.log('test...');
        if (h237) {
            h237.setAttribute('style', 'display: none;');
            document.querySelector('.content').setAttribute('style', 'display: block;');

            console.log('cleared');
            clearInterval(interval);
        }
    }, 50);
})();
