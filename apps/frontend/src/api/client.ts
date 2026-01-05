import { AnalyzeRequestDto, AnalyzeResponseDto } from '@prism/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function getSessionId() {
    let sid = localStorage.getItem('prism_session_id');
    if (!sid) {
        sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('prism_session_id', sid);
    }
    return sid;
}

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
});

export async function analyzeCode(data: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
    const response = await fetch(`${API_URL}/review/analyze`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to analyze code');
    }

    return response.json();
}

export async function fetchModels(): Promise<string[]> {
    const response = await fetch(`${API_URL}/review/models`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch models');
    }
    return response.json();
}

export async function fetchHistory(): Promise<any[]> {
    const response = await fetch(`${API_URL}/review/history`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }
    return response.json();
}

export async function clearHistory(): Promise<void> {
    const response = await fetch(`${API_URL}/review/history`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to clear history');
    }
}
