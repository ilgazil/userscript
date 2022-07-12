// ==UserScript==
// @name         link-grabber
// @version      0.2
// @description  Grab links from dl-protecte and such
// @author       Monk
// @match        https://*.journaldupirate.net/go_to*
// @match        https://decotoday.net/*
// @match        https://hyipstats.net/*
// @match        https://dl-protect.info/*
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
      } else if (/.*dl-protect.*/.exec(url)) {
        return new DlProtectPageObject();
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

  class DlProtectPageObject {
    constructor() {
      this.list = document.createElement('ol');
      this.actions = document.createElement('div');
    }

    async ready() {
      if (!document.querySelector('form#myForm')) {
        return Promise.resolve();
      }

      setTimeout(() => document.querySelector('form#myForm button.g-recaptcha').click(), 2000);
    }

    getUrl() {
      return document.querySelector('.urls a')?.href;
    }

    async getAppAnchor() {
      const rowElement = document.createElement('div');
      rowElement.className = 'row';

      const appAnchor = document.createElement('div');
      appAnchor.id = 'app';

      rowElement.appendChild(appAnchor);
      document.querySelector('.urls').parentNode.parentNode.appendChild(rowElement);

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
    // Build with https://play.tailwindcss.com/
    const tailwindElement = document.createElement('style');
    tailwindElement.innerHTML = `*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}::after,::before{--tw-content:''}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}*,::after,::before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scroll-snap-strictness:proximity;--tw-ring-offset-width:0;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000}::-webkit-backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scroll-snap-strictness:proximity;--tw-ring-offset-width:0;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000}::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scroll-snap-strictness:proximity;--tw-ring-offset-width:0;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000}.my-1{margin-top:.25rem;margin-bottom:.25rem}.ml-2{margin-left:.5rem}.inline{display:inline}.flex{display:flex}.h-8{height:2rem}.h-6{height:1.5rem}.w-8{width:2rem}.w-6{width:1.5rem}.max-w-xl{max-width:36rem}.cursor-pointer{cursor:pointer}.cursor-default{cursor:default}.select-none{-webkit-user-select:none;user-select:none}.justify-between{justify-content:space-between}.space-x-1>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-right:calc(0.25rem * var(--tw-space-x-reverse));margin-left:calc(0.25rem * calc(1 - var(--tw-space-x-reverse)))}.rounded{border-radius:.25rem}.border{border-width:1px}.border-l-4{border-left-width:4px}.border-red-600{--tw-border-opacity:1;border-color:rgb(220 38 38 / var(--tw-border-opacity))}.border-blue-600{--tw-border-opacity:1;border-color:rgb(37 99 235 / var(--tw-border-opacity))}.p-1{padding:.25rem}.px-2{padding-left:.5rem;padding-right:.5rem}.pl-6{padding-left:1.5rem}.text-red-600{--tw-text-opacity:1;color:rgb(220 38 38 / var(--tw-text-opacity))}.text-blue-600{--tw-text-opacity:1;color:rgb(37 99 235 / var(--tw-text-opacity))}.hover\\:border-red-400:hover{--tw-border-opacity:1;border-color:rgb(248 113 113 / var(--tw-border-opacity))}.hover\\:border-blue-400:hover{--tw-border-opacity:1;border-color:rgb(96 165 250 / var(--tw-border-opacity))}.hover\\:bg-blue-100:hover{--tw-bg-opacity:1;background-color:rgb(219 234 254 / var(--tw-bg-opacity))}.hover\\:text-red-400:hover{--tw-text-opacity:1;color:rgb(248 113 113 / var(--tw-text-opacity))}.hover\\:text-blue-400:hover{--tw-text-opacity:1;color:rgb(96 165 250 / var(--tw-text-opacity))}`;
    document.head.appendChild(tailwindElement);

    // Install Vue3
    const vue3ScriptElement = document.createElement('script');
    vue3ScriptElement.src = 'https://unpkg.com/vue@3.2.36/dist/vue.global.prod.js';
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
            class="cursor-pointer rounded border border-red-600 hover:border-red-400 p-1 text-red-600 hover:text-red-400 select-none"
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
            class="cursor-pointer rounded border border-blue-600 hover:border-blue-400 p-1 text-blue-600 hover:text-blue-400 select-none"
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
              <svg viewBox="0 0 24 24" class="inline w-6 h-6">
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
