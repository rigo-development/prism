import { Module } from '@nestjs/common';
import { ReviewModule } from './modules/review/review.module';

@Module({
    imports: [ReviewModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
