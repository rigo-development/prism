import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Express } from 'express';

let cachedApp: Express;

async function bootstrap(): Promise<Express> {
    if (!cachedApp) {
        const app = await NestFactory.create<NestExpressApplication>(AppModule);

        app.set('trust proxy', 1);
        app.enableCors();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe({ transform: true }));

        await app.init();
        cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp;
}

// Export the handler for Vercel
export default async (req: any, res: any) => {
    const app = await bootstrap();
    return app(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
    bootstrap().then(expressApp => {
        const port = process.env.PORT || 3000;
        expressApp.listen(port, () => {
            console.log(`Application is running on: http://localhost:${port}/api/v1`);
        });
    });
}
