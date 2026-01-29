import { onMessage, sendMessage } from '@/utils/messaging';  
import { fCCPageDataObj, parentObserver, modalObserver, observeConfig } from '@/utils/utils';

  
// Watch for page changes to challenge page bc it's a Single Page Application
const watchPattern = new MatchPattern('*://*.freecodecamp.org/learn/daily-coding-challenge/20*');

export default defineContentScript({
  // run content script on whole fCC site
  matches: ['*://*.freecodecamp.org/*'],
  async main(ctx) {
    // content script logic
    console.log('Hello content.');

    // Communicate with background
    //const sharefCCDataResp = await sendMessage('sharefCCData', fCCPageDataObj);  
    const octokit = await sendMessage('authenticateGithub');

    fCCPageDataObj.shouldCommitToGithub = false;

    // Request background.ts for OS info
    const os = await sendMessage('requestPlatformInfo');
    fCCPageDataObj.isMac = (os === "mac");
    console.log("Success? Platform: " + os);

    // upon SPA page refresh
    let currURL = window.location.href;
    if (watchPattern.includes(currURL)){
      console.log("CODING CHALLENGE PAGE");

      fCCPageDataObj.shouldCommitToGithub = false;
      fCCPageDataObj.date = currURL.split("daily-coding-challenge/")[1].trim();
      parentObserver.observe(document.body, observeConfig);
      modalObserver.observe(document.body, observeConfig);      
    }

    // upon SPA page change to coding challenge, start scraping
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      console.log("PAGE CHANGE");
      if (watchPattern.includes(newUrl)){
        console.log("CODING CHALLENGE PAGE");

        fCCPageDataObj.shouldCommitToGithub = false;
        fCCPageDataObj.date = currURL.split("daily-coding-challenge/")[1].trim();
        parentObserver.observe(document.body, observeConfig);
        modalObserver.observe(document.body, observeConfig);
      }
    });
  },
});