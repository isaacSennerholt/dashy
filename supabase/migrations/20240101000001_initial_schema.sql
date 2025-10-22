-- Create custom types
CREATE TYPE metric_unit AS ENUM ('percentage', 'temperature', 'count', 'bytes', 'seconds', 'milliseconds', 'currency');

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    alias TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create metrics table
CREATE TABLE public.metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit metric_unit NOT NULL,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create metric_history table
CREATE TABLE public.metric_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_id UUID REFERENCES public.metrics(id) ON DELETE CASCADE NOT NULL,
    value NUMERIC NOT NULL,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_metrics_type ON public.metrics(type);
CREATE INDEX idx_metrics_created_at ON public.metrics(created_at);
CREATE INDEX idx_metric_history_metric_id ON public.metric_history(metric_id);
CREATE INDEX idx_metric_history_created_at ON public.metric_history(created_at);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for metrics (readable by all, writable by authenticated users)
CREATE POLICY "Metrics are viewable by everyone" ON public.metrics
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create metrics" ON public.metrics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update metrics they created" ON public.metrics
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete metrics they created" ON public.metrics
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for metric_history (readable by all, writable by authenticated users)
CREATE POLICY "Metric history is viewable by everyone" ON public.metric_history
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create metric history" ON public.metric_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, alias)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'alias', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON public.metrics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to add metric history when metric is updated
CREATE OR REPLACE FUNCTION public.add_metric_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.value != NEW.value THEN
        INSERT INTO public.metric_history (metric_id, value, created_by)
        VALUES (NEW.id, NEW.value, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add history on metric update
CREATE TRIGGER on_metric_updated
    AFTER UPDATE ON public.metrics
    FOR EACH ROW EXECUTE FUNCTION public.add_metric_history();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.metric_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;