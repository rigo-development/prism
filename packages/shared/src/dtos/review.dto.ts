export class AnalyzeRequestDto {
    code!: string;
    language?: string;
    focus!: 'security' | 'performance' | 'readability' | 'bugs';
    model?: string;
}

export class AnalyzeResponseDto {
    reviewId!: string;
    summary!: string;
    score!: number;
    issues!: ReviewIssue[];
}

export class ReviewIssue {
    line!: number;
    severity!: 'info' | 'warning' | 'critical';
    message!: string;
    suggestion?: string;
}
