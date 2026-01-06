import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn().mockReturnValue('mock-key') },
                },
                {
                    provide: PrismaService,
                    useValue: { $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]) },
                },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return welcome message', () => {
        expect(controller.welcome()).toHaveProperty('message', 'Prism AI Code Review API is running');
    });

    it('should return status ok', async () => {
        const result = await controller.check();
        expect(result).toHaveProperty('status', 'ok');
        expect(result).toHaveProperty('timestamp');
    });

    it('should perform active check if ping is true', async () => {
        const result = await controller.check('true');
        expect(result.database.active_check).toBe(true);
    });
});
