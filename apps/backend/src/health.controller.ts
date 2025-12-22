import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get()
    welcome() {
        return {
            message: 'Prism API is running',
            version: 'v1',
            documentation: '/api/v1',
        };
    }

    @Get('health')
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
