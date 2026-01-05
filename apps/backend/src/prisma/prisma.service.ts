import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import * as path from 'node:path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const url = process.env.POSTGRES_PRISMA_URL ||
            process.env.DATABASE_URL ||
            process.env.PRISMA_DATABASE_URL;

        const isPostgres = url && !url.startsWith('file:');
        let finalUrl: string;

        if (isPostgres) {
            finalUrl = url;
        } else {
            // Local SQLite setup
            const dbPath = path.join(process.cwd(), 'prisma/dev.db');
            finalUrl = `file:${dbPath}`;
        }

        super({
            datasources: {
                db: {
                    url: finalUrl,
                },
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
