import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
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

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]

    switch (req.method) {
      case 'POST': {
        if (action === 'add') {
          const { userId, address, city, pincode, phone, notes } = await req.json()

          if (!userId || !address || !city || !pincode || !phone) {
            return new Response(
              JSON.stringify({ success: false, message: 'Invalid data provided!' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          const { data: newAddress, error } = await supabaseClient
            .from('addresses')
            .insert({
              user_id: userId,
              address,
              city,
              pincode,
              phone,
              notes: notes || ''
            })
            .select()
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ success: false, message: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: newAddress }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'GET': {
        const userId = pathSegments[pathSegments.length - 1]

        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, message: 'User ID is required!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: addresses, error } = await supabaseClient
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        // Transform data to match frontend expectations
        const transformedAddresses = addresses.map(addr => ({
          _id: addr.id,
          userId: addr.user_id,
          address: addr.address,
          city: addr.city,
          pincode: addr.pincode,
          phone: addr.phone,
          notes: addr.notes
        }))

        return new Response(
          JSON.stringify({ success: true, data: transformedAddresses }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const segments = pathSegments.slice(-2) // Get last two segments: userId and addressId
        const [userId, addressId] = segments
        const formData = await req.json()

        if (!userId || !addressId) {
          return new Response(
            JSON.stringify({ success: false, message: 'User and address ID is required!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: address, error } = await supabaseClient
          .from('addresses')
          .update({
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            phone: formData.phone,
            notes: formData.notes || ''
          })
          .eq('id', addressId)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: address }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const segments = pathSegments.slice(-2) // Get last two segments: userId and addressId
        const [userId, addressId] = segments

        if (!userId || !addressId) {
          return new Response(
            JSON.stringify({ success: false, message: 'User and address ID is required!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { error } = await supabaseClient
          .from('addresses')
          .delete()
          .eq('id', addressId)
          .eq('user_id', userId)

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Address deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ success: false, message: 'Method not allowed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})