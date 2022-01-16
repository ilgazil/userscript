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
  async function getElement(selector) {
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

    async getAppAnchor() {
      const appAnchor = document.createElement('div');
      appAnchor.id = 'app';

      document.querySelector('.content-body .alert').appendChild(appAnchor);

      return '#app';
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

    async getAppAnchor() {
      const appAnchor = document.createElement('div');
      appAnchor.id = 'app';

      document.querySelector('.page-content .alert').appendChild(appAnchor);

      return '#app';
    }
  }

  class HyipstatsPageObject {
    constructor() {
      this.list = document.createElement('ol');
      this.actions = document.createElement('div');
    }

    async removeAds() {
      const selectors = ['.m-table-content', '.detn_stat1_block', '.detn_foot_ul', '#kt_content .d-none'];

      if (window.history.length === 1) {
        selectors.push('.alert.alert-notice.alert-light-primary');
      }

      const elements = await Promise.all(selectors.map(getElement));

      elements.forEach((element) => element.parentElement.removeChild(element));
    }

    async ready() {
      await this.removeAds();
    }

    getUrl() {
      return document.querySelector('.main-body .alert-white a')?.href;
    }

    async getAppAnchor() {
      const appAnchor = document.createElement('div');
      appAnchor.id = 'app';

      document.querySelector('.main-body').appendChild(appAnchor);

      return '#app';
    }
  }

  const page = (new PageObjectFactory()).factory(window.location);

  if (!page) {
    console.warn('Cannot parse this page');
  }

  await page.ready();

  await new Promise((resolve) => {
    // Install TailwindCSS
    const tailwindLinkElement = document.createElement('link');
    tailwindLinkElement.href = 'https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css';
    tailwindLinkElement.rel = 'stylesheet';
    document.head.appendChild(tailwindLinkElement);

    // Install Vue3
    const vue3ScriptElement = document.createElement('script');
    vue3ScriptElement.src = 'https://unpkg.com/vue@next';
    document.head.appendChild(vue3ScriptElement);

    const handle = setInterval(() => {
      if (unsafeWindow.Vue) {
        clearInterval(handle);
        resolve();
      }
    }, 50);
  });

  const urlListComponent = Vue.createApp({
    data() {
      return {
        urlList: [],
      };
    },

    computed: {
      urls: {
        get() {
          return this.urlList;
        },

        set(urls) {
          this.urlList = urls;
          localStorage.setItem('urls', JSON.stringify(urls));
        },
      },

      rawList() {
        return JSON.stringify(this.urls);
      }
    },

    mounted() {
      this.syncUrls();
      setInterval(() => this.syncUrls(), 500);

      if (page.getUrl()) {
        if (!this.urls.includes(page.getUrl())) {
          this.urls = [...this.urls, page.getUrl()];
        }
      } else {
        console.warn('No link found in this page');
      }
    },

    methods: {
      clear() {
        this.urls = [];
      },

      copy() {
        navigator.clipboard.writeText(this.urls.join('\r\n'));
      },

      remove(url) {
        this.urls = this.urls.filter((storedUrl) => storedUrl !== url);
      },

      syncUrls() {
        const rawStoredList = localStorage.getItem('urls');

        if (this.rawList !== rawStoredList) {
          const storedList = JSON.parse(rawStoredList);

          if (storedList && Array.isArray(storedList) && storedList.length) {
            this.urls = storedList;
          }
        }
      },
    },

    template: `
      <div>
        <div class="flex space-x-1">
          <button
            class="cursor-pointer rounded border border-black border-red-600 hover:border-red-400 p-1 text-red-600 hover:text-red-400 select-none"
            @click="clear"
          >
            <svg
              class="inline w-8 h-8"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
              />
            </svg> Clear
          </button>

          <button
            class="cursor-pointer rounded border border-black border-blue-600 hover:border-blue-400 p-1 text-blue-600 hover:text-blue-400 select-none"
            @click="copy"
          >
            <svg
              class="inline w-8 h-8"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
              />
            </svg> Copy
          </button>
        </div>

        <div
          v-if="urls.length"
          class="my-1 ml-2 border-l-4 border-grey-300 pl-6 cursor-default"
        >
          <div
            v-for="url in urls"
            class="flex justify-between px-2 rounded hover:bg-blue-100"
          >
            <div>{{ url }}</div>
            <button class="cursor-pointer select-none" @click="remove(url)">
              <svg viewBox="0 0 24 24" class="inline w-4 h-4">
                <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,
  });

  urlListComponent.mount(await page.getAppAnchor());
})();
