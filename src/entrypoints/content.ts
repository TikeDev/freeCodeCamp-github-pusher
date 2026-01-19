  // Watch for page changes to challenge page bc it's a Single Page Application
  const watchPattern = new MatchPattern('*://*.freecodecamp.org/learn/daily-coding-challenge/20*');

export default defineContentScript({
  // run content script on whole fCC site
  matches: ['*://*.freecodecamp.org/*'],
  main(ctx) {
    // content script logic
    console.log('Hello content.');

    // upon SPA page change to coding challenge, start scraping
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      console.log("PAGE CHANGE");
      if (watchPattern.includes(newUrl)){
        console.log("CODING CHALLENGE PAGE");
        startChallengeScrape(newUrl);
      }
    });
  },
});

function startChallengeScrape(newUrl: URL){
  console.log('Handling page change match');

  let shouldCommitToGithub = false;
  let isMac = false;

  // DOM Page Scraping - Challenge Info
  let date = newUrl.pathname.split("daily-coding-challenge/")[1].trim();  // YYYY-MM-DD
  let language = document.querySelector('.tabs-row-middle [aria-expanded="true"]')?.textContent.includes('JavaScript') ? 'js': "py";
  let challengeTitle = document.querySelector('.challenge-title')?.textContent.trim();
  challengeTitle = challengeTitle?.trim().toLowerCase().replaceAll(' ', '_');   // Nth Fibonacci Number => nth_fibonacci_number
  let challengeDesc = document.querySelector('.challenge-instructions')?.textContent.trim();
  let challengeTests = 'Tests\n' + document.querySelector('.instructions-panel')?.textContent.trim();

  let fCCPageDataObj = {
    date: date,  // YYYY-MM-DD
    language: language,
    challengeTitle: challengeTitle,
    challengeDesc: challengeDesc,
    challengeTests: challengeTests,
    solutionCode: '',
  };    

    console.dir(fCCPageDataObj);
  },
});
