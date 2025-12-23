import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AnalyzeRequestDto, AnalyzeResponseDto } from '@prism/shared';

@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Get('models')
    async getModels(): Promise<string[]> {
        return this.reviewService.getModels();
    }

    @Post('analyze')
    async analyze(@Body() dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        return this.reviewService.analyze(dto);
    }
}
