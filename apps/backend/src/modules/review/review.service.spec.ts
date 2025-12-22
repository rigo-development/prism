import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { LlmService } from '../llm/llm.service';

describe('ReviewService', () => {
    let service: ReviewService;
    let llmService: LlmService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewService,
                {
                    provide: LlmService,
                    useValue: {
                        analyzeCode: jest.fn().mockResolvedValue({
                            reviewId: 'test-id',
                            summary: 'Test Summary',
                            score: 90,
                            issues: []
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<ReviewService>(ReviewService);
        llmService = module.get<LlmService>(LlmService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call llm service with correct parameters', async () => {
        const dto = { code: 'console.log("hello")', focus: 'performance' as const };
        await service.analyze(dto);
        expect(llmService.analyzeCode).toHaveBeenCalledWith(dto);
    });
});
