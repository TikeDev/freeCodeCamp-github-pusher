import { defineExtensionMessaging } from '@webext-core/messaging';
import PageDataObj from '@/types/challenge';

interface ProtocolMap {
  requestPlatformInfo() :string;
  shareDataAndPushToGithub(data: PageDataObj) :string;
  pushToGithub(data: PageDataObj) :string;
  authenticateGithub() :string;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();