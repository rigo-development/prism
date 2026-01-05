import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeCode } from './client';

global.fetch = vi.fn();

describe('API Client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('analyzeCode calls correct endpoint and returns data', async () => {
        const mockResponse = { summary: 'Good job', score: 100, issues: [] };
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await analyzeCode({
            code: 'console.log("test")',
            focus: 'readability',
            language: 'javascript'
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/review/analyze'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'x-session-id': expect.any(String)
                }),
                body: expect.stringContaining('readability')
            })
        );
        expect(result).toEqual(mockResponse);
    });
});
