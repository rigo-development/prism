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
    detectedLanguage?: string;
}

export class ReviewIssue {
    line!: number;
    severity!: 'info' | 'warning' | 'critical';
    message!: string;
    suggestion?: string;
}

export class HistoryItemDto {
    id!: string;
    code!: string;
    language!: string;
    focus!: string;
    summary!: string;
    score!: number;
    createdAt!: Date;
}
