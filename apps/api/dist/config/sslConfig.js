"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sslConfig = void 0;
exports.validateSSLCertificates = validateSSLCertificates;
exports.createHTTPSServer = createHTTPSServer;
const https_1 = __importDefault(require("https"));
const promises_1 = __importDefault(require("fs/promises"));
// SSL/HTTPS Configuration for Production
exports.sslConfig = {
    certPath: process.env.SSL_CERT_PATH || './certificates/server.crt',
    keyPath: process.env.SSL_KEY_PATH || './certificates/server.key',
    caPath: process.env.SSL_CA_PATH || './certificates/ca.crt',
    options: {
        allowHTTP1: true,
        minVersion: 'TLSv1.2',
        honorCipherOrder: true
    }
};
// SSL Certificate validation
async function validateSSLCertificates() {
    try {
        console.log('🔒 Validating SSL certificates...');
        const certExists = await fileExists(exports.sslConfig.certPath);
        const keyExists = await fileExists(exports.sslConfig.keyPath);
        if (!certExists) {
            throw new Error(`SSL certificate not found at ${exports.sslConfig.certPath}`);
        }
        if (!keyExists) {
            throw new Error(`SSL private key not found at ${exports.sslConfig.keyPath}`);
        }
        const cert = await promises_1.default.readFile(exports.sslConfig.certPath, 'utf8');
        const key = await promises_1.default.readFile(exports.sslConfig.keyPath, 'utf8');
        if (!cert.includes('BEGIN CERTIFICATE')) {
            throw new Error('Invalid SSL certificate format');
        }
        if (!key.includes('BEGIN PRIVATE KEY')) {
            throw new Error('Invalid SSL private key format');
        }
        console.log('✅ SSL certificates validated successfully');
        return { cert, key };
    }
    catch (error) {
        console.error('❌ SSL certificate validation failed:', error);
        throw new Error(`SSL certificate validation failed: ${error}`);
    }
}
async function fileExists(filePath) {
    try {
        await promises_1.default.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
// Create HTTPS server
function createHTTPSServer(app, options = {}) {
    return https_1.default.createServer(options, app);
}
//# sourceMappingURL=sslConfig.js.map