# Web3 TikTok Supabase Backend

Backend infrastructure for the Web3 TikTok application using Supabase Edge Functions, PostgreSQL database, and Storage.

## 🚀 Quick Start

### Prerequisites
- Supabase account
- Supabase CLI installed (`npm install -g supabase`)
- Node.js 18+

### Setup Instructions

1. **Create Supabase Project**
   ```bash
   # Create a new project at https://supabase.com/dashboard
   # Note your project URL and service role key
   ```

2. **Initialize Supabase Locally**
   ```bash
   supabase init
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Set up Database Schema**
   ```bash
   # Run schema.sql in your Supabase SQL editor
   # Or use the CLI:
   supabase db push
   ```

4. **Create Storage Bucket**
   ```bash
   # In Supabase Dashboard > Storage
   # Create a new bucket named 'videos'
   # Set it to public
   ```

5. **Deploy Edge Functions**
   ```bash
   # Deploy all functions
   supabase functions deploy register
   supabase functions deploy login
   supabase functions deploy upload-video-metadata
   ```

## 📁 Project Structure

```
supabase/
├── functions/
│   ├── register/
│   │   └── index.ts           # User registration with wallet creation
│   ├── login/
│   │   └── index.ts           # JWT authentication
│   └── upload-video-metadata/
│       └── index.ts           # Video metadata with signature
├── schema.sql                 # Database schema and RLS policies
└── README.md                  # This file
```

## 🗄️ Database Schema

### User Table
Stores user accounts with encrypted wallet information.

```sql
CREATE TABLE "User" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "username" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "walletAddress" TEXT UNIQUE NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Video Table
Stores video metadata with cryptographic signatures.

```sql
CREATE TABLE "Video" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "ownerId" uuid NOT NULL REFERENCES "User"(id),
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Row Level Security (RLS)
Database-level access control for secure data access.

## 🔧 Edge Functions

### 1. Register Function (`/register`)
Creates new user accounts with automatic wallet generation.

**Endpoint**: `POST /functions/v1/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Process**:
1. Validates email and password
2. Hashes password with bcrypt
3. Generates new Ethereum wallet
4. Encrypts private key with AES-256-GCM
5. Stores user data in database

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "0x1234...",
    "walletAddress": "0x1234...",
    "createdAt": "2023-..."
  }
}
```

### 2. Login Function (`/login`)
Authenticates users and issues JWT tokens.

**Endpoint**: `POST /functions/v1/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Process**:
1. Validates credentials
2. Verifies password with bcrypt
3. Generates JWT token
4. Returns user data and token

**Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "0x1234...",
    "walletAddress": "0x1234...",
    "createdAt": "2023-..."
  }
}
```

### 3. Upload Video Metadata Function (`/upload-video-metadata`)
Processes video metadata with wallet signatures.

**Endpoint**: `POST /functions/v1/upload-video-metadata`

**Headers**:
```
Authorization: Bearer your_jwt_token
```

**Request Body**:
```json
{
  "videoUrl": "https://supabase.co/storage/v1/object/public/videos/...",
  "title": "My Amazing Video",
  "password": "userpassword"
}
```

**Process**:
1. Validates JWT token
2. Decrypts user's private key
3. Signs video URL with wallet
4. Stores metadata and signature

**Response**:
```json
{
  "message": "Video metadata uploaded successfully",
  "video": {
    "id": "uuid",
    "title": "My Amazing Video",
    "videoUrl": "https://...",
    "ownerId": "uuid",
    "signature": "0x...",
    "createdAt": "2023-..."
  }
}
```

## 🔐 Security Features

### Password Security
- bcrypt hashing with salt
- Minimum password requirements
- Secure password validation

### Private Key Encryption
- AES-256-GCM encryption
- PBKDF2 key derivation (100,000 iterations)
- Random salt and IV generation
- Keys never stored in plain text

### JWT Authentication
- HS256 algorithm
- 7-day token expiration
- Secure token validation
- Automatic token refresh

### Database Security
- Row Level Security (RLS) policies
- Parameterized queries
- Input validation and sanitization
- Secure database connections

## 🌐 Environment Variables

### Required Variables
Set these in your Supabase project settings:

```bash
# Supabase (auto-configured)
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Custom variables (add in Edge Function settings)
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
```

### Setting Environment Variables
```bash
# Set secrets for Edge Functions
supabase secrets set JWT_SECRET=your_jwt_secret_key

# List current secrets
supabase secrets list
```

## 📦 Deployment

### Deploy Edge Functions
```bash
# Deploy individual functions
supabase functions deploy register
supabase functions deploy login
supabase functions deploy upload-video-metadata

# Deploy all functions
supabase functions deploy
```

### Database Migrations
```bash
# Apply schema changes
supabase db push

# Generate migration files
supabase db diff --schema public
```

### Storage Setup
1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `videos`
3. Set bucket to public
4. Configure upload policies if needed

## 🔧 Local Development

### Start Local Supabase
```bash
supabase start
```

### Develop Functions Locally
```bash
# Serve functions locally
supabase functions serve

# Test specific function
supabase functions serve --env-file .env.local register
```

### Testing Functions
```bash
# Test register function
curl -X POST http://localhost:54321/functions/v1/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test login function
curl -X POST http://localhost:54321/functions/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 📊 Monitoring

### Function Logs
```bash
# View function logs
supabase functions logs register
supabase functions logs login
supabase functions logs upload-video-metadata
```

### Database Monitoring
- Use Supabase Dashboard for real-time metrics
- Monitor RLS policy performance
- Check query execution times

## 🔄 API Documentation

### Base URL
```
https://your-project.supabase.co/functions/v1
```

### Error Responses
All functions return consistent error responses:

```json
{
  "error": "Description of the error"
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `409`: Conflict
- `500`: Internal Server Error

## 🛡️ Security Best Practices

1. **Never log sensitive data** (passwords, private keys)
2. **Use environment variables** for secrets
3. **Validate all inputs** on both client and server
4. **Implement rate limiting** for authentication endpoints
5. **Use HTTPS only** for all communications
6. **Regular security audits** of code and dependencies

## 🔧 Troubleshooting

### Common Issues

1. **Function Deployment Fails**
   ```bash
   # Check function syntax
   supabase functions serve register
   
   # Verify environment variables
   supabase secrets list
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   supabase status
   
   # Verify schema
   supabase db pull
   ```

3. **JWT Token Issues**
   ```bash
   # Verify JWT secret is set
   supabase secrets list
   
   # Check token format in requests
   ```

4. **Storage Upload Issues**
   - Verify bucket exists and is public
   - Check file size limits
   - Ensure proper CORS settings

### Debug Mode
Enable debug logging in functions:
```typescript
console.log('Debug info:', { variable: value })
```

## 📝 Development Notes

### Dependencies
Edge Functions use Deno runtime with ES modules:
- `https://deno.land/std@0.168.0/http/server.ts`
- `https://esm.sh/@supabase/supabase-js@2`
- `https://esm.sh/ethers@6`
- `https://deno.land/x/bcrypt@v0.4.1/mod.ts`

### TypeScript Support
All functions are written in TypeScript with proper type definitions.

### CORS Configuration
All functions include proper CORS headers for web client access.

## 🤝 Contributing

1. Test functions locally before deployment
2. Follow TypeScript best practices
3. Add proper error handling
4. Update documentation for new features
5. Ensure security review for sensitive operations

## 📞 Support

For backend-specific issues:
1. Check Supabase function logs
2. Verify environment variables
3. Test with curl commands
4. Review database RLS policies