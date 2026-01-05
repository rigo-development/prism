import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('health')
@Controller()
export class HealthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) { }

    @Get()
    @ApiOperation({ summary: 'Welcome message and API status', description: 'Returns a simple welcome message and basic API metadata.' })
    @ApiResponse({ status: 200, description: 'API is alive and welcoming' })
    welcome() {
        return {
            message: 'Prism AI Code Review API is running',
            version: 'v1.0.0',
            status: 'online',
            documentation: '/api/v1/docs'
        };
    }

    @Get('health')
    @ApiOperation({ summary: 'Health check and configuration status', description: 'Provides detailed health information including database connection status and environment configuration.' })
    @ApiResponse({ status: 200, description: 'Health statistics retrieved' })
    async check(@Query('ping') ping?: string) {
        const url = process.env.PRISMA_DATABASE_URL ||
            process.env.POSTGRES_PRISMA_URL ||
            process.env.DATABASE_URL;

        let dbStatus = url ? 'configured' : 'not_configured';
        const isPostgres = url && !url.startsWith('file:') && !url.includes('dev.db');
        let dbType = isPostgres ? 'postgres' : 'sqlite';

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
