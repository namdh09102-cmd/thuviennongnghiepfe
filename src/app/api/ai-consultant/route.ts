import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `Bạn là chuyên gia nông nghiệp Việt Nam. Trả lời bằng tiếng Việt, ngắn gọn, thực tế. Tập trung vào: cây trồng nhiệt đới, sâu bệnh, phân bón, thời vụ. Nếu vấn đề phức tạp, đề xuất hỏi chuyên gia thật.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Lịch sử trò chuyện không hợp lệ' }, { status: 400 });
    }

    // Lọc tin nhắn phù hợp với format của Anthropic
    const anthropicMessages = messages.map((msg: any) => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    // Trích xuất text từ response
    const text = response.content.find((c) => c.type === 'text')?.text || '';

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('Anthropic API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Đã xảy ra lỗi khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
