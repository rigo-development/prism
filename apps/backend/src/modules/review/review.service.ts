import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { AnalyzeRequestDto, AnalyzeResponseDto } from '../../../../../packages/shared/src';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewService {
    constructor(
        private readonly llmService: LlmService,
        private readonly prisma: PrismaService
    ) { }

    async analyze(dto: AnalyzeRequestDto, sessionId?: string): Promise<AnalyzeResponseDto> {
        const result = await this.llmService.analyzeCode(dto);

        // Save to DB
        const savedReview = await this.prisma.review.create({
            data: {
                sessionId,
                code: dto.code,
                language: result.detectedLanguage || dto.language || 'plaintext',
                focus: dto.focus,
                feedback: JSON.stringify(result),
            }
        });

        // Trigger cleanup (fire and forget for now, simple enough)
        this.cleanupOldReviews().catch(e => console.error('Cleanup failed', e));

        return {
            ...result,
            reviewId: savedReview.id
        };
    }

    async getModels(): Promise<string[]> {
        return this.llmService.listModels();
    }

    async getHistory(sessionId?: string, limit: number = 20): Promise<any[]> {
        const reviews = await this.prisma.review.findMany({
            where: sessionId ? { sessionId } : undefined,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return reviews.map(r => {
            let feedback;
            try {
                feedback = JSON.parse(r.feedback);
            } catch (e) {
                feedback = { summary: 'Error parsing feedback', score: 0 };
            }

            return {
                id: r.id,
                code: r.code,
                language: r.language,
                focus: r.focus,
                ...feedback,
                createdAt: r.createdAt,
            };
        });
    }

    async clearHistory(sessionId: string): Promise<void> {
        if (!sessionId) return;
        await this.prisma.review.deleteMany({
            where: { sessionId }
        });
    }

    private async cleanupOldReviews(): Promise<void> {
        // Automatically history clear after 30 days only for postgres as requested
        if (!this.prisma.isPostgres) return;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            const result = await this.prisma.review.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo
                    }
                }
            });
            if (result.count > 0) {
                console.log(`[Cleanup] Deleted ${result.count} old reviews from Postgres`);
            }
        } catch (e) {
            console.error('[Cleanup] Failed to remove old records', e);
        }
    }
}
