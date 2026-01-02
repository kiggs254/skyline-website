import { SiteSettings } from '../types';
import { api } from './api';

// --- Local Upload Logic (via PHP API) ---
const uploadToLocal = async (file: File): Promise<string | null> => {
    return await api.upload(file);
};

// --- Wasabi (S3 Compatible) Upload Logic ---
// ... (Wasabi logic remains valid if you want to keep it as an option, 
// but sticking to local/PHP for simplicity as requested)

// Helper to convert ArrayBuffer to a hexadecimal string
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return bufferToHex(hashBuffer);
}

async function hmacSha256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
    const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + key), dateStamp);
    const kRegion = await hmacSha256(kDate, regionName);
    const kService = await hmacSha256(kRegion, serviceName);
    return hmacSha256(kService, 'aws4_request');
}

const uploadToWasabi = async (file: File, config: SiteSettings['wasabi']): Promise<string | null> => {
    if (!config || !config.accessKeyId || !config.secretAccessKey || !config.region || !config.bucket) {
        alert('Wasabi storage is not configured correctly. Please check your settings.');
        return null;
    }
    
    const service = 's3';
    const host = `${config.bucket}.${service}.${config.region}.wasabisys.com`;
    const endpoint = `https://${host}`;
    const sanitizedFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const canonicalUri = `/${sanitizedFileName}`;
    const canonicalQuerystring = '';
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;
    
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${config.region}/${service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

    const signingKey = await getSignatureKey(config.secretAccessKey, dateStamp, config.region, service);
    const finalKey = await crypto.subtle.importKey('raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', finalKey, new TextEncoder().encode(stringToSign));
    const signatureHex = bufferToHex(signature);

    const authorizationHeader = `${algorithm} Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;

    try {
        const response = await fetch(`${endpoint}${canonicalUri}`, {
            method: 'PUT',
            headers: {
                'Authorization': authorizationHeader,
                'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
                'x-amz-date': amzDate,
                'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Wasabi Upload Error:', errorText);
            alert(`Wasabi upload failed: ${response.statusText}. Check console for details.`);
            return null;
        }

        return `${endpoint}${canonicalUri}`;

    } catch (e) {
        console.error('Fetch error during Wasabi upload:', e);
        alert(`An error occurred during upload: ${(e as Error).message}`);
        return null;
    }
};

export const uploadFile = async (file: File, settings: SiteSettings): Promise<string | null> => {
    if (settings.storageProvider === 'wasabi') {
        return uploadToWasabi(file, settings.wasabi);
    }
    // Default to Local PHP upload
    return uploadToLocal(file);
};