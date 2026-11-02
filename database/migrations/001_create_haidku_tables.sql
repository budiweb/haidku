-- Migration: 001_create_haidku_tables.sql
-- HaidKu Database Schema (MySQL 8)
-- Strict privacy compliance (UU No. 27/2022 PDP)

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NULL UNIQUE,
    email_verified_at DATETIME NULL,
    password_hash VARCHAR(255) NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Jakarta',
    locale VARCHAR(10) NOT NULL DEFAULT 'id_ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_settings (
    user_id VARCHAR(36) PRIMARY KEY,
    goal ENUM('track', 'conceive', 'avoid') NOT NULL DEFAULT 'track',
    sdm_consent_at DATETIME NULL,
    notification_enabled TINYINT(1) NOT NULL DEFAULT 0,
    notification_time_local VARCHAR(5) NOT NULL DEFAULT '09:00',
    notification_privacy_mode ENUM('private', 'detailed') NOT NULL DEFAULT 'private',
    sync_opt_in TINYINT(1) NOT NULL DEFAULT 0,
    app_lock_enabled TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menstrual_periods (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    bleeding_type ENUM('period', 'spotting') NOT NULL DEFAULT 'period',
    flow_level ENUM('light', 'medium', 'heavy') NOT NULL DEFAULT 'medium',
    status ENUM('confirmed', 'draft') NOT NULL DEFAULT 'confirmed',
    note TEXT NULL,
    record_version INT NOT NULL DEFAULT 1,
    client_mutation_id VARCHAR(64) NULL,
    source ENUM('manual', 'import', 'sync') NOT NULL DEFAULT 'manual',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_periods_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_periods_user_start (user_id, start_date DESC),
    INDEX idx_periods_mutation (client_mutation_id),
    INDEX idx_periods_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_symptoms (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    observation_date DATE NOT NULL,
    pain_scale TINYINT NULL,
    flow_level ENUM('light', 'medium', 'heavy') NULL,
    mood VARCHAR(50) NULL,
    symptom_codes_json JSON NULL,
    notes_encrypted TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_symptoms_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY uq_symptoms_user_date (user_id, observation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS computed_cycle_snapshots (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    cycle_start_date DATE NOT NULL,
    cycle_day INT NOT NULL,
    median_cycle_length INT NULL,
    cycle_range_json JSON NULL,
    predicted_next_period DATE NULL,
    estimated_ovulation_date DATE NULL,
    sdm_state ENUM('HIGHER_FERTILITY_PRECAUTION', 'LOWER_CHANCE_NOT_ZERO', 'UNKNOWN', 'DISABLED') NOT NULL DEFAULT 'DISABLED',
    reason_codes_json JSON NULL,
    method_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_snapshots_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_snapshots_user_cycle (user_id, cycle_start_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    scheduled_at_utc DATETIME NOT NULL,
    delivered_at_utc DATETIME NULL,
    status ENUM('pending', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    privacy_safe_text VARCHAR(255) NOT NULL,
    dedupe_key VARCHAR(100) NULL,
    method_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notif_user_scheduled (user_id, scheduled_at_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS acknowledgements (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    accepted_at_utc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_agent_summary VARCHAR(255) NULL,
    CONSTRAINT fk_ack_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS educational_articles (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    excerpt TEXT NOT NULL,
    body MEDIUMTEXT NOT NULL,
    reference_urls_json JSON NULL,
    clinician_reviewed_at DATETIME NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    status ENUM('published', 'draft') NOT NULL DEFAULT 'published',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sync_mutations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    client_mutation_id VARCHAR(64) NOT NULL UNIQUE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(20) NOT NULL,
    applied_at_utc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sync_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_sync_user_applied (user_id, applied_at_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS security_audit_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    event_type VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NULL,
    context_redacted_json JSON NULL,
    created_at_utc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_event (event_type, created_at_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
