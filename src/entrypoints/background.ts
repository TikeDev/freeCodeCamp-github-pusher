import { onMessage, sendMessage } from '@/utils/messaging';
import authenticateGithub from '@/utils/github';
import { localExtStorage } from '@webext-core/storage';


export default defineBackground(() => {
  // background logic
  console.log('Hello background!', { id: browser.runtime.id });

	let challengeDataObj = {};

	// need to respond if it's mac (uses cmd key instead of ctrl)
	onMessage('requestPlatformInfo', async () => {
		let platformInfo = await browser.runtime.getPlatformInfo();
		console.log('Sending to Content script: ' + platformInfo.os);
		return platformInfo.os;
	});

	// receive fCC data from content script
	onMessage('shareDataAndPushToGithub', (message) => {
		challengeDataObj = message.data;
		console.log('HELLO ABOUT TO GITHUB PUSH');
		console.dir(challengeDataObj);		
	});

	// authenticate github user
	onMessage('authenticateGithub',  async  (message) => {
		const {username, octokit} = await authenticateGithub();
		console.log(username);
		console.dir(octokit);
		return octokit;
	});	


});