import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeRequestDto {
    @ApiProperty({
        description: 'The code snippet to analyze',
        example: 'function hello() { console.log("world"); }'
    })
    code!: string;

    @ApiProperty({
        description: 'Programming language of the code',
        example: 'javascript',
        required: false
    })
    language?: string;

    @ApiProperty({
        description: 'Focus area for the review',
        enum: ['security', 'performance', 'readability', 'bugs'],
        example: 'readability'
    })
    focus!: 'security' | 'performance' | 'readability' | 'bugs';

    @ApiProperty({
        description: 'AI model to use for analysis',
        example: 'gemini-1.5-flash',
        required: false
    })
    model?: string;
}

export class ReviewIssue {
    @ApiProperty({ description: 'Line number where the issue occurs', example: 5 })
    line!: number;

    @ApiProperty({
        description: 'Severity level of the issue',
        enum: ['info', 'warning', 'critical'],
        example: 'warning'
    })
    severity!: 'info' | 'warning' | 'critical';

    @ApiProperty({ description: 'Description of the issue', example: 'Missing semi-colon' })
    message!: string;

    @ApiProperty({
        description: 'Suggested fix for the issue',
        example: 'console.log("world");',
        required: false
    })
    suggestion?: string;
}

export class AnalyzeResponseDto {
    @ApiProperty({ description: 'Unique identifier for the review', example: 'uuid-123' })
    reviewId!: string;

    @ApiProperty({ description: 'High-level summary of the code review', example: 'Code looks good but has some minor issues.' })
    summary!: string;

    @ApiProperty({ description: 'Overall code quality score (0-100)', example: 85 })
    score!: number;

    @ApiProperty({ description: 'List of detected issues', type: () => [ReviewIssue] })
    issues!: ReviewIssue[];

    @ApiProperty({ description: 'The language detected by the AI', example: 'typescript', required: false })
    detectedLanguage?: string;
}

export class HistoryItemDto {
    @ApiProperty({ description: 'Unique identifier for the history item' })
    id!: string;

    @ApiProperty({ description: 'The analyzed code' })
    code!: string;

    @ApiProperty({ description: 'Language of the code' })
    language!: string;

    @ApiProperty({ description: 'Focus area of the review' })
    focus!: string;

    @ApiProperty({ description: 'Summary of the feedback' })
    summary!: string;

    @ApiProperty({ description: 'Score assigned' })
    score!: number;

    @ApiProperty({ description: 'Timestamp when the review was created' })
    createdAt!: Date;
}
