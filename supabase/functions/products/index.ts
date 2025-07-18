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
    const action = pathSegments[pathSegments.length - 1] // Last segment after /functions/v1/products

    switch (req.method) {
      case 'GET': {
        if (action && action !== 'products') {
          // Get single product by ID
          const { data: product, error } = await supabaseClient
            .from('products')
            .select(`
              *,
              categories(name, slug),
              brands(name, slug)
            `)
            .eq('id', action)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ success: false, message: 'Product not found' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: product }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get filtered products
        const category = url.searchParams.get('category')
        const brand = url.searchParams.get('brand')
        const sortBy = url.searchParams.get('sortBy') || 'price-lowtohigh'

        let query = supabaseClient
          .from('products')
          .select(`
            *,
            categories(name, slug),
            brands(name, slug)
          `)

        // Apply filters
        if (category) {
          const categories = category.split(',')
          query = query.in('categories.slug', categories)
        }

        if (brand) {
          const brands = brand.split(',')
          query = query.in('brands.slug', brands)
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-lowtohigh':
            query = query.order('price', { ascending: true })
            break
          case 'price-hightolow':
            query = query.order('price', { ascending: false })
            break
          case 'title-atoz':
            query = query.order('title', { ascending: true })
            break
          case 'title-ztoa':
            query = query.order('title', { ascending: false })
            break
          default:
            query = query.order('price', { ascending: true })
        }

        const { data: products, error } = await query

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: products }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, message: 'Unauthorized' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        const productData = await req.json()

        // Get category and brand IDs
        const { data: category } = await supabaseClient
          .from('categories')
          .select('id')
          .eq('slug', productData.category)
          .single()

        const { data: brand } = await supabaseClient
          .from('brands')
          .select('id')
          .eq('slug', productData.brand)
          .single()

        const { data: product, error } = await supabaseClient
          .from('products')
          .insert({
            title: productData.title,
            description: productData.description,
            image: productData.image,
            category_id: category?.id,
            brand_id: brand?.id,
            price: productData.price,
            sale_price: productData.salePrice || 0,
            total_stock: productData.totalStock,
            average_review: productData.averageReview || 0
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
          JSON.stringify({ success: true, data: product }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const productData = await req.json()
        const productId = action

        // Get category and brand IDs
        const { data: category } = await supabaseClient
          .from('categories')
          .select('id')
          .eq('slug', productData.category)
          .single()

        const { data: brand } = await supabaseClient
          .from('brands')
          .select('id')
          .eq('slug', productData.brand)
          .single()

        const { data: product, error } = await supabaseClient
          .from('products')
          .update({
            title: productData.title,
            description: productData.description,
            image: productData.image,
            category_id: category?.id,
            brand_id: brand?.id,
            price: productData.price,
            sale_price: productData.salePrice || 0,
            total_stock: productData.totalStock,
            average_review: productData.averageReview || 0
          })
          .eq('id', productId)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: product }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const productId = action

        const { error } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', productId)

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Product deleted successfully' }),
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