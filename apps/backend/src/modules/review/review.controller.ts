import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AnalyzeRequestDto, AnalyzeResponseDto } from '../../../../../packages/shared/src';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('review')
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Get('models')
    @ApiOperation({ summary: 'Get available AI models' })
    @ApiResponse({ status: 200, description: 'List of model names', type: [String] })
    async getModels(): Promise<string[]> {
        return this.reviewService.getModels();
    }

    @Post('analyze')
    @ApiOperation({ summary: 'Analyze code for issues' })
    @ApiResponse({ status: 201, description: 'Analysis results', type: AnalyzeResponseDto })
    async analyze(@Body() dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        return this.reviewService.analyze(dto);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get recent review history' })
    @ApiResponse({ status: 200, description: 'List of recent reviews' })
    async getHistory() {
        return this.reviewService.getHistory();
    }
}
