-- Create table to track username changes
CREATE TABLE username_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    previous_username TEXT,
    new_username TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE username_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own history
CREATE POLICY "Users can view their own username history"
    ON username_history FOR SELECT
    USING (auth.uid() = user_id);

-- Function to check limit and log change
CREATE OR REPLACE FUNCTION check_username_change_limit()
RETURNS TRIGGER AS $$
DECLARE
    change_count INTEGER;
BEGIN
    -- Only run if full_name is changing
    IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
        -- Count changes in the last year
        SELECT COUNT(*) INTO change_count
        FROM username_history
        WHERE user_id = NEW.id
        AND changed_at > NOW() - INTERVAL '1 year';

        IF change_count >= 2 THEN
            RAISE EXCEPTION 'Username can only be changed twice per year.';
        END IF;

        -- Log the change
        INSERT INTO username_history (user_id, previous_username, new_username)
        VALUES (NEW.id, OLD.full_name, NEW.full_name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on profiles table
CREATE TRIGGER on_username_change
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_username_change_limit();
