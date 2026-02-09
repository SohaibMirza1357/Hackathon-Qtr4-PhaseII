name: auth-skill
description: Implement secure authentication systems including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Authentication System Skill

## Instructions

### User Signup
- Collect email and password
- Validate input fields
- Hash password before saving
- Store user in the database

### User Signin
- Verify email exists
- Compare hashed passwords
- Handle invalid credentials securely
- Return authentication response

### Password Hashing
- Use bcrypt or argon2
- Never store plain text passwords
- Apply proper salt rounds

### JWT Tokens
- Generate access token on signin
- Include user ID in token payload
- Set token expiration
- Verify token on protected routes

### Better Auth Integration
- Configure Better Auth provider
- Connect with database
- Use built-in session handling
- Secure cookies and tokens

---

## Best Practices
- Always hash passwords
- Use HTTPS only
- Set short-lived token expiry
- Store secrets in environment variables
- Protect all private routes

---

## Example Flow

```ts
// Signup
User → Hash Password → Save User

// Signin
User → Verify Password → Generate JWT

// Protected Route
Request → Verify JWT → Allow Access
