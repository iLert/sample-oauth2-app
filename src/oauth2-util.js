import crypto from "crypto";

function sha256(plain) {
    return crypto.createHash("sha256").update(plain).digest();
}

function base64urlencode(buf) {
    return buf.toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function generateCodeVerifier() {
    return crypto.pseudoRandomBytes(32).toString("hex");
}

function getCodeChallengeForVerifier(codeVerifier) {
    return base64urlencode(sha256(codeVerifier));
}

function uuid() {
    return crypto.randomUUID();
}

export {
    generateCodeVerifier,
    getCodeChallengeForVerifier,
    uuid
};
