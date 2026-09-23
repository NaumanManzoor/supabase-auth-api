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

// ---------- STAGE 1: SIGN UP ----------
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body || {};

  // Never trust the client: check the input first
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Supabase creates the account and hashes the password
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }

  return res.status(201).json({ user: data.user });
});

// ---------- STAGE 1: LOG IN ----------
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: { id: data.user.id, email: data.user.email },
  });
});

// ---------- STAGE 2: PUBLIC ROUTE ----------
app.get('/public/info', (req, res) => {
  return res.status(200).json({ message: 'Welcome stranger! This info is public.' });
});

// ---------- STAGE 3: PROTECTED ROUTE (token verified with Supabase) ----------
app.get('/protected/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  // 1. Was a token sent in the right format?
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // 2. Ask Supabase: is this token real?
  const { data, error } = await supabase.auth.getUser(token);

  // 3. Fake, tampered or expired → reject
  if (error || !data || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // 4. Valid → return safe user info only
  const user = data.user;
  return res.status(200).json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} and connected to Supabase`);
});