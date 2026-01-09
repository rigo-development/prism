import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LlmService', () => {
    let service: LlmService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LlmService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('mock-api-key'),
                    },
                },
            ],
        }).compile();

        service = module.get<LlmService>(LlmService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should list models from API', async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                models: [
                    { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
                    { name: 'models/other', supportedGenerationMethods: [] }
                ]
            }
        });

        const result = await service.listModels();
        expect(result).toEqual(['gemini-1.5-flash']);
    });

    it('should fallback to mock list if API fails', async () => {
        mockedAxios.get.mockRejectedValue(new Error('API Fail'));
        const result = await service.listModels();
        expect(result).toContain('gemini-2.5-flash');
    });

    it('should return mock response if no genAI', async () => {
        // Force genAI to be null by clearing apiKey in a fresh module if needed, 
        // but here we can just test the fallback logic
        (service as any).genAI = null;
        const result = await service.analyzeCode({ code: 'test', focus: 'readability' });
        expect(result.summary).toContain('(MOCK)');
    });
});
