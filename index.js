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

// =====================================================
// STAGE 4: AUTH MIDDLEWARE — the one guard for every locked door
// =====================================================
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  // 1. Token present and in "Bearer <token>" format?
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // 2. Ask Supabase if the token is real
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // 3. Attach the verified user + token, then let the route run
  req.user = data.user;
  req.token = token;
  next();
}

// ---------- SIGN UP ----------
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }

  return res.status(201).json({ user: data.user });
});

// ---------- LOG IN ----------
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

// ---------- LOG OUT (protected) ----------
app.post('/auth/logout', requireAuth, async (req, res) => {
  // Ends THIS user's session on Supabase using their own token
  const { error } = await supabase.auth.admin.signOut(req.token);

  if (error) {
    return res.status(500).json({ error: 'Logout failed' });
  }

  return res.status(204).send(); // 204 = success, no body
});

// ---------- PUBLIC ----------
app.get('/public/info', (req, res) => {
  return res.status(200).json({ message: 'Welcome stranger! This info is public.' });
});

// ---------- PROTECTED: PROFILE ----------
app.get('/protected/profile', requireAuth, (req, res) => {
  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at,
  });
});

// ---------- PROTECTED: DASHBOARD (no new auth code!) ----------
app.get('/protected/dashboard', requireAuth, (req, res) => {
  return res.status(200).json({
    message: `Welcome to your dashboard, ${req.user.email}!`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} and connected to Supabase`);
});