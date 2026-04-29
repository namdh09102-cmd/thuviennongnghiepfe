const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  console.log('Categories:', categories, 'Error:', catError);

  const { data: posts, error: postError } = await supabase.from('posts').select('*');
  console.log('Posts:', posts, 'Error:', postError);

  const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profiles, 'Error:', profError);
}

checkData();
