import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { LlmModule } from '../llm/llm.module';

@Module({
    imports: [ConfigModule, LlmModule, PrismaModule],
    controllers: [ReviewController],
    providers: [ReviewService],
})
export class ReviewModule { }
