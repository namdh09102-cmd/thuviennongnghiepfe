require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

async function test() {
  const slug = 'ky-thuat-trong-dua-luoi-nha-mang';
  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  console.log('Post error:', error);
  console.log('Post data:', post);
}
test();
