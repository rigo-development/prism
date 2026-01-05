import { Body, Controller, Get, Post, Delete, Headers } from '@nestjs/common';
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
    async analyze(
        @Body() dto: AnalyzeRequestDto,
        @Headers() headers: Record<string, string>
    ): Promise<AnalyzeResponseDto> {
        const sessionId = headers['x-session-id'];
        return this.reviewService.analyze(dto, sessionId);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get recent review history' })
    @ApiResponse({ status: 200, description: 'List of recent reviews' })
    async getHistory(@Headers() headers: Record<string, string>) {
        const sessionId = headers['x-session-id'];
        return this.reviewService.getHistory(sessionId);
    }

    @Delete('history')
    @ApiOperation({ summary: 'Clear session history' })
    @ApiResponse({ status: 200, description: 'History cleared' })
    async clearHistory(@Headers() headers: Record<string, string>) {
        const sessionId = headers['x-session-id'];
        if (!sessionId) return;
        return this.reviewService.clearHistory(sessionId);
    }
}
