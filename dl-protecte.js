// ==UserScript==
// @name         dl-protecte
// @version      0.1
// @description  Grab links from dl-protecte and such
// @author       Monk
// @match        https://www.protect-lien.com/*
// @match        https://www.protect-zt.com/*
// @match        https://www.protecte-link.com/*
// @match        https://www.liens-telechargement.com/*
// @match        http://ed-protect.org/*
// @match        https://ed-protect.org/*
// @match        https://www.dl-protect1.com/*
// @match        https://time2watch.in/*
// @match        https://www.journaldupirate.net/go_to/*
// ==/UserScript==

(function() {
    'use strict';

    /**
     * @class
     *
     * @param ({string}|{UrlFinder[]}) selector - CSS selector for locating link (a tag) elements. Can be a collection of UrlFinder
     */
    var UrlFinder = function(selector, anchor) {
        var urls = [];

        return {
            /**
             * Returns finder urls
             */
            urls: function () {
                if (!urls.length) {
                    // If collection of UrlFinder, we concat all finder urls
                    if (Array.isArray(selector)) {
                        selector.forEach(function (finder) {
                            urls = urls.concat(finder.urls());
                        });
                    } else {
                        var elements = document.querySelectorAll(selector);

                        if (elements.length) {
                            elements.forEach(function(element) {
                                urls.push(element.href);
                            });
                        }
                    }
                }

                return urls;
            },

            /**
             *
             */
            hasUrls: function () {
                return !!this.urls().length;
            },

            /**
             *
             */
            anchor: function() {
                if (typeof anchor === 'function') {
                    return anchor();
                } else if (!anchor) {
                    // If collection of UrlFinder, we return the first valid anchor
                    if (Array.isArray(selector)) {
                        selector.some(function (finder) {
                            anchor = finder.anchor();

                            return !!anchor;
                        });
                    } else {
                        anchor = document.querySelector(selector.split(' ')[0]);
                    }
                }

                return anchor;
            }
        };
    };

    var finder = new UrlFinder([
        new UrlFinder('.lienet a'),
        new UrlFinder('.contenu_liens table.affichier_lien tr:not(.hellooo) td:nth-child(2) a'),
        new UrlFinder('a[href*=uptobox]', () => document.querySelector('h1 + div h4 + div')),
        new UrlFinder('.content-body--right .alert a')
    ]);

    if (!finder.hasUrls()) {
        return;
    }

    document.querySelector('body').innerHTML += '<style>' + [
        '.dl-wrapper { width: 300px; margin: 5px auto 0; text-align: center; }',
        '.dl-list-item { text-align: left; height: 25px; border-bottom: 1px solid #e0dcdc; margin-top: 3px; }',
        '.dl-list-item:last-child { border: none; }',
        '.dl-list-item.new { color: tomato; }',
        '.dl-cleanup-button { border: 1px solid transparent; background-color: transparent; cursor: pointer; }',
        '.dl-cleanup-button:after { display: block; height: 15px; background-color: #FA9595; margin: auto; padding: 2px; border-radius: 4px; text-align: center; color: white; font-weight: normal; font-size: 12px; box-shadow: 0 0 2px #E50F0F; cursor: pointer; }',
        '.dl-remove { float: right; }',
        '.dl-remove:after { content: "X"; width: 15px; }',
        '.dl-clear:after { content: "Clear"; width: 35px; }'
    ].join(' ') + '</style>';

    var UrlCollection = function(storage, anchor) {
        var items = storage.getItem('links') ? JSON.parse(localStorage.getItem('links')) : [];

        anchor.outerHTML += '<div class="dl-wrapper"><button class="dl-cleanup-button dl-clear"></button><ol class="dl-list"></ol><button class="dl-cleanup-button dl-clear"></button></div>';
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

    var collection = new UrlCollection(localStorage, finder.anchor());

    document.querySelector('.dl-list').addEventListener('click', function(e) {
        if (e.target && e.target.matches('.dl-remove')) {
            collection.remove(e.target.previousElementSibling.textContent);
        }
    });
    document.querySelectorAll('.dl-clear').forEach(domElement => {
        domElement.addEventListener('click', function(e) {
            collection.clear();
        });
    });

    collection.print();
    finder.urls().forEach(function(url) {
        collection.add(url);
    });
})();
