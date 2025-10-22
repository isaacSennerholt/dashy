import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const metricId = url.pathname.split('/').pop()
    
    if (!metricId) {
      return new Response(
        JSON.stringify({ error: 'Metric ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get metric history with user aliases
    const { data: history, error } = await supabaseClient
      .from('metric_history')
      .select(`
        *,
        user_profiles!metric_history_created_by_fkey(alias)
      `)
      .eq('metric_id', metricId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Calculate min and max values
    const values = history.map(h => h.value)
    const minValue = values.length > 0 ? Math.min(...values) : 0
    const maxValue = values.length > 0 ? Math.max(...values) : 0

    const result = {
      history,
      stats: {
        min: minValue,
        max: maxValue,
        count: history.length
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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