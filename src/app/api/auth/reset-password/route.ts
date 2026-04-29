import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' }, { status: 400 });
    }

    // Hash new password using email as salt
    const hashedPassword = crypto.scryptSync(password, user.email, 64).toString('hex');

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
