import { onMessage, sendMessage } from '@/utils/messaging';

export default defineBackground(() => {
  // background logic
  console.log('Hello background!', { id: browser.runtime.id });

	 // need to respond if it's mac (uses cmd key instead of ctrl)
	onMessage('requestPlatformInfo', async () => {
		let platformInfo = await browser.runtime.getPlatformInfo();
		console.log('Sending to Content script: ' + platformInfo.os);
		return platformInfo.os;
	});
});