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
                        listModels: jest.fn().mockResolvedValue(['mock-model']),
                        analyzeCode: jest.fn().mockResolvedValue({
                            reviewId: 'test-id',
                            summary: 'Test Summary',
                            score: 90,
                            detectedLanguage: 'typescript',
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

    it('should call llm service and save to DB in analyze', async () => {
        const dto = { code: 'console.log("hello")', focus: 'performance' as const };
        const sessionId = 'test-session';

        const response = await service.analyze(dto, sessionId);

        expect(llmService.analyzeCode).toHaveBeenCalledWith(dto);
        expect(prismaService.review.create).toHaveBeenCalledWith({
            data: {
                sessionId,
                code: dto.code,
                language: 'typescript', // Mocked return from LLM
                focus: dto.focus,
                feedback: JSON.stringify({ reviewId: 'test-id', summary: 'Test Summary', score: 90, detectedLanguage: 'typescript', issues: [] }),
            }
        });
        expect(response.reviewId).toBe('saved-id');
    });

    it('should get models from llm service', async () => {
        const mockModels = ['model-1', 'model-2'];
        jest.spyOn(llmService, 'listModels').mockResolvedValue(mockModels);

        const result = await service.getModels();
        expect(result).toEqual(mockModels);
    });

    it('should get history with sessionId filtering', async () => {
        const sessionId = 'test-session';
        const mockReviews = [
            { id: '1', code: 'c1', language: 'l1', focus: 'f1', feedback: '{}', createdAt: new Date() }
        ];
        (prismaService.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

        const result = await service.getHistory(sessionId);

        expect(prismaService.review.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { sessionId }
        }));
        expect(result[0].id).toBe('1');
    });

    it('should handle invalid feedback JSON in history', async () => {
        (prismaService.review.findMany as jest.Mock).mockResolvedValue([
            { id: '1', feedback: 'invalid-json' }
        ]);

        const result = await service.getHistory();
        expect(result[0].summary).toBe('Error parsing feedback');
    });

    it('should clear history for a session', async () => {
        const sessionId = 'test-session';
        await service.clearHistory(sessionId);
        expect(prismaService.review.deleteMany).toHaveBeenCalledWith({
            where: { sessionId }
        });
    });
});
