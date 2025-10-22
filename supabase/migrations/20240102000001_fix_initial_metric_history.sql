-- Fix: Add initial metric history record when a new metric is created
-- This ensures that new metrics have their initial value recorded in the history table

-- Function to add initial metric history when metric is created
CREATE OR REPLACE FUNCTION public.add_initial_metric_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Add the initial value to metric history
    INSERT INTO public.metric_history (metric_id, value, created_by)
    VALUES (NEW.id, NEW.value, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add initial history on metric creation
CREATE TRIGGER on_metric_created
    AFTER INSERT ON public.metrics
    FOR EACH ROW EXECUTE FUNCTION public.add_initial_metric_history();

-- Grant necessary permissions for the new function
GRANT EXECUTE ON FUNCTION public.add_initial_metric_history() TO authenticated;