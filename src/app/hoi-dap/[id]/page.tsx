import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Award, CheckCircle, HelpCircle, User } from 'lucide-react';
import JsonLd from '@/components/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thuviennongnghiepfe.vercel.app';

async function getQuestion(id: string) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select(`
      *,
      author:profiles(full_name, username, avatar_url, is_verified),
      category:categories(name),
      answers(
        *,
        author:profiles(full_name, username, avatar_url, is_verified)
      )
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const question = await getQuestion(params.id);
  if (!question) return { title: 'Không tìm thấy câu hỏi' };

  return {
    title: `${question.title} | Hỏi đáp Thuviennongnghiep`,
    description: question.content.substring(0, 155),
  };
}

export default async function QuestionDetailPage({ params }: { params: { id: string } }) {
  const question = await getQuestion(params.id);
  if (!question) notFound();

  const qnaSchema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question.title,
      text: question.content,
      answerCount: question.answers?.length || 0,
      datePublished: question.created_at,
      author: {
        '@type': 'Person',
        name: question.author.full_name,
      },
      acceptedAnswer: question.answers?.find((a: any) => a.is_best) ? {
        '@type': 'Answer',
        text: question.answers.find((a: any) => a.is_best).content,
        datePublished: question.answers.find((a: any) => a.is_best).created_at,
        author: {
          '@type': 'Person',
          name: question.answers.find((a: any) => a.is_best).author.full_name,
        },
      } : undefined,
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={qnaSchema} />
      
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center space-x-2 text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">
          <HelpCircle className="w-4 h-4" />
          <span>Hỏi đáp {question.category?.name}</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 leading-tight">
          {question.title}
        </h1>

        <div className="flex items-center justify-between py-4 border-y border-gray-50 mb-6">
          <div className="flex items-center space-x-3">
            <img src={question.author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} className="w-10 h-10 rounded-full bg-gray-100" alt="" />
            <div>
              <p className="text-xs font-black text-gray-900">{question.author.full_name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{format(new Date(question.created_at), 'dd/MM/yyyy', { locale: vi })}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${question.is_solved ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
            {question.is_solved ? 'Đã giải quyết' : 'Đang chờ trả lời'}
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {question.content}
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-black text-gray-900 ml-4">Câu trả lời ({question.answers?.length || 0})</h2>
        {question.answers?.map((answer: any) => (
          <div key={answer.id} className={`p-6 rounded-[32px] border ${answer.is_best ? 'bg-green-50/30 border-green-200' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img src={answer.author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} className="w-8 h-8 rounded-full bg-gray-100" alt="" />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-black text-gray-900">{answer.author.full_name}</span>
                    {answer.author.is_verified && <Award className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{format(new Date(answer.created_at), 'dd MMMM, yyyy', { locale: vi })}</span>
                </div>
              </div>
              {answer.is_best && (
                <div className="flex items-center space-x-1 text-[10px] font-black text-green-700 uppercase bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span>Hữu ích nhất</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {answer.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
