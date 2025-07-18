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
        if (action === 'create') {
          const orderData = await req.json()

          // Create order
          const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
              user_id: orderData.userId,
              order_status: orderData.paymentMethod === 'cod' ? 'confirmed' : 'pending',
              payment_method: orderData.paymentMethod,
              payment_status: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
              total_amount: orderData.totalAmount,
              shipping_address: orderData.addressInfo
            })
            .select()
            .single()

          if (orderError) {
            return new Response(
              JSON.stringify({ success: false, message: orderError.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
          }

          // Create order items
          const orderItems = orderData.cartItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId,
            title: item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity
          }))

          const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(orderItems)

          if (itemsError) {
            return new Response(
              JSON.stringify({ success: false, message: itemsError.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
          }

          // Clear cart for COD orders
          if (orderData.paymentMethod === 'cod') {
            await supabaseClient
              .from('cart_items')
              .delete()
              .eq('user_id', orderData.userId)
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: orderData.paymentMethod === 'cod' 
                ? 'Order placed successfully with Cash on Delivery'
                : 'Order created successfully',
              orderId: order.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'GET': {
        if (action.startsWith('list')) {
          // Get orders by user ID
          const userId = pathSegments[pathSegments.length - 1]

          const { data: orders, error } = await supabaseClient
            .from('orders')
            .select(`
              *,
              order_items (
                *
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) {
            return new Response(
              JSON.stringify({ success: false, message: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
          }

          // Transform data to match frontend expectations
          const transformedOrders = orders.map(order => ({
            _id: order.id,
            userId: order.user_id,
            cartItems: order.order_items.map((item: any) => ({
              productId: item.product_id,
              title: item.title,
              image: item.image,
              price: item.price,
              quantity: item.quantity
            })),
            addressInfo: order.shipping_address,
            orderStatus: order.order_status,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            totalAmount: order.total_amount,
            orderDate: order.created_at,
            orderUpdateDate: order.updated_at
          }))

          return new Response(
            JSON.stringify({ success: true, data: transformedOrders }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (action.startsWith('details')) {
          // Get single order details
          const orderId = pathSegments[pathSegments.length - 1]

          const { data: order, error } = await supabaseClient
            .from('orders')
            .select(`
              *,
              order_items (
                *
              )
            `)
            .eq('id', orderId)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ success: false, message: 'Order not found' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
          }

          // Transform data
          const transformedOrder = {
            _id: order.id,
            userId: order.user_id,
            cartItems: order.order_items.map((item: any) => ({
              productId: item.product_id,
              title: item.title,
              image: item.image,
              price: item.price,
              quantity: item.quantity
            })),
            addressInfo: order.shipping_address,
            orderStatus: order.order_status,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            totalAmount: order.total_amount,
            orderDate: order.created_at,
            orderUpdateDate: order.updated_at
          }

          return new Response(
            JSON.stringify({ success: true, data: transformedOrder }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get all orders (admin)
          const { data: orders, error } = await supabaseClient
            .from('orders')
            .select(`
              *,
              order_items (
                *
              )
            `)
            .order('created_at', { ascending: false })

          if (error) {
            return new Response(
              JSON.stringify({ success: false, message: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
          }

          // Transform data
          const transformedOrders = orders.map(order => ({
            _id: order.id,
            userId: order.user_id,
            cartItems: order.order_items.map((item: any) => ({
              productId: item.product_id,
              title: item.title,
              image: item.image,
              price: item.price,
              quantity: item.quantity
            })),
            addressInfo: order.shipping_address,
            orderStatus: order.order_status,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            totalAmount: order.total_amount,
            orderDate: order.created_at,
            orderUpdateDate: order.updated_at
          }))

          return new Response(
            JSON.stringify({ success: true, data: transformedOrders }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'PUT': {
        // Update order status (admin only)
        const orderId = pathSegments[pathSegments.length - 1]
        const { orderStatus } = await req.json()

        const { data: order, error } = await supabaseClient
          .from('orders')
          .update({ order_status: orderStatus })
          .eq('id', orderId)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Order status updated successfully!' }),
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