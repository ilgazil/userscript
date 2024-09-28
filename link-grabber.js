// ==UserScript==
// @name         link-grabber
// @version      2.0
// @description  Grab links from url protectors
// @author       Monk
// @match        https://dl-protect.link/*
// ==/UserScript==

(async () => {
  async function waitForElement(selector) {
    return new Promise((resolve) => {
      const handler = setInterval(() => {
        const element = document.querySelector(selector);

        if (element) {
          clearInterval(handler);
          resolve(element);
        }
      }, 50);
    });
  }

  async function getCaptchaValidator() {
    return document.querySelector('#subButton');
  }

  async function isCaptchaPage() {
    return Promise.resolve(!!(await getCaptchaValidator()));
  }

  async function resolveCaptcha() {
    return new Promise((resolve) => {
      const handle = setInterval(async () => {
        const button = await getCaptchaValidator();

        if (button.innerText === 'Continuer') {
          resolve();
          setTimeout(() => {
            button.click();
            clearInterval(handle);
            resolve();
          }, 100);
        }
      }, 500);
    });
  }

  async function getNewUrl() {
    return /(?<url>.*)&/.exec((await waitForElement('.urls a')).href).groups.url;
  }

  async function getStore({onChange}) {
    function parseSavedList(raw) {
      let savedList = JSON.parse(raw) || [];

      if (!savedList || !Array.isArray(savedList)) {
        savedList = [];
      }

      return savedList;
    }

    const store = {
      urls: parseSavedList(localStorage.getItem('urls')),

      add(url) {
        if (this.urls.includes(url)) {
          return;
        }

        this.urls.push(url);
        this.save();
        onChange(this);
      },

      remove(url) {
        if (!this.urls.includes(url)) {
          return;
        }

        this.urls = this.urls.filter((savedUrl) => savedUrl !== url);
        this.save();
        onChange(this);
      },

      clear() {
        this.urls = [];
        this.save();
        onChange(this);
      },

      save() {
        localStorage.setItem('urls', JSON.stringify(this.urls));
      },

      sync() {
        window.addEventListener('storage', (event) => {
          if (event.key !== 'urls') {
            return;
          }

          this.urls = parseSavedList(event.newValue);
          onChange(this);
        });
      },
    }

    store.sync();

    return Promise.resolve(store);
  }

  async function getAnchor() {
    const layoutRow = document.createElement('div');
    layoutRow.className = 'row';

    const anchor = document.createElement('div');
    anchor.id = 'app';

    layoutRow.appendChild(anchor);
    document.querySelector('.urls').parentNode.parentNode.appendChild(layoutRow);

    anchor.innerHTML = `
      <div id="app">
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.25em">
          <button
            id="clear"
            style="cursor: pointer; border-radius: 0.25em; border: 1px solid rgb(220 38 38); color: rgb(220 38 38); background-color: transparent; user-select: none"
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
          </button>

          <button
            id="copy"
            style="cursor: pointer; border-radius: 0.25em; border: 1px solid rgb(37 99 235); color: rgb(37 99 235); background-color: transparent; user-select: none"
          >
            <svg
              style="display: inline; width: 1em; height: 1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
              />
            </svg> Copy
          </button>

          <span id="summary"></span>
        </div>

        <ol
          id="list"
          style="margin: 0.25em 0 0.25em 0.5em; border-left: 4px solid rgb(209 213 219); cursor: default"
        ></ol>
      </div>
    `;

    return Promise.resolve(anchor);
  }

  async function addEventListeners(anchor, store) {
    anchor
      .querySelector('#app')
      .addEventListener('click', (event) => event.stopPropagation());

    anchor
      .querySelector('#clear')
      .addEventListener('click', () => store.clear());

    anchor
      .querySelector('#copy')
      .addEventListener('click', () => navigator.clipboard.writeText(store.urls.join(' ')));

    anchor
      .querySelector('#list')
      .addEventListener('click', (event) => {
        const button = Array
          .from(anchor.querySelector('#list').children)
          .map((element) => element.querySelector('button'))
          .find((button) => button === event.target || button.contains(event.target));

        if (button) {
          store.remove(button.previousElementSibling.innerText);
        }
      });

    return Promise.resolve();
  }

  async function writeUrls(anchor, store) {
    const newUrl = await getNewUrl();

    anchor.querySelector('#list').innerHTML = store.urls.map((url) => `
      <li
        style="display: flex; justify-content: space-between; padding: 0.25em 0; border-radius: 0.25em;"
      >
        <div style="${newUrl === url ? 'font-weight: bold' : ''}">${url}</div>
        <button
          style="cursor: pointer; border-radius: 0.25em; border: 1px solid rgb(220 38 38); color: rgb(220 38 38); background-color: transparent; user-select: none"
          class="link"
        >
          <svg viewBox="0 0 24 24" style="display: inline; width: 1.5em; height: 1.5em">
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

  async function createAddSentry() {
    const observer = new MutationObserver((mutationList, observer) => {
      Object
        .values(mutationList)
        .forEach((mutation) => {
          if (mutation.type === "childList") {
            void clearBody();
          }
        });
    });

    observer.observe(document.body, {childList: true, subtree: true});

    void clearBody();

    return Promise.resolve(true);
  }

  let BODY_CLEAR_THROTTLE = 0;
  async function clearBody() {
    if (BODY_CLEAR_THROTTLE) {
      clearTimeout(BODY_CLEAR_THROTTLE);
    }

    BODY_CLEAR_THROTTLE = setTimeout(() => {
      const elements = Array.from(document.body.children);
      const footerElementIndex = elements.findIndex((element) => element.tagName === 'FOOTER');

      elements
        .filter((element, index) => (index < footerElementIndex && element.tagName !== 'DIV') || (index > footerElementIndex))
        .forEach((element) => element.parentNode.removeChild(element));
    }, 100);
  }

  if (await isCaptchaPage()) {
    await createAddSentry();

    await resolveCaptcha();
  } else {
    const anchor = await getAnchor();

    const store = await getStore({
      onChange: async (store) => {
        await writeUrls(anchor, store);
        await writeSummary(anchor, store);
      },
    });

    await writeUrls(anchor, store);
    await writeSummary(anchor, store);

    store.add(await getNewUrl());

    await addEventListeners(anchor, store);

    await createAddSentry();
  }
})();
