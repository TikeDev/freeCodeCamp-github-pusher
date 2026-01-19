import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['storage', 'tabs'],
  },
  srcDir: 'src',
  webExt: {
    binaries: {
      chrome: '/Applications/Google\ Chrome Beta.app/Contents/MacOS/Google Chrome\ Beta', //  Chrome Beta instead of regular Chrome
      firefox: '/Applications/Firefox\ Developer\ Edition.app/Contents/MacOS/firefox', // Firefox Developer Edition instead of regular Firefox
    },
    chromiumArgs: [
      '--user-data-dir=./.wxt/chrome-data', 
      '--auto-open-devtools-for-tabs',
      '--same-tab',
      'https://www.freecodecamp.org/learn/daily-coding-challenge/archive', 

    ],
  },
});