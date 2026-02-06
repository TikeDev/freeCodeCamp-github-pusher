import { Octokit, App } from "octokit";
import { type CreateCommitOnBranchInput, type Commit, /* validate */ } from '@octokit/graphql-schema'
import { localExtStorage } from '@webext-core/storage';
import { PageDataObj } from "@/types/challenge";
import { Base64 } from "js-base64";

export { authenticateGithub, pushCommit };

let octokit: null | Octokit = null;

async function authenticateGithub(){
  const storedPAT = await localExtStorage.getItem('github_PAT');
  if (!storedPAT){
    await localExtStorage.setItem('github_PAT', import.meta.env.WXT_GITHUB_PAT_TOKEN);
  }

  octokit = new Octokit({ 
    userAgent: "fCC-github-pusher/v0.0.0",
    auth: `${import.meta.env.WXT_GITHUB_PAT_TOKEN}` 
  });

  try {
    // authenticate and get username using PAT
    const { data: { login:username } } = await octokit.rest.users.getAuthenticated();
    console.log("Hello, %s", username);

    // get branch head's oid and store in localExtStorage
    const oid = getRepoInfo(username, "fCC-test-repo");
    await localExtStorage.setItem('branchhead_oid', oid);
    
    return { username, octokit };

  } catch (error: any) {
      // Catch authorization or network errors
      console.error("Error:", error.message);  
  }
    
}

// query for repo main oid given the owner and repo name
async function getRepoInfo(username: string, reponame: string){
  console.log("GETTING REPO");

  try {
    const repo = await octokit?.graphql(
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
        owner: username,
        repo: reponame
      }
    );

    const oid = repo.repository.ref.target.oid;
    await localExtStorage.setItem('branchhead_oid', oid);

    console.dir(oid);

    return oid;

  } catch (error) {
    console.log(error);
  }
    

}

// attempt pushing commit given
// repo's main branch oid
async function pushCommit(obj: PageDataObj){
  console.log("PUSHING COMMIT");

  // build variables for mutation
  const input :CreateCommitOnBranchInput = {
    branch: { 
      repositoryNameWithOwner: 'TikeDev/fCC-test-repo',
      branchName: 'main'
    },
    expectedHeadOid: await localExtStorage.getItem('branchhead_oid'),
    fileChanges: { 
      additions: [
      { // README w description
        path:         
          `${obj.date}/\
${obj.challengeTitle.toLowerCase().replaceAll(' ', '_')}/\
README.md`, 
        contents: `${Base64.encode('<h1>' + obj.challengeTitle + '</h1>' + '\n\n' + 
obj.challengeDesc + '\n\n' + 
obj.challengeTests)}`
      },
      { // solution code file
        path: 
          `${obj.date}/\
${obj.challengeTitle.toLowerCase().replaceAll(' ', '_')}/\
${obj.challengeTitle.toLowerCase().replaceAll(' ', '_')}.${obj.language}`, 
        contents: `${Base64.encode(obj.solutionCode)}` ///
      }]
    },
    message: { 
      headline: "Add solution - freeCodeCamp Daily Code Challenge"
    },  
  };
  const mutationString = 
    `mutation CreateCommit($input: CreateCommitOnBranchInput!){ 
      createCommitOnBranch(input: $input){
        clientMutationId,
        commit {
          additions
          id
          oid
        }
        ref {
          id
          target {
            oid
          }
        }
      }
    }
    `;    

  // validate mutation string against graphql schema
  //let mutationErrors = validate(mutationString);
  // console.log("VALIDATING")
  // if (mutationErrors){
  //   console.log(mutationErrors);
  // }

  console.log('ATTEMPTED COMMIT');

  // send create commit request
  try {
    let commit :Commit | null = await octokit?.graphql( 
      mutationString, { input } 
    );

    //console.dir(commit);    
    console.log(commit);
    return;

  } catch (error) {
    console.log('COMMIT ERROR')
    console.dir(error);
    if (error.errors)   
      console.dir(error.errors);
  } 
 
  return;
}



