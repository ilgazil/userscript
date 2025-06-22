// ==UserScript==
// @name         link-grabber
// @version      3.0
// @description  Grab links from url protectors
// @author       Monk
// @match        https://darki.zone/*
// @match        https://darkiworld2025.com/*
// ==/UserScript==

(async () => {
  const API_KEY = '';

  if (window.location.host.startsWith('darkiworld2025')) {
    let autoClose = false;
    let collected = false;

    function attachLinks() {
      const tableElement = document.querySelector('tbody');

      if (!tableElement) {
        return;
      }

      Array
        .from(tableElement.querySelectorAll('button:not([data-attached-event])'))
        .filter((button) => button.firstElementChild?.alt?.startsWith('1fichier'))
        .forEach((button) => {
          button.setAttribute('data-attached-event', '');

          button.addEventListener('click', (event) => {
            collected = false;
            autoClose = !event.ctrlKey;
            event.target.closest('tr').style.backgroundColor = 'orange'
          });
      });
    }

    function autoOpenLink() {
      const link = document.querySelector('a[href*="darki.zone"]');

      if (!link) {
        return;
      }

      if (autoClose) {
        link.href = link.href.concat('&auto-close');
      }

      link.click();
      link.closest('.z-modal').querySelector('.backdrop-blur-sm').click();

      collected = true;
    }

    function createCollectAll() {
      if (document.querySelector('#auto-collector')) {
        return;
      }

      const reference = document.querySelector('.hidden-scrollbar button');

      if (!reference) {
        return;
      }

      const button = new DOMParser().parseFromString(reference.outerHTML, 'text/html').body.firstElementChild;
      button.id = 'auto-collector';
      button.firstElementChild.outerHTML = document.querySelector('[data-testid="ArchiveOutlinedIcon"').outerHTML;
      button.firstElementChild.classList.remove('text-muted');
      button.firstElementChild.nextSibling.nodeValue = 'Tout télécharger';

      button.addEventListener('click', collectAll);

      reference.after(button);
    }

    async function collectAll() {
      const buttons = Array
        .from(document.querySelectorAll('[data-attached-event]'))
        .filter((button) => String(Number(button.closest('tr').firstElementChild.innerText)) === button.closest('tr').firstElementChild.innerText);

      while (buttons.length) {
        buttons.shift().click();

        await new Promise((resolve) => setInterval(() => collected && resolve(), 100));
      }
    }

    const linkObserver = new MutationObserver((mutations) => {
      if (mutations.find((mutation) => mutation.type === 'childList')) {
        attachLinks();
        autoOpenLink();
        createCollectAll();
      }
    });

    linkObserver.observe(document.body, {childList: true, subtree: true});

    return;
  }

  async function getSubmitButton() {
    return document.querySelector('main header + div button');
  }

  async function getUrlButton() {
    return document.querySelector('main header + div a');
  }

  async function getStore({onChange}) {
    const store = {
      urls: [],

      add(url) {
        if (!url || this.urls.includes(url)) {
          return;
        }

        this.urls.push(url);
        this.save();
      },

      remove(url) {
        this.urls = this.urls.filter((storedUrl) => storedUrl !== url);
        onChange(this);
        this.save();
      },

      clear() {
        this.urls = [];
        this.save();
      },

      save() {
        localStorage.setItem('urls', JSON.stringify(this.urls));
        onChange(this);
      },

      load() {
        try {
          this.urls = JSON.parse(localStorage.getItem('urls'));

          this.urls.forEach((url) => {
            if (typeof url !== 'string') {
              throw new Error('Invalid url');
            }
          });
        } catch (_) {
          this.urls = [];
        }

        onChange(this);
      },
    }

    store.load();

    return Promise.resolve(store);
  }

  async function getAnchor() {
    const urlButton = await getUrlButton();

    const layoutRow = urlButton.getRootNode().createElement('div');
    layoutRow.style = 'margin-top: 1rem;';

    const anchor = urlButton.getRootNode().createElement('div');
    anchor.id = 'app';

    layoutRow.appendChild(anchor);
    urlButton.parentNode.after(layoutRow);

    anchor.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.25em">
          <div
            id="clear"
            style="cursor: pointer; border-radius: 0.25em; border: 1px solid rgb(220 38 38); color: rgb(220 38 38); user-select: none; display: flex; align-items: center; padding: 2px 5px;"
          >
            <svg
              style="display: inline; width: 1em; height: 1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
              />
            </svg> Clear
          </div>

          <div
            id="copy"
            style="cursor: pointer; border-radius: 0.25em; border: 1px solid rgb(37 99 235); color: rgb(37 99 235); user-select: none; display: flex; align-items: center; padding: 2px 5px;"
          >
            <svg
              style="display: inline; width: 1em; height: 1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
              />
            </svg> Copier
          </div>

          <span id="summary"></span>
        </div>

        <ol
          id="list"
          style="margin: 0.25em 0 0.25em 0.5em; border-left: 4px solid rgb(209 213 219); cursor: default; padding-left: 1em"
        ></ol>
      </div>
    `;

    return Promise.resolve(anchor);
  }

  async function addEventListeners(anchor, store) {
    anchor.addEventListener('click', (event) => {
      const {target} = event;

      const clearButton = anchor.querySelector('#clear');

      if (clearButton === target || clearButton.contains(target)) {
        store.urls = [];
        store.save();
        return;
      }

      const copyButton = anchor.querySelector('#copy');

      if (copyButton === target || copyButton.contains(target)) {
        navigator.clipboard.writeText(store.urls.map((url) => `https://api.vivien.cloud/1fichier.php?api_key=${API_KEY}&url=${url}`).join('\n'));
        return;
      }

      const linkButton = Array.from(anchor.querySelectorAll('.link')).find((button) => button === target || button.contains(target));

      if (linkButton) {
        store.urls = store.urls.filter((storedUrl) => storedUrl !== linkButton.getAttribute('data-url'));
        store.save();
        return;
      }
    });

    return Promise.resolve();
  }

  async function writeUrls(anchor, store) {
    anchor.querySelector('#list').innerHTML = store.urls.map((url) => `
      <li
        style="display: flex; justify-content: space-between; padding: 0.25em 0; border-radius: 0.25em;"
      >
        <div>${url}</div>
        <button style="cursor: pointer; display: flex" class="link" data-url="${url}">
          <svg viewBox="0 0 24 24" style="width: 1em; height: 1em">
            <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
          </svg>
        </button>
      </li>
    `).join('');

    return Promise.resolve();
  }

  async function writeSummary(anchor, store) {
    if (!store.urls.length) {
      anchor.querySelector('#summary').innerHTML = 'No urls';
      return Promise.resolve();
    }

    anchor.querySelector('#summary').innerHTML = `${store.urls.length} url`;

    if (store.urls.length > 1) {
      anchor.querySelector('#summary').innerHTML = anchor.querySelector('#summary').innerHTML.concat('s');
    }

    return Promise.resolve();
  }

  async function registerUrl(url) {
    const anchor = await getAnchor();

    const store = await getStore({
      onChange: async (store) => {
        await writeUrls(anchor, store);
        await writeSummary(anchor, store);
        await addEventListeners(anchor, store);
      },
    });

    store.add(url);

    return store;
  }

  function autoSubmit() {
    const handler = setInterval(async () => {
      const button = await getSubmitButton();

      if (button) {
        button.click();
        clearInterval(handler);
      };
    }, 100);
  }

  function onNewUrl(handler) {
    const handle = setInterval(async () => {
      const url = String((await getUrlButton())?.href || '');

      if (!url) {
        return;
      }

      handler(url);
      clearInterval(handle);
    }, 100);
  }

  onNewUrl(async (url) => {
    const store = await registerUrl(url);

    if (new URLSearchParams(window.location.search).has('auto-close')) {
      window.close();
    }
  });
  autoSubmit();
})();
