import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { LlmModule } from '../llm/llm.module';

@Module({
    imports: [LlmModule],
    controllers: [ReviewController],
    providers: [ReviewService],
})
export class ReviewModule { }
