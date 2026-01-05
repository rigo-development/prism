import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { AnalyzeRequestDto } from '../../../../../packages/shared/src';

describe('ReviewController', () => {
    let controller: ReviewController;
    let service: ReviewService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReviewController],
            providers: [
                {
                    provide: ReviewService,
                    useValue: {
                        getModels: jest.fn().mockResolvedValue(['m1', 'm2']),
                        analyze: jest.fn().mockResolvedValue({ reviewId: 'r1' }),
                        getHistory: jest.fn().mockResolvedValue([]),
                        clearHistory: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        controller = module.get<ReviewController>(ReviewController);
        service = module.get<ReviewService>(ReviewService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return models', async () => {
        expect(await controller.getModels()).toEqual(['m1', 'm2']);
    });

    it('should call analyze with headers', async () => {
        const dto: AnalyzeRequestDto = { code: 'c', focus: 'security' };
        const headers = { 'x-session-id': 's1' };
        await controller.analyze(dto, headers);
        expect(service.analyze).toHaveBeenCalledWith(dto, 's1');
    });

    it('should call getHistory with headers', async () => {
        const headers = { 'x-session-id': 's1' };
        await controller.getHistory(headers);
        expect(service.getHistory).toHaveBeenCalledWith('s1');
    });

    it('should call clearHistory with headers', async () => {
        const headers = { 'x-session-id': 's1' };
        await controller.clearHistory(headers);
        expect(service.clearHistory).toHaveBeenCalledWith('s1');
    });
});
