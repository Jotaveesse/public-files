/**
 * Password-based encryption for a vault blob.
 *
 * Format v1: self-describing (version + KDF params + cipher in the header),
 * header is authenticated via AES-GCM AAD.
 */

// ---------- Types & constants ----------

export interface KdfParams {
    name: "PBKDF2";
    hash: "SHA-256";
    iterations: number;
}

export interface EncryptedPackage {
    version: number; // format version
    cipher: "AES-256-GCM";
    kdf: KdfParams;
    salt: string; // base64
    iv: string; // base64
    ciphertext: string; // base64 (includes 128-bit GCM tag)
}

export const FORMAT_VERSION = 1;
const CURRENT_ITERATIONS = 600_000; // OWASP guidance for PBKDF2-HMAC-SHA256
const MIN_ITERATIONS = 100_000; // reject downgraded params
const MAX_ITERATIONS = 10_000_000; // reject DoS-by-params
const SALT_BYTES = 16;
const IV_BYTES = 12;

// TS 5.7+: WebCrypto requires ArrayBuffer-backed views (not SharedArrayBuffer)
type Bytes = Uint8Array<ArrayBuffer>;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

// ---------- Helpers ----------

const toB64 = (bytes: Uint8Array): string => {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
        s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(s);
};

const fromB64 = (b64: string): Bytes => {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
};

/** Canonical, deterministic header bytes used as AES-GCM additional data. */
function headerAad(v: number, cipher: string, kdf: KdfParams): Bytes {
    return encoder.encode(JSON.stringify([v, cipher, kdf.name, kdf.hash, kdf.iterations]));
}

function validateKdf(kdf: KdfParams): void {
    if (
        kdf?.name !== "PBKDF2" ||
        kdf.hash !== "SHA-256" ||
        !Number.isInteger(kdf.iterations) ||
        kdf.iterations < MIN_ITERATIONS ||
        kdf.iterations > MAX_ITERATIONS
    ) {
        throw new Error("Unsupported or unsafe KDF parameters.");
    }
}

// ---------- Key derivation ----------

async function deriveKey(password: string, salt: Bytes, kdf: KdfParams): Promise<CryptoKey> {
    validateKdf(kdf);

    // NFKC so the same passphrase typed on different devices/keyboards matches
    const material = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password.normalize("NFKC")),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: kdf.iterations, hash: kdf.hash },
        material,
        { name: "AES-GCM", length: 256 },
        false, // non-extractable
        ["encrypt", "decrypt"]
    );
}

// ---------- Public API ----------

export async function encryptText(text: string, password: string): Promise<string> {
    const kdf: KdfParams = { name: "PBKDF2", hash: "SHA-256", iterations: CURRENT_ITERATIONS };
    const cipher = "AES-256-GCM" as const;

    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const key = await deriveKey(password, salt, kdf);

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
            additionalData: headerAad(FORMAT_VERSION, cipher, kdf),
            tagLength: 128,
        },
        key,
        encoder.encode(text)
    );

    const pkg: EncryptedPackage = {
        version: FORMAT_VERSION,
        cipher,
        kdf,
        salt: toB64(salt),
        iv: toB64(iv),
        ciphertext: toB64(new Uint8Array(ciphertext)),
    };
    return JSON.stringify(pkg);
}

export async function decryptText(packageJson: string, password: string): Promise<string> {
    const fail = () => new Error("Decryption failed: wrong password or corrupted data.");

    try {
        const pkg = JSON.parse(packageJson) as Partial<EncryptedPackage>;
        if (pkg.version !== FORMAT_VERSION || pkg.cipher !== "AES-256-GCM" || !pkg.kdf) {
            throw new Error("Unsupported vault format version.");
        }

        const salt = fromB64(pkg.salt!);
        const iv = fromB64(pkg.iv!);
        const ciphertext = fromB64(pkg.ciphertext!);
        if (iv.length !== IV_BYTES) throw fail();

        const key = await deriveKey(password, salt, pkg.kdf);
        const plain = new Uint8Array(
            await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv,
                    additionalData: headerAad(pkg.version, pkg.cipher, pkg.kdf),
                    tagLength: 128,
                },
                key,
                ciphertext
            )
        );

        return decoder.decode(plain);
    } catch (err) {
        if (err instanceof Error && err.message.startsWith("Unsupported")) throw err;
        throw fail();
    }
}

/**
 * True if the payload uses an older format or weaker KDF settings.
 * After a successful decrypt, call encryptText() again and store the result.
 */
export function needsUpgrade(packageJson: string): boolean {
    try {
        const pkg = JSON.parse(packageJson) as Partial<EncryptedPackage>;
        return pkg.version !== FORMAT_VERSION || (pkg.kdf?.iterations ?? 0) < CURRENT_ITERATIONS;
    } catch {
        return false;
    }
}