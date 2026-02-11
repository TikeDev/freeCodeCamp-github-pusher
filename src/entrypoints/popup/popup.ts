import './style.css';
import { authenticateGithub } from "@/utils/github";
import { localExtStorage } from "@webext-core/storage";

console.log("popup.ts loaded")

const submitBtn = document.querySelector('#submit-btn');
const patInput = document.querySelector('#pat-input');
const ownerInput = document.querySelector('#owner-input');
const repoInput = document.querySelector('#repo-input');

submitBtn?.addEventListener('click', handleAuthSubmission);

async function handleAuthSubmission(){
  console.log('LESS GO HANDLE');
  const pat = patInput?.value.trim();
  const owner = ownerInput?.value.trim();
  const repo = repoInput?.value.trim();

  if (/* !pat || */ !repo){
    console.log('MISSING A FIELD');
    return;
  }
    
  const login = await authenticateGithub(pat);

  if (!login) {
    console.log("SOMETHING W THE AUTH ISN'T RIGHT");
    // TODO add user hint to popup
    return;
  }
  console.log("LOGIN ACQUIRED", login);

  const oid = await getRepoInfo(login, repo);
  if (!oid) { 
    console.log("SOMETHING W THE REPO QUERY ISN'T RIGHT");
    // TODO add user hint to popup
    return;
  }


}