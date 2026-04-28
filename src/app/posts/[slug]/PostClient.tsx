'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Bookmark, Share2, UserPlus, MessageCircle, CheckCircle, HelpCircle } from 'lucide-react';
import DOMPurify from 'dompurify';
import AdSlot from '@/components/AdSlot';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  isExpertAnswer: boolean;
  author: { username: string; role: string; isVerifiedExpert?: boolean };
  replies?: Comment[];
}

interface PostData {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  tags: string[];
  author: { id: string; username: string; role: string; isVerifiedExpert?: boolean };
  comments?: Comment[];
}

// Danh sách bệnh cây trồng phổ biến để Auto-link
const COMMON_DISEASES = ['thối rễ', 'sâu đục thân', 'đạo ôn', 'vàng lá', 'phấn trắng', 'nứt thân'];

export default function PostClient({ post }: { post: PostData }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || [
    {
      id: 'c1',
      content: 'Sầu riêng bị nứt thân xì mủ thì bón phân gì được ạ?',
      createdAt: new Date().toISOString(),
      isExpertAnswer: false,
      author: { username: 'farmer_hoang', role: 'FARMER' },
      replies: [
        {
          id: 'c2',
          content: 'Chào anh, bệnh nứt thân xì mủ anh cần cạo sạch vết bệnh và quét thuốc chứa gốc đồng hoặc hoạt chất Metalaxyl nhé.',
          createdAt: new Date().toISOString(),
          isExpertAnswer: true,
          author: { username: 'expert_viet', role: 'EXPERT', isVerifiedExpert: true }
        }
      ]
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => setLiked(!liked);
  const handleSave = () => setSaved(!saved);
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link bài viết vào clipboard!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentData: Comment = {
      id: Math.random().toString(),
      content: newComment,
      createdAt: new Date().toISOString(),
      isExpertAnswer: false,
      author: { username: 'NongDan99', role: 'FARMER' }
    };

    setComments([newCommentData, ...comments]);
    setNewComment('');
  };

  // 1. Auto-link tag bệnh
  const autoLinkDiseases = (html: string) => {
    let result = html;
    COMMON_DISEASES.forEach(disease => {
      const regex = new RegExp(`(${disease})`, 'gi');
      result = result.replace(regex, `<a href="/search?q=$1" class="text-green-600 font-semibold hover:underline" title="Bấm để xem cách chữa bệnh $1">$1</a>`);
    });
    return result;
  };

  const rawHTML = typeof window !== 'undefined' ? DOMPurify.sanitize(post.content) : post.content;
  const cleanHTML = autoLinkDiseases(rawHTML);

  // 2. Helper render Badge
  const renderBadge = (role: string, isVerified?: boolean) => {
    if (isVerified) return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm border border-yellow-200">🏆 Chuyên gia xác nhận</span>;
    if (role === 'EXPERT') return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm border border-blue-200">🎓 Kỹ sư</span>;
    return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm border border-green-200">🧑🌾 Nông dân</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
      {/* Cột Trái: Nội dung bài viết & Bình luận */}
      <main className="col-span-1 lg:col-span-8 space-y-6">
        <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="relative h-56 sm:h-80 w-full">
            <Image
              src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=80"
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-5 md:p-8">
            <div className="flex flex-wrap gap-1.5">
              {post.tags?.map(tag => (
                <span key={tag} className="bg-green-50 text-green-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mt-3 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-between mt-6 pb-6 border-b border-gray-100 lg:hidden">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                  {post.author.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-800">
                      {post.author.username}
                    </span>
                    {renderBadge(post.author.role, post.author.isVerifiedExpert)}
                  </div>
                  <span className="text-xs text-gray-400">Tác giả bài viết</span>
                </div>
              </div>
              <button className="flex items-center space-x-1 text-xs font-semibold text-green-600 border border-green-600 hover:bg-green-50 px-3 py-1.5 rounded-xl transition-colors duration-200">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Theo dõi</span>
              </button>
            </div>

            <div 
              className="prose prose-green text-sm md:text-base text-gray-700 leading-relaxed mt-6 space-y-4"
              dangerouslySetInnerHTML={{ __html: cleanHTML }}
            />

            <div className="flex items-center justify-around border-t border-b border-gray-100 py-3 mt-8 text-gray-500 text-xs font-medium">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart className={`h-4.5 w-4.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>Thích ({post.likeCount + (liked ? 1 : 0)})</span>
              </button>
              
              <button 
                onClick={handleSave}
                className={`flex items-center space-x-1.5 transition-colors ${saved ? 'text-green-600' : 'hover:text-green-600'}`}
              >
                <Bookmark className={`h-4.5 w-4.5 ${saved ? 'fill-green-600 text-green-600' : ''}`} />
                <span>Lưu</span>
              </button>

              <button 
                onClick={handleShare}
                className="flex items-center space-x-1.5 hover:text-blue-600 transition-colors"
              >
                <Share2 className="h-4.5 w-4.5" />
                <span>Chia sẻ</span>
              </button>
            </div>

            {/* Bình luận */}
            <div className="mt-8">
              <div className="flex items-center space-x-2 mb-4 text-gray-800">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-base">Thảo luận ({comments.length})</h3>
              </div>

              <form onSubmit={handleAddComment} className="mb-6 flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Bạn có thắc mắc gì cho Chuyên gia?..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                />
                <button 
                  type="submit" 
                  className="bg-green-600 text-white text-xs font-semibold px-4 rounded-xl shadow-sm hover:bg-green-700 transition-colors"
                >
                  Gửi
                </button>
              </form>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-50 pb-4 last:border-none">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-700 text-xs">
                        {comment.author.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-bold text-xs text-gray-900">{comment.author.username}</span>
                          {renderBadge(comment.author.role, comment.author.isVerifiedExpert)}
                        </div>
                        
                        <p className={`text-xs text-gray-700 mt-1 inline-block min-w-[120px] ${
                          comment.isExpertAnswer 
                            ? 'bg-green-50 border border-green-100 text-green-900 p-3 rounded-2xl shadow-sm' 
                            : 'bg-gray-50 p-2.5 rounded-xl'
                        }`}>
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-8 space-y-3 pl-4 border-l-2 border-gray-100">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-2">
                            <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-[10px]">
                              {reply.author.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-bold text-[10px] text-gray-900">{reply.author.username}</span>
                                {renderBadge(reply.author.role, reply.author.isVerifiedExpert)}
                              </div>
                              <p className={`text-xs mt-1 inline-block min-w-[100px] ${
                                reply.isExpertAnswer 
                                  ? 'bg-green-50 border border-green-100 text-green-900 p-3 rounded-2xl shadow-sm' 
                                  : 'bg-blue-50/50 text-gray-700 p-2 rounded-xl'
                              }`}>
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </main>

      {/* Cột Phải: Thông tin tác giả & Bài viết liên quan */}
      <aside className="hidden lg:block lg:col-span-4 space-y-4 sticky top-20 self-start">
        {/* Widget Tác giả */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-xl mx-auto shadow-sm">
            {post.author.username[0].toUpperCase()}
          </div>
          <h3 className="font-bold text-base text-gray-900 mt-3 flex items-center justify-center">
            {post.author.username}
          </h3>
          <div className="flex justify-center mt-1">
            {renderBadge(post.author.role, post.author.isVerifiedExpert)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center justify-center">
            Tác giả • {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </p>
          
          <button className="w-full flex items-center justify-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl mt-4 shadow-sm transition-colors duration-200">
            <UserPlus className="h-4 w-4" />
            <span>Theo dõi tác giả</span>
          </button>
        </div>

        {/* Widget Bài viết liên quan */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center space-x-1.5">
            <HelpCircle className="h-4 w-4 text-green-600" />
            <span>Bài viết liên quan</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 group cursor-pointer">
              <div className="relative h-14 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-50">
                <Image src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=500&q=80" fill alt="Bài liên quan" className="object-cover group-hover:scale-105 transition-transform duration-200" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">Miền Tây</span>
                <h4 className="text-xs font-semibold text-gray-800 mt-1 line-clamp-2 group-hover:text-green-600 transition-colors">Kỹ thuật chăm sóc sầu riêng Musang King ra bông</h4>
              </div>
            </div>

            <div className="flex items-start space-x-3 group cursor-pointer">
              <div className="relative h-14 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-50">
                <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80" fill alt="Bài liên quan" className="object-cover group-hover:scale-105 transition-transform duration-200" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Tây Nguyên</span>
                <h4 className="text-xs font-semibold text-gray-800 mt-1 line-clamp-2 group-hover:text-green-600 transition-colors">Nhận biết bệnh thối rễ cây bơ và phương pháp đặc trị</h4>
              </div>
            </div>
          </div>
        </div>

        <AdSlot placement="post" />
      </aside>
    </div>
  );
}
