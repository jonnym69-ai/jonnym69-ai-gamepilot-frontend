"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = healthCheck;
function healthCheck(req, res) {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'gamepilot-api',
        version: '1.0.0'
    });
}
//# sourceMappingURL=healthController.js.map