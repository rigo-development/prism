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

    async analyze(dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        const result = await this.llmService.analyzeCode(dto);

        // Save to DB
        const savedReview = await this.prisma.review.create({
            data: {
                code: dto.code,
                language: result.detectedLanguage || dto.language || 'plaintext',
                focus: dto.focus,
                feedback: JSON.stringify(result),
            }
        });

        return {
            ...result,
            reviewId: savedReview.id
        };
    }

    async getModels(): Promise<string[]> {
        return this.llmService.listModels();
    }

    async getHistory(limit: number = 10): Promise<any[]> {
        const reviews = await this.prisma.review.findMany({
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
}
