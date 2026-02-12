import { Octokit, App } from "octokit";
import { type CreateCommitOnBranchInput, type Commit, Repository, Query, /* validate */ } from '@octokit/graphql-schema'
import { localExtStorage } from '@webext-core/storage';
import { PageDataObj } from "@/types/challenge";
import { Base64 } from "js-base64";

export { authenticateGithub, getRepoInfo, pushCommit };

let octokit: null | Octokit = null;
const githubAccObj = {
  // owner name, connected repo, branch, authenticated?, 
  owner: '',
  repo: '',
  branchToCommit: '',
  branchToCommitHeadOid: '',
  authenticated: false
}

async function authenticateGithub(PAT = ''){

  octokit = new Octokit({ 
    userAgent: "fCC-github-pusher/v0.0.0",
    auth: (PAT || import.meta.env.WXT_GITHUB_PAT_TOKEN)
  });

  try {
    // authenticate and get username using PAT
    const { data: { login } } = await octokit.rest.users.getAuthenticated();
    if (login){
      console.log("Hello, %s", login);
    }

    // save owner info
    if (login){
      githubAccObj.owner = login;
      await localExtStorage.setItem('pat_token', PAT);
      await localExtStorage.setItem('owner', login);
    }    

    return login;
  } 
  catch (error: any) {
    const status = error.status;
    // Catch authorization or network errors
    console.error("Authentication failed\n", `ERROR ${error.status}:`, error.response?.data.message || error?.message);  
  }
    
}

// query for repo main oid given the owner and repo name
async function getRepoInfo(owner, repo){
  console.log("GETTING REPO");

  const query =
    `query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        ref(qualifiedName: "refs/heads/main") {
          target {
            oid
          }
        }
      }
    }`;

  try {
    const response = await octokit?.graphql(
      query,
      {
        owner,
        repo
      }
    );

    console.log("GOT THE REPO QUERY");
    const oid = response?.repository.ref.target.oid;

    // save repo info
    if (oid){
      await localExtStorage.setItem('repo', repo);    
      await localExtStorage.setItem('branchhead_oid', oid);
      githubAccObj.repo = repo;
      githubAccObj.branchToCommitHeadOid = oid;
    }

    console.dir(oid);
    return oid;
  } 
  catch (error) {
    console.error("Repo Query Failed\n", 
      "Messages:", error.errors.map(e => e.message),
      "\nProvided values:", (error?.request?.variables || "none")
    );
  }
    

}

function endWithNewline(str: string) {
  if (str.endsWith('\n') || str.endsWith('\r\n')) { 
    return str; 
  } 
  // If not, append a newline character 
  return str + '\n'; 
}

async function buildCreateCommitInput(obj: PageDataObj) {
  const input :CreateCommitOnBranchInput = {
    branch: { 
      repositoryNameWithOwner: `${githubAccObj.owner}/${githubAccObj.repo}`,
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

  return input;
}

// attempt pushing commit given
// repo's main branch oid
async function pushCommit(obj: PageDataObj){
  console.log("PUSHING COMMIT");

  // build variables for mutation
  const input = await buildCreateCommitInput(obj);
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

  }
  catch (error) {
    console.log('COMMIT ERROR')
    console.dir(error);
    console.error("Pushing Commit Failed\n", 
      "Messages:", error.errors.map(e => e.message),
      "\nProvided values:", (error?.request?.variables || "none")
    );
  }
  return;
}



