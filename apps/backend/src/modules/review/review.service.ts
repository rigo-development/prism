import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { AnalyzeRequestDto, AnalyzeResponseDto } from '@prism/shared';

@Injectable()
export class ReviewService {
    constructor(private readonly llmService: LlmService) { }

    async analyze(dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        return this.llmService.analyzeCode(dto);
    }

    async getModels(): Promise<string[]> {
        return this.llmService.listModels();
    }
}
