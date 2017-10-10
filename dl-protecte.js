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

    $('body').append('<style>' + [
        '.dl-list { width: 300px; margin: 0 auto; }',
        '.dl-list-item { text-align: left; height: 25px; border-bottom: 1px solid #e0dcdc; margin-top: 3px; }',
        '.dl-list-item:last-child { border: none; }',
        '.dl-list-item.new { color: tomato; }',
        '.dl-cleanup-button { border: 1px solid transparent; background-color: transparent; cursor: pointer; }',
        '.dl-cleanup-button:after { display: block; height: 15px; background-color: #FA9595; margin: auto; padding: 2px; border-radius: 4px; text-align: center; color: white; font-weight: normal; font-size: 12px; box-shadow: 0 0 2px #E50F0F; cursor: pointer; }',
        '.dl-remove { float: right; }',
        '.dl-remove:after { content: "X"; width: 15px; }',
        '.dl-clear:after { content: "Clear"; width: 35px; }'
    ].join(' ') + '</style>');

    var UrlCollection = function(storage) {
        var items = storage.getItem('links') ? JSON.parse(localStorage.getItem('links')) : [];

        document.querySelector('.lienet').outerHTML += '<button class="dl-cleanup-button dl-clear"></button><ol class="dl-list"></ol><button class="dl-cleanup-button dl-clear"></button>';
        var dom = document.querySelector('.dl-list');

        /**
         * @param {string} string
         * @param {boolean} isNew
         */
        var render = function(url, isNew) {
            return '<li class="dl-list-item' + (isNew ? ' new' : '') + '"><span>' + url + '</span> <button class="dl-cleanup-button dl-remove" type="button"></button></li>';
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
                var element = dom.querySelector('.dl-list-item:nth-child(' + (index + 1) + ')');

                items.splice(index, 1);
                element.parentElement.removeChild(element);
                storage.setItem('links', JSON.stringify(items));
            },

            /**
             *
             */
            clear: function() {
                var index = items.length;

                while (--index > -1) {
                    this.remove(items[index]);
                }
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
    $('.dl-clear').on('click', function() {
        collection.clear();
    });

    collection.print();
    collection.add(document.querySelector('.lienet a').href);
})();
