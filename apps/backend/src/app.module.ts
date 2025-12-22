import { Module } from '@nestjs/common';
import { ReviewModule } from './modules/review/review.module';

import { HealthController } from './health.controller';

@Module({
    imports: [ReviewModule],
    controllers: [HealthController],
    providers: [],
})
export class AppModule { }
