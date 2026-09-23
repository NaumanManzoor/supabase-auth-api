require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_KEY, PORT = 3000 } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const app = express();
app.use(express.json());

// (Stage 1 routes will go here)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} and connected to Supabase`);
});