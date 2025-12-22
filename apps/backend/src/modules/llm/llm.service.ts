import { Injectable, Logger } from '@nestjs/common';
import { AnalyzeRequestDto, AnalyzeResponseDto } from '@prism/shared';
import axios from 'axios';

@Injectable()
export class LlmService {
    private readonly logger = new Logger(LlmService.name);
    private readonly apiKey = process.env.OPENAI_API_KEY;

    async analyzeCode(dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        if (!this.apiKey) {
            this.logger.warn('No OPENAI_API_KEY found. Using Mock response.');
            return this.getMockResponse(dto);
        }

        try {
            const systemPrompt = `
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
No markdown, no conversation. Just the JSON.`;

            const userPrompt = `Code to review:\n\n${dto.code}`;

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.2, // Low temp for structured output
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const content = response.data.choices[0].message.content;
            // Simple parse, assuming the LLM obeys. In real prod, use Zod or similar to validate.
            const result = JSON.parse(content);

            return {
                reviewId: this.generateId(),
                ...result,
            };
        } catch (error) {
            this.logger.error('LLM Call failed', error);
            return this.getMockResponse(dto);
        }
    }

    private getMockResponse(dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    reviewId: 'mock-' + this.generateId(),
                    summary: `(MOCK) Analyzed ${dto.language || 'code'} for ${dto.focus}. No API Key provided.`,
                    score: 88,
                    issues: [
                        {
                            line: 2,
                            severity: 'warning',
                            message: 'This is a mock issue. Configure OPENAI_API_KEY to see real results.',
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
