import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  webExt: {
    binaries: {
      chrome: '/Applications/Google\ Chrome Beta.app/Contents/MacOS/Google Chrome\ Beta', //  Chrome Beta instead of regular Chrome
      firefox: '/Applications/Firefox\ Developer\ Edition.app/Contents/MacOS/firefox', // Firefox Developer Edition instead of regular Firefox
    },
  },
});