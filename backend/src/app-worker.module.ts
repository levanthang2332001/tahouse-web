import { Controller, Get, DynamicModule, Module, Res } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { D1Database as CloudflareD1 } from '@cloudflare/workers-types';
import { LoggerModule } from './common/logger/logger.module';
import { D1DatabaseModule } from './database/d1.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { BrandsModule } from './modules/brands/brands.module';
import { UploadModule } from './modules/upload/upload.module';
import { RagModule } from './modules/rag/rag.module';
import { StatsModule } from './modules/stats/stats.module';
import { SettingsModule } from './modules/settings/settings.module';
import { BypassTransform } from './common/decorators/bypass-transform.decorator';

let swaggerDocument: any = null;
export function setSwaggerDocument(doc: any) {
  swaggerDocument = doc;
}

@Controller()
class HealthController {
  @Get('health')
  @BypassTransform()
  health() {
    return {
      status: 'ok',
      runtime: 'cloudflare-workers',
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller('api')
class DocsController {
  @Get('docs-json')
  @BypassTransform()
  getDocsJson(@Res() res: any) {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerDocument || {});
  }

  @Get('docs')
  @BypassTransform()
  getDocsUi(@Res() res: any) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TA House API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #0b0d19; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui img { filter: invert(100%) hue-rotate(180deg); }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/docs-json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`);
  }
}

@Module({})
export class WorkerAppModule {
  static forWorker(nativeDb: CloudflareD1): DynamicModule {
    return {
      module: WorkerAppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule,
        D1DatabaseModule.forWorker(nativeDb),
        AuthModule,
        ProductsModule,
        BrandsModule,
        UploadModule,
        RagModule,
        StatsModule,
        SettingsModule,
      ],
      controllers: [HealthController, DocsController],
    };
  }
}
