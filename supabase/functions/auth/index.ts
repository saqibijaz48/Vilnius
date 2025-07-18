import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface AuthRequest {
  action: 'register' | 'login' | 'logout' | 'check-auth'
  email?: string
  password?: string
  userName?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, password, userName }: AuthRequest = await req.json()

    switch (action) {
      case 'register': {
        if (!email || !password || !userName) {
          return new Response(
            JSON.stringify({ success: false, message: 'Missing required fields' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseClient
          .from('users')
          .select('email')
          .eq('email', email)
          .single()

        if (existingUser) {
          return new Response(
            JSON.stringify({ success: false, message: 'User already exists with the same email! Please try again' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        })

        if (authError) {
          return new Response(
            JSON.stringify({ success: false, message: authError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Create user profile
        const { error: profileError } = await supabaseClient
          .from('users')
          .insert({
            id: authData.user.id,
            user_name: userName,
            email: email,
            role: email === 'saqibijaz488@gmail.com' ? 'admin' : 'user'
          })

        if (profileError) {
          return new Response(
            JSON.stringify({ success: false, message: profileError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Registration successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'login': {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ success: false, message: 'Email and password required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        })

        if (authError) {
          return new Response(
            JSON.stringify({ success: false, message: 'Incorrect email or password! Please try again' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Get user profile
        const { data: userProfile } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Logged in successfully',
            user: {
              id: authData.user.id,
              email: authData.user.email,
              userName: userProfile?.user_name,
              role: userProfile?.role || 'user'
            },
            session: authData.session
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'logout': {
        return new Response(
          JSON.stringify({ success: true, message: 'Logged out successfully!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'check-auth': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, message: 'No authorization header' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabaseClient.auth.getUser(token)

        if (error || !user) {
          return new Response(
            JSON.stringify({ success: false, message: 'Invalid token' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        // Get user profile
        const { data: userProfile } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Authenticated user!',
            user: {
              id: user.id,
              email: user.email,
              userName: userProfile?.user_name,
              role: userProfile?.role || 'user'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})