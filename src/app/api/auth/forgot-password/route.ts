import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Vui lòng nhập email' }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findOne({ email });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json({ 
        success: true, 
        message: 'Nếu email tồn tại, mã xác nhận đã được tạo.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // In real app, send email. Here we log to console for testing/demo.
    console.log(`[RESET PASSWORD] Token for ${email}: ${resetToken}`);
    console.log(`[RESET PASSWORD] Link: http://localhost:3000/reset-password?token=${resetToken}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Yêu cầu đã được ghi nhận. Sử dụng mã xác nhận để đặt lại mật khẩu.',
      token: resetToken // Returning token for MVP convenience
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
