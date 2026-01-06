import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as path from 'node:path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    public readonly isPostgres: boolean;

    constructor() {
        // Fallback chain for Postgres URLs (common in Vercel/Neon/Supabase)
        const pgUrl = process.env.PRISMA_DATABASE_URL ||
            process.env.POSTGRES_PRISMA_URL ||
            process.env.POSTGRES_URL;

        const dbUrl = process.env.DATABASE_URL;

        // Local Dev fallback: If not on Vercel, we might still want to use Postgres if pgUrl is set
        const isPg = !!(process.env.VERCEL || (pgUrl && pgUrl.startsWith('postgres')));
        let finalUrl: string = '';

        if (isPg) {
            finalUrl = pgUrl || dbUrl || '';
            if (!finalUrl && process.env.VERCEL) {
                console.error('[Prisma] ERROR: Running on Vercel but no database URL found (PRISMA_DATABASE_URL, POSTGRES_PRISMA_URL, or DATABASE_URL).');
            }
        } else {
            const localPath = path.join(process.cwd(), 'prisma/dev.db');
            finalUrl = dbUrl && dbUrl.startsWith('file:') ? dbUrl : `file:${localPath}`;
            // Force it for the engine
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
        console.log(`[Prisma] Mode: ${this.isPostgres ? 'POSTGRES' : 'SQLITE'}`);
        if (finalUrl) {
            console.log(`[Prisma] URL Target: ${finalUrl.split('@').pop()?.split('?')[0]}`);
        }
    }

    async onModuleInit() {
        await this.$connect().catch(err => {
            console.error('[Prisma] Error connecting to database during initialization:', err.message);
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
