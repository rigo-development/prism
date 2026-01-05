import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as path from 'node:path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    public readonly isPostgres: boolean;

    constructor() {
        const pgUrl = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        const dbUrl = process.env.DATABASE_URL;

        // Local Dev: Always force SQLite unless we are actually on Vercel
        const isPg = !!process.env.VERCEL;
        let finalUrl: string;

        if (isPg) {
            finalUrl = pgUrl || dbUrl!;
        } else {
            const localPath = path.join(process.cwd(), 'prisma/dev.db');
            finalUrl = dbUrl && dbUrl.startsWith('file:') ? dbUrl : `file:${localPath}`;
            process.env.DATABASE_URL = finalUrl;
        }

        super({
            datasources: {
                db: {
                    url: finalUrl,
                },
            },
        });

        this.isPostgres = isPg;
        console.log(`[Prisma] Initialized in ${this.isPostgres ? 'POSTGRES' : 'SQLITE'} mode`);
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
