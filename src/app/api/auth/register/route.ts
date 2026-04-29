import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, username, password } = await req.json();

    if (!full_name || !email || !username || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin đăng ký' }, { status: 400 });
    }

    await connectMongoDB();

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username đã được sử dụng' }, { status: 400 });
    }

    // Hash password using email as salt
    const hashedPassword = crypto.scryptSync(password, email, 64).toString('hex');

    // Create user in MongoDB
    const newUser = await User.create({
      name: full_name,
      email,
      username,
      password: hashedPassword,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      points: 0,
      level: 1,
      bio: 'Thành viên mới tham gia AgriLib.',
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      } 
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
