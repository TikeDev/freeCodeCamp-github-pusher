import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  requestPlatformInfo() :string;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();