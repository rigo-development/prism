import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { LlmService } from '../src/modules/llm/llm.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LlmService)
            .useValue({
                listModels: jest.fn().mockResolvedValue(['mock-model']),
                analyzeCode: jest.fn().mockResolvedValue({
                    summary: 'Mock E2E Summary',
                    score: 95,
                    detectedLanguage: 'typescript',
                    issues: []
                }),
            })
            .overrideProvider(PrismaService)
            .useValue({
                review: {
                    create: jest.fn().mockResolvedValue({ id: 'mock-e2e-id' }),
                    findMany: jest.fn().mockResolvedValue([]),
                    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
                },
                isPostgres: false,
                onModuleInit: jest.fn(),
                onModuleDestroy: jest.fn(),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('/review/models (GET)', () => {
        return request(app.getHttpServer())
            .get('/review/models')
            .expect(200);
    });

    it('/review/analyze (POST) should return mock response and save to DB', async () => {
        const response = await request(app.getHttpServer())
            .post('/review/analyze')
            .send({
                code: 'console.log("hello")',
                focus: 'readability',
                language: 'javascript'
            })
            .expect(201);

        expect(response.body.summary).toBeDefined();
        expect(response.body.reviewId).toBeDefined();
    });
});
