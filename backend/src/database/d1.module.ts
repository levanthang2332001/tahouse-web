import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { D1_DATABASE } from './d1.constants';
import { createD1Client, D1Config, D1Database } from './d1.client';
import * as schema from './schema';

@Global()
@Module({})
export class D1DatabaseModule {
  static forRootAsync(): DynamicModule {
    const d1Provider: Provider = {
      provide: D1_DATABASE,
      useFactory: (configService: ConfigService): D1Database => {
        const config: D1Config = {
          accountId: configService.get<string>('CLOUDFLARE_ACCOUNT_ID'),
          databaseId: configService.get<string>('CLOUDFLARE_D1_DATABASE_ID'),
          apiToken: configService.get<string>('CLOUDFLARE_D1_API_TOKEN') || configService.get<string>('CLOUDFLARE_API_TOKEN'),
        };
        return createD1Client(config);
      },
      inject: [ConfigService],
    };

    return {
      module: D1DatabaseModule,
      providers: [d1Provider],
      exports: [d1Provider],
    };
  }

  static forRoot(config: D1Config): DynamicModule {
    const d1Provider: Provider = {
      provide: D1_DATABASE,
      useValue: createD1Client(config),
    };

    return {
      module: D1DatabaseModule,
      providers: [d1Provider],
      exports: [d1Provider],
    };
  }
}
