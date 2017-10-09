// ==UserScript==
// @name         dl-protecte
// @namespace    Monk
// @version      0.1
// @description  Grab links from dl-protecte and such
// @author       Monk
// @match        https://www.protect-lien.com/*
// @match        https://www.protect-zt.com/*
// ==/UserScript==

(function() {
    'use strict';

    if (!document.querySelector('.lienet')) {
        return;
    }

    var UrlCollection = function(storage) {
        var items = storage.getItem('links') ? JSON.parse(localStorage.getItem('links')) : [];

        document.querySelector('.lienet').outerHTML += '<ol class="dl-list" style="width: 300px; margin: 0 auto;"></ol>';
        var dom = document.querySelector('.dl-list');

        /**
         * @param {string} string
         * @param {boolean} isNew
         */
        var render = function(url, isNew) {
            return '<li style="text-align: left;' + (isNew ? ' color: tomato;' : '') + '"><span>' + url + '</span> <span class="dl-remove" style="float: right;">X</span></li>';
        };

        /**
         *
         */
        var print = function() {
            dom.innerHTML = '';

            if (items.length) {
                items.forEach(function(url) {
                    dom.innerHTML += render(url);
                });
            }
        };

        return {
            /**
             * @param {string} url
             */
            add: function(url) {
                if (items.indexOf(url) > -1) {
                    return;
                }

                items.push(url);
                dom.innerHTML += render(url, true);
                storage.setItem('links', JSON.stringify(items));
            },

            /**
             * @param {string}
             */
            remove: function(url) {
                if (items.indexOf(url) == -1) {
                    return;
                }

                var index = items.indexOf(url);
                var element = dom.querySelector('li:nth-child(' + (index + 1) + ')');

                items.splice(index, 1);
                element.parentElement.removeChild(element);
                storage.setItem('links', JSON.stringify(items));
            },

            /**
             *
             */
            print: function() {
                dom.innerHTML = '';

                if (items.length) {
                    items.forEach(function(url) {
                        dom.innerHTML += render(url);
                    });
                }
            }
        };
    };

    var collection = new UrlCollection(localStorage);

    $('.dl-list').on('click', '.dl-remove', function() {
        collection.remove(this.previousElementSibling.textContent);
    });

    collection.print();
    collection.add(document.querySelector('.lienet a').href);
})();
