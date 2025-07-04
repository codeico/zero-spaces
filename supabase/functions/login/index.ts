import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginRequest {
  email: string
  password: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password }: LoginRequest = await req.json()

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
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

    // Find user by email
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('id, email, username, passwordHash, walletAddress, createdAt')
      .eq('email', email)
      .single()

    if (findError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify password
    const isValidPassword = await verify(password, user.passwordHash)
    
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate JWT token
    const jwtSecret = Deno.env.get('JWT_SECRET')!
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )

    const payload = {
      sub: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      iat: getNumericDate(new Date()),
      exp: getNumericDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
    }

    const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key)

    // Update last login timestamp
    await supabase
      .from('User')
      .update({ updatedAt: new Date().toISOString() })
      .eq('id', user.id)

    // Return success response with JWT token
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})