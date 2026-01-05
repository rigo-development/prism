import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('health')
@Controller()
export class HealthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) { }

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
    async check(@Query('ping') ping?: string) {
        const url = process.env.POSTGRES_PRISMA_URL ||
            process.env.DATABASE_URL ||
            process.env.PRISMA_DATABASE_URL;

        let dbStatus = url ? 'configured' : 'not_configured';
        let dbType = url && !url.startsWith('file:') ? 'postgres' : 'sqlite';

        // Only perform active ping if explicitly requested to save free-tier resources
        if (ping === 'true' && url) {
            try {
                await this.prisma.$queryRaw`SELECT 1`;
                dbStatus = 'connected';
            } catch (error) {
                dbStatus = 'connection_failed';
            }
        }

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: dbStatus,
                type: dbType,
                active_check: ping === 'true'
            },
            config: {
                geminiKeySet: !!this.configService.get('GEMINI_API_KEY'),
            }
        };
    }
}
