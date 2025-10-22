-- Add user-specific metric ordering functionality
-- This allows authenticated users to customize the display order of metric cards

-- Create user_metric_orders table to store per-user metric ordering
CREATE TABLE public.user_metric_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    metric_id UUID REFERENCES public.metrics(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure each user can only have one ordering entry per metric
    UNIQUE(user_id, metric_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_metric_orders_user_id ON public.user_metric_orders(user_id);
CREATE INDEX idx_user_metric_orders_metric_id ON public.user_metric_orders(metric_id);
CREATE INDEX idx_user_metric_orders_order_index ON public.user_metric_orders(user_id, order_index);

-- Enable RLS on the new table
ALTER TABLE public.user_metric_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_metric_orders
CREATE POLICY "Users can view their own metric orders" ON public.user_metric_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metric orders" ON public.user_metric_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metric orders" ON public.user_metric_orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metric orders" ON public.user_metric_orders
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_user_metric_orders_updated_at 
    BEFORE UPDATE ON public.user_metric_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.user_metric_orders TO authenticated;