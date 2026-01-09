import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { ReviewModule } from '../review/review.module';

/**
 * MCP Module
 * Exposes Prism's code review capabilities via Model Context Protocol
 * Enables AI agents (ChatGPT, Claude, etc.) to use Prism as a tool
 */
@Module({
    imports: [ReviewModule],
    controllers: [McpController],
    providers: [McpService],
    exports: [McpService]
})
export class McpModule { }
