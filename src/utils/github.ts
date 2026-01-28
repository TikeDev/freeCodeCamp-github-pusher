import { Octokit, App } from "octokit";
import { localExtStorage } from '@webext-core/storage';

export default authenticateGithub;

let octokit: null | Octokit = null;

async function authenticateGithub(){
  const storedPAT = await localExtStorage.getItem('github_PAT');
  if (!storedPAT){
    await localExtStorage.setItem('github_PAT', import.meta.env.WXT_GITHUB_PAT_TOKEN);
  }

   octokit = new Octokit({ auth: `${import.meta.env.WXT_GITHUB_PAT_TOKEN}` });

  try {
    // authenticate and get username using PAT
    const { data: { login:username },} = await octokit.rest.users.getAuthenticated();
    console.log("Hello, %s", username);

    getRepoInfo(username);
    return { username, octokit };

  } catch (error: any) {
      // Catch authorization or network errors
      console.error("Error:", error.message);  
  }
    
}

async function getRepoInfo(username: string){
  console.log("GETTING REPO");

  try {
    const repo  = await octokit?.graphql(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          ref(qualifiedName: "refs/heads/main") {
            target {
              oid
            }
          }
        }
      }
    `,
      {
        owner:username,
        repo:"fCC-test-repo"
      }
    );

    let oid = repo.repository.ref.target.oid;
    console.dir(oid);

    //pushCommit(oid);

    return oid;

  } catch (error) {
    console.log(error);
  }
    
  return "Ok";

}

async function pushCommit(oid: string){
  console.log("PUSHING COMMIT");
  // GET https://api.github.com/repos/{owner}/{repo}/git/refs/heads/{branch}

  try {
    const repo  = await octokit?.graphql(
      `mutation($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          ref(qualifiedName: "refs/heads/main") {
            target {
              oid
            }
          }
        }
      }
    `,
      {
        owner:username,
        repo:"fCC-test-repo"
      }
    );

    let oid = repo.repository.ref.target.oid;
    console.dir(oid);

    return oid;

  } catch (error) {
    console.log(error);
  }
 
    return "Ok";

}



