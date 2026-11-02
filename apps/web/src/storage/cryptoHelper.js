/**
 * cryptoHelper.js — Web Crypto API AES-GCM client-side encryption
 * Provides local at-rest protection for sensitive notes & personal health entries
 * when App Lock / Passphrase is set by the user.
 */

export class CryptoHelper {
  /**
   * Derive a 256-bit AES-GCM key from user PIN/passphrase using PBKDF2
   */
  static async deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a text string. Returns base64 encoded payload { iv, salt, ciphertext }
   */
  static async encrypt(plainText, passphrase) {
    if (!plainText || plainText.trim() === '') return '';
    if (!passphrase) return plainText; // unencrypted fallback

    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(passphrase, salt);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    return JSON.stringify({
      version: 1,
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext)),
    });
  }

  /**
   * Decrypt a base64 encoded payload with user passphrase
   */
  static async decrypt(encryptedPayload, passphrase) {
    if (!encryptedPayload) return '';
    if (!passphrase) return encryptedPayload;

    try {
      const parsed = JSON.parse(encryptedPayload);
      if (!parsed.salt || !parsed.iv || !parsed.data) {
        return encryptedPayload; // Bukan format terenkripsi
      }

      const salt = new Uint8Array(parsed.salt);
      const iv = new Uint8Array(parsed.iv);
      const data = new Uint8Array(parsed.data);
      const key = await this.deriveKey(passphrase, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      console.warn('[HaidKu] Gagal mendekripsi catatan (PIN salah atau data rusak):', e);
      return '[Terenkripsi — Masukkan PIN untuk membuka]';
    }
  }
}
