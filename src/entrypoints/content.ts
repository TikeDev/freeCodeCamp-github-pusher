export default defineContentScript({
  matches: ['https://www.freecodecamp.org/learn/daily-coding-challenge/20*'],
  excludeMatches: ['*://*.freecodecamp.org/learn/daily-coding-challenge/archive'],
  main() {
    // content script logic
    console.log('Hello content.');

    let shouldCommitToGithub = false;
    let isMac = false;


    // DOM Page Scraping - Challenge Info
    let date = window.location.pathname.split("daily-coding-challenge/")[1].trim();  // YYYY-MM-DD
    let language = document.querySelector('.tabs-row-middle [aria-expanded="true"]')?.textContent.includes('JavaScript') ? 'js': "py";
    let challengeTitle = document.querySelector('.challenge-title')?.textContent.trim();
    challengeTitle = challengeTitle?.trim().toLowerCase().replaceAll(' ', '_');   // Nth Fibonacci Number => nth_fibonacci_number
    let challengeDesc = document.querySelector('.challenge-instructions')?.textContent.trim();
    let challengeTests = 'Tests\n' + document.querySelector('.instructions-panel')?.textContent.trim();


    let fCCPageDataObj = {
      date: date,            // YYYY-MM-DD
      language: language,
      challengeTitle: challengeTitle,
      challengeDesc: challengeDesc,
      challengeTests: challengeTests,
      solutionCode: '',
    };    

    console.dir(fCCPageDataObj);
  },
});
