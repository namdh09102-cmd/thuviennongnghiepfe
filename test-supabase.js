const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    const { data, error } = await supabase.from('notifications').select('*').limit(1);
    if (error) {
      console.error('Error querying notifications:', error);
    } else {
      console.log('Notifications table exists!', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

main();
