import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = (session.user as any).id;

  try {
    const body = await req.json();
    const { avatar_url } = body;

    if (!avatar_url) {
      return NextResponse.json({ error: 'No avatar URL provided' }, { status: 400 });
    }

    // If it's a base64 data URL, attempt Cloudinary upload
    let finalUrl = avatar_url;
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (avatar_url.startsWith('data:') && cloudinaryCloudName && cloudinaryUploadPreset) {
      try {
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: avatar_url,
              upload_preset: cloudinaryUploadPreset,
              folder: 'tvnn/avatars',
              transformation: 'w_400,h_400,c_fill,q_auto,f_auto',
            }),
          }
        );
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalUrl = uploadData.secure_url;
        }
      } catch (e) {
        console.error('Cloudinary upload failed, storing base64:', e);
        // Fall back to storing the base64 directly (not recommended for production)
      }
    }

    // Save to MongoDB
    await connectMongoDB();
    const db = mongoose.connection.db!;
    const userFilter = mongoose.isValidObjectId(currentUserId)
      ? { _id: new mongoose.Types.ObjectId(currentUserId) }
      : { id: currentUserId };

    await db.collection('users').updateOne(userFilter, {
      $set: { avatar: finalUrl, image: finalUrl, updated_at: new Date() }
    });

    return NextResponse.json({ avatar_url: finalUrl });
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
