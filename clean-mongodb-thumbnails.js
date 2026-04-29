const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

async function clean() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');
    
    const posts = await mongoose.connection.db.collection('posts').find({}).toArray();
    console.log(`Found ${posts.length} posts. Cleaning up thumbnails...`);
    
    let updatedCount = 0;
    for (const post of posts) {
      if (post.thumbnail_url && post.thumbnail_url.includes('res.cloudinary.com/demo/image/fetch')) {
        try {
          // Extract the original URL
          // Format: https://res.cloudinary.com/demo/image/fetch/w_400,h_225,c_fill,f_auto,q_auto/https%3A%2F%2Fimages.unsplash.com%2Fphoto...
          const parts = post.thumbnail_url.split('fetch/');
          if (parts.length > 1) {
            const configAndUrl = parts[1];
            // Skip width settings if present
            const urlIndex = configAndUrl.indexOf('http');
            if (urlIndex !== -1) {
              const originalUrl = decodeURIComponent(configAndUrl.substring(urlIndex));
              console.log(`Post [${post.title}]: Restoring original URL ->`, originalUrl);
              
              await mongoose.connection.db.collection('posts').updateOne(
                { _id: post._id },
                { $set: { thumbnail_url: originalUrl } }
              );
              updatedCount++;
            }
          }
        } catch (e) {
          console.error(`Error parsing URL for post ${post._id}:`, e.message);
        }
      }
    }
    
    console.log(`Success. Cleaned up ${updatedCount} posts.`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

clean();
