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
    // @ts-expect-error tweetnacl-util naming: encodeUTF8 converts string→Uint8Array at runtime
    encodeUTF8(message),
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
  // @ts-expect-error tweetnacl-util naming: decodeUTF8 converts Uint8Array→string at runtime
  return result ? decodeUTF8(result) : null;
}

export function encryptGroup(message: string, groupKeyB64: string): string {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  // @ts-expect-error tweetnacl-util naming: encodeUTF8 converts string→Uint8Array at runtime
  const encrypted = nacl.secretbox(encodeUTF8(message), nonce, decodeBase64(groupKeyB64));
  return encodeBase64(new Uint8Array([...nonce, ...encrypted]));
}

export function decryptGroup(ciphertextB64: string, groupKeyB64: string): string | null {
  const data = decodeBase64(ciphertextB64);
  const nonce = data.slice(0, nacl.secretbox.nonceLength);
  const box = data.slice(nacl.secretbox.nonceLength);
  const result = nacl.secretbox.open(box, nonce, decodeBase64(groupKeyB64));
  // @ts-expect-error tweetnacl-util naming: decodeUTF8 converts Uint8Array→string at runtime
  return result ? decodeUTF8(result) : null;
}
