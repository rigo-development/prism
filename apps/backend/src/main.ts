import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

let cachedApp: any;

async function bootstrap() {
    if (!cachedApp) {
        const app = await NestFactory.create<NestExpressApplication>(AppModule);
        app.setGlobalPrefix('api/v1');
        app.enableCors();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();
        cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp;
}

export default async (req: any, res: any) => {
    const app = await bootstrap();
    return app(req, res);
};

// Start for local dev
if (!process.env.VERCEL) {
    bootstrap().then((app) => {
        app.listen(3000);
        console.log('Local server started on port 3000');
    });
}
