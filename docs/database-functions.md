# Database Functions Documentation

## Overview

This document explains the PostgreSQL functions used in the Stats Dashboard application, specifically those defined in the Supabase migration files. These functions provide critical business logic at the database level, ensuring data integrity, consistency, and optimal performance for real-time features.

**Migration Files**:
- `20240101000001_initial_schema.sql` - Core schema and functions
- `20240102000001_fix_initial_metric_history.sql` - History tracking fixes  
- `20240103000001_fix_user_profile_visibility.sql` - Profile access improvements
- `20240104000001_add_user_metric_ordering.sql` - Drag & drop ordering support

## Why Database Functions?

Instead of implementing business logic in application code, we use PostgreSQL functions for several key advantages:

- **Data Integrity**: Functions execute within database transactions and cannot be bypassed
- **Performance**: Database-level operations are faster with no network overhead
- **Consistency**: Logic is centralized and applies regardless of which client accesses the data
- **Real-time Support**: Immediate execution enables instant updates for real-time features
- **Security**: `SECURITY DEFINER` allows controlled privilege escalation

## Function Definitions

### 1. `handle_new_user()` - Automatic User Profile Creation

**Purpose**: Automatically creates a user profile record whenever a new user signs up via Supabase Auth.

**Location**: Lines 78-85 in migration file

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, alias)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'alias', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Trigger Setup**:
```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**How It Works**:
1. **Trigger Event**: Executes automatically `AFTER INSERT` on the `auth.users` table
2. **Profile Creation**: Creates a corresponding record in `public.user_profiles`
3. **Alias Generation**: Uses provided alias from `raw_user_meta_data` or generates one from email
4. **Data Mapping**: Maps `auth.users.id` to `user_profiles.id` for referential integrity

**Why This Approach**:
- **Seamless UX**: Users don't need a separate profile creation step
- **Data Consistency**: Guarantees every authenticated user has a profile
- **Automatic Fallback**: Generates alias if none provided during signup
- **Atomic Operation**: Profile creation is part of the signup transaction

**Alternative Approach Problems**:
- Application code could fail after user creation, leaving orphaned auth records
- Requires additional API calls and error handling
- Risk of race conditions with concurrent signups
- Manual coordination between auth and profile systems

### 2. `update_updated_at_column()` - Automatic Timestamp Management

**Purpose**: Automatically updates the `updated_at` timestamp whenever a record is modified.

**Location**: Lines 93-99 in migration file

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger Setup**:
```sql
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON public.metrics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

**How It Works**:
1. **Trigger Event**: Executes `BEFORE UPDATE` on configured tables
2. **Timestamp Update**: Sets `NEW.updated_at` to current timestamp
3. **Automatic Execution**: Happens for every update operation

**Why This Approach**:
- **Audit Trail**: Provides accurate modification timestamps for all records
- **Zero Maintenance**: Developers never forget to update timestamps
- **Performance**: Database operation is faster than application-level updates
- **Consistency**: Same logic applied across multiple tables

**Use Cases**:
- Track when metrics were last modified
- Provide "last updated" information in the UI
- Enable time-based queries and sorting
- Support cache invalidation strategies

### 3. `add_metric_history()` - Automatic Metric History Tracking

**Purpose**: Automatically creates a history record whenever a metric value changes, enabling historical tracking and sparkline visualizations.

**Location**: Lines 109-118 in migration file

```sql
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
```

**Trigger Setup**:
```sql
CREATE TRIGGER on_metric_updated
    AFTER UPDATE ON public.metrics
    FOR EACH ROW EXECUTE FUNCTION public.add_metric_history();
```

**How It Works**:
1. **Trigger Event**: Executes `AFTER UPDATE` on the `metrics` table
2. **Value Comparison**: Only creates history if the value actually changed (`OLD.value != NEW.value`)
3. **History Record**: Inserts new record with metric ID, new value, and current user
4. **User Context**: Uses `auth.uid()` to track who made the change

**Why This Approach**:
- **Core Feature**: Historical tracking is essential for sparkline charts
- **Data Integrity**: Guarantees history is never missed when values change
- **Real-time Ready**: History is immediately available for subscriptions
- **Performance**: No additional API calls or application coordination needed
- **Security**: `SECURITY DEFINER` ensures proper access to `auth.uid()`

**Business Logic**:
- Only creates history when values actually change (prevents noise)
- Captures the user who made the change for audit purposes
- Enables time-series analysis of metric trends
- Powers the sparkline visualizations in the UI

## Architecture Benefits

### Data Integrity Guarantees

**Atomic Operations**:
```sql
-- This entire operation is atomic
UPDATE metrics SET value = 85.5 WHERE id = 'metric-123';
-- ↓ Automatically triggers history creation
-- INSERT INTO metric_history (metric_id, value, created_by) VALUES (...);
```

**Cannot Be Bypassed**:
- Direct database access still triggers functions
- API bugs cannot skip business logic
- Malicious clients cannot circumvent rules

### Performance Advantages

**Reduced Network Overhead**:
```
Application Approach:          Database Function Approach:
1. UPDATE metrics              1. UPDATE metrics
2. SELECT to check if changed     ↓ (automatic)
3. INSERT into history         2. Function creates history
4. Handle errors/rollbacks        (all atomic)

= 3+ database calls           = 1 database call
```

**Real-time Benefits**:
- History records available immediately for real-time subscriptions
- No delay between metric updates and chart data
- Sparklines update instantly when metrics change

### Security Considerations

**`SECURITY DEFINER` Usage**:
```sql
-- This function runs with creator's privileges
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Why It's Safe**:
- Functions are controlled and reviewed in migrations
- Limited scope - only specific, well-defined operations
- Enables access to `auth.uid()` for user context
- Alternative would require elevated application permissions

**Security Benefits**:
- User context preserved in history records
- Controlled privilege escalation for specific operations
- Audit trail includes user attribution

## Alternative Approaches & Trade-offs

### Application-Level Implementation

**What it would look like**:
```typescript
// Application code approach
async function updateMetric(id: string, newValue: number) {
  const transaction = await db.transaction()
  try {
    // Update metric
    const oldMetric = await transaction.update('metrics')
      .where('id', id)
      .set({ value: newValue, updated_at: new Date() })
      .returning('*')
    
    // Create history if value changed
    if (oldMetric.value !== newValue) {
      await transaction.insert('metric_history')
        .values({
          metric_id: id,
          value: newValue,
          created_by: userId
        })
    }
    
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
```

**Problems with Application Approach**:
- **Complexity**: Requires transaction management and error handling
- **Performance**: Multiple round-trips to database
- **Reliability**: Application failures could leave inconsistent data
- **Maintainability**: Business logic scattered across multiple files
- **Security**: Requires application to have broad database permissions

### Database Function Advantages

**Simplicity**:
```typescript
// With database functions
async function updateMetric(id: string, newValue: number) {
  await db.update('metrics')
    .where('id', id)
    .set({ value: newValue })
    // History and timestamps handled automatically
}
```

**Reliability**:
- Single atomic operation
- Impossible to forget history creation
- Consistent behavior across all clients
- No partial failures or inconsistent states

## Integration with Application Code

### React Hooks Integration

The database functions integrate seamlessly with the application's React Query hooks:

```typescript
// useUpdateMetric hook leverages automatic history creation
export function useUpdateMetric() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMetricInput }) => {
      const { data: updatedMetric, error } = await supabase
        .from('metrics')
        .update({ value: sanitizedValue, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      // History is automatically created by database trigger
      return updatedMetric
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      queryClient.invalidateQueries({ queryKey: ['metric-history', variables.id] })
    }
  })
}
```

### Real-time Subscriptions

Database functions enable immediate real-time updates:

```typescript
// Real-time subscription receives updates instantly
const subscription = supabase
  .channel('metrics-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'metrics'
  }, (payload) => {
    // Metric and history data is immediately consistent
    queryClient.invalidateQueries({ queryKey: ['metrics'] })
    queryClient.invalidateQueries({ queryKey: ['metric-history', payload.new.id] })
  })
```

## Conclusion

PostgreSQL functions provide a robust foundation for the Stats Dashboard's core business logic. They ensure data integrity, optimize performance, and enable real-time features while reducing complexity in application code.

### Key Benefits Summary:
1. **Guaranteed Execution**: Business logic cannot be bypassed
2. **Optimal Performance**: Minimal network overhead and immediate consistency
3. **Real-time Ready**: Instant availability for subscriptions and UI updates
4. **Simplified Code**: Application logic focuses on user experience, not data consistency
5. **Audit Trail**: Comprehensive tracking of changes with user attribution

This architecture enables the application to meet its core requirements of real-time updates with <100ms latency while maintaining data integrity and providing comprehensive historical tracking for all metrics.

### Recent Enhancements

**User Metric Ordering (Migration 20240104000001)**:
- Added `user_metric_orders` table for persistent drag & drop functionality
- Each user can customize metric card ordering with database storage
- Supports the @dnd-kit integration for intuitive UI interactions
- RLS policies ensure users only manage their own ordering preferences