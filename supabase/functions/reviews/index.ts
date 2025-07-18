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
          const { productId, userId, userName, reviewMessage, reviewValue } = await req.json()

          // Check if user has purchased this product
          const { data: order } = await supabaseClient
            .from('order_items')
            .select(`
              *,
              orders!inner(user_id)
            `)
            .eq('product_id', productId)
            .eq('orders.user_id', userId)
            .single()

          if (!order) {
            return new Response(
              JSON.stringify({ success: false, message: 'You need to purchase product to review it.' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
          }

          // Check if review already exists
          const { data: existingReview } = await supabaseClient
            .from('product_reviews')
            .select('id')
            .eq('product_id', productId)
            .eq('user_id', userId)
            .single()

          if (existingReview) {
            return new Response(
              JSON.stringify({ success: false, message: 'You already reviewed this product!' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          // Create review
          const { data: review, error } = await supabaseClient
            .from('product_reviews')
            .insert({
              product_id: productId,
              user_id: userId,
              user_name: userName,
              review_message: reviewMessage,
              review_value: reviewValue
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
            JSON.stringify({ success: true, data: review }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'GET': {
        const productId = pathSegments[pathSegments.length - 1]

        const { data: reviews, error } = await supabaseClient
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        // Transform data to match frontend expectations
        const transformedReviews = reviews.map(review => ({
          _id: review.id,
          productId: review.product_id,
          userId: review.user_id,
          userName: review.user_name,
          reviewMessage: review.review_message,
          reviewValue: review.review_value
        }))

        return new Response(
          JSON.stringify({ success: true, data: transformedReviews }),
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