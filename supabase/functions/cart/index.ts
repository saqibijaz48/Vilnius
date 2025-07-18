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
          const { userId, productId, quantity } = await req.json()

          if (!userId || !productId || quantity <= 0) {
            return new Response(
              JSON.stringify({ success: false, message: 'Invalid data provided!' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          // Check if product exists
          const { data: product, error: productError } = await supabaseClient
            .from('products')
            .select('id, total_stock')
            .eq('id', productId)
            .single()

          if (productError || !product) {
            return new Response(
              JSON.stringify({ success: false, message: 'Product not found' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
          }

          // Check if item already exists in cart
          const { data: existingItem } = await supabaseClient
            .from('cart_items')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single()

          if (existingItem) {
            // Update quantity
            const { data: updatedItem, error } = await supabaseClient
              .from('cart_items')
              .update({ quantity: existingItem.quantity + quantity })
              .eq('id', existingItem.id)
              .select()
              .single()

            if (error) {
              return new Response(
                JSON.stringify({ success: false, message: error.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              )
            }

            return new Response(
              JSON.stringify({ success: true, data: updatedItem }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          } else {
            // Create new cart item
            const { data: newItem, error } = await supabaseClient
              .from('cart_items')
              .insert({ user_id: userId, product_id: productId, quantity })
              .select()
              .single()

            if (error) {
              return new Response(
                JSON.stringify({ success: false, message: error.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              )
            }

            return new Response(
              JSON.stringify({ success: true, data: newItem }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
        break
      }

      case 'GET': {
        const userId = pathSegments[pathSegments.length - 1]

        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, message: 'User ID is mandatory!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: cartItems, error } = await supabaseClient
          .from('cart_items')
          .select(`
            *,
            products (
              id,
              title,
              image,
              price,
              sale_price
            )
          `)
          .eq('user_id', userId)

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        // Transform data to match frontend expectations
        const transformedItems = cartItems.map(item => ({
          productId: item.product_id,
          image: item.products.image,
          title: item.products.title,
          price: item.products.price,
          salePrice: item.products.sale_price,
          quantity: item.quantity
        }))

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              _id: userId,
              items: transformedItems
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        if (action === 'update-cart') {
          const { userId, productId, quantity } = await req.json()

          if (!userId || !productId || quantity <= 0) {
            return new Response(
              JSON.stringify({ success: false, message: 'Invalid data provided!' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          const { data: updatedItem, error } = await supabaseClient
            .from('cart_items')
            .update({ quantity })
            .eq('user_id', userId)
            .eq('product_id', productId)
            .select(`
              *,
              products (
                id,
                title,
                image,
                price,
                sale_price
              )
            `)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ success: false, message: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: updatedItem }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'DELETE': {
        const segments = pathSegments.slice(-2) // Get last two segments: userId and productId
        const [userId, productId] = segments

        if (!userId || !productId) {
          return new Response(
            JSON.stringify({ success: false, message: 'Invalid data provided!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { error } = await supabaseClient
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Cart item deleted successfully' }),
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