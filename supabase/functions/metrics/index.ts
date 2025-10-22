import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { method } = req

    if (method === 'GET') {
      // Get all metrics with latest values
      const { data: metrics, error } = await supabaseClient
        .from('metrics')
        .select(`
          *,
          user_profiles!metrics_created_by_fkey(alias)
        `)
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify(metrics),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'POST') {
      // Create new metric
      const body = await req.json()
      const { type, value, unit } = body

      if (!type || value === undefined || !unit) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: type, value, unit' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data: metric, error } = await supabaseClient
        .from('metrics')
        .insert([
          {
            type,
            value: parseFloat(value),
            unit,
            created_by: user.id
          }
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify(metric),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})