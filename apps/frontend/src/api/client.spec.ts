import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchModels, fetchHistory, clearHistory, analyzeCode } from './client';

global.fetch = vi.fn();

describe('API Client - Extended Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Session Management', () => {
        it('generates and stores session ID on first call', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ([])
            });

            await fetchHistory();

            const sessionId = localStorage.getItem('prism_session_id');
            expect(sessionId).toBeTruthy();
            expect(sessionId!.length).toBeGreaterThan(10);
        });

        it('reuses existing session ID', async () => {
            const existingSessionId = 'test-session-123';
            localStorage.setItem('prism_session_id', existingSessionId);

            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ([])
            });

            await fetchHistory();

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-session-id': existingSessionId
                    })
                })
            );
        });

        it('includes session ID in all API calls', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ([])
            });

            await fetchModels();
            await fetchHistory();
            await analyzeCode({ code: 'test', focus: 'security' });

            const calls = (fetch as any).mock.calls;
            calls.forEach((call: any) => {
                expect(call[1].headers['x-session-id']).toBeTruthy();
            });
        });
    });

    describe('fetchModels', () => {
        it('fetches available models successfully', async () => {
            const mockModels = ['gemini-1.5-flash', 'gemini-1.5-pro'];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockModels
            });

            const result = await fetchModels();

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/review/models'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-session-id': expect.any(String)
                    })
                })
            );
            expect(result).toEqual(mockModels);
        });

        it('throws error when fetch fails', async () => {
            (fetch as any).mockResolvedValue({
                ok: false,
                status: 500
            });

            await expect(fetchModels()).rejects.toThrow('Failed to fetch models');
        });
    });

    describe('fetchHistory', () => {
        it('fetches history successfully', async () => {
            const mockHistory = [
                {
                    id: '1',
                    code: 'test',
                    language: 'python',
                    focus: 'security',
                    summary: 'Test',
                    score: 85,
                    createdAt: new Date().toISOString()
                }
            ];

            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockHistory
            });

            const result = await fetchHistory();

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/review/history'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-session-id': expect.any(String)
                    })
                })
            );
            expect(result).toEqual(mockHistory);
        });

        it('returns empty array when no history exists', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => []
            });

            const result = await fetchHistory();
            expect(result).toEqual([]);
        });

        it('throws error when fetch fails', async () => {
            (fetch as any).mockResolvedValue({
                ok: false,
                status: 404
            });

            await expect(fetchHistory()).rejects.toThrow('Failed to fetch history');
        });
    });

    describe('clearHistory', () => {
        it('clears history successfully', async () => {
            (fetch as any).mockResolvedValue({
                ok: true
            });

            await clearHistory();

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/review/history'),
                expect.objectContaining({
                    method: 'DELETE',
                    headers: expect.objectContaining({
                        'x-session-id': expect.any(String)
                    })
                })
            );
        });

        it('throws error when clear fails', async () => {
            (fetch as any).mockResolvedValue({
                ok: false,
                status: 500
            });

            await expect(clearHistory()).rejects.toThrow('Failed to clear history');
        });
    });

    describe('analyzeCode', () => {
        it('sends correct request with all parameters', async () => {
            const mockResponse = {
                summary: 'Good code',
                score: 90,
                issues: [],
                detectedLanguage: 'javascript',
                reviewId: '123'
            };

            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const request = {
                code: 'console.log("test")',
                focus: 'readability' as const,
                language: 'javascript',
                model: 'gemini-1.5-flash'
            };

            const result = await analyzeCode(request);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/review/analyze'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'x-session-id': expect.any(String)
                    }),
                    body: JSON.stringify(request)
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles security focus mode', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ summary: 'Test', score: 80, issues: [] })
            });

            await analyzeCode({
                code: 'SELECT * FROM users',
                focus: 'security'
            });

            const callBody = JSON.parse((fetch as any).mock.calls[0][1].body);
            expect(callBody.focus).toBe('security');
        });

        it('handles performance focus mode', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ summary: 'Test', score: 80, issues: [] })
            });

            await analyzeCode({
                code: 'for loop test',
                focus: 'performance'
            });

            const callBody = JSON.parse((fetch as any).mock.calls[0][1].body);
            expect(callBody.focus).toBe('performance');
        });

        it('handles readability focus mode', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ summary: 'Test', score: 80, issues: [] })
            });

            await analyzeCode({
                code: 'function test() {}',
                focus: 'readability'
            });

            const callBody = JSON.parse((fetch as any).mock.calls[0][1].body);
            expect(callBody.focus).toBe('readability');
        });

        it('throws error when analysis fails', async () => {
            (fetch as any).mockResolvedValue({
                ok: false,
                status: 400
            });

            await expect(analyzeCode({
                code: 'test',
                focus: 'security'
            })).rejects.toThrow('Failed to analyze code');
        });

        it('handles network errors', async () => {
            (fetch as any).mockRejectedValue(new Error('Network error'));

            await expect(analyzeCode({
                code: 'test',
                focus: 'security'
            })).rejects.toThrow('Network error');
        });
    });

    describe('API URL Configuration', () => {
        it('uses environment variable for API URL if available', async () => {
            // Note: This test assumes VITE_API_URL is set or defaults to localhost
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ([])
            });

            await fetchModels();

            expect(fetch).toHaveBeenCalledWith(
                expect.stringMatching(/\/review\/models$/),
                expect.any(Object)
            );
        });
    });
});
