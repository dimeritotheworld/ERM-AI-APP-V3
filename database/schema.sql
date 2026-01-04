-- ============================================
-- DIMERI ERM - PostgreSQL Database Schema
-- Version: 1.0.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE member_status AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE workspace_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE plan_type AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE risk_likelihood AS ENUM ('rare', 'unlikely', 'possible', 'likely', 'almost_certain');
CREATE TYPE risk_impact AS ENUM ('insignificant', 'minor', 'moderate', 'major', 'catastrophic');
CREATE TYPE risk_status AS ENUM ('open', 'in_progress', 'mitigated', 'closed', 'accepted');
CREATE TYPE control_status AS ENUM ('planned', 'implemented', 'effective', 'ineffective', 'retired');
CREATE TYPE control_type AS ENUM ('preventive', 'detective', 'corrective', 'directive');
CREATE TYPE activity_type AS ENUM ('user', 'risk', 'control', 'report', 'settings', 'system');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    phone VARCHAR(50),
    job_title VARCHAR(255),
    department VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',

    -- Email verification
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,

    -- Password reset
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,

    -- Two-factor auth
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),

    -- Preferences (JSON for flexibility)
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "weekly_digest": true}',

    -- Timestamps
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- WORKSPACES TABLE
-- ============================================

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(512),
    industry VARCHAR(255),
    company_size VARCHAR(50),

    -- Owner
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Plan & Billing
    plan plan_type DEFAULT 'FREE',
    plan_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    billing_email VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),

    -- Status
    status workspace_status DEFAULT 'active',
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspended_reason TEXT,

    -- Settings (JSON for flexibility)
    settings JSONB DEFAULT '{}',
    risk_categories JSONB DEFAULT '["Strategic", "Operational", "Financial", "Compliance", "Technology", "Reputational"]',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_status ON workspaces(status);

-- ============================================
-- WORKSPACE MEMBERS (Join Table)
-- ============================================

CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    status member_status DEFAULT 'active',

    -- Invitation details
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invitation_token VARCHAR(255),
    invitation_expires TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,

    -- Suspension
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspended_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_status ON workspace_members(status);

-- ============================================
-- RISK REGISTERS TABLE
-- ============================================

CREATE TABLE risk_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#c41e3a',
    icon VARCHAR(50),

    -- Ownership
    owner_id UUID REFERENCES users(id),

    -- Stats (denormalized for performance)
    risk_count INTEGER DEFAULT 0,
    high_risk_count INTEGER DEFAULT 0,

    -- Order
    sort_order INTEGER DEFAULT 0,

    -- Archive
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_risk_registers_workspace ON risk_registers(workspace_id);
CREATE INDEX idx_risk_registers_owner ON risk_registers(owner_id);

-- ============================================
-- RISKS TABLE
-- ============================================

CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    register_id UUID NOT NULL REFERENCES risk_registers(id) ON DELETE CASCADE,

    -- Core fields
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(255),

    -- Risk assessment (inherent)
    inherent_likelihood risk_likelihood,
    inherent_impact risk_impact,
    inherent_score INTEGER GENERATED ALWAYS AS (
        CASE inherent_likelihood
            WHEN 'rare' THEN 1
            WHEN 'unlikely' THEN 2
            WHEN 'possible' THEN 3
            WHEN 'likely' THEN 4
            WHEN 'almost_certain' THEN 5
        END *
        CASE inherent_impact
            WHEN 'insignificant' THEN 1
            WHEN 'minor' THEN 2
            WHEN 'moderate' THEN 3
            WHEN 'major' THEN 4
            WHEN 'catastrophic' THEN 5
        END
    ) STORED,

    -- Risk assessment (residual - after controls)
    residual_likelihood risk_likelihood,
    residual_impact risk_impact,
    residual_score INTEGER GENERATED ALWAYS AS (
        CASE residual_likelihood
            WHEN 'rare' THEN 1
            WHEN 'unlikely' THEN 2
            WHEN 'possible' THEN 3
            WHEN 'likely' THEN 4
            WHEN 'almost_certain' THEN 5
        END *
        CASE residual_impact
            WHEN 'insignificant' THEN 1
            WHEN 'minor' THEN 2
            WHEN 'moderate' THEN 3
            WHEN 'major' THEN 4
            WHEN 'catastrophic' THEN 5
        END
    ) STORED,

    -- Status & treatment
    status risk_status DEFAULT 'open',
    treatment TEXT,

    -- Ownership
    owner_id UUID REFERENCES users(id),

    -- Dates
    identified_date DATE DEFAULT CURRENT_DATE,
    review_date DATE,
    target_date DATE,

    -- Additional info
    causes TEXT,
    consequences TEXT,
    tags TEXT[],

    -- AI-related
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_risks_workspace ON risks(workspace_id);
CREATE INDEX idx_risks_register ON risks(register_id);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_owner ON risks(owner_id);
CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_inherent_score ON risks(inherent_score);
CREATE INDEX idx_risks_residual_score ON risks(residual_score);

-- ============================================
-- CONTROLS TABLE
-- ============================================

CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Core fields
    name VARCHAR(500) NOT NULL,
    description TEXT,
    control_type control_type,
    category VARCHAR(255),

    -- Status & effectiveness
    status control_status DEFAULT 'planned',
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    last_tested_at TIMESTAMP WITH TIME ZONE,
    next_test_date DATE,

    -- Ownership
    owner_id UUID REFERENCES users(id),

    -- Implementation details
    implementation_date DATE,
    implementation_cost DECIMAL(12,2),
    operating_cost DECIMAL(12,2),

    -- Documentation
    evidence_url VARCHAR(512),
    policy_reference VARCHAR(255),

    -- AI-related
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_controls_workspace ON controls(workspace_id);
CREATE INDEX idx_controls_status ON controls(status);
CREATE INDEX idx_controls_owner ON controls(owner_id);
CREATE INDEX idx_controls_type ON controls(control_type);

-- ============================================
-- RISK-CONTROL LINKS (Many-to-Many)
-- ============================================

CREATE TABLE risk_control_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,

    -- Relationship details
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),

    UNIQUE(risk_id, control_id)
);

CREATE INDEX idx_risk_control_links_risk ON risk_control_links(risk_id);
CREATE INDEX idx_risk_control_links_control ON risk_control_links(control_id);

-- ============================================
-- REPORTS TABLE
-- ============================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Core fields
    title VARCHAR(500) NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL, -- 'risk_summary', 'heatmap', 'control_assessment', 'custom'

    -- Content
    content JSONB, -- Store report data/configuration

    -- Generation
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID REFERENCES users(id),

    -- File storage
    file_url VARCHAR(512),
    file_format VARCHAR(20), -- 'pdf', 'excel', 'csv'
    file_size INTEGER,

    -- Scheduling
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_cron VARCHAR(100),
    next_run_at TIMESTAMP WITH TIME ZONE,

    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    public_token VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_workspace ON reports(workspace_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);

-- ============================================
-- ACTIVITIES / AUDIT LOG TABLE
-- ============================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Actor
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255), -- Denormalized for display
    user_email VARCHAR(255),

    -- Action
    activity_type activity_type NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'exported', etc.

    -- Target
    target_type VARCHAR(100), -- 'risk', 'control', 'report', 'user', etc.
    target_id UUID,
    target_name VARCHAR(500),

    -- Details
    description TEXT,
    details JSONB, -- Additional context

    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_workspace ON activities(workspace_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_target ON activities(target_type, target_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- ============================================
-- SESSIONS TABLE (for JWT refresh tokens)
-- ============================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Token
    refresh_token VARCHAR(500) NOT NULL,

    -- Device info
    device_name VARCHAR(255),
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address VARCHAR(45),

    -- Location (optional, from IP)
    location VARCHAR(255),

    -- Validity
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- SUBSCRIPTIONS / BILLING TABLE
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Stripe
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    stripe_price_id VARCHAR(255),

    -- Plan details
    plan plan_type NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'

    -- Billing period
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,

    -- Trial
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_workspace ON subscriptions(workspace_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- INVOICES TABLE
-- ============================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    -- Stripe
    stripe_invoice_id VARCHAR(255) UNIQUE,

    -- Amount
    amount_due INTEGER NOT NULL, -- in cents
    amount_paid INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Status
    status VARCHAR(50) NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'

    -- Dates
    invoice_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,

    -- PDF
    invoice_pdf_url VARCHAR(512),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_workspace ON invoices(workspace_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- AI USAGE TRACKING TABLE
-- ============================================

CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    -- Usage details
    feature VARCHAR(100) NOT NULL, -- 'risk_generation', 'control_suggestion', 'report_ai', etc.
    tokens_used INTEGER DEFAULT 0,
    cost_cents INTEGER DEFAULT 0,

    -- Request details
    model VARCHAR(100),
    prompt_tokens INTEGER,
    completion_tokens INTEGER,

    -- Period (for monthly limits)
    usage_month DATE NOT NULL, -- First day of the month

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_usage_workspace ON ai_usage(workspace_id);
CREATE INDEX idx_ai_usage_user ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_month ON ai_usage(usage_month);
CREATE INDEX idx_ai_usage_feature ON ai_usage(feature);

-- ============================================
-- PLAN LIMITS TABLE (Reference)
-- ============================================

CREATE TABLE plan_limits (
    plan plan_type PRIMARY KEY,
    max_risk_registers INTEGER,
    max_risks INTEGER,
    max_controls INTEGER,
    max_reports INTEGER,
    max_team_members INTEGER,
    max_storage_mb INTEGER,
    max_ai_calls_monthly INTEGER,
    can_export_pdf BOOLEAN DEFAULT FALSE,
    can_export_excel BOOLEAN DEFAULT FALSE,
    can_use_api BOOLEAN DEFAULT FALSE,
    has_sso BOOLEAN DEFAULT FALSE,
    has_audit_log BOOLEAN DEFAULT FALSE,
    has_custom_branding BOOLEAN DEFAULT FALSE,
    support_level VARCHAR(50) DEFAULT 'community' -- 'community', 'email', 'priority', 'dedicated'
);

-- Insert default plan limits
INSERT INTO plan_limits (plan, max_risk_registers, max_risks, max_controls, max_reports, max_team_members, max_storage_mb, max_ai_calls_monthly, can_export_pdf, can_export_excel, can_use_api, has_sso, has_audit_log, has_custom_branding, support_level)
VALUES
    ('FREE', 3, 25, 15, 5, 3, 50, 100, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'community'),
    ('PRO', 25, 500, 200, 50, 15, 500, 1000, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, 'email'),
    ('ENTERPRISE', -1, -1, -1, -1, -1, -1, -1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'dedicated');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_registers_updated_at BEFORE UPDATE ON risk_registers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update risk register counts
CREATE OR REPLACE FUNCTION update_risk_register_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE risk_registers SET
            risk_count = (SELECT COUNT(*) FROM risks WHERE register_id = NEW.register_id),
            high_risk_count = (SELECT COUNT(*) FROM risks WHERE register_id = NEW.register_id AND inherent_score >= 15)
        WHERE id = NEW.register_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE risk_registers SET
            risk_count = (SELECT COUNT(*) FROM risks WHERE register_id = OLD.register_id),
            high_risk_count = (SELECT COUNT(*) FROM risks WHERE register_id = OLD.register_id AND inherent_score >= 15)
        WHERE id = OLD.register_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_risk_register_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON risks
FOR EACH ROW EXECUTE FUNCTION update_risk_register_counts();

-- ============================================
-- VIEWS
-- ============================================

-- Workspace usage view
CREATE VIEW workspace_usage AS
SELECT
    w.id AS workspace_id,
    w.name AS workspace_name,
    w.plan,
    (SELECT COUNT(*) FROM risk_registers WHERE workspace_id = w.id) AS risk_register_count,
    (SELECT COUNT(*) FROM risks WHERE workspace_id = w.id) AS risk_count,
    (SELECT COUNT(*) FROM controls WHERE workspace_id = w.id) AS control_count,
    (SELECT COUNT(*) FROM reports WHERE workspace_id = w.id) AS report_count,
    (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id AND status = 'active') + 1 AS team_member_count,
    (SELECT COALESCE(SUM(tokens_used), 0) FROM ai_usage WHERE workspace_id = w.id AND usage_month = DATE_TRUNC('month', CURRENT_DATE)) AS ai_calls_this_month,
    pl.max_risk_registers,
    pl.max_risks,
    pl.max_controls,
    pl.max_reports,
    pl.max_team_members,
    pl.max_ai_calls_monthly
FROM workspaces w
JOIN plan_limits pl ON w.plan = pl.plan;

-- Risk summary view
CREATE VIEW risk_summary AS
SELECT
    r.workspace_id,
    r.register_id,
    rr.name AS register_name,
    r.status,
    COUNT(*) AS count,
    AVG(r.inherent_score) AS avg_inherent_score,
    AVG(r.residual_score) AS avg_residual_score,
    COUNT(*) FILTER (WHERE r.inherent_score >= 15) AS high_risk_count,
    COUNT(*) FILTER (WHERE r.inherent_score >= 10 AND r.inherent_score < 15) AS medium_risk_count,
    COUNT(*) FILTER (WHERE r.inherent_score < 10) AS low_risk_count
FROM risks r
JOIN risk_registers rr ON r.register_id = rr.id
GROUP BY r.workspace_id, r.register_id, rr.name, r.status;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Application users who can be members of multiple workspaces';
COMMENT ON TABLE workspaces IS 'Organizational units that contain all ERM data';
COMMENT ON TABLE workspace_members IS 'Join table linking users to workspaces with roles';
COMMENT ON TABLE risk_registers IS 'Collections of related risks within a workspace';
COMMENT ON TABLE risks IS 'Individual risk entries with likelihood and impact scores';
COMMENT ON TABLE controls IS 'Mitigation controls that can be linked to risks';
COMMENT ON TABLE risk_control_links IS 'Many-to-many relationship between risks and controls';
COMMENT ON TABLE reports IS 'Generated reports and their configurations';
COMMENT ON TABLE activities IS 'Audit log of all actions in the system';
COMMENT ON TABLE sessions IS 'User authentication sessions for JWT refresh tokens';
COMMENT ON TABLE subscriptions IS 'Workspace subscription and billing information';
COMMENT ON TABLE invoices IS 'Billing invoices for paid subscriptions';
COMMENT ON TABLE ai_usage IS 'Tracking of AI feature usage for billing and limits';
COMMENT ON TABLE plan_limits IS 'Reference table defining limits for each plan tier';
