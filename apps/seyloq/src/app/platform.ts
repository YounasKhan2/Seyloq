import { createLocalFirstApp, FakeMessageTransport } from "./local-first";
import { BrowserStorageLocalRepository } from "./local-first";
import { UuidV7Generator } from "./identity";
import { createTauriNativeLocalFirstApp, isTauriRuntime } from "./tauri-native";

export function createSeyloqApplication() {
  if (isTauriRuntime()) {
    return createTauriNativeLocalFirstApp();
  }

  return createLocalFirstApp({
    repository: new BrowserStorageLocalRepository("seyloq.browser-dev.v1"),
    transport: new FakeMessageTransport(),
    ids: new UuidV7Generator(),
  });
}
