import { onMessage, sendMessage } from '@/utils/messaging';  
  
// Watch for page changes to challenge page bc it's a Single Page Application
const watchPattern = new MatchPattern('*://*.freecodecamp.org/learn/daily-coding-challenge/20*');

export default defineContentScript({
  // run content script on whole fCC site
  matches: ['*://*.freecodecamp.org/*'],
  async main(ctx) {
    // content script logic
    console.log('Hello content.');

    // Request background.ts for OS info
    const os = await sendMessage('requestPlatformInfo');
    console.log("Success? Platform: " + os);

    // account for SPA page refreshes
    let currURL = window.location.href;
    if (watchPattern.includes(currURL)){
      console.log("CODING CHALLENGE PAGE");
      startChallengeScrape(currURL, os);
    }

    // upon SPA page change to coding challenge, start scraping
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      console.log("PAGE CHANGE");
      if (watchPattern.includes(newUrl)){
        console.log("CODING CHALLENGE PAGE");
        startChallengeScrape(newUrl, os);
      }
    });
  },
});


async function startChallengeScrape(newUrl: URL | string, os: string){
  console.log('Handling page change match');

  let shouldCommitToGithub = false;
  let isMac = (os === "mac");
  let newUrlStr = (newUrl instanceof URL ? newUrl.pathname: newUrl);  

  // DOM Page Scraping - Challenge Info
  let date = newUrlStr.split("daily-coding-challenge/")[1].trim();  // YYYY-MM-DD
  let language = document.querySelector('.tabs-row-middle [aria-expanded="true"]')?.textContent.includes('JavaScript') ? 'js': "py";
  let challengeTitle = document.querySelector('.challenge-title')?.textContent.trim();
  challengeTitle = challengeTitle?.trim().toLowerCase().replaceAll(' ', '_');   // Nth Fibonacci Number => nth_fibonacci_number
  let challengeDesc = document.querySelector('.challenge-instructions')?.textContent.trim();
  let challengeTests = 'Tests\n' + document.querySelector('.instructions-panel')?.textContent.trim();

  

  const sharefCCDataResp = await sendMessage('sharefCCData', fCCPageDataObj);  
  const octokit = await sendMessage('authenticateGithub');
  

  console.dir(fCCPageDataObj);
}
