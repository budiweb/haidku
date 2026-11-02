-- Migration: 002_add_fertility_and_devices.sql
-- Completes ERD specifications for fertility_observations and devices

CREATE TABLE IF NOT EXISTS fertility_observations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    observation_date DATE NOT NULL,
    temperature DECIMAL(4,2) NULL,
    cervical_mucus ENUM('dry', 'sticky', 'creamy', 'egg_white', 'watery') NULL,
    lh_result ENUM('negative', 'positive', 'peak') NULL,
    notes_encrypted TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fertility_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY uq_fertility_user_date (user_id, observation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    platform ENUM('web', 'android', 'ios') NOT NULL,
    push_token_encrypted TEXT NULL,
    device_name VARCHAR(100) NULL,
    app_version VARCHAR(20) NULL,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_devices_user_platform (user_id, platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
