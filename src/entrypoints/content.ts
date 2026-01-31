import { onMessage, sendMessage } from '@/utils/messaging';  
import { fCCPageDataObj, parentObserver, modalObserver, observeConfig, setSubmissionCallback } from '@/utils/utils';

  
// Watch for page changes to challenge page bc it's a Single Page Application
const watchPattern = new MatchPattern('*://*.freecodecamp.org/learn/daily-coding-challenge/20*');

export default defineContentScript({
  // run content script on whole fCC site
  matches: ['*://*.freecodecamp.org/*'],
  async main(ctx) {
    // content script logic
    console.log('Hello content.');

    // set submit button callback
    setSubmissionCallback(
     () => { sendMessage('shareDataAndPushToGithub', fCCPageDataObj) }
    );

    // Communicate with background
    const octokit = await sendMessage('authenticateGithub');

    fCCPageDataObj.shouldCommitToGithub = false;

    // Request background.ts for OS info
    const os = await sendMessage('requestPlatformInfo');
    fCCPageDataObj.isMac = (os === "mac");
    console.log("Success? Platform: " + os);

    // upon SPA page refresh/reload
    let currURL = window.location.href;
    if (watchPattern.includes(currURL)){
      console.log("CODING CHALLENGE PAGE");

      resetFCCPageDataObj();
      fCCPageDataObj.date = currURL.split("daily-coding-challenge/")[1].trim();
      parentObserver.observe(document.body, observeConfig);
      modalObserver.observe(document.body, observeConfig);      
    }

    // upon SPA page change to coding challenge, start scraping
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      console.log("PAGE CHANGE");
      if (watchPattern.includes(newUrl)){
        let newUrlStr = newUrl.toString();
        console.log("CODING CHALLENGE PAGE");

        resetFCCPageDataObj();
        fCCPageDataObj.date = newUrlStr.split("daily-coding-challenge/")[1].trim();
        parentObserver.observe(document.body, observeConfig);
        modalObserver.observe(document.body, observeConfig);
      }
    });
  },
});

function resetFCCPageDataObj(){
  fCCPageDataObj.date = '';  // YYYY-MM-DD
  fCCPageDataObj.language = '';
  fCCPageDataObj.challengeTitle = '';
  fCCPageDataObj.challengeDesc = '';
  fCCPageDataObj.challengeTests = '';
  fCCPageDataObj.solutionCode = '';
  fCCPageDataObj.shouldCommitToGithub = false;
// fCCPageDataObj.isMac won't change
}