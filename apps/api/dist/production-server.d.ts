import { Server } from 'http';
import { Server as HTTPSServer } from 'https';
import { Express } from 'express';
declare function startProductionServer(): Promise<HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | Express>;
export { startProductionServer };
//# sourceMappingURL=production-server.d.ts.map