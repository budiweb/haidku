# ERD_HAIDKU — Rancangan Database dan Penyimpanan Offline
**Versi:** 1.1 — draft desain, diperinci dalam `PRD_HAIDKU.md`.

## Entitas utama MySQL 8
| Tabel | Kolom penting | Relasi / batasan |
|---|---|---|
| `users` | id, email, email_verified_at, locale, timezone, created_at, deleted_at | Identitas untuk sync; email unik nullable |
| `user_settings` | user_id, goal, sdm_consent_at, notification_time_local, privacy_mode, sync_opt_in | 1:1 users |
| `menstrual_periods` | id, user_id, start_date DATE, end_date DATE nullable, bleeding_type, status, record_version, client_mutation_id | 1:N users; end >= start; idempotent; no overlap |
| `daily_symptoms` | id, user_id, observation_date DATE, pain_scale, flow_level, notes_encrypted | 1:N users |
| `fertility_observations` | id, user_id, observation_date DATE, temperature, mucus, lh_result | Phase 2, not used for SDM low-risk decision in MVP |
| `computed_cycle_snapshots` | id, user_id, cycle_start_date, cycle_day, method_version, sdm_state, reason_codes_json | Recomputable cache only |
| `notifications` | id, user_id, type, scheduled_at_utc, status, dedupe_key | No sensitive payload in lock screen default |
| `acknowledgements` | id, user_id, type, version, accepted_at_utc | Informed acknowledgement of SDM risks |
| `educational_articles` | id, slug, title, content, source_urls_json, reviewed_at | Public content |
| `security_audit_events` | id, user_id nullable, event_type, context_redacted_json | Never log period dates |
| `sync_mutations` | id, user_id, client_mutation_id UNIQUE, entity_type, entity_id, applied_at_utc | Prevents retries from creating duplicates |
| `devices` | id, user_id, platform, push_token_encrypted_nullable, last_seen_at | Token revocation and privacy; optional |

## Indeks dan keamanan
- Compound index `menstrual_periods(user_id, start_date DESC)`; index `daily_symptoms(user_id, observation_date)`.
- Ownership enforced in SQL where clauses and service/API layer (no `GET /all-periods` admin endpoint).
- Set FK ON DELETE policy appropriate; domain health data deletion policy and backups reviewed; no plaintext period status in application logs.
- `record_version` expected update check. Use parameterized queries and transactions.
- Dates are local DATE without UTC conversion; audit events UTC TIMESTAMP.

## IndexedDB client
`local_profiles`, `periods`, `symptoms`, `settings`, `sync_outbox`, `sync_cursor`, `schema_metadata`. Store encrypted sensitive payload with key management appropriate to browser/native. Do not store auth secret as plain localStorage value. Guest session can work without server. Sync disabled by default.

## Perubahan data / sync
1. Local mutation => update UI and encrypted local store, append outbox with immutable `client_mutation_id`.
2. If login+consent+network => send HTTPS `POST /api/v1/sync/push` with idempotency and record version.
3. Server validates ownership/shape/ranges, applies within transaction once, returns conflict and new cursor.
4. Client pulls authorized changes; conflicting period dates force a visible conflict resolution and `UNKNOWN` SDM status until resolved.
5. Do not rely on client time for authoritative modification order.

## Diagram hubungan (text)
```text
users 1 ──── 1 user_settings
  │
  ├──── N menstrual_periods
  ├──── N daily_symptoms
  ├──── N fertility_observations
  ├──── N computed_cycle_snapshots
  ├──── N notifications
  ├──── N acknowledgements
  ├──── N devices
  ├──── N sync_mutations
  └──── N security_audit_events

educational_articles (standalone CMS)
```
