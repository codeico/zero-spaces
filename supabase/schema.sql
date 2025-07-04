-- Tabel untuk Pengguna
CREATE TABLE "User" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "username" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "walletAddress" TEXT UNIQUE NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel untuk Video
CREATE TABLE "Video" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "ownerId" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "signature" TEXT NOT NULL, -- Bukti kepemilikan dari tanda tangan dompet
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User table
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Video table
CREATE POLICY "Videos are viewable by everyone" ON "Video"
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own videos" ON "Video"
    FOR INSERT WITH CHECK (auth.uid() = "ownerId");

CREATE POLICY "Users can update own videos" ON "Video"
    FOR UPDATE USING (auth.uid() = "ownerId");

CREATE POLICY "Users can delete own videos" ON "Video"
    FOR DELETE USING (auth.uid() = "ownerId");

-- Create indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_wallet_address ON "User"("walletAddress");
CREATE INDEX idx_video_owner_id ON "Video"("ownerId");
CREATE INDEX idx_video_created_at ON "Video"("createdAt" DESC);