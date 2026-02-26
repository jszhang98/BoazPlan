# 6-4 — Telemetry & dashboard sweep: remove archived metric (Average Response Time)

Status: ready-for-dev

## Summary
Find and remove or replace all uses of the archived metric `Average Response Time` across monitoring, dashboards, alerts and reports (Grafana / Looker / Metabase / Prometheus / Datadog / SQL reports). Ensure no active alert or dashboard depends on the removed metric.

## Acceptance criteria
- No active dashboard card, Look/Explore, or Metabase card shows or queries `Average Response Time`.
- No active alert rule references the removed metric.
- Replace occurrences with approved alternative(s) where applicable (see PRD: `Request Response Rate` or PRD‑recommended timing metrics).
- Change log + notification sent to Product / Data / Ops teams.
- Validation: run quick smoke checks and confirm no new alerts triggered.

## Tasks
1. Inventory
   - Export/list dashboards (Grafana JSON, LookML, Metabase cards) and search for metric name variants: `Average response time`, `avg response time`, `avg_response_time`, `平均响应时长`.
   - Search alert rules (Prometheus/Alertmanager/Datadog) and SQL reports for the metric.
2. Remediation
   - Update dashboard queries or card definitions to remove or replace the metric.
   - Disable or update any alerts that reference it; create transitional suppression if needed during change.
3. Verification
   - Run dashboard smoke checks and trigger a test alert where appropriate.
   - Add entry to the change log with links to updated dashboards/alerts.
4. Communication
   - Notify Product / Data / Ops with summary and rollback plan.

## Notes / Guidance
- Recommended replacements: `Request Response Rate` or a PRD‑approved latency metric (median P95/P99 if latency is needed). Avoid re-introducing `avg` as it masks tail latency.
- If dashboards are managed in code (JSON/YAML in repo), open PRs; otherwise coordinate with Data/Ops owners.

## Owner / Estimate / Priority
Owner: @data-ops (TBD)
Estimate: 1-2 days
Priority: High

## Change notification (copy / paste)

Slack (short):
> :warning: *Metric retired* — `Average Response Time` has been removed from the PRD. Please search & remove/replace this metric from any dashboards, alerts or saved queries you own within 3 business days. Recommended replacement: `Request Response Rate` or PRD‑approved latency (p95/p99).

Email (detailed):
Subject: [ACTION] Metric retired — "Average Response Time" — please verify dashboards/alerts

Body:
- Status: **Average Response Time** has been retired from the PRD and removed from documentation.
- Request: Please confirm and remove/replace this metric from dashboards and alerts you own within **3 business days** (if not possible, reply within 24 hours with an ETA).
- Recommended replacements: `Request Response Rate` or PRD‑recommended latency metrics (use p95/p99 or median; avoid averages).
- Verification: Reply with updated dashboard/alert links or the change PR.
- Rollback: Contact @Product / @Data-Ops if rollback is required and describe the impact.

---

## Admin search & remediation commands (copy / paste)

PowerShell (search exported files or repo):
```
Get-ChildItem -Recurse -Include *.json,*.yml,*.yaml,*.sql,*.md | 
  Select-String -Pattern 'Average response time|avg_response_time|avg response time|平均响应时长' -SimpleMatch | 
  Select-Object Path, LineNumber, Line
```

Linux / Git Bash (repo or exported dir):
```
grep -R --line-number -E "Average response time|avg_response_time|avg response time|平均响应时长" <path-to-dashboards-or-repo>
```

Grafana (API search — dashboards & panels):
```
curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "https://<grafana-host>/api/search?query=Average%20Response%20Time"
```
(If dashboards are provisioned: grep the provisioning folder.)

Prometheus / Alertmanager (alert rules):
```
grep -R -n -E "avg_response_time|Average response time|avg_response_time_total" /etc/prometheus || <path-to-alerts-repo>
```

Datadog (monitor search via API):
```
curl -s -G "https://api.datadoghq.com/api/v1/monitor" \
  -d "query=Average response time" \
  -H "DD-API-KEY: $DD_API_KEY" -H "DD-APPLICATION-KEY: $DD_APP_KEY"
```

Looker (UI): Admin → Content → Search "Average response time"; (API): use `search/content` endpoint.

Metabase (UI/API): Search saved questions / dashboards for keyword; API: `GET /api/card?query=Average%20Response%20Time`.

SQL warehouse (example):
```
SELECT table_schema, table_name
FROM information_schema.views
WHERE view_definition ILIKE '%avg_response_time%' OR view_definition ILIKE '%Average response time%';
```

## Suggested replacements (do not reintroduce `avg`):
- `Request Response Rate` (PRD canonical)
- Latency quantiles: `p95_response_latency`, `p99_response_latency`, or `median_response_time`

## Quick acceptance checklist (for Data/Ops)
- [ ] No dashboards/cards query `Average Response Time` (search results = 0)
- [ ] No active alert references the metric
- [ ] Replaced or archived cards include link to PRD and note "metric retired"
- [ ] Change log entry created and product notified
- [ ] Smoke test executed and no unexpected alerts triggered

## Next actions / ownership
- Assign owner in this story (suggest: `@data-ops` or a named engineer). If you want, I can add the notification and command outputs into a GitHub/GitLab issue or send the Slack/email text.

---
