import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  requestPlatformInfo() :string;
  shareDataAndPushToGithub(data: Object) :string;
  authenticateGithub() :string;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();