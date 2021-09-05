// ==UserScript==
// @name         link-grabber
// @version      0.2
// @description  Grab links from dl-protecte and such
// @author       Monk
// @match        https://*.journaldupirate.net/go_to*
// @match        https://decotoday.net/*
// ==/UserScript==

(() => {
  class PageObject {
    constructor(url) {
      if (/.*journaldupirate.*/.exec(url)) {
        this.form = document.querySelector('.content-body form');
        this.link = document.querySelector('.content-body .alert a');
        this.alert = document.querySelector('.content-body .alert');
      } else if (/.*decotoday.*/.exec(url)) {
        this.form = document.querySelector('.page-content form');
        this.link = document.querySelector('.page-content .alert a');
        this.alert = document.querySelector('.page-content .alert');
      }
    }
  }

  const page = new PageObject(window.location);

  // If form is present, it should be submitted to continue
  if (page.form) {
    page.form.submit();
    return;
  }

  // If no link is present, then the page is probably not a link protection page
  if (!page.link) {
    return;
  }

  // Install TailwindCSS
  // <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">
  const tailwindLinkElement = document.createElement('link');
  tailwindLinkElement.href = 'https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css';
  tailwindLinkElement.rel = 'stylesheet';
  document.head.appendChild(tailwindLinkElement);

  const urls = [];

  // Get previous urls from localStorage
  if (localStorage.getItem('urls')) {
    const store = JSON.parse(localStorage.getItem('urls'));

    if (store && Array.isArray(store) && store.length) {
      urls.push(...store);
    }
  }

  // Filter duplicate urls
  if (!urls.includes(page.link.href)) {
    urls.push(page.link.href);
    localStorage.setItem('urls', JSON.stringify(urls));
  }

  if (!page.alert) {
    return;
  }

  // Create reset button
  const resetButtonElement = document.createElement('div');
  resetButtonElement.className = 'cursor-pointer rounded border border-black border-red-600 hover:border-red-400 p-1 text-red-600 hover:text-red-400';
  resetButtonElement.innerHTML = '<svg class="inline" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg> Clear';
  resetButtonElement.addEventListener('click', () => {
    localStorage.removeItem('urls');
    writeListContent();
    actionWrapperElement.style.display = listElement.style.display = 'none';
  });

  // Create copy button
  const copyButtonElement = document.createElement('div');
  copyButtonElement.className = 'cursor-pointer rounded border border-black border-blue-600 hover:border-blue-400 p-1 text-blue-600 hover:text-blue-400';
  copyButtonElement.innerHTML = '<svg class="inline" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg> Copy';
  copyButtonElement.addEventListener('click', () => {
    const content = urls.map((url) => {
      if (!prefixInputElement.value) {
        return url;
      }

      return `${prefixInputElement.value.replace('[url]', url)}`;
    }).join('\r\n');

    navigator.clipboard.writeText(content);
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

  // Create action wrapper element
  const actionWrapperElement = document.createElement('div');
  actionWrapperElement.className = 'flex space-x-1';
  actionWrapperElement.appendChild(resetButtonElement);
  actionWrapperElement.appendChild(copyButtonElement);
  actionWrapperElement.appendChild(prefixInputElement);

  function writeListContent() {
    listElement.innerHTML = urls.map((url) => {
      if (!prefixInputElement.value) {
        return `<li class="ml-8">${url}</li>`;
      }

      return `<li class="ml-8 text-gray-400">${prefixInputElement.value.replace('[url]', `<span class="text-gray-600">${url}</span>`)}</li>`;
    }).join('');
  }

  // Create url list
  const listElement = document.createElement('ol');
  listElement.className = 'my-1 ml-2 border-l-4 border-grey-300 pl-6 select-none list-decimal';
  writeListContent();
  page.alert.parentElement.insertBefore(listElement, page.alert);

  page.alert.parentElement.insertBefore(actionWrapperElement, listElement);
})();
