# Web3 TikTok Client

React frontend for the Web3 TikTok decentralized video sharing platform. Built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase project setup

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx          # Reusable button component
│   │   └── Input.tsx           # Form input component
│   └── layout/
│       ├── Layout.tsx          # Main layout wrapper
│       └── Navbar.tsx          # Navigation component
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── pages/
│   ├── HomePage.tsx            # Video feed page
│   ├── LoginPage.tsx           # Login form
│   ├── RegisterPage.tsx        # Registration form
│   ├── UploadPage.tsx          # Video upload
│   └── ProfilePage.tsx         # User profile
├── services/
│   ├── api.ts                  # API client
│   └── supabaseClient.ts       # Supabase configuration
├── types/
│   └── index.ts                # TypeScript definitions
├── App.tsx                     # Main app component
└── main.tsx                    # App entry point
```

## 🔧 Configuration

### Supabase Configuration
The app requires the following Supabase configuration:

1. **Database Tables**: User and Video tables (see `../supabase/schema.sql`)
2. **Storage Bucket**: Create a bucket named `videos`
3. **Edge Functions**: Deploy the functions from `../supabase/functions/`

### Environment Variables
```bash
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 UI Components

### Common Components
- **Button**: Customizable button with loading states
- **Input**: Form input with validation and error handling

### Layout Components
- **Layout**: Main page wrapper with navigation
- **Navbar**: Responsive navigation bar

### Pages
- **HomePage**: Video feed with play/pause controls
- **LoginPage**: Authentication form
- **RegisterPage**: User registration with wallet creation
- **UploadPage**: Video upload with metadata
- **ProfilePage**: User profile and video management

## 🔐 Authentication

The app uses a custom authentication system:

1. **Registration**: Creates user account and Ethereum wallet
2. **Login**: JWT-based authentication
3. **Protected Routes**: Automatic redirect for unauthenticated users
4. **Wallet Integration**: Automatic wallet management

### useAuth Hook
```typescript
const { user, login, register, logout, loading } = useAuth()
```

## 📱 Features

### Video Management
- Upload videos with metadata
- View video feed
- User profile with video history
- Responsive video player

### Web3 Integration
- Automatic wallet creation
- Private key encryption
- Video signing for ownership proof
- Wallet address display

### User Experience
- Responsive design
- Loading states
- Error handling
- Form validation
- Toast notifications

## 🔄 API Integration

### Authentication API
```typescript
// Login
const response = await authApi.login({ email, password })

// Register
const response = await authApi.register({ email, password })
```

### Video API
```typescript
// Upload video metadata
const response = await videoApi.uploadMetadata(videoUrl, title, password)
```

### Supabase Services
```typescript
// Upload video file
const { data, error } = await uploadVideo(file, fileName)

// Get public URL
const publicUrl = getPublicUrl(path)
```

## 🎯 State Management

The app uses React's built-in state management:

- **useAuth**: Authentication state and methods
- **useState**: Component-level state
- **useEffect**: Side effects and API calls
- **Local Storage**: Token persistence

## 🌐 Routing

Protected and public routes:

```typescript
// Public routes (redirect if authenticated)
/login
/register

// Protected routes (require authentication)
/
/upload
/profile
```

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
Output in `dist/` directory

### Deployment Options
- **Vercel**: `npm run build` then deploy `dist/`
- **Netlify**: Connect repository for automatic deployments
- **AWS S3**: Upload `dist/` contents to S3 bucket

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the root directory
   - Check that variables start with `VITE_`
   - Restart development server

2. **Supabase Connection Issues**
   - Verify Supabase URL and keys
   - Check if Edge Functions are deployed
   - Ensure database tables exist

3. **Video Upload Failures**
   - Check storage bucket permissions
   - Verify file size limits
   - Ensure video formats are supported

4. **Authentication Issues**
   - Check JWT secret configuration
   - Verify Edge Function deployment
   - Clear browser storage

### Development Tips

1. **Hot Reloading**: Changes are reflected immediately
2. **TypeScript**: Use strict mode for better type safety
3. **Linting**: Run `npm run lint` regularly
4. **Browser DevTools**: Use React DevTools extension

## 📊 Performance

### Optimization Features
- **Vite**: Fast build tool with HMR
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with proper sizing

### Best Practices
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Optimize video loading with proper formats
- Use Web Workers for heavy computations

## 🧪 Testing

### Setup Testing (Future)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Testing Structure
```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── pages/
└── test-utils/
```

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new components
3. Test your changes thoroughly
4. Update documentation as needed

## 📝 Notes

- The app uses Tailwind CSS for styling
- All components are fully typed with TypeScript
- Authentication state is managed globally
- Video uploads go directly to Supabase Storage
- Private keys are never stored in plain text