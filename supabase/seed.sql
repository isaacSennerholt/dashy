-- Insert seed data for development
-- Note: User profiles are created automatically via auth triggers when users sign up
-- This seed file only contains sample metrics without user dependencies

-- Insert sample metrics (created_by set to NULL since no auth users exist yet)
INSERT INTO public.metrics (id, type, value, unit, created_by, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'CPU Usage', 75.5, 'percentage', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'Memory Usage', 68.2, 'percentage', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Response Time', 120, 'milliseconds', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Active Users', 1250, 'count', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Revenue', 45000, 'currency', NULL, NOW(), NOW());

-- Insert sample metric history (created_by set to NULL since no auth users exist yet)
INSERT INTO public.metric_history (metric_id, value, created_by, created_at) VALUES
  -- CPU Usage history
  ('550e8400-e29b-41d4-a716-446655440000', 70.2, NULL, NOW() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440000', 72.8, NULL, NOW() - INTERVAL '45 minutes'),
  ('550e8400-e29b-41d4-a716-446655440000', 75.5, NULL, NOW() - INTERVAL '30 minutes'),
  ('550e8400-e29b-41d4-a716-446655440000', 73.1, NULL, NOW() - INTERVAL '15 minutes'),
  
  -- Memory Usage history
  ('550e8400-e29b-41d4-a716-446655440001', 65.0, NULL, NOW() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440001', 66.5, NULL, NOW() - INTERVAL '45 minutes'),
  ('550e8400-e29b-41d4-a716-446655440001', 68.2, NULL, NOW() - INTERVAL '30 minutes'),
  
  -- Response Time history
  ('550e8400-e29b-41d4-a716-446655440002', 110, NULL, NOW() - INTERVAL '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440002', 115, NULL, NOW() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440002', 120, NULL, NOW() - INTERVAL '30 minutes'),
  
  -- Active Users history
  ('550e8400-e29b-41d4-a716-446655440003', 1100, NULL, NOW() - INTERVAL '3 hours'),
  ('550e8400-e29b-41d4-a716-446655440003', 1180, NULL, NOW() - INTERVAL '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440003', 1220, NULL, NOW() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440003', 1250, NULL, NOW() - INTERVAL '30 minutes'),
  
  -- Revenue history
  ('550e8400-e29b-41d4-a716-446655440004', 42000, NULL, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440004', 43500, NULL, NOW() - INTERVAL '12 hours'),
  ('550e8400-e29b-41d4-a716-446655440004', 45000, NULL, NOW() - INTERVAL '6 hours');