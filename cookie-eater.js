// ==UserScript==
// @name         Cookie eater
// @namespace    ilagzil
// @version      0.1
// @description  Remove cookie popups
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function removeElement(selector) {
        const element = document.querySelector(selector);

        if (!element) {
            return false;
        }

        element.parentElement.removeChild(element);
        return true;
    }

    const body = {
        handle() {
            this.class.handle();
            this.children.handle();
        },

        class: {
            handlers: [],
            handle() {
                this.handlers.forEach((handle) => handle());
            },
        },

        children: {
            handlers: [],
            handle() {
                this.handlers.forEach((handle) => handle());
            },
        },
    };

    const observer = new MutationObserver((mutationList) => {
        if (mutationList.filter(({attributeName}) => attributeName === 'class').length) {
            body.class.handle();
        }

        if (mutationList.filter(({type}) => type === 'childList').length) {
            body.children.handle();
        }
    });

    observer.observe(document.body, { attributes: true, childList: true });

    body.class.handlers.push(
        function didomi() {
            const body = document.body;

            if (body.classList.contains('didomi-popup-open')) {
                body.classList.remove('didomi-popup-open');
                removeElement('#didomi-host');
            }
        },
        function appconsent() {
            const body = document.body;

            if (body.classList.contains('appconsent_noscroll')) {
                body.classList.remove('appconsent_noscroll');
                removeElement('#appconsent');

                const handle = setInterval(
                    removeElement('.fig-consent-banner') && clearInterval(handle),
                    500,
                );
            }
        },
    );

    body.class.handlers.push(
        function cookiescript() {
            const banner = document.querySelector('body > #cookiescript_injected');

            if (banner) {
                console.log('remove', banner);
                document.body.removeChild(banner);
            }
        },
    );

    body.handle();
})();
