import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '../products/products.module';
import { RagController } from './rag.controller';
import { RagService } from './services/rag.service';
import { OpenAiCompatibleProvider } from './providers/openai-compatible.provider';
import { ProductRetrieverService } from './services/product-retriever.service';

@Module({
  imports: [ConfigModule, ProductsModule],
  controllers: [RagController],
  providers: [
    RagService,
    {
      provide: 'ILlmProvider',
      useClass: OpenAiCompatibleProvider,
    },
    {
      provide: 'IRetriever',
      useClass: ProductRetrieverService,
    },
  ],
  exports: [RagService],
})
export class RagModule {}
