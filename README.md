\# Supabase Auth API



A secure REST API built with \*\*Node.js + Express\*\* that handles user authentication with \*\*Supabase Auth\*\* — sign up, log in, log out — and protects routes so they only respond to logged-in users. Tokens are \*\*JSON Web Tokens (JWTs)\*\* verified with Supabase on every protected request. Documented with \*\*Swagger UI\*\*.



Built for the FlyRank Internship — Backend Track, Week 2, Assignment A4.



\## How it works



1\. The client signs up / logs in → the server forwards credentials to Supabase.

2\. Supabase returns a signed \*\*access token (JWT)\*\*.

3\. The client calls protected routes with `Authorization: Bearer <token>`.

4\. A reusable \*\*middleware\*\* (`requireAuth`) asks Supabase to verify the token. Valid → the route runs. Invalid → `401`.



The server never stores or hashes passwords — Supabase does that.



\## Setup



\*\*Requirements:\*\* Node.js 18+ and a free \[Supabase](https://supabase.com) project.



1\. Clone the repo and install dependencies:

```bash

&#x20;  git clone https://github.com/NaumanManzoor/supabase-auth-api.git

&#x20;  cd supabase-auth-api

&#x20;  npm install

```

2\. Copy `.env.example` to `.env` and fill in your values:

```

&#x20;  SUPABASE\_URL=your\_project\_url

&#x20;  SUPABASE\_KEY=your\_anon\_key

&#x20;  PORT=3000

```

&#x20;  Find these in the Supabase Dashboard → \*\*Project Settings → API Keys\*\*. Use the \*\*anon / publishable\*\* key — never the `service\_role` key.

3\. In Supabase → \*\*Authentication → Sign In / Providers → Email\*\*, turn off \*\*Confirm email\*\* (for local testing only).



\## Run



```bash

npm start

```



Server: `http://localhost:3000` · Swagger docs: `http://localhost:3000/docs`



\## API reference



| Method | Route                  | Purpose                        | Auth required |

|--------|------------------------|--------------------------------|---------------|

| POST   | `/auth/signup`         | Create a new user account      | No            |

| POST   | `/auth/login`          | Log in, returns access token   | No            |

| POST   | `/auth/logout`         | End the user's session         | Yes (Bearer)  |

| GET    | `/protected/profile`   | Get the logged-in user's data  | Yes (Bearer)  |

| GET    | `/protected/dashboard` | Dashboard for logged-in users  | Yes (Bearer)  |

| GET    | `/public/info`         | Public information             | No            |



\### Status codes



| Code | Meaning |

|------|---------|

| 201 | Signup successful |

| 200 | Login / read successful |

| 204 | Logout successful (no body) |

| 400 | Missing email or password |

| 401 | Missing, malformed, invalid or expired token — or wrong login credentials |



All errors return JSON: `{ "error": "..." }`



\## Testing with curl (Windows CMD)



```cmd

curl -i -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\"}"



curl -i -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\"}"



curl -i http://localhost:3000/protected/profile -H "Authorization: Bearer <ACCESS\_TOKEN>"

```



Changing one character of the token returns `401 Invalid or expired token`.



\## Swagger UI



Open `/docs`, log in via \*\*POST /auth/login\*\*, click \*\*Authorize 🔒\*\*, paste the access token, then use \*\*Try it out\*\* on any protected route.



!\[Swagger UI](a4-swagger-auth.png)



\## Security notes



\- `.env` is git-ignored and has never been committed; `.env.example` shows the required keys.

\- Only the Supabase \*\*anon\*\* key is used — the `service\_role` key is never used.

\- JWTs are stateless: after logout, an already-issued access token can remain valid until it expires (1 hour by default).



\## Tech stack



Node.js · Express · Supabase Auth (`@supabase/supabase-js`) · dotenv · swagger-ui-express

