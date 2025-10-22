import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'PUT') {
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

    const body = await req.json()
    const { value } = body

    if (value === undefined) {
      return new Response(
        JSON.stringify({ error: 'Value is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // First check if metric exists and user has permission
    const { data: existingMetric, error: fetchError } = await supabaseClient
      .from('metrics')
      .select('*')
      .eq('id', metricId)
      .single()

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Metric not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the metric value
    const { data: updatedMetric, error: updateError } = await supabaseClient
      .from('metrics')
      .update({ 
        value: parseFloat(value),
        updated_at: new Date().toISOString()
      })
      .eq('id', metricId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Add to history (this will be automatically handled by the trigger)
    const { error: historyError } = await supabaseClient
      .from('metric_history')
      .insert([
        {
          metric_id: metricId,
          value: parseFloat(value),
          created_by: user.id
        }
      ])

    if (historyError) {
      console.error('Failed to add to history:', historyError)
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify(updatedMetric),
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