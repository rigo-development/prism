import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { McpService } from './mcp.service';

/**
 * MCP (Model Context Protocol) Controller
 * Exposes Prism's code review capabilities as MCP tools for AI agents
 * Compatible with ChatGPT, Claude, and other MCP-enabled AI assistants
 */
@ApiTags('mcp')
@Controller('mcp')
export class McpController {
    constructor(private readonly mcpService: McpService) { }

    /**
     * MCP Discovery Endpoint
     * Returns available tools, resources, and prompts
     */
    @Get('discovery')
    @ApiOperation({
        summary: 'MCP Discovery',
        description: 'Returns MCP server capabilities (tools, resources, prompts)'
    })
    @ApiResponse({ status: 200, description: 'MCP server manifest' })
    async getDiscovery() {
        return this.mcpService.getServerManifest();
    }

    /**
     * MCP Tools List
     * Returns available tools that AI agents can invoke
     */
    @Post('tools/list')
    @ApiOperation({
        summary: 'List MCP Tools',
        description: 'Returns available code review tools for AI agents'
    })
    @ApiResponse({ status: 200, description: 'List of available tools' })
    async listTools() {
        return this.mcpService.listTools();
    }

    /**
     * MCP Tool Invocation
     * Executes a specific tool with provided arguments
     */
    @Post('tools/call')
    @ApiOperation({
        summary: 'Call MCP Tool',
        description: 'Invoke a code review tool with specified parameters'
    })
    @ApiResponse({ status: 200, description: 'Tool execution result' })
    @ApiResponse({ status: 400, description: 'Invalid tool or arguments' })
    async callTool(@Body() request: { name: string; arguments: any }) {
        return this.mcpService.callTool(request.name, request.arguments);
    }

    /**
     * MCP Resources List
     * Returns available resources (review history, models)
     */
    @Post('resources/list')
    @ApiOperation({
        summary: 'List MCP Resources',
        description: 'Returns available resources (review history, AI models)'
    })
    @ApiResponse({ status: 200, description: 'List of available resources' })
    async listResources(@Body() request: { sessionId?: string }) {
        return this.mcpService.listResources(request.sessionId);
    }

    /**
     * MCP Resource Read
     * Retrieves a specific resource by URI
     */
    @Post('resources/read')
    @ApiOperation({
        summary: 'Read MCP Resource',
        description: 'Retrieve a specific resource by URI'
    })
    @ApiResponse({ status: 200, description: 'Resource content' })
    @ApiResponse({ status: 404, description: 'Resource not found' })
    async readResource(@Body() request: { uri: string; sessionId?: string }) {
        return this.mcpService.readResource(request.uri, request.sessionId);
    }

    /**
     * MCP Prompts List
     * Returns available prompt templates
     */
    @Post('prompts/list')
    @ApiOperation({
        summary: 'List MCP Prompts',
        description: 'Returns available prompt templates for code review'
    })
    @ApiResponse({ status: 200, description: 'List of available prompts' })
    async listPrompts() {
        return this.mcpService.listPrompts();
    }

    /**
     * MCP Prompt Get
     * Retrieves a specific prompt template
     */
    @Post('prompts/get')
    @ApiOperation({
        summary: 'Get MCP Prompt',
        description: 'Retrieve a specific prompt template with arguments'
    })
    @ApiResponse({ status: 200, description: 'Prompt template' })
    @ApiResponse({ status: 404, description: 'Prompt not found' })
    async getPrompt(@Body() request: { name: string; arguments?: any }) {
        return this.mcpService.getPrompt(request.name, request.arguments);
    }
}
