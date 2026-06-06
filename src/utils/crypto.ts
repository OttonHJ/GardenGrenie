import "react-native-get-random-values";
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from "tweetnacl-util";

export function generateKeyPair(): { publicKey: string; secretKey: string } {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  };
}

export function encryptDM(
  message: string,
  recipientPublicKeyB64: string,
  mySecretKeyB64: string,
): string {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box(
    decodeUTF8(message),
    nonce,
    decodeBase64(recipientPublicKeyB64),
    decodeBase64(mySecretKeyB64),
  );
  return encodeBase64(new Uint8Array([...nonce, ...encrypted]));
}

export function decryptDM(
  ciphertextB64: string,
  senderPublicKeyB64: string,
  mySecretKeyB64: string,
): string | null {
  const data = decodeBase64(ciphertextB64);
  const nonce = data.slice(0, nacl.box.nonceLength);
  const box = data.slice(nacl.box.nonceLength);
  const result = nacl.box.open(
    box,
    nonce,
    decodeBase64(senderPublicKeyB64),
    decodeBase64(mySecretKeyB64),
  );
  return result ? encodeUTF8(result) : null;
}

export function encryptGroup(message: string, groupKeyB64: string): string {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(decodeUTF8(message), nonce, decodeBase64(groupKeyB64));
  return encodeBase64(new Uint8Array([...nonce, ...encrypted]));
}

export function decryptGroup(ciphertextB64: string, groupKeyB64: string): string | null {
  const data = decodeBase64(ciphertextB64);
  const nonce = data.slice(0, nacl.secretbox.nonceLength);
  const box = data.slice(nacl.secretbox.nonceLength);
  const result = nacl.secretbox.open(box, nonce, decodeBase64(groupKeyB64));
  return result ? encodeUTF8(result) : null;
}
