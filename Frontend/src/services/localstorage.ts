"use client";

import { encrypt, decrypt } from "@/lib/crypto";

export const storage = {
  async set(key: string, value: unknown) {
    if (typeof window === "undefined") return;

    const ciphertext = await encrypt(JSON.stringify(value));
    localStorage.setItem(key, ciphertext);
  },

  async get<T = unknown>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;

    const ciphertext = localStorage.getItem(key);
    if (!ciphertext) return null;

    try {
      const plaintext = await decrypt(ciphertext);
      return JSON.parse(plaintext) as T;
    } catch {
      return null;
    }
  },

  remove(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};
