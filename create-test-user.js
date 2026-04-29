const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Creating test user in auth.users...');
  
  const email = 'test@example.com';
  const password = 'password123';
  const username = 'testuser';
  const full_name = 'Người dùng Thử nghiệm';

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      username
    }
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    // If user already exists, let's try to get their ID
    if (authError.message.includes('already registered')) {
      console.log('User already exists. Fetching user...');
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('Error listing users:', listError);
        return;
      }
      const existingUser = users.users.find(u => u.email === email);
      if (existingUser) {
        console.log('Found existing user ID:', existingUser.id);
        await createProfile(existingUser.id, username, full_name);
      }
    }
    return;
  }

  console.log('Auth user created successfully:', authData.user.id);
  await createProfile(authData.user.id, username, full_name);
}

async function createProfile(id, username, full_name) {
  console.log('Creating profile...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert([{
      id,
      username,
      full_name,
      role: 'expert',
      is_verified: true,
      points: 150,
      bio: 'Nông dân thử nghiệm với 150 điểm uy tín.',
      region: 'Đồng Tháp'
    }], { onConflict: 'id' });

  if (profileError) {
    console.error('Error creating profile:', profileError);
  } else {
    console.log('Profile created/updated successfully!');
  }
}

main();
