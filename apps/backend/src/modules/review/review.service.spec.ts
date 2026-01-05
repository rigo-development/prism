import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { LlmService } from '../llm/llm.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReviewService', () => {
    let service: ReviewService;
    let llmService: LlmService;
    let prismaService: PrismaService;

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
                {
                    provide: PrismaService,
                    useValue: {
                        review: {
                            create: jest.fn().mockResolvedValue({ id: 'saved-id' }),
                            findMany: jest.fn().mockResolvedValue([]),
                            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
                        },
                        isPostgres: false,
                    },
                },
            ],
        }).compile();

        service = module.get<ReviewService>(ReviewService);
        llmService = module.get<LlmService>(LlmService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call llm service with correct parameters', async () => {
        const dto = { code: 'console.log("hello")', focus: 'performance' as const };
        await service.analyze(dto);
        expect(llmService.analyzeCode).toHaveBeenCalledWith(dto);
    });

    it('should clear history for a session', async () => {
        const sessionId = 'test-session';
        await service.clearHistory(sessionId);
        expect(prismaService.review.deleteMany).toHaveBeenCalledWith({
            where: { sessionId }
        });
    });
});
