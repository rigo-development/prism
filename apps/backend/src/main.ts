import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.set('trust proxy', 1);
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    return app.getHttpAdapter().getInstance();
}

let handler: any;

export default async (req: any, res: any) => {
    if (!handler) {
        handler = await bootstrap();
    }
    return handler(req, res);
};

// Start for local dev
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    bootstrap().then(app => {
        app.listen(3000, () => {
            console.log('Server running locally on http://localhost:3000');
        });
    });
}
