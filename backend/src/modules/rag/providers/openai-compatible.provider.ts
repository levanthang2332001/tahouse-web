import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import {
  ILlmProvider,
  IChatMessage,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAiCompatibleProvider implements ILlmProvider {
  private readonly logger = new Logger(OpenAiCompatibleProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('LLM_API_BASE_URL') ||
      'https://api.openai.com/v1';
    this.apiKey = this.configService.get<string>('LLM_API_KEY') || '';
    this.modelName =
      this.configService.get<string>('LLM_MODEL_NAME') || 'gpt-4o-mini';
  }

  streamChat(
    systemPrompt: string,
    message: string,
    history: IChatMessage[],
  ): Observable<string> {
    return new Observable<string>((subscriber) => {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ];

      const url = `${this.baseUrl.replace(/\/$/, '')}/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const controller = new AbortController();

      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.modelName,
          messages,
          stream: true,
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const errText = await response.text();
            throw new Error(
              `LLM API Request failed: ${response.status} ${response.statusText} - ${errText}`,
            );
          }
          if (!response.body) {
            throw new Error('LLM Response body is empty');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const read = async () => {
            try {
              const { done, value } = await reader.read();
              if (done) {
                subscriber.complete();
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // giữ dòng chưa hoàn thiện lại trong buffer

              for (const line of lines) {
                const cleaned = line.trim();
                if (!cleaned) continue;
                if (cleaned.startsWith('data: [DONE]')) {
                  subscriber.complete();
                  return;
                }
                if (cleaned.startsWith('data: ')) {
                  try {
                    const jsonStr = cleaned.slice(6);
                    const parsed = JSON.parse(jsonStr);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      subscriber.next(content);
                    }
                  } catch {
                    // Bỏ qua lỗi JSON parse cho các dòng rác
                  }
                }
              }
              // Tiếp tục đọc
              await read();
            } catch (err) {
              if (err.name === 'AbortError') {
                this.logger.log('LLM Stream connection was aborted by client');
              } else {
                subscriber.error(err);
              }
            }
          };

          read();
        })
        .catch((err) => {
          subscriber.error(err);
        });

      // Tự động hủy HTTP connection nếu subscriber unsubscribe (ngắt kết nối stream từ phía client)
      return () => {
        controller.abort();
      };
    });
  }
}
