const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function query() {
  const { data: cats } = await supabase.from('categories').select('*');
  const { data: posts } = await supabase.from('posts').select('id, slug, title, author_id, category_id');
  const { data: profs } = await supabase.from('profiles').select('id, username, full_name, role');
  
  console.log('CATEGORIES:', JSON.stringify(cats, null, 2));
  console.log('POSTS:', JSON.stringify(posts, null, 2));
  console.log('PROFILES:', JSON.stringify(profs, null, 2));
}
query();
