// ==UserScript==
// @name         link-grabber
// @version      0.2
// @description  Grab links from dl-protecte and such
// @author       Monk
// @match        https://*.journaldupirate.net/go_to*
// ==/UserScript==

(() => {
  const formElement = document.querySelector('.content-body form')

  // If form is present, it should be submitted to continue
  if (formElement) {
    formElement.submit();
    return;
  }

  const linkElement = document.querySelector('.content-body .alert a');

  // If no link is present, then the page is probably not a link protection page
  if (!linkElement) {
    return;
  }

  const urls = [];

  // Get previous urls from localStorage
  if (localStorage.getItem('urls')) {
    const store = JSON.parse(localStorage.getItem('urls'));

    if (store && Array.isArray(store) && store.length) {
      urls.push(...store);
    }
  }

  // Filter duplicate urls
  if (!urls.includes(linkElement.href)) {
    urls.push(linkElement.href);
    localStorage.setItem('urls', JSON.stringify(urls));
  }

  const alertElement = document.querySelector('.content-body .alert');

  // Create url list
  const listElement = document.createElement('ol');
  listElement.innerHTML = urls.map((url) => `<li>${url}</li>`).join('');
  alertElement.parentElement.insertBefore(listElement, alertElement.nextSibling);

  // Create reset button
  const resetButton = document.createElement('button');
  resetButton.innerHTML = '✗ Clear';
  resetButton.addEventListener('click', () => {
    localStorage.removeItem('urls');
    listElement.innerHTML = '';
    resetButton.style.display = listElement.style.display = 'none';
  });
  alertElement.parentElement.insertBefore(resetButton, listElement);
})();
