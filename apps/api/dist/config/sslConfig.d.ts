import https from 'https';
export declare const sslConfig: {
    certPath: string;
    keyPath: string;
    caPath: string;
    options: {
        allowHTTP1: boolean;
        minVersion: string;
        honorCipherOrder: boolean;
    };
};
export declare function validateSSLCertificates(): Promise<{
    cert: string;
    key: string;
}>;
export declare function createHTTPSServer(app: any, options?: https.ServerOptions): https.Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
//# sourceMappingURL=sslConfig.d.ts.map