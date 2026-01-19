// Script to add Dream Chimney station to Supabase
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDreamChimney() {
  console.log('Adding Dream Chimney to database...');

  const { data, error } = await supabase
    .from('stations')
    .insert({
      name: 'Dream Chimney',
      logo_url: 'https://www.dreamchimney.com/mainpage/dc-title06.gif',
      stream_url: 'https://dreamchimney.out.airtime.pro/dreamchimney_a',
      country: 'United States',
      city: null,
      genre: 'Experimental',
      display_order: 17,
      is_active: true
    })
    .select();

  if (error) {
    console.error('Error adding station:', error);
    process.exit(1);
  }

  console.log('✓ Dream Chimney added successfully!');
  console.log(data);
  process.exit(0);
}

addDreamChimney();
