// ==UserScript==
// @name         link-grabber
// @version      0.2
// @description  Grab links from dl-protecte and such
// @author       Monk
// @match        https://*.journaldupirate.net/go_to*
// @match        https://decotoday.net/*
// @match        https://hyipstats.net/*
// ==/UserScript==

(async () => {
  class PageObjectFactory {
    factory(url) {
      if (/.*journaldupirate.*/.exec(url)) {
        return new JournalDuPiratePageObject();
      } else if (/.*decotoday.*/.exec(url)) {
        return new DecoTodayPageObject();
      } else if (/.*hyipstats.*/.exec(url)) {
        return new HyipstatsPageObject();
      }
    }
  }

  class JournalDuPiratePageObject {
    constructor() {
      this.list = document.createElement('ol');
      this.actions = document.createElement('div');
    }

    async ready() {
      document.querySelector('.content-body form')?.submit();
      return Promise.resolve();
    }

    getUrl() {
      return document.querySelector('.content-body .alert a')?.href;
    }

    injectElements() {
      const anchor = document.querySelector('.content-body .alert');
      anchor.parentElement.insertBefore(this.list, anchor);
      anchor.parentElement.insertBefore(this.actions, this.list);
    }
  }

  class DecoTodayPageObject {
    constructor() {
      this.list = document.createElement('ol');
      this.actions = document.createElement('div');
    }

    async ready() {
      document.querySelector('.page-content form')?.submit();
      return Promise.resolve();
    }

    getUrl() {
      return document.querySelector('.page-content .alert a')?.href;
    }

    injectElements() {
      const anchor = document.querySelector('.page-content .alert');
      anchor.parentElement.insertBefore(this.list, anchor);
      anchor.parentElement.insertBefore(this.actions, this.list);
    }
  }

  class HyipstatsPageObject {
    constructor() {
      this.list = document.createElement('ol');
      this.actions = document.createElement('div');
    }

    async ready() {
      if (this.getUrl()) {
        const ad = await (new Promise((resolve) => {
          const handler = setInterval(() => {
            if (document.querySelector('.m-table-content')) {
              clearInterval(handler);
              resolve(document.querySelector('.m-table-content'));
            }
          }, 50);
        }));

        ad.parentElement.removeChild(ad);

        return Promise.resolve();
      }

      const geetest = await (new Promise((resolve) => {
        const handler = setInterval(() => {
          if (document.querySelector('.geetest_holder')) {
            clearInterval(handler);
            resolve(document.querySelector('.geetest_holder'));
          }
        }, 50);
      }));

      geetest.dispatchEvent(new Event('click'));
      document.querySelector('#get_link').submit();

      await (new Promise((resolve) => {
        const handler = setInterval(() => {
          if (document.querySelector('.geetest_success_radar_tip_content').innerHTML === 'Succeeded') {
            clearInterval(handler);
            resolve();
          }
        }, 50);
      }));
    }

    getUrl() {
      return document.querySelector('.main-body .alert-white a')?.href;
    }

    injectElements() {
      document.querySelector('.main-body').appendChild(this.list);
      document.querySelector('.main-body').insertBefore(this.actions, this.list);
    }
  }

  const page = (new PageObjectFactory()).factory(window.location);

  if (!page) {
    console.warn('Cannot parse this page');
  }

  await page.ready();

  if (!page.getUrl()) {
    console.warn('No link found in this page');
    return;
  }

  const urls = [];
  function fetchUrls() {
    const stringifiedUrls = JSON.stringify(urls);
    const raw = localStorage.getItem('urls');

    if (stringifiedUrls !== raw) {
      const store = JSON.parse(raw);

      if (store && Array.isArray(store) && store.length) {
        urls.splice(0, urls.length, ...store);
        writeListContent();
      }
    }
  }

  // Install TailwindCSS
  const tailwindLinkElement = document.createElement('link');
  tailwindLinkElement.href = 'https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css';
  tailwindLinkElement.rel = 'stylesheet';
  document.head.appendChild(tailwindLinkElement);

  // Create reset button
  const resetButtonElement = document.createElement('div');
  resetButtonElement.className = 'cursor-pointer rounded border border-black border-red-600 hover:border-red-400 p-1 text-red-600 hover:text-red-400';
  resetButtonElement.innerHTML = '<svg class="inline" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg> Clear';
  resetButtonElement.addEventListener('click', () => {
    localStorage.removeItem('urls');
    writeListContent();
    page.actions.style.display = page.list.style.display = 'none';
  });

  // Create copy button
  const copyButtonElement = document.createElement('div');
  copyButtonElement.className = 'cursor-pointer rounded border border-black border-blue-600 hover:border-blue-400 p-1 text-blue-600 hover:text-blue-400';
  copyButtonElement.innerHTML = '<svg class="inline" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg> Copy';
  copyButtonElement.addEventListener('click', () => {
    const content = prefixInputElement.value
      ? urls.map((url) => prefixInputElement.value.replace('[url]', url)).join('\r\n')
      : urls.join(' ');

    navigator.clipboard.writeText(`${content}\r\n`);
  });

  // Create prefix input
  const prefixInputElement = document.createElement('input');
  prefixInputElement.placeholder = 'cmd --option [url] extra-arg';
  prefixInputElement.className = 'outline-none flex-grow rounded border border-grey-200 p-1';
  prefixInputElement.value = localStorage.getItem('pattern') || '';
  prefixInputElement.addEventListener('input', (input) => {
    writeListContent(input.target.value);
    localStorage.setItem('pattern', input.target.value);
  });

  // Populate action wrapper element
  page.actions.className = 'flex space-x-1';
  page.actions.appendChild(resetButtonElement);
  page.actions.appendChild(copyButtonElement);
  page.actions.appendChild(prefixInputElement);

  function writeListContent() {
    page.list.innerHTML = urls.map((url) => {
      if (!prefixInputElement.value) {
        return `<li class="ml-8">${url}</li>`;
      }

      return `<li class="ml-8 text-gray-400">${prefixInputElement.value.replace('[url]', `<span class="text-gray-600">${url}</span>`)}</li>`;
    }).join('');
  }

  // Populate url list
  page.list.className = 'my-1 ml-2 border-l-4 border-grey-300 pl-6 select-none list-decimal';

  page.injectElements();

  fetchUrls();

  // Filter duplicate urls
  if (!urls.includes(page.getUrl())) {
    urls.push(page.getUrl());
    localStorage.setItem('urls', JSON.stringify(urls));
    writeListContent();
  }

  setInterval(fetchUrls, 500);
})();
