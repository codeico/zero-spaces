# Web3 TikTok - Decentralized Video Sharing Platform

A full-stack web3 application that combines TikTok-like video sharing with custodial wallet integration. Users can register, upload videos, and interact with content while having an Ethereum wallet automatically created and managed securely.

## 🚀 Features

- **Traditional Registration & Login**: Email/password authentication
- **Automatic Wallet Creation**: Ethereum wallet generated on registration
- **Secure Key Management**: Private keys encrypted with user password
- **Video Upload & Sharing**: TikTok-style video feed
- **Cryptographic Ownership**: Videos signed with user's wallet
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🏗️ Architecture

### Backend (Supabase)
- **PostgreSQL Database**: User and video metadata storage
- **Edge Functions**: Server-side logic for authentication and video processing
- **Storage**: Direct video file uploads
- **Row Level Security**: Database-level access control

### Frontend (React)
- **Vite + TypeScript**: Modern build tooling
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **React Hook Form**: Form management
- **Axios**: HTTP client for API calls

### Web3 Integration
- **ethers.js**: Ethereum wallet operations
- **AES-256-GCM**: Private key encryption
- **Digital Signatures**: Video ownership verification

## 📁 Project Structure

```
/
├── supabase/
│   ├── functions/
│   │   ├── register/           # User registration with wallet creation
│   │   ├── login/              # JWT authentication
│   │   └── upload-video-metadata/ # Video metadata with signature
│   └── schema.sql              # Database schema
│
└── client/                     # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── common/         # Reusable UI components
    │   │   └── layout/         # Layout components
    │   ├── hooks/              # Custom React hooks
    │   ├── pages/              # Page components
    │   ├── services/           # API and Supabase clients
    │   └── types/              # TypeScript definitions
    └── public/
```

## 🔐 Security Features

1. **Password Hashing**: bcrypt for secure password storage
2. **Private Key Encryption**: AES-256-GCM with PBKDF2 key derivation
3. **JWT Authentication**: Secure session management
4. **Row Level Security**: Database-level access control
5. **Input Validation**: Client and server-side validation
6. **CORS Configuration**: Secure cross-origin requests

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web3-tiktok
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Create a storage bucket named `videos`
   - Deploy the Edge Functions

3. **Configure Environment Variables**
   ```bash
   # Client
   cd client
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Install Dependencies**
   ```bash
   # Client
   cd client
   npm install
   ```

5. **Start Development Server**
   ```bash
   # Client
   npm run dev
   ```

## 📚 Detailed Setup Guides

For detailed setup instructions, see the README files in each directory:
- [Client Setup](./client/README.md)
- [Supabase Setup](./supabase/README.md)

## 🔄 How It Works

### User Registration Flow
1. User provides email and password
2. Password is hashed with bcrypt
3. New Ethereum wallet is generated
4. Private key is encrypted with user's password
5. User data stored in database with encrypted wallet

### Video Upload Flow
1. User uploads video file to Supabase Storage
2. User provides password to decrypt private key
3. Video URL is signed with user's wallet
4. Metadata and signature stored in database

### Authentication Flow
1. User logs in with email/password
2. JWT token issued upon successful authentication
3. Token includes user ID and wallet address
4. Protected routes require valid JWT

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## 🚀 Deployment

### Frontend Deployment
The React app can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront

### Backend Deployment
Supabase handles backend deployment automatically:
- Edge Functions are deployed via Supabase CLI
- Database migrations can be applied via SQL editor

## 📝 Environment Variables

### Client (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Functions
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔧 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Storage)
- **Web3**: ethers.js v6
- **Authentication**: JWT, bcrypt
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 🎯 Roadmap

- [ ] Video like/comment system
- [ ] User follow/following
- [ ] Video recommendations
- [ ] Mobile app (React Native)
- [ ] NFT minting for videos
- [ ] Token rewards system
- [ ] Live streaming
- [ ] Advanced video editing

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using modern web technologies and Web3 integration.# zero-spaces
