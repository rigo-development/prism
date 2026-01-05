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
                language: dto.language || 'plaintext',
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
}
