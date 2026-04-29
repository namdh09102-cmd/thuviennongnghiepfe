import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

function formatUser(user: any, currentUserId?: string) {
  const id = user._id?.toString();
  const points = user.points || 0;
  const level = Math.max(1, Math.floor(points / 100) + 1);
  const levelProgress = points % 100;

  const followers: string[] = user.followers || [];
  const following: string[] = user.following || [];

  return {
    id,
    _id: id,
    username: user.username || user.email?.split('@')[0] || id,
    full_name: user.name || user.full_name || 'Thành viên',
    email: user.email,
    avatar_url: user.avatar || user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    bio: user.bio || '',
    region: user.region || user.location || '',
    location: user.region || user.location || '',
    main_crops: user.main_crops || [],
    expertise: user.expertise || user.main_crops || [],
    role: user.role || 'user',
    isVerified: user.isVerified || user.is_verified || false,
    is_verified: user.isVerified || user.is_verified || false,
    points,
    level,
    levelProgress,
    followersCount: followers.length,
    followingCount: following.length,
    created_at: user.created_at || user.createdAt || new Date().toISOString(),
    isFollowing: currentUserId ? followers.includes(currentUserId) : false,
    last_checkin: user.last_checkin || null,
    stats: {
      postsCount: 0,
      answersCount: 0,
      followersCount: followers.length,
      followingCount: following.length,
    },
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // id is actually username or MongoDB ID
  const currentUserId = req.headers.get('x-user-id') || '';

  try {
    await connectMongoDB();
    const db = mongoose.connection.db!;

    // Try to find by username first, then by _id
    let user: any = null;

    // Try username
    user = await db.collection('users').findOne({ username: id });

    // Try by _id if looks like ObjectId
    if (!user && mongoose.isValidObjectId(id)) {
      user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(id) });
    }

    // Try by email prefix (email split @)
    if (!user) {
      user = await db.collection('users').findOne({
        email: new RegExp(`^${id}@`, 'i')
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user._id.toString();

    // Fetch user's published posts
    const posts = await Post.find({
      author_id: userId,
      status: { $in: ['published', 'approved'] }
    })
      .select('title slug excerpt thumbnail_url category_id like_count view_count comment_count created_at published_at likes saves viewCount')
      .sort({ created_at: -1 })
      .limit(20)
      .lean();

    const formattedPosts = posts.map((p: any) => ({
      ...p,
      id: p._id?.toString(),
      _id: p._id?.toString(),
      author: {
        full_name: user.name || 'Thành viên',
        avatar_url: user.avatar || user.image || '',
        role: user.role || 'user'
      }
    }));

    // Fetch user's questions (hoi-dap)
    let questions: any[] = [];
    try {
      questions = await db.collection('questions')
        .find({ author_id: userId })
        .sort({ created_at: -1 })
        .limit(10)
        .toArray();
      questions = questions.map((q: any) => ({ ...q, id: q._id?.toString() }));
    } catch (e) { /* table may not exist */ }

    // Calculate badges based on points / activity
    const points = user.points || 0;
    const badges = [];
    if (user.created_at || user.createdAt) {
      badges.push({ id: 'member', name: 'Thành viên', icon: '🌱', description: 'Đã tham gia cộng đồng TVNN' });
    }
    if (formattedPosts.length > 0) {
      badges.push({ id: 'writer', name: 'Người chia sẻ', icon: '✍️', description: 'Đã đăng bài viết đầu tiên' });
    }
    if (points >= 100) {
      badges.push({ id: 'active', name: 'Nông dân Chăm chỉ', icon: '🚜', description: 'Đạt 100 điểm uy tín' });
    }
    if (points >= 500) {
      badges.push({ id: 'expert', name: 'Chuyên gia Kỹ thuật', icon: '🏆', description: 'Đạt 500 điểm uy tín' });
    }
    if ((user.isVerified || user.is_verified)) {
      badges.push({ id: 'verified', name: 'Chuyên gia Xác minh', icon: '✅', description: 'Được xác minh bởi TVNN' });
    }

    const formatted = formatUser(user, currentUserId);

    return NextResponse.json({
      ...formatted,
      posts: formattedPosts,
      questions,
      badges,
      stats: {
        postsCount: formattedPosts.length,
        answersCount: questions.length,
        followersCount: (user.followers || []).length,
        followingCount: (user.following || []).length,
      }
    });
  } catch (err: any) {
    console.error('GET /api/users/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
