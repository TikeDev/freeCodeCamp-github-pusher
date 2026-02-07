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

  if (!pat || !owner || !repo){
    console.log('RETURNIN');
    return;
  }
    
  const login = await authenticateGithub(pat, owner, repo);
  if (login){
    await localExtStorage.setItem('pat_token', pat);
    await localExtStorage.setItem('owner', owner);
    await localExtStorage.setItem('repo', repo);
  }
  else {
    console.log("SOMETHING W THE AUTH ISN'T RIGHT");
  }
  console.log("LOGIN ACQUIRED", login);

}