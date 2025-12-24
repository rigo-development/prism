import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedApp: any;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api/v1');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Swagger setup
    const config = new DocumentBuilder()
        .setTitle('Prism AI API')
        .setDescription('API for analyzing code using Google Gemini AI')
        .setVersion('1.0')
        .addTag('review')
        .build();
    const document = SwaggerModule.createDocument(app, config);

    // Use CDN for Swagger UI assets to fix the white screen (404 for local assets)
    SwaggerModule.setup('api/v1/docs', app, document, {
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
        ],
        customCssUrl: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
        ],
    });

    await app.init();
    return app;
}

// Vercel Serverless Handler
export default async (req: any, res: any) => {
    if (!cachedApp) {
        const app = await bootstrap();
        cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp(req, res);
};

// Local Development
if (!process.env.VERCEL) {
    bootstrap().then((app) => {
        app.listen(3000);
        console.log('Local server started on port 3000');
        console.log('Swagger docs: http://localhost:3000/api/v1/docs');
    });
}
