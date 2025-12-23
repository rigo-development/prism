import { Injectable, Logger } from '@nestjs/common';
import { AnalyzeRequestDto, AnalyzeResponseDto } from '@prism/shared';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LlmService {
    private readonly logger = new Logger(LlmService.name);
    private genAI: GoogleGenerativeAI | null = null;
    private readonly apiKey: string | undefined;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        }
    }

    async listModels(): Promise<string[]> {
        if (!this.apiKey) {
            return ['mock-model'];
        }

        try {
            const response = await axios.get(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`
            );

            // Filter for models that support generateContent
            const models = response.data.models
                .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
                .map((m: any) => m.name.replace('models/', ''));

            return models;
        } catch (error) {
            this.logger.error('Failed to list models from Gemini API', error);
            // Fallback to a safe list if API fails
            return [
                'gemini-1.5-flash',
                'gemini-1.5-flash-8b',
                'gemini-1.5-pro',
                'gemini-2.0-flash-exp'
            ];
        }
    }

    async analyzeCode(dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        if (!this.genAI) {
            this.logger.warn('No GEMINI_API_KEY found. Using Mock response.');
            return this.getMockResponse(dto);
        }

        try {
            const modelName = dto.model || 'gemini-1.5-flash-8b';
            const model = this.genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: `
You are Prism, an elite code review AI.
Your goal is to review the code with a focus on: ${dto.focus.toUpperCase()}.
Return ONLY valid JSON matching this structure:
{
  "summary": "Brief high-level summary",
  "score": number (0-100),
  "issues": [
    {
      "line": number,
      "severity": "info" | "warning" | "critical",
      "message": "Short explanation",
      "suggestion": "Refactored code snippet if applicable (optional)"
    }
  ]
}
No markdown, no conversation. Just the JSON.`,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const userPrompt = `Code to review:\n\n${dto.code}`;

            const result = await model.generateContent(userPrompt);
            const response = result.response;
            const content = response.text();

            // Parse the JSON response
            const parsedResult = JSON.parse(content);

            return {
                reviewId: this.generateId(),
                ...parsedResult,
            };
        } catch (error) {
            this.logger.error('Gemini Call failed', error);
            return this.getMockResponse(dto);
        }
    }

    private getMockResponse(dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    reviewId: 'mock-' + this.generateId(),
                    summary: `(MOCK) Analyzed ${dto.language || 'code'} for ${dto.focus}. No GEMINI_API_KEY or error.`,
                    score: 88,
                    issues: [
                        {
                            line: 2,
                            severity: 'warning',
                            message: 'This is a mock issue. Configure GEMINI_API_KEY to see real results.',
                            suggestion: 'const real = true;'
                        }
                    ]
                });
            }, 1000);
        });
    }

    private generateId(): string {
        return Math.random().toString(36).substring(7);
    }
}
