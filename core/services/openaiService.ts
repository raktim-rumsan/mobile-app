interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }[];
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private useStreaming: boolean;

  constructor(useStreaming: boolean = false) {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.useStreaming = useStreaming;
    console.log(
      'OpenAI API Key:',
      this.apiKey ? 'Configured' : 'Not Configured',
    );
    console.log(
      'OpenAI Streaming:',
      this.useStreaming ? 'Enabled' : 'Disabled',
    );

    if (!this.apiKey) {
      console.warn(
        this.apiKey,
        'OpenAI API key not found in environment variables',
      );
    }
  }

  setStreaming(enabled: boolean): void {
    this.useStreaming = enabled;
    console.log(
      'OpenAI Streaming:',
      this.useStreaming ? 'Enabled' : 'Disabled',
    );
  }

  getStreamingEnabled(): boolean {
    return this.useStreaming;
  }

  async sendMessageStream(
    messages: OpenAIMessage[],
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    if (!this.apiKey) {
      onError(new Error('OpenAI API key is not configured'));
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        onError(
          new Error(
            `OpenAI API error: ${response.status} - ${
              errorData.error?.message || 'Unknown error'
            }`,
          ),
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError(new Error('Failed to get response stream'));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '' || !trimmedLine.startsWith('data: ')) {
              continue;
            }

            const dataStr = trimmedLine.slice(6); // Remove 'data: ' prefix
            if (dataStr === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const chunk: OpenAIStreamChunk = JSON.parse(dataStr);
              const content = chunk.choices?.[0]?.delta?.content;

              if (content) {
                onToken(content);
              }

              if (chunk.choices?.[0]?.finish_reason) {
                onComplete();
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse chunk:', parseError);
              // Continue processing other chunks
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      onError(
        error instanceof Error ? error : new Error('Unknown streaming error'),
      );
    }
  }

  async sendMessage(messages: OpenAIMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} - ${
            errorData.error?.message || 'Unknown error'
          }`,
        );
      }

      const data: OpenAIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async sendChatMessageStream(
    userMessage: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: `You are Bhunte, a helpful AI assistant for a digital wallet application called Rumsan Wallet. You help users with:
      - Wallet balance inquiries
      - Transaction history
      - Account management
      - General financial questions
      - App navigation and features
      
      Keep your responses helpful, concise, and friendly. If you don't know something specific about the wallet, be honest and suggest contacting support.`,
    };

    const messages: OpenAIMessage[] = [
      systemMessage,
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    if (this.useStreaming) {
      return this.sendMessageStream(messages, onToken, onComplete, onError);
    } else {
      // Handle non-streaming response by sending the complete message at once
      try {
        const response = await this.sendMessage(messages);
        onToken(response);
        onComplete();
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  async sendChatMessage(
    userMessage: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  ): Promise<string> {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: `You are Bhunte, a helpful AI assistant for a digital wallet application called Rumsan Wallet. You help users with:
      - Wallet balance inquiries
      - Transaction history
      - Account management
      - General financial questions
      - App navigation and features
      
      Keep your responses helpful, concise, and friendly. If you don't know something specific about the wallet, be honest and suggest contacting support.`,
    };

    const messages: OpenAIMessage[] = [
      systemMessage,
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    return this.sendMessage(messages);
  }
}

export const openaiService = new OpenAIService();

// Helper function to create a new instance with custom streaming setting
export const createOpenAIService = (useStreaming: boolean = true) => {
  return new OpenAIService(useStreaming);
};
