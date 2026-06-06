import * as SecureStore from "expo-secure-store";

export interface KeyPair {
  publicKey: string | null;
  secretKey: string | null;
}

export async function saveKeyPair(kp: { publicKey: string; secretKey: string }): Promise<void> {
  await SecureStore.setItemAsync("secretKey", kp.secretKey);
  await SecureStore.setItemAsync("publicKey", kp.publicKey);
}

export async function loadKeyPair(): Promise<KeyPair> {
  return {
    secretKey: await SecureStore.getItemAsync("secretKey"),
    publicKey: await SecureStore.getItemAsync("publicKey"),
  };
}
