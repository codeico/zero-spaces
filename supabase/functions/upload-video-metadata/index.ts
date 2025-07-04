import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ethers } from 'https://esm.sh/ethers@6'
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadVideoMetadataRequest {
  videoUrl: string
  title: string
  password: string
}

interface JWTPayload {
  sub: string
  email: string
  walletAddress: string
  iat: number
  exp: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const jwtSecret = Deno.env.get('JWT_SECRET')!
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )

    let payload: JWTPayload
    try {
      payload = await verify(token, key) as JWTPayload
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { videoUrl, title, password }: UploadVideoMetadataRequest = await req.json()

    // Validate input
    if (!videoUrl || !title || !password) {
      return new Response(
        JSON.stringify({ error: 'Video URL, title, and password are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user data including encrypted private key
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, email, walletAddress, encryptedPrivateKey, salt, iv')
      .eq('id', payload.sub)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Convert hex strings back to Uint8Array
    const salt = new Uint8Array(user.salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    const iv = new Uint8Array(user.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    const encryptedPrivateKey = new Uint8Array(user.encryptedPrivateKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )

    // Decrypt private key
    let decryptedPrivateKey: string
    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encryptedPrivateKey
      )
      decryptedPrivateKey = new TextDecoder().decode(decryptedBuffer)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create wallet signer
    const signer = new ethers.Wallet(decryptedPrivateKey)

    // Verify wallet address matches user's wallet
    if (signer.address !== user.walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Wallet address mismatch' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create message to sign (video URL as proof of ownership)
    const message = `Video Upload: ${videoUrl}\nTitle: ${title}\nTimestamp: ${new Date().toISOString()}`
    
    // Sign the message
    const signature = await signer.signMessage(message)

    // Save video metadata to database
    const { data: video, error: insertError } = await supabase
      .from('Video')
      .insert({
        title,
        videoUrl,
        ownerId: user.id,
        signature,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save video metadata' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: 'Video metadata uploaded successfully',
        video: {
          id: video.id,
          title: video.title,
          videoUrl: video.videoUrl,
          ownerId: video.ownerId,
          signature: video.signature,
          createdAt: video.createdAt
        }
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Upload video metadata error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})