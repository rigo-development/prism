import { AnalyzeRequestDto, AnalyzeResponseDto } from '@prism/shared';

const API_URL = 'http://localhost:3000/api/v1';

export async function analyzeCode(data: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
    const response = await fetch(`${API_URL}/review/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to analyze code');
    }

    return response.json();
}

export async function fetchModels(): Promise<string[]> {
    const response = await fetch(`${API_URL}/review/models`);
    if (!response.ok) {
        throw new Error('Failed to fetch models');
    }
    return response.json();
}
