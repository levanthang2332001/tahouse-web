import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '../products/products.module';
import { RagController } from './rag.controller';
import { AdminChatController } from './admin-chat.controller';
import { RagService } from './services/rag.service';
import { ChatRepository } from './repositories/chat.repository';
import { IpGeoService } from './services/ip-geo.service';
import { OpenAiCompatibleProvider } from './providers/openai-compatible.provider';
import { ProductRetrieverService } from './services/product-retriever.service';

@Module({
  imports: [ConfigModule, ProductsModule],
  controllers: [RagController, AdminChatController],
  providers: [
    RagService,
    ChatRepository,
    IpGeoService,
    {
      provide: 'ILlmProvider',
      useClass: OpenAiCompatibleProvider,
    },
    {
      provide: 'IRetriever',
      useClass: ProductRetrieverService,
    },
  ],
  exports: [RagService, ChatRepository, IpGeoService],
})
export class RagModule {}
