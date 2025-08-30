-- =====================================================
-- IQ Test Platform - Enterprise Database Schema
-- PostgreSQL 14+ with advanced security features
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CORE USER MANAGEMENT
-- =====================================================

-- Users table with enhanced security
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    country_code VARCHAR(3),
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token UUID,
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned', 'pending')),
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Security constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_age CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '13 years')
);

-- User profiles for additional data
CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    education_level VARCHAR(50),
    occupation VARCHAR(100),
    native_language VARCHAR(50),
    test_preferences JSONB,
    privacy_settings JSONB DEFAULT '{"share_results": false, "public_profile": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for JWT management
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- QUESTION BANK MANAGEMENT
-- =====================================================

-- Question categories
CREATE TABLE question_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question types
CREATE TABLE question_types (
    type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    pattern_complexity INTEGER CHECK (pattern_complexity BETWEEN 1 AND 10),
    rendering_requirements JSONB,
    is_active BOOLEAN DEFAULT TRUE
);

-- Core questions table
CREATE TABLE questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id INTEGER REFERENCES question_categories(category_id),
    type_id INTEGER REFERENCES question_types(type_id),
    question_text TEXT,
    matrix_data JSONB NOT NULL, -- 3x3 matrix structure
    pattern_rules JSONB NOT NULL, -- Logic rules and patterns
    difficulty_score DECIMAL(3,2) CHECK (difficulty_score BETWEEN 0.00 AND 10.00),
    time_estimate INTEGER DEFAULT 60, -- seconds
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(user_id),
    
    -- Ensure matrix_data has proper structure
    CONSTRAINT valid_matrix_data CHECK (jsonb_typeof(matrix_data) = 'object'),
    CONSTRAINT valid_pattern_rules CHECK (jsonb_typeof(pattern_rules) = 'array')
);

-- Answer options for each question
CREATE TABLE answer_options (
    option_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    option_label CHAR(1) NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
    option_content JSONB NOT NULL, -- Visual representation
    is_correct BOOLEAN NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one correct answer per question
    UNIQUE(question_id, is_correct) DEFERRABLE INITIALLY DEFERRED
);

-- Question statistics for adaptive difficulty
CREATE TABLE question_statistics (
    stat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    total_attempts INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    average_time_spent DECIMAL(8,2) DEFAULT 0,
    difficulty_adjustment DECIMAL(3,2) DEFAULT 0,
    last_calibrated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Calculated fields
    success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_attempts > 0 
        THEN ROUND((correct_answers::DECIMAL / total_attempts) * 100, 2)
        ELSE 0 END
    ) STORED
);

-- =====================================================
-- TEST MANAGEMENT
-- =====================================================

-- Test sessions
CREATE TABLE test_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    test_type VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_limit INTEGER DEFAULT 2400, -- 40 minutes in seconds
    time_remaining INTEGER,
    current_question INTEGER DEFAULT 1,
    total_questions INTEGER DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test questions for each session
CREATE TABLE test_questions (
    test_question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(question_id),
    question_order INTEGER NOT NULL,
    user_answer UUID REFERENCES answer_options(option_id),
    time_spent INTEGER, -- seconds
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESULTS AND ANALYTICS
-- =====================================================

-- Test results
CREATE TABLE test_results (
    result_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    raw_score INTEGER NOT NULL,
    max_possible_score INTEGER NOT NULL,
    percentage_score DECIMAL(5,2) NOT NULL,
    iq_score INTEGER,
    iq_percentile DECIMAL(5,2),
    time_taken INTEGER NOT NULL, -- total seconds
    questions_answered INTEGER NOT NULL,
    questions_correct INTEGER NOT NULL,
    average_confidence DECIMAL(3,2),
    difficulty_distribution JSONB,
    category_performance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_percentage CHECK (percentage_score BETWEEN 0 AND 100),
    CONSTRAINT valid_iq_score CHECK (iq_score IS NULL OR (iq_score >= 40 AND iq_score <= 200)),
    CONSTRAINT valid_percentile CHECK (iq_percentile IS NULL OR (iq_percentile BETWEEN 0 AND 100))
);

-- Detailed question responses
CREATE TABLE question_responses (
    response_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL REFERENCES test_results(result_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(question_id),
    user_answer UUID REFERENCES answer_options(option_id),
    correct_answer UUID NOT NULL REFERENCES answer_options(option_id),
    time_spent INTEGER NOT NULL,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    is_correct BOOLEAN NOT NULL,
    difficulty_level INTEGER,
    pattern_complexity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENT AND SUBSCRIPTION
-- =====================================================

-- Payment transactions
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    result_id UUID REFERENCES test_results(result_id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),
    transaction_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure positive amounts
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECURITY AND AUDIT
-- =====================================================

-- Security logs
CREATE TABLE security_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    event_type VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    request_data JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API rate limiting
CREATE TABLE rate_limit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =====================================================

-- User lookup indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(account_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;

-- Session management indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);

-- Question performance indexes
CREATE INDEX idx_questions_category_type ON questions(category_id, type_id) WHERE is_active = TRUE;
CREATE INDEX idx_questions_difficulty ON questions(difficulty_score) WHERE is_active = TRUE;
CREATE INDEX idx_questions_matrix_data ON questions USING GIN(matrix_data);
CREATE INDEX idx_questions_pattern_rules ON questions USING GIN(pattern_rules);

-- Test session indexes
CREATE INDEX idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX idx_test_sessions_status ON test_sessions(status);
CREATE INDEX idx_test_sessions_started_at ON test_sessions(started_at);

-- Results and analytics indexes
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_created_at ON test_results(created_at);
CREATE INDEX idx_test_results_iq_score ON test_results(iq_score);
CREATE INDEX idx_test_results_percentage ON test_results(percentage_score);

-- Payment indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Security and rate limiting indexes
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_rate_limit_logs_ip_endpoint ON rate_limit_logs(ip_address, endpoint);

-- =====================================================
-- PARTITIONING FOR SCALABILITY
-- =====================================================

-- Partition test_results by month for better performance
CREATE TABLE test_results_partitioned (
    LIKE test_results INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create partitions for the next 12 months
CREATE TABLE test_results_2024_01 PARTITION OF test_results_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE test_results_2024_02 PARTITION OF test_results_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Continue for remaining months...

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User dashboard view
CREATE VIEW user_dashboard AS
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(tr.result_id) as total_tests,
    AVG(tr.iq_score) as average_iq,
    MAX(tr.created_at) as last_test_date,
    up.test_preferences,
    up.privacy_settings
FROM users u
LEFT JOIN test_results tr ON u.user_id = tr.user_id
LEFT JOIN user_profiles up ON u.user_id = up.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.user_id, u.email, u.first_name, u.last_name, up.test_preferences, up.privacy_settings;

-- Question performance analytics view
CREATE VIEW question_analytics AS
SELECT 
    q.question_id,
    qc.name as category_name,
    qt.name as type_name,
    q.difficulty_score,
    qs.total_attempts,
    qs.success_rate,
    qs.average_time_spent,
    qs.difficulty_adjustment
FROM questions q
JOIN question_categories qc ON q.category_id = qc.category_id
JOIN question_types qt ON q.type_id = qt.type_id
JOIN question_statistics qs ON q.question_id = qs.question_id
WHERE q.is_active = TRUE;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_sessions_updated_at BEFORE UPDATE ON test_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate IQ score
CREATE OR REPLACE FUNCTION calculate_iq_score(
    raw_score INTEGER,
    max_score INTEGER,
    user_age INTEGER DEFAULT 25
)
RETURNS INTEGER AS $$
DECLARE
    percentile DECIMAL;
    iq_score INTEGER;
BEGIN
    -- Calculate percentile based on historical data
    -- This is a simplified version - you'd want more sophisticated statistical analysis
    percentile := (raw_score::DECIMAL / max_score) * 100;
    
    -- Convert percentile to IQ score (simplified)
    -- In practice, you'd use proper statistical distributions
    IF percentile >= 99.9 THEN
        iq_score := 145;
    ELSIF percentile >= 99 THEN
        iq_score := 135;
    ELSIF percentile >= 95 THEN
        iq_score := 125;
    ELSIF percentile >= 90 THEN
        iq_score := 120;
    ELSIF percentile >= 75 THEN
        iq_score := 110;
    ELSIF percentile >= 50 THEN
        iq_score := 100;
    ELSIF percentile >= 25 THEN
        iq_score := 90;
    ELSIF percentile >= 10 THEN
        iq_score := 80;
    ELSIF percentile >= 5 THEN
        iq_score := 75;
    ELSIF percentile >= 1 THEN
        iq_score := 70;
    ELSE
        iq_score := 65;
    END IF;
    
    -- Age adjustment (simplified)
    IF user_age < 18 THEN
        iq_score := iq_score + 5;
    ELSIF user_age > 65 THEN
        iq_score := iq_score - 3;
    END IF;
    
    RETURN GREATEST(40, LEAST(200, iq_score));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECURITY POLICIES (Row Level Security)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY test_results_own_data ON test_results
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_profiles_own_data ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY payments_own_data ON payments
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default question categories
INSERT INTO question_categories (name, description, difficulty_level) VALUES
('Pattern Recognition', 'Visual pattern identification and completion', 7),
('Spatial Reasoning', '3D spatial awareness and manipulation', 8),
('Logical Sequences', 'Logical progression and sequence completion', 6),
('Mathematical Patterns', 'Numerical and geometric patterns', 9),
('Abstract Reasoning', 'Abstract concept manipulation', 8);

-- Insert default question types
INSERT INTO question_types (name, description, pattern_complexity, rendering_requirements) VALUES
('Matrix Completion', '3x3 matrix with missing element', 8, '{"requires_svg": true, "supports_3d": false}'),
('Rotation Patterns', 'Shape rotation and transformation', 7, '{"requires_svg": true, "supports_3d": false}'),
('Sequence Logic', 'Logical sequence completion', 6, '{"requires_svg": false, "supports_3d": false}'),
('Spatial Manipulation', '3D spatial reasoning', 9, '{"requires_svg": true, "supports_3d": true}'),
('Pattern Synthesis', 'Complex multi-rule patterns', 10, '{"requires_svg": true, "supports_3d": true}');

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Core user accounts with enhanced security features';
COMMENT ON TABLE questions IS 'IQ test questions with matrix data and pattern rules';
COMMENT ON TABLE test_results IS 'User test results with calculated IQ scores';
COMMENT ON TABLE payments IS 'Payment transactions for test results access';
COMMENT ON FUNCTION calculate_iq_score IS 'Calculates IQ score based on raw score and age';

-- =====================================================
-- END OF SCHEMA
-- ===================================================== 