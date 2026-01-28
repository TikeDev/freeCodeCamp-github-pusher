const observeConfig = { attributes: false, childList: true, subtree: true };
const parentSelector = '.instructions-panel';
const targetSelectors = ['#content-start', '#description', '.challenge-test-suite'];
const modalSelector = '#headlessui-portal-root';
const found = new Set();

interface PageDataObj {
  date :string,  // YYYY-MM-DD
  language :string,
  challengeTitle :string,
  challengeDesc :string,
  challengeTests :string,
  solutionCode :string,
  shouldCommitToGithub : boolean
}; 

const fCCPageDataObj :PageDataObj = {
  date:'',  // YYYY-MM-DD
  language:'',
  challengeTitle:'',
  challengeDesc:'',
  challengeTests:'',
  solutionCode:'',
  shouldCommitToGithub: false
};  
   

const targetsCallback = (mutations, observer) => {
  console.log('HELLO TARGETS CALLBACK');
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes){
        // ignore non-html elements
        if (!(node instanceof HTMLElement))
          continue;
        
        // title
        if (node.matches(targetSelectors[0])){
          fCCPageDataObj.challengeTitle = node.innerText.trim();
          found.add(targetSelectors[0]);
        }
        // description
        if (node.matches(targetSelectors[1])){
          fCCPageDataObj.challengeDesc = node.innerText.trim();
          found.add(targetSelectors[1]);          
        }
        // tests
        if (node.matches(targetSelectors[2])){
          fCCPageDataObj.challengeTests = 'Tests\n' + node.innerText.trim();
          found.add(targetSelectors[2]);          
        }        
        // both targets found, stop looking for targets to scrape
        if (found.size === targetSelectors.length){
          console.log('HELLO TARGETS FOUND');
          console.dir(fCCPageDataObj);
          
          observer.disconnect();
        }
      }
    }
  }
}

// Callback function to execute when mutations are observed
const parentCallback = (mutations, observer) => {
  console.log('HELLO PARENT CALLBACK');

  // check to see if parent is there before observing
  let parent = document.querySelector(parentSelector);
  if (parent){
    console.log('PARENT FOUND');         
    observer.disconnect();

    targetSelectors.forEach((targetSelector) => {
      let exists = parent.querySelector(targetSelector);
      if (exists instanceof HTMLElement){
        // title
        if (targetSelector === targetSelectors[0]){
          fCCPageDataObj.challengeTitle = exists.innerText.trim();
        }
        // description
        else if (targetSelector === targetSelectors[1]){
          fCCPageDataObj.challengeDesc = exists.innerText.trim();
        }
        // tests
        else if (targetSelector === targetSelectors[2]){
          fCCPageDataObj.challengeTests = 'Tests\n' + exists.innerText.trim();
        }    
        found.add(targetSelector);
      }

    });

    if (found.size < targetSelectors.length)
      targetsObserver.observe(parent, observeConfig);
    else{
      console.log('TARGETS FOUND FIRST TRY');
      console.dir(fCCPageDataObj);
    } 
  }



  // check for mutations to find parent
  for (const mutation of mutations) {
    if (mutation.type === "childList") {    
      for (const node of mutation.addedNodes){
        // ignore non-html elements
        if (!(node instanceof HTMLElement)) 
          continue;

        // stop looking for parent if found,
        // start watching parent for scraping targets
        if (node.matches(parentSelector)){ 
          console.log('PARENT FOUND');         
          observer.disconnect();
          const parent = node;

          targetSelectors.forEach((targetSelector) => {
            let exists = parent.querySelector(targetSelector);
            if (exists instanceof HTMLElement){
              // title
              if (targetSelector === targetSelectors[0]){
                fCCPageDataObj.challengeTitle = exists.innerText.trim();
              }
              // description
              else if (targetSelector === targetSelectors[1]){
                fCCPageDataObj.challengeDesc = exists.innerText.trim();
              }
              // tests
              else if (targetSelector === targetSelectors[2]){
                fCCPageDataObj.challengeTests = 'Tests\n' + exists.innerText.trim();
              }    
              found.add(targetSelector);
            }

          });

          if (found.size < targetSelectors.length)
            targetsObserver.observe(parent, observeConfig);
          else{
            console.log('TARGETS FOUND FIRST TRY AFTER PARENT FOUND');
            console.dir(fCCPageDataObj);
          }

        }
      }
    } 
  }
};

const modalCallback = (mutations, observer) => {
  console.log('HELLO MODAL CALLBACK');

  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes){
        // ignore non-html elements
        if (!(node instanceof HTMLElement))
          continue;
        
        // modal
        if (node.matches(modalSelector)){
          console.log('HELLO FOUND MODAL');

          let codePanel = document.querySelector('.view-lines ');
          let language = document.querySelector('.react-monaco-editor-container')?.getAttribute('data-mode-id')?.trim();
          fCCPageDataObj.solutionCode = codePanel?.innerText.trim();
          fCCPageDataObj.language = language;
          
          fCCPageDataObj.shouldCommitToGithub = true;
          console.dir(fCCPageDataObj);

        }    

      }
    }
  }
}

// Create an observer instance linked to the callback function
const parentObserver = new MutationObserver(parentCallback);
const targetsObserver = new MutationObserver(targetsCallback);
const modalObserver = new MutationObserver(modalCallback);

export { parentObserver, modalObserver, fCCPageDataObj, observeConfig };
