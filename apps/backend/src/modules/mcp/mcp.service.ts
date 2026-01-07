import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviewService } from '../review/review.service';

/**
 * MCP Service
 * Implements Model Context Protocol for AI agent integration
 */
@Injectable()
export class McpService {
    constructor(private readonly reviewService: ReviewService) { }

    /**
     * Returns MCP server manifest with capabilities
     */
    getServerManifest() {
        return {
            protocolVersion: '2024-11-05',
            serverInfo: {
                name: 'prism-code-review',
                version: '1.0.0',
                description: 'AI-powered code review assistant with security, performance, and readability analysis'
            },
            capabilities: {
                tools: {},
                resources: {},
                prompts: {}
            }
        };
    }

    /**
     * Lists available MCP tools
     */
    listTools() {
        return {
            tools: [
                {
                    name: 'analyze_code',
                    description: 'Analyze code for security, performance, or readability issues using AI',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            code: {
                                type: 'string',
                                description: 'The code to analyze'
                            },
                            focus: {
                                type: 'string',
                                enum: ['security', 'performance', 'readability'],
                                description: 'Analysis focus area'
                            },
                            language: {
                                type: 'string',
                                description: 'Programming language (optional, auto-detected if not provided)'
                            }
                        },
                        required: ['code', 'focus']
                    }
                },
                {
                    name: 'get_available_models',
                    description: 'Get list of available AI models for code analysis',
                    inputSchema: {
                        type: 'object',
                        properties: {}
                    }
                },
                {
                    name: 'get_review_history',
                    description: 'Retrieve code review history for a session',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sessionId: {
                                type: 'string',
                                description: 'Session ID to retrieve history for'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum number of reviews to return (default: 10)'
                            }
                        }
                    }
                }
            ]
        };
    }

    /**
     * Executes a specific MCP tool
     */
    async callTool(name: string, args: any) {
        switch (name) {
            case 'analyze_code':
                return await this.analyzeCodeTool(args);
            case 'get_available_models':
                return await this.getModelsTool();
            case 'get_review_history':
                return await this.getHistoryTool(args);
            default:
                throw new BadRequestException(`Unknown tool: ${name}`);
        }
    }

    /**
     * Tool: Analyze Code
     */
    private async analyzeCodeTool(args: { code: string; focus: string; language?: string }) {
        if (!args.code || !args.focus) {
            throw new BadRequestException('Missing required arguments: code and focus');
        }

        const validFocus = ['security', 'performance', 'readability', 'bugs'];
        if (!validFocus.includes(args.focus)) {
            throw new BadRequestException(`Invalid focus. Must be one of: ${validFocus.join(', ')}`);
        }

        const result = await this.reviewService.analyze({
            code: args.code,
            focus: args.focus as 'security' | 'performance' | 'readability' | 'bugs',
            language: args.language
        }, 'mcp-session');

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }

    /**
     * Tool: Get Available Models
     */
    private async getModelsTool() {
        const models = await this.reviewService.getModels();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ models }, null, 2)
                }
            ]
        };
    }

    /**
     * Tool: Get Review History
     */
    private async getHistoryTool(args: { sessionId?: string; limit?: number }) {
        const sessionId = args.sessionId || 'mcp-session';
        const history = await this.reviewService.getHistory(sessionId);
        const limited = args.limit ? history.slice(0, args.limit) : history.slice(0, 10);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ history: limited, total: history.length }, null, 2)
                }
            ]
        };
    }

    /**
     * Lists available MCP resources
     */
    async listResources(sessionId?: string) {
        const sid = sessionId || 'mcp-session';
        const history = await this.reviewService.getHistory(sid);

        return {
            resources: [
                {
                    uri: 'prism://models',
                    name: 'Available AI Models',
                    description: 'List of AI models available for code analysis',
                    mimeType: 'application/json'
                },
                {
                    uri: `prism://history/${sid}`,
                    name: 'Review History',
                    description: `Code review history for session ${sid}`,
                    mimeType: 'application/json'
                },
                ...history.map((review, idx) => ({
                    uri: `prism://review/${review.id}`,
                    name: `Review ${idx + 1}: ${review.language || 'unknown'}`,
                    description: `${review.focus} analysis - Score: ${review.score || 'N/A'}`,
                    mimeType: 'application/json'
                }))
            ]
        };
    }

    /**
     * Reads a specific MCP resource
     */
    async readResource(uri: string, sessionId?: string) {
        if (uri === 'prism://models') {
            const models = await this.reviewService.getModels();
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({ models }, null, 2)
                    }
                ]
            };
        }

        if (uri.startsWith('prism://history/')) {
            const sid = uri.split('/')[2] || sessionId || 'mcp-session';
            const history = await this.reviewService.getHistory(sid);
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({ history, total: history.length }, null, 2)
                    }
                ]
            };
        }

        if (uri.startsWith('prism://review/')) {
            const reviewId = uri.split('/')[2];
            const sid = sessionId || 'mcp-session';
            const history = await this.reviewService.getHistory(sid);
            const review = history.find(r => r.id === reviewId);

            if (!review) {
                throw new NotFoundException(`Review not found: ${reviewId}`);
            }

            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(review, null, 2)
                    }
                ]
            };
        }

        throw new NotFoundException(`Resource not found: ${uri}`);
    }

    /**
     * Lists available MCP prompts
     */
    listPrompts() {
        return {
            prompts: [
                {
                    name: 'security_review',
                    description: 'Analyze code for security vulnerabilities',
                    arguments: [
                        {
                            name: 'code',
                            description: 'Code to analyze',
                            required: true
                        },
                        {
                            name: 'language',
                            description: 'Programming language',
                            required: false
                        }
                    ]
                },
                {
                    name: 'performance_review',
                    description: 'Analyze code for performance issues',
                    arguments: [
                        {
                            name: 'code',
                            description: 'Code to analyze',
                            required: true
                        },
                        {
                            name: 'language',
                            description: 'Programming language',
                            required: false
                        }
                    ]
                },
                {
                    name: 'readability_review',
                    description: 'Analyze code for readability improvements',
                    arguments: [
                        {
                            name: 'code',
                            description: 'Code to analyze',
                            required: true
                        },
                        {
                            name: 'language',
                            description: 'Programming language',
                            required: false
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Gets a specific MCP prompt
     */
    getPrompt(name: string, args?: any) {
        const prompts = {
            security_review: {
                name: 'security_review',
                description: 'Security-focused code review',
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Please analyze the following ${args?.language || 'code'} for security vulnerabilities:\n\n${args?.code || '[code will be inserted here]'}\n\nFocus on: SQL injection, XSS, authentication issues, data exposure, and other security concerns.`
                        }
                    }
                ]
            },
            performance_review: {
                name: 'performance_review',
                description: 'Performance-focused code review',
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Please analyze the following ${args?.language || 'code'} for performance issues:\n\n${args?.code || '[code will be inserted here]'}\n\nFocus on: algorithmic complexity, memory usage, unnecessary operations, and optimization opportunities.`
                        }
                    }
                ]
            },
            readability_review: {
                name: 'readability_review',
                description: 'Readability-focused code review',
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Please analyze the following ${args?.language || 'code'} for readability improvements:\n\n${args?.code || '[code will be inserted here]'}\n\nFocus on: naming conventions, code structure, documentation, and maintainability.`
                        }
                    }
                ]
            }
        };

        const prompt = prompts[name];
        if (!prompt) {
            throw new NotFoundException(`Prompt not found: ${name}`);
        }

        return prompt;
    }
}
