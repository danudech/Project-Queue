"use client";

const cryptoKey = "TN31eZq4xyiK/Rlc7Ezt7+5NC3XEi8c0cu1zoTg9FYU=";

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getKeyFromBase64Secret(secretB64: string) {
  const raw = base64ToBytes(secretB64);

  if (raw.length !== 16 && raw.length !== 32) {
    throw new Error(`AES key must be 16 or 32 bytes. Got ${raw.length} bytes.`);
  }

  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encrypt(plainText: string) {
  const key = await getKeyFromBase64Secret(cryptoKey as string);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plainText);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  return btoa(
    JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    }),
  );
}

export async function decrypt(token: string) {
  const key = await getKeyFromBase64Secret(cryptoKey as string);

  const parsed = JSON.parse(atob(token));
  const iv = new Uint8Array(parsed.iv);
  const data = new Uint8Array(parsed.data);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  return new TextDecoder().decode(decrypted);
}
