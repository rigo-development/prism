import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

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
