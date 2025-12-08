require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// supabase config - using supabase as database instead of mongodb
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing! Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
