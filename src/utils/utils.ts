import PageDataObj from "@/types/challenge";

const observeConfig = { attributes: false, childList: true, subtree: true };
const parentSelector = '.instructions-panel';
const targetSelectors = ['#content-start', '#description', '.challenge-test-suite'];
const modalSelector = '#headlessui-portal-root';
const solutionSelector = '.view-lines';
const languageSelectors = ['.react-monaco-editor-container', 'data-mode-id']
const found = new Set();

const fCCPageDataObj :PageDataObj = {
  date:'',  // YYYY-MM-DD
  language:'',
  challengeTitle:'',
  challengeDesc:'',
  challengeTests:'',
  solutionCode:'',
  shouldCommitToGithub: false,
  isMac: false
};  

let submissionCallback: any;

const setSubmissionCallback = (callback: () => void) => {
  submissionCallback = callback;
}

const handleSubmission = () => {
  console.log('HANDLING SUBMISSION');
  fCCPageDataObj.shouldCommitToGithub = true;
  submissionCallback();
};

const targetsCallback = (mutations, observer) => {
  console.log('HELLO TARGETS CALLBACK');
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes){
        // ignore non-html elements
        if (!(node instanceof HTMLElement))
          continue;
        
        // check if any targets *appeared*
        // title
        if (node.matches(targetSelectors[0])){
          fCCPageDataObj.challengeTitle = node.innerHTML.trim();
          found.add(targetSelectors[0]);
        }
        // description
        if (node.matches(targetSelectors[1])){
          fCCPageDataObj.challengeDesc = node.innerHTML.trim();
          found.add(targetSelectors[1]);          
        }
        // tests
        if (node.matches(targetSelectors[2])){
          let items = Array.from(node.querySelectorAll('.test-output span:not(.sr-only)'));
          //console.dir(items.map((el) => el.innerHTML.trim()));
          
          
          fCCPageDataObj.challengeTests = '<h2>Tests</h2>\n' + '<ul>\n' +
          items.map((el) => `<li>${el.innerHTML.trim()}</li>`).join("\n") +
          '\n</ul>';
          found.add(targetSelectors[2]);          
        }        

        // both targets found, stop looking for targets
        if (found.size === targetSelectors.length){
          found.clear();
          console.log('HELLO TARGETS FOUND');
          console.dir(fCCPageDataObj);
          
          observer.disconnect();
        }
      }
    }
  }
};

const checkAllTargetsExist = (parent) => {
  targetSelectors.forEach((targetSelector) => {
    let targetExists = parent.querySelector(targetSelector);
    if (targetExists instanceof HTMLElement){
      // title
      if (targetSelector === targetSelectors[0]){
        fCCPageDataObj.challengeTitle = targetExists.innerHTML.trim();
      }
      // description
      else if (targetSelector === targetSelectors[1]){
        fCCPageDataObj.challengeDesc = targetExists.innerHTML.trim();
      }
      // tests
      else if (targetSelector === targetSelectors[2]){
        let items = Array.from(targetExists.querySelectorAll('.test-output span:not(.sr-only)'));
        //console.dir(items.map((el) => el.innerHTML.trim()));

        fCCPageDataObj.challengeTests = '<h2>Tests</h2>\n' + '<ul>\n' +
        items.map((el) => `<li>${el.innerHTML.trim()}</li>`).join("\n") +
        '\n</ul>';
      }    
      found.add(targetSelector);
    }
  });

    // if targets don't exist, start observing for targets
  if (found.size < targetSelectors.length)
    targetsObserver.observe(parent, observeConfig);
  else {
    found.clear();
    console.log('TARGETS FOUND FIRST TRY');
    console.dir(fCCPageDataObj);
  } 
}

// Callback function to execute when mutations are observed
const parentCallback = (mutations, observer) => {
  console.log('HELLO PARENT CALLBACK');

  // check to see if parent already exists before observing for it
  let parent = document.querySelector(parentSelector);
  if (parent){
    console.log('PARENT FOUND');         
    observer.disconnect();

    // parent exists, see if any targets exist before observing for targets
    checkAllTargetsExist(parent);
  }

  // check to see if parent appears
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

          // parent exists, see if any targets exist before observing for targets
          checkAllTargetsExist(parent);

          // not all targets exist, watch for rest of targets to *appear*
          if (found.size < targetSelectors.length)
            targetsObserver.observe(parent, observeConfig);
          else {          
            found.clear();
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
        
        // if modal, grab solution code and language
        if (node.matches(modalSelector)){
          console.log('HELLO FOUND MODAL');

          let codePanel = document.querySelector(solutionSelector);
          let language = document.querySelector(languageSelectors[0])?.getAttribute(languageSelectors[1])?.trim();
          fCCPageDataObj.solutionCode = codePanel?.innerText.trim()+'\n';
          fCCPageDataObj.language = language?.toLowerCase() === 'javascript' ? 'js': 'py';
          
          console.dir(fCCPageDataObj);

          // start listening for submission 
          // (submit button or keyboard shorcut)
          const submitBtn = Array.from(node.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Go to next challenge (Command + Enter)'));

          // submit button click
          submitBtn?.addEventListener('click', () => {
            console.log("SUBMIT BUTTON PRESSED")
            
            handleSubmission();
          });

          // submit keyboard shortcut
          document.addEventListener('keydown', (event) => {
            // command or ctrl key depending on platform
            const modifier = fCCPageDataObj.isMac ? event.metaKey: event.ctrlKey;

            if (modifier && event.key === 'Enter'){
              console.log("KEYBOARD COMBO PRESSED")
              handleSubmission();
            }
          });
        }    
      }
    }
  }
};

// Create an observer instance linked to the callback function
const parentObserver = new MutationObserver(parentCallback);
const targetsObserver = new MutationObserver(targetsCallback);
const modalObserver = new MutationObserver(modalCallback);

export { parentObserver, modalObserver, fCCPageDataObj, observeConfig, setSubmissionCallback };
