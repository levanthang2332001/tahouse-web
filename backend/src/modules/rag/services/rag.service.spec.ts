import { RagService } from './rag.service';
import {
  ILlmProvider,
  IChatMessage,
} from '../interfaces/llm-provider.interface';
import { IRetriever } from '../interfaces/retriever.interface';
import { of, firstValueFrom, toArray } from 'rxjs';

describe('RagService', () => {
  let service: RagService;
  let llmProvider: jest.Mocked<ILlmProvider>;
  let retriever: jest.Mocked<IRetriever>;

  beforeEach(() => {
    llmProvider = {
      streamChat: jest
        .fn()
        .mockReturnValue(of('Xin chào', ' tôi có thể giúp gì?')),
    };

    retriever = {
      retrieve: jest.fn().mockResolvedValue('Thông tin sản phẩm: Khóa KL-989F'),
    };

    service = new RagService(llmProvider, retriever);
  });

  it('should retrieve context, build prompt, and stream response from LLM', async () => {
    const history: IChatMessage[] = [
      { role: 'user', content: 'Tư vấn khóa' },
      { role: 'assistant', content: 'Chào bạn' },
      { role: 'user', content: '   ' }, // should be filtered out
    ];

    const stream$ = service.streamChat(
      'Khóa Kassler giá bao nhiêu',
      history,
      'TP.HCM',
    );
    const chunks = await firstValueFrom(stream$.pipe(toArray()));

    expect(retriever.retrieve).toHaveBeenCalledWith(
      'Khóa Kassler giá bao nhiêu',
      4,
    );
    expect(llmProvider.streamChat).toHaveBeenCalledWith(
      expect.stringContaining('Thông tin sản phẩm: Khóa KL-989F'),
      'Khóa Kassler giá bao nhiêu',
      [
        { role: 'user', content: 'Tư vấn khóa' },
        { role: 'assistant', content: 'Chào bạn' },
      ],
    );
    expect(chunks).toEqual(['Xin chào', ' tôi có thể giúp gì?']);
  });
});
