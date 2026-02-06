import { onMessage, sendMessage } from '@/utils/messaging';
import { authenticateGithub, pushCommit } from '@/utils/github';
import PageDataObj from '@/types/challenge';
// import { localExtStorage } from '@webext-core/storage';


export default defineBackground(() => {
  // background logic
  console.log('Hello background!', { id: browser.runtime.id });

	let challengeDataObj: PageDataObj;
	let retryQueue = [];

	// need to respond if it's mac (uses cmd key instead of ctrl)
	onMessage('requestPlatformInfo', async () => {
		let platformInfo = await browser.runtime.getPlatformInfo();
		console.log('Sending to Content script: ' + platformInfo.os);
		return platformInfo.os;
	});

	// receive fCC data from content script
	onMessage('shareDataAndPushToGithub', async (message) => {
		challengeDataObj = message.data;
		console.log('HELLO ABOUT TO GITHUB PUSH');
		console.dir(challengeDataObj);		

		await pushCommit(challengeDataObj);
	});

	// authenticate github user
	onMessage('authenticateGithub',  async  (message) => {
		const { username, octokit } = await authenticateGithub();
		console.log(username);
		console.dir(octokit);
		return octokit;
	});	


});