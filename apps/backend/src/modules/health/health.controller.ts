import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
    constructor(private readonly configService: ConfigService) { }

    @Get()
    @ApiOperation({ summary: 'Welcome message and API status' })
    welcome() {
        return {
            message: 'Prism AI Code Review API is running',
            version: 'v1.0.0',
            status: 'online',
            documentation: '/api/v1/docs'
        };
    }

    @Get('health')
    @ApiOperation({ summary: 'Health check and configuration status' })
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            config: {
                geminiKeySet: !!this.configService.get('GEMINI_API_KEY'),
            }
        };
    }
}
