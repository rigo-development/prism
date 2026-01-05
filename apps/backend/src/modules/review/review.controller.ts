import { Body, Controller, Get, Post, Delete, Headers } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AnalyzeRequestDto, AnalyzeResponseDto, HistoryItemDto } from '../../../../../packages/shared/src';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

@ApiTags('review')
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Get('models')
    @ApiOperation({ summary: 'Get available AI models', description: 'Fetch a list of supported AI models for code analysis.' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved model list', type: [String] })
    async getModels(): Promise<string[]> {
        return this.reviewService.getModels();
    }

    @Post('analyze')
    @ApiOperation({ summary: 'Analyze code for issues', description: 'Submit code for AI review based on a specific focus (security, performance, etc.).' })
    @ApiHeader({
        name: 'x-session-id',
        description: 'Unique session ID for history tracking',
        required: false,
        example: 'user-session-123'
    })
    @ApiResponse({ status: 201, description: 'Analysis complete', type: AnalyzeResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
    async analyze(
        @Body() dto: AnalyzeRequestDto,
        @Headers() headers: Record<string, string>
    ): Promise<AnalyzeResponseDto> {
        const sessionId = headers['x-session-id'];
        return this.reviewService.analyze(dto, sessionId);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get recent review history', description: 'Retrieve history of code reviews associated with the current session.' })
    @ApiHeader({
        name: 'x-session-id',
        description: 'Unique session ID for history tracking',
        required: false,
        example: 'user-session-123'
    })
    @ApiResponse({ status: 200, description: 'History retrieved successfully', type: [AnalyzeResponseDto] })
    async getHistory(@Headers() headers: Record<string, string>) {
        const sessionId = headers['x-session-id'];
        return this.reviewService.getHistory(sessionId);
    }

    @Delete('history')
    @ApiOperation({ summary: 'Clear session history', description: 'Delete all code review history associated with the current session.' })
    @ApiHeader({
        name: 'x-session-id',
        description: 'Unique session ID for history tracking',
        required: false,
        example: 'user-session-123'
    })
    @ApiResponse({ status: 200, description: 'History cleared successfully' })
    @ApiResponse({ status: 400, description: 'Session ID missing' })
    async clearHistory(@Headers() headers: Record<string, string>) {
        const sessionId = headers['x-session-id'];
        return this.reviewService.clearHistory(sessionId);
    }
}
