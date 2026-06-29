# Sentrais OS — n8n Workflow Architecture: Part 2

## Live Operations, After-Action, Response Orchestration, Integrations, Predictions, Reporting & API Layer

**Version:** 2.0
**Classification:** Internal — Engineering
**Architecture Owner:** Sentrais Corporation
**Date:** February 2026

---

## Table of Contents

1. [RUN Phase Workflows](#1-run-phase-workflows)
2. [REVIEW Phase Workflows](#2-review-phase-workflows)
3. [Response Orchestration Workflows](#3-response-orchestration-workflows)
4. [Integration Workflows](#4-integration-workflows)
5. [Prediction Workflows](#5-prediction-workflows)
6. [Reporting Workflows](#6-reporting-workflows)
7. [API Layer Design](#7-api-layer-design)
8. [Cross-Cutting Concerns](#8-cross-cutting-concerns)

---

# 1. RUN Phase Workflows

## 1.1 LIFECYCLE_Run_Phase

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `LIFECYCLE_Run_Phase` |
| Description | Master orchestrator for live event operations from gates-open through facility-clear. Manages the event state machine, coordinates monitoring loops, and provides the backbone for all live-operations workflows. |
| Version | `2.0.0` |
| Trigger | State transition: event moves to `run` zone via `SHARED_State_Machine` OR manual activation from Command Center |
| Schedule | None (event-driven) |
| Dependencies | `SHARED_Evidence_Writer`, `SHARED_Notification_Service`, `SHARED_State_Machine`, all `INTEGRATION_*` workflows, all `PREDICTION_*` workflows |

**Input Schema**

```json
{
  "event_id": "evt_20260208_nfl_mbs",
  "venue_id": "venue_mbs_001",
  "zone": "run",
  "sub_phase": "gates_open",
  "expected_attendance": 71000,
  "event_config": {
    "event_type": "nfl_regular_season",
    "kickoff_time": "2026-02-08T13:00:00-05:00",
    "gates_open_time": "2026-02-08T10:00:00-05:00",
    "estimated_clear_time": "2026-02-08T17:30:00-05:00",
    "weather_sensitivity": "high",
    "vip_sections": ["club_100", "suite_200", "field_level"],
    "broadcast": true
  },
  "active_sops": ["sop_lightning_response_v3", "sop_medical_emergency_v4", "sop_evacuation_v2"],
  "command_center_staff": [
    { "user_id": "usr_001", "role": "incident_commander", "channel": "command" },
    { "user_id": "usr_002", "role": "operations_chief", "channel": "ops" },
    { "user_id": "usr_003", "role": "safety_officer", "channel": "safety" }
  ]
}
```

**Output Schema**

```json
{
  "event_id": "evt_20260208_nfl_mbs",
  "zone": "run",
  "phase_status": "completed",
  "phase_duration_minutes": 450,
  "sub_phases_completed": [
    "gates_open", "pre_event", "event_active", "halftime", "event_active_2", "post_event", "facility_clear"
  ],
  "incidents_total": 3,
  "incidents_resolved": 3,
  "peak_attendance": 68432,
  "evidence_entries": 1247,
  "system_health_summary": { "uptime_pct": 99.98, "alerts_total": 7, "critical_alerts": 0 },
  "handoff_to_review": {
    "review_phase_id": "rev_20260208_nfl_mbs",
    "data_package_ready": true,
    "timestamp": "2026-02-08T17:45:00-05:00"
  }
}
```

**Node Definitions**

```
Node 001: run_trigger
  Type: webhook / state_machine_listener
  Name: "RUN Phase Trigger"
  Config:
    listen_for: { zone: "run", event_id: "$event_id" }
    source: SHARED_State_Machine callback OR Command Center webhook
  Output: event_id, venue_id, event_config
  → connects to: 002

Node 002: load_event_context
  Type: function
  Name: "Load Full Event Context"
  Config:
    // Pull from PostgreSQL: event record, venue config, active SOPs, staffing
    // Pull from Document Store: SOP definitions for active_sops
    // Pull from TimescaleDB: last 24h sensor baselines
  Code:
    ```javascript
    const pg = $input.item.json;
    
    // PostgreSQL: event + venue + staffing
    const event = await $pg.query(`
      SELECT e.*, v.venue_name, v.capacity, v.sensor_count, v.system_integrations
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.event_id = $1
    `, [pg.event_id]);
    
    // PostgreSQL: command center roster
    const roster = await $pg.query(`
      SELECT rp.user_id, rp.role, rp.current_zone, rp.status, u.name, u.channels
      FROM resource_positions rp
      JOIN users u ON rp.user_id = u.user_id
      WHERE rp.event_id = $1 AND rp.role_category = 'command_center'
    `, [pg.event_id]);
    
    // Document Store: active SOP definitions
    const sops = await $mongo.find('sops', {
      _id: { $in: pg.active_sops },
      'metadata.status': 'active'
    });
    
    // TimescaleDB: 24h sensor baselines for anomaly detection
    const baselines = await $timescale.query(`
      SELECT sensor_type, 
             AVG(value) as baseline_avg,
             STDDEV(value) as baseline_stddev,
             MIN(value) as baseline_min,
             MAX(value) as baseline_max
      FROM sensor_readings
      WHERE venue_id = $1
        AND reading_time > NOW() - INTERVAL '24 hours'
      GROUP BY sensor_type
    `, [pg.venue_id]);
    
    return {
      event: event.rows[0],
      roster: roster.rows,
      sops: sops,
      baselines: baselines.rows,
      run_config: {
        monitoring_interval_ms: 5000,
        health_check_interval_ms: 30000,
        crowd_check_interval_ms: 10000,
        evidence_flush_interval_ms: 60000
      }
    };
    ```
  → connects to: 003

Node 003: initialize_run_phase
  Type: function
  Name: "Initialize RUN Phase State"
  Config:
    // Set event to run zone, initialize monitoring counters, start evidence session
  Code:
    ```javascript
    const ctx = $input.item.json;
    
    // Transition event state
    await $workflow.execute('SHARED_State_Machine', {
      entity_type: 'event',
      entity_id: ctx.event.event_id,
      from_state: 'ready',
      to_state: 'run.gates_open',
      actor: 'system',
      metadata: {
        expected_attendance: ctx.event.expected_attendance,
        active_sops: ctx.sops.map(s => s._id),
        command_roster_count: ctx.roster.length
      }
    });
    
    // Initialize run-phase counters in PostgreSQL
    await $pg.query(`
      INSERT INTO event_run_metrics (
        event_id, phase_start, incidents_count, alerts_count,
        peak_attendance, evidence_entries, system_uptime_pct
      ) VALUES ($1, NOW(), 0, 0, 0, 0, 100.0)
    `, [ctx.event.event_id]);
    
    // Log to Evidence Ledger
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: ctx.event.event_id,
      evidence_type: 'phase_transition',
      category: 'lifecycle',
      source: 'LIFECYCLE_Run_Phase',
      data: {
        phase: 'run',
        sub_phase: 'gates_open',
        roster: ctx.roster,
        active_sops: ctx.sops.map(s => s._id),
        baselines_loaded: ctx.baselines.length
      },
      compliance_tags: ['NIMS', 'NFL_GOM']
    });
    
    return ctx;
    ```
  → connects to: 004

Node 004: start_monitoring_loops
  Type: split_in_batches (parallel)
  Name: "Start All Monitoring Loops"
  Config:
    // Launch parallel monitoring sub-workflows
    parallel_executions: [
      { workflow: "RUN_Monitor_Systems", params: { event_id, venue_id, interval: 30000 } },
      { workflow: "RUN_Monitor_Crowd", params: { event_id, venue_id, interval: 10000 } },
      { workflow: "RUN_Monitor_Weather", params: { event_id, venue_id, interval: 60000 } },
      { workflow: "RUN_Monitor_Resources", params: { event_id, venue_id, interval: 15000 } },
      { workflow: "RUN_Monitor_Access_Control", params: { event_id, venue_id, interval: 5000 } },
      { workflow: "PREDICTION_Threshold_Monitor", params: { event_id, venue_id } },
      { workflow: "PREDICTION_Pattern_Detector", params: { event_id, venue_id } }
    ]
  → connects to: 005

Node 005: sub_phase_controller
  Type: function (loop with webhook listener)
  Name: "Sub-Phase State Controller"
  Config:
    // Manages transitions: gates_open → pre_event → event_active → halftime → event_active_2 → post_event → facility_clear
    // Transitions driven by: time, manual command, or SOP trigger
  Code:
    ```javascript
    const SUB_PHASES = [
      { id: 'gates_open', next: 'pre_event', transition: 'time_or_manual' },
      { id: 'pre_event', next: 'event_active', transition: 'kickoff_signal' },
      { id: 'event_active', next: 'halftime', transition: 'halftime_signal' },
      { id: 'halftime', next: 'event_active_2', transition: 'second_half_signal' },
      { id: 'event_active_2', next: 'post_event', transition: 'final_whistle_signal' },
      { id: 'post_event', next: 'facility_clear', transition: 'crowd_cleared' },
      { id: 'facility_clear', next: null, transition: 'all_clear_confirmed' }
    ];
    
    // Listen for sub-phase transition signals
    // Each transition:
    //   1. Logs to Evidence Ledger
    //   2. Updates event state via SHARED_State_Machine
    //   3. Notifies command center
    //   4. Adjusts monitoring parameters (e.g., crowd monitoring intensity post-game)
    
    const currentPhase = $input.item.json.current_sub_phase || 'gates_open';
    const phaseConfig = SUB_PHASES.find(p => p.id === currentPhase);
    
    if (!phaseConfig.next) {
      // Facility clear — terminate monitoring, begin handoff
      return { action: 'complete_run_phase' };
    }
    
    return {
      current: currentPhase,
      next: phaseConfig.next,
      transition_type: phaseConfig.transition,
      waiting_for_signal: true
    };
    ```
  → connects to: 006 (on phase complete) OR loops back (on next sub-phase)

Node 006: terminate_monitoring
  Type: function
  Name: "Stop All Monitoring Loops"
  Config:
    // Send termination signals to all RUN_Monitor_* sub-workflows
    // Wait for graceful shutdown (flush pending evidence, close connections)
  Code:
    ```javascript
    const event_id = $input.item.json.event_id;
    
    // Signal all monitors to stop
    await $pg.query(`
      UPDATE event_monitors
      SET status = 'stopping', stop_requested_at = NOW()
      WHERE event_id = $1 AND status = 'running'
    `, [event_id]);
    
    // Wait for confirmation (max 60 seconds)
    let attempts = 0;
    while (attempts < 12) {
      const running = await $pg.query(`
        SELECT COUNT(*) as count FROM event_monitors
        WHERE event_id = $1 AND status != 'stopped'
      `, [event_id]);
      
      if (parseInt(running.rows[0].count) === 0) break;
      await new Promise(r => setTimeout(r, 5000));
      attempts++;
    }
    
    return { monitors_stopped: true, event_id };
    ```
  → connects to: 007

Node 007: compile_run_summary
  Type: function
  Name: "Compile RUN Phase Summary"
  Config:
    // Aggregate all metrics from the run phase
  Code:
    ```javascript
    const event_id = $input.item.json.event_id;
    
    // Pull final metrics
    const metrics = await $pg.query(`
      SELECT 
        COUNT(DISTINCT i.incident_id) as total_incidents,
        COUNT(DISTINCT CASE WHEN i.status = 'resolved' THEN i.incident_id END) as resolved_incidents,
        AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))) as avg_resolution_seconds,
        MAX(a.current_count) as peak_attendance
      FROM events e
      LEFT JOIN incidents i ON e.event_id = i.event_id
      LEFT JOIN access_counts a ON e.event_id = a.event_id
      WHERE e.event_id = $1
    `, [event_id]);
    
    const evidence_count = await $pg.query(`
      SELECT COUNT(*) as count FROM evidence_ledger
      WHERE event_id = $1 AND created_at >= (
        SELECT phase_start FROM event_run_metrics WHERE event_id = $1
      )
    `, [event_id]);
    
    const system_health = await $pg.query(`
      SELECT 
        AVG(uptime_pct) as avg_uptime,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
        COUNT(*) as total_alerts
      FROM system_status_log
      WHERE event_id = $1
    `, [event_id]);
    
    return {
      event_id,
      phase: 'run',
      status: 'completed',
      metrics: metrics.rows[0],
      evidence_entries: parseInt(evidence_count.rows[0].count),
      system_health: system_health.rows[0],
      completed_at: new Date().toISOString()
    };
    ```
  → connects to: 008

Node 008: handoff_to_review
  Type: function
  Name: "Handoff to REVIEW Phase"
  Config:
    // Create review phase record, package data, trigger LIFECYCLE_Review_Phase
  Code:
    ```javascript
    const summary = $input.item.json;
    
    // Create review record
    const review = await $pg.query(`
      INSERT INTO event_reviews (
        event_id, review_status, run_summary, created_at
      ) VALUES ($1, 'pending', $2, NOW())
      RETURNING review_id
    `, [summary.event_id, JSON.stringify(summary)]);
    
    // Transition to review zone
    await $workflow.execute('SHARED_State_Machine', {
      entity_type: 'event',
      entity_id: summary.event_id,
      from_state: 'run.facility_clear',
      to_state: 'review.pending',
      actor: 'system',
      metadata: { review_id: review.rows[0].review_id }
    });
    
    // Log phase completion
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: summary.event_id,
      evidence_type: 'phase_completion',
      category: 'lifecycle',
      source: 'LIFECYCLE_Run_Phase',
      data: summary,
      compliance_tags: ['NIMS', 'NFL_GOM', 'OSHA']
    });
    
    // Notify command that RUN is complete
    await $workflow.execute('SHARED_Notification_Service', {
      event_id: summary.event_id,
      notification_type: 'phase_complete',
      severity: 'info',
      channels: ['push', 'email'],
      recipients: ['role:incident_commander', 'role:operations_chief'],
      message: {
        title: 'RUN Phase Complete',
        body: `Event ${summary.event_id} run phase completed. ${summary.metrics.total_incidents} incidents, ${summary.metrics.resolved_incidents} resolved. Review phase initiated.`
      }
    });
    
    // Trigger REVIEW phase (async, scheduled for T+1 hour)
    await $workflow.trigger('LIFECYCLE_Review_Phase', {
      event_id: summary.event_id,
      review_id: review.rows[0].review_id,
      run_summary: summary,
      scheduled_start: new Date(Date.now() + 3600000).toISOString()
    });
    
    return { handoff_complete: true, review_id: review.rows[0].review_id };
    ```
  → END
```

**Error Handling**

| Error Type | Handling | Recovery |
|------------|----------|----------|
| Monitor crash | Auto-restart with exponential backoff (max 3 attempts) | Log to evidence, notify ops chief |
| Database connection loss | Retry with circuit breaker (5s, 15s, 30s) | Fall back to in-memory queue, flush on reconnect |
| State transition conflict | Reject transition, log conflict | Alert incident commander for manual resolution |
| Sub-phase timeout | Escalate to incident commander | Allow manual override of sub-phase transition |

---

## 1.2 RUN_Monitor_Systems

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `RUN_Monitor_Systems` |
| Description | Continuous health monitoring of all integrated venue systems during live events. Checks API health, response times, error rates, and integration sync status. |
| Version | `2.0.0` |
| Trigger | Called by `LIFECYCLE_Run_Phase` Node 004 |
| Schedule | Polling loop at `health_check_interval_ms` (default 30s) |

**Node Definitions**

```
Node 001: init_monitor
  Type: function
  Name: "Initialize System Monitor"
  Config:
    // Load system registry, set health check endpoints
  Code:
    ```javascript
    const systems = await $pg.query(`
      SELECT system_id, system_name, system_type, health_endpoint,
             expected_response_ms, critical_for_operations,
             last_known_status, integration_config
      FROM system_registry
      WHERE venue_id = $1 AND monitor_during_events = true
      ORDER BY critical_for_operations DESC
    `, [$input.item.json.venue_id]);
    
    // Register this monitor
    await $pg.query(`
      INSERT INTO event_monitors (event_id, monitor_type, status, started_at)
      VALUES ($1, 'systems', 'running', NOW())
      ON CONFLICT (event_id, monitor_type) DO UPDATE SET status = 'running', started_at = NOW()
    `, [$input.item.json.event_id]);
    
    return {
      systems: systems.rows,
      event_id: $input.item.json.event_id,
      venue_id: $input.item.json.venue_id,
      interval: $input.item.json.interval || 30000
    };
    ```
  → connects to: 002

Node 002: check_stop_signal
  Type: function
  Name: "Check for Stop Signal"
  Code:
    ```javascript
    const monitor = await $pg.query(`
      SELECT status FROM event_monitors
      WHERE event_id = $1 AND monitor_type = 'systems'
    `, [$input.item.json.event_id]);
    
    if (monitor.rows[0]?.status === 'stopping') {
      await $pg.query(`
        UPDATE event_monitors SET status = 'stopped', stopped_at = NOW()
        WHERE event_id = $1 AND monitor_type = 'systems'
      `, [$input.item.json.event_id]);
      return { action: 'stop' };
    }
    return { action: 'continue', ...$input.item.json };
    ```
  → connects to: 003 (continue) OR END (stop)

Node 003: parallel_health_checks
  Type: split_in_batches
  Name: "Parallel System Health Checks"
  Config:
    // Fan out: one HTTP request per system
    batch_size: 10
  Code:
    ```javascript
    // For each system, perform health check
    const system = $input.item.json;
    const start = Date.now();
    
    try {
      const response = await $http.request({
        method: 'GET',
        url: system.health_endpoint,
        timeout: system.expected_response_ms * 3,
        headers: system.integration_config?.auth_headers || {}
      });
      
      const response_ms = Date.now() - start;
      const healthy = response.statusCode >= 200 && response.statusCode < 300;
      const degraded = response_ms > system.expected_response_ms;
      
      return {
        system_id: system.system_id,
        system_name: system.system_name,
        status: healthy ? (degraded ? 'degraded' : 'healthy') : 'unhealthy',
        response_ms,
        expected_ms: system.expected_response_ms,
        critical: system.critical_for_operations,
        checked_at: new Date().toISOString(),
        details: response.body
      };
    } catch (error) {
      return {
        system_id: system.system_id,
        system_name: system.system_name,
        status: 'offline',
        response_ms: Date.now() - start,
        critical: system.critical_for_operations,
        error: error.message,
        checked_at: new Date().toISOString()
      };
    }
    ```
  → connects to: 004

Node 004: evaluate_health_results
  Type: function
  Name: "Evaluate and Store Health Results"
  Code:
    ```javascript
    const results = $input.all();
    const event_id = results[0]?.json?.event_id;
    
    // Batch insert health results into TimescaleDB
    for (const r of results) {
      const result = r.json;
      await $timescale.query(`
        INSERT INTO system_health_ts (
          system_id, event_id, status, response_ms, checked_at
        ) VALUES ($1, $2, $3, $4, $5)
      `, [result.system_id, event_id, result.status, result.response_ms, result.checked_at]);
    }
    
    // Update current status in PostgreSQL
    for (const r of results) {
      const result = r.json;
      await $pg.query(`
        UPDATE system_status
        SET status = $2, last_response_ms = $3, last_check = $4, error_message = $5
        WHERE system_id = $1 AND event_id = $6
      `, [result.system_id, result.status, result.response_ms, result.checked_at, result.error || null, event_id]);
    }
    
    // Identify problems
    const critical_failures = results.filter(r => 
      r.json.critical && (r.json.status === 'offline' || r.json.status === 'unhealthy')
    );
    const degraded = results.filter(r => r.json.status === 'degraded');
    
    return {
      event_id,
      total_checked: results.length,
      healthy: results.filter(r => r.json.status === 'healthy').length,
      degraded: degraded.length,
      unhealthy: results.filter(r => r.json.status === 'unhealthy').length,
      offline: results.filter(r => r.json.status === 'offline').length,
      critical_failures: critical_failures.map(r => r.json),
      degraded_systems: degraded.map(r => r.json)
    };
    ```
  → connects to: 005

Node 005: handle_system_issues
  Type: if
  Name: "Any Critical Issues?"
  Condition: critical_failures.length > 0 OR offline count > 0
  TRUE → connects to: 006 (alert and evidence)
  FALSE → connects to: 007 (wait and loop)

Node 006: alert_system_failure
  Type: function
  Name: "Alert on System Failure"
  Code:
    ```javascript
    const issues = $input.item.json;
    
    for (const failure of issues.critical_failures) {
      // Create alert
      await $pg.query(`
        INSERT INTO alerts (
          event_id, alert_type, severity, source_system, message, created_at
        ) VALUES ($1, 'system_failure', 'critical', $2, $3, NOW())
      `, [issues.event_id, failure.system_id, 
          `Critical system ${failure.system_name} is ${failure.status}. Response: ${failure.response_ms}ms`]);
      
      // Evidence
      await $workflow.execute('SHARED_Evidence_Writer', {
        event_id: issues.event_id,
        evidence_type: 'system_alert',
        category: 'system_health',
        source: 'RUN_Monitor_Systems',
        data: failure,
        compliance_tags: ['IT_OPS', 'INCIDENT']
      });
      
      // Notify
      await $workflow.execute('SHARED_Notification_Service', {
        event_id: issues.event_id,
        notification_type: 'system_critical',
        severity: 'critical',
        channels: ['push', 'sms', 'radio'],
        recipients: ['role:operations_chief', 'role:it_director'],
        message: {
          title: `CRITICAL: ${failure.system_name} ${failure.status.toUpperCase()}`,
          body: `System ${failure.system_name} (${failure.system_id}) is ${failure.status}. Immediate attention required.`,
          action_url: `/command/systems/${failure.system_id}`
        }
      });
    }
    
    return issues;
    ```
  → connects to: 007

Node 007: wait_interval
  Type: wait
  Name: "Wait for Next Check Cycle"
  Config: { seconds: interval_ms / 1000 }
  → connects to: 002 (loop back to stop check)
```

---

## 1.3 RUN_Monitor_Crowd

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `RUN_Monitor_Crowd` |
| Description | Real-time crowd density, flow, and anomaly monitoring during live events. Ingests data from access control, camera analytics, Wi-Fi probe counts, and sensor arrays. |
| Version | `2.0.0` |
| Trigger | Called by `LIFECYCLE_Run_Phase` Node 004 |
| Schedule | Polling loop at 10s intervals |

**Node Definitions**

```
Node 001: init_crowd_monitor
  Type: function
  Name: "Initialize Crowd Monitor"
  Code:
    ```javascript
    // Load zone definitions and thresholds
    const zones = await $pg.query(`
      SELECT zone_id, zone_name, zone_type, max_capacity,
             warning_threshold_pct, critical_threshold_pct,
             sensor_ids, camera_ids
      FROM venue_zones
      WHERE venue_id = $1 AND monitor_crowd = true
    `, [$input.item.json.venue_id]);
    
    await $pg.query(`
      INSERT INTO event_monitors (event_id, monitor_type, status, started_at)
      VALUES ($1, 'crowd', 'running', NOW())
      ON CONFLICT (event_id, monitor_type) DO UPDATE SET status = 'running'
    `, [$input.item.json.event_id]);
    
    return {
      zones: zones.rows,
      event_id: $input.item.json.event_id,
      venue_id: $input.item.json.venue_id
    };
    ```
  → connects to: 002

Node 002: check_stop_signal
  Type: function
  Name: "Check Stop Signal"
  // Same pattern as RUN_Monitor_Systems Node 002
  → connects to: 003 (continue) OR END (stop)

Node 003: ingest_crowd_data
  Type: function
  Name: "Ingest Multi-Source Crowd Data"
  Code:
    ```javascript
    const ctx = $input.item.json;
    const crowd_data = {};
    
    for (const zone of ctx.zones) {
      // Source 1: Access control turnstile counts
      const access = await $pg.query(`
        SELECT 
          SUM(entry_count) - SUM(exit_count) as net_occupancy,
          SUM(entry_count) as total_entries,
          SUM(exit_count) as total_exits
        FROM access_events
        WHERE zone_id = $1 AND event_id = $2
      `, [zone.zone_id, ctx.event_id]);
      
      // Source 2: Camera analytics (latest reading)
      const camera = await $timescale.query(`
        SELECT density_estimate, flow_rate, anomaly_score
        FROM camera_analytics
        WHERE camera_id = ANY($1) AND event_id = $2
        ORDER BY reading_time DESC LIMIT 1
      `, [zone.camera_ids, ctx.event_id]);
      
      // Source 3: Wi-Fi probe counts
      const wifi = await $timescale.query(`
        SELECT device_count
        FROM wifi_probe_counts
        WHERE zone_id = $1
        ORDER BY reading_time DESC LIMIT 1
      `, [zone.zone_id]);
      
      // Fuse data sources (weighted average)
      const access_count = parseInt(access.rows[0]?.net_occupancy || 0);
      const camera_count = parseInt(camera.rows[0]?.density_estimate || 0);
      const wifi_count = parseInt(wifi.rows[0]?.device_count || 0);
      
      const fused_occupancy = Math.round(
        access_count * 0.5 + camera_count * 0.3 + wifi_count * 0.2
      );
      
      const occupancy_pct = (fused_occupancy / zone.max_capacity) * 100;
      
      crowd_data[zone.zone_id] = {
        zone_id: zone.zone_id,
        zone_name: zone.zone_name,
        fused_occupancy,
        occupancy_pct: Math.round(occupancy_pct * 10) / 10,
        max_capacity: zone.max_capacity,
        sources: { access: access_count, camera: camera_count, wifi: wifi_count },
        flow_rate: camera.rows[0]?.flow_rate || 0,
        anomaly_score: camera.rows[0]?.anomaly_score || 0,
        status: occupancy_pct >= zone.critical_threshold_pct ? 'critical' :
                occupancy_pct >= zone.warning_threshold_pct ? 'warning' : 'normal',
        timestamp: new Date().toISOString()
      };
    }
    
    return { event_id: ctx.event_id, zones: Object.values(crowd_data) };
    ```
  → connects to: 004

Node 004: store_and_evaluate
  Type: function
  Name: "Store Readings & Evaluate Thresholds"
  Code:
    ```javascript
    const data = $input.item.json;
    
    // Store to TimescaleDB
    for (const zone of data.zones) {
      await $timescale.query(`
        INSERT INTO crowd_readings (
          event_id, zone_id, occupancy, occupancy_pct, flow_rate,
          anomaly_score, status, reading_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [data.event_id, zone.zone_id, zone.fused_occupancy,
          zone.occupancy_pct, zone.flow_rate, zone.anomaly_score, zone.status]);
    }
    
    // Update real-time status in PostgreSQL
    for (const zone of data.zones) {
      await $pg.query(`
        UPDATE zone_current_status
        SET occupancy = $2, occupancy_pct = $3, status = $4, updated_at = NOW()
        WHERE zone_id = $1 AND event_id = $5
      `, [zone.zone_id, zone.fused_occupancy, zone.occupancy_pct, zone.status, data.event_id]);
    }
    
    // Update peak attendance
    const total_occupancy = data.zones.reduce((sum, z) => sum + z.fused_occupancy, 0);
    await $pg.query(`
      UPDATE event_run_metrics
      SET peak_attendance = GREATEST(peak_attendance, $2)
      WHERE event_id = $1
    `, [data.event_id, total_occupancy]);
    
    // Identify zones needing action
    const critical_zones = data.zones.filter(z => z.status === 'critical');
    const warning_zones = data.zones.filter(z => z.status === 'warning');
    const anomalous_zones = data.zones.filter(z => z.anomaly_score > 0.7);
    
    return {
      ...data,
      total_occupancy,
      critical_zones,
      warning_zones,
      anomalous_zones,
      requires_action: critical_zones.length > 0 || anomalous_zones.length > 0
    };
    ```
  → connects to: 005

Node 005: crowd_action_router
  Type: if
  Name: "Requires Action?"
  TRUE → connects to: 006
  FALSE → connects to: 007 (wait and loop)

Node 006: crowd_alert_handler
  Type: function
  Name: "Handle Crowd Alerts"
  Code:
    ```javascript
    const data = $input.item.json;
    
    for (const zone of data.critical_zones) {
      await $pg.query(`
        INSERT INTO alerts (event_id, alert_type, severity, zone_id, message, created_at)
        VALUES ($1, 'crowd_density', 'critical', $2, $3, NOW())
      `, [data.event_id, zone.zone_id,
          `Zone ${zone.zone_name} at ${zone.occupancy_pct}% capacity (${zone.fused_occupancy}/${zone.max_capacity})`]);
      
      await $workflow.execute('SHARED_Evidence_Writer', {
        event_id: data.event_id,
        evidence_type: 'crowd_alert',
        category: 'crowd_safety',
        source: 'RUN_Monitor_Crowd',
        data: zone,
        compliance_tags: ['CROWD_SAFETY', 'NFPA', 'NFL_GOM']
      });
      
      await $workflow.execute('SHARED_Notification_Service', {
        event_id: data.event_id,
        notification_type: 'crowd_critical',
        severity: 'critical',
        channels: ['push', 'radio', 'pa_system'],
        recipients: ['role:safety_officer', 'role:operations_chief', 'role:security_commander'],
        message: {
          title: `CROWD ALERT: ${zone.zone_name}`,
          body: `Zone at ${zone.occupancy_pct}% capacity. Immediate flow management required.`,
          action_url: `/command/crowd/${zone.zone_id}`
        }
      });
    }
    
    for (const zone of data.anomalous_zones) {
      await $workflow.execute('SHARED_Notification_Service', {
        event_id: data.event_id,
        notification_type: 'crowd_anomaly',
        severity: 'warning',
        channels: ['push'],
        recipients: ['role:security_commander'],
        message: {
          title: `Crowd Anomaly: ${zone.zone_name}`,
          body: `Unusual crowd pattern detected (score: ${zone.anomaly_score}). Review camera feeds.`,
          action_url: `/command/crowd/${zone.zone_id}/cameras`
        }
      });
    }
    
    return data;
    ```
  → connects to: 007

Node 007: wait_interval
  Type: wait
  Name: "Wait for Next Check"
  Config: { seconds: 10 }
  → connects to: 002 (loop)
```

---

## 1.4 RUN_Monitor_Weather

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `RUN_Monitor_Weather` |
| Description | Continuous weather monitoring with hyperlocal forecasting, lightning detection (NFL 8-mile rule), and automated SOP triggering for weather events. |
| Version | `2.0.0` |
| Trigger | Called by `LIFECYCLE_Run_Phase` Node 004 |
| Schedule | 60s polling loop, accelerates to 15s when threat detected |

**Node Definitions**

```
Node 001: init_weather_monitor
  Type: function
  Code:
    ```javascript
    const venue = await $pg.query(`
      SELECT latitude, longitude, has_retractable_roof, indoor_outdoor,
             weather_station_ids, lightning_detection_range_miles
      FROM venues WHERE venue_id = $1
    `, [$input.item.json.venue_id]);
    
    return {
      ...venue.rows[0],
      event_id: $input.item.json.event_id,
      venue_id: $input.item.json.venue_id,
      nfl_lightning_range: 8,  // NFL 8-mile rule
      polling_interval: 60000,
      threat_interval: 15000,
      threat_active: false
    };
    ```
  → connects to: 002

Node 002: check_stop_signal
  // Standard stop check pattern
  → connects to: 003 OR END

Node 003: fetch_weather_data
  Type: function
  Name: "Fetch Weather Data"
  Code:
    ```javascript
    const ctx = $input.item.json;
    
    // Source 1: Weather API (hyperlocal)
    const weather = await $http.request({
      method: 'GET',
      url: `${process.env.WEATHER_API_URL}/current`,
      qs: { lat: ctx.latitude, lon: ctx.longitude, units: 'imperial' },
      headers: { 'Authorization': `Bearer ${process.env.WEATHER_API_KEY}` }
    });
    
    // Source 2: Lightning detection network
    const lightning = await $http.request({
      method: 'GET',
      url: `${process.env.LIGHTNING_API_URL}/strikes`,
      qs: {
        lat: ctx.latitude, lon: ctx.longitude,
        radius_miles: ctx.nfl_lightning_range,
        since_minutes: 30
      }
    });
    
    // Source 3: Venue weather stations
    const stations = await $timescale.query(`
      SELECT station_id, temperature, humidity, wind_speed, wind_direction,
             barometric_pressure, precipitation_rate
      FROM weather_station_readings
      WHERE station_id = ANY($1)
      ORDER BY reading_time DESC LIMIT 1
    `, [ctx.weather_station_ids]);
    
    // Source 4: Forecast (6-hour window)
    const forecast = await $http.request({
      method: 'GET',
      url: `${process.env.WEATHER_API_URL}/forecast/hourly`,
      qs: { lat: ctx.latitude, lon: ctx.longitude, hours: 6 }
    });
    
    return {
      ...ctx,
      current: weather.body,
      lightning: {
        strikes_in_range: lightning.body.strikes || [],
        closest_strike_miles: lightning.body.closest_miles || null,
        within_nfl_range: (lightning.body.closest_miles || 999) <= ctx.nfl_lightning_range
      },
      station_data: stations.rows[0] || null,
      forecast: forecast.body.hourly || [],
      timestamp: new Date().toISOString()
    };
    ```
  → connects to: 004

Node 004: evaluate_weather_threats
  Type: function
  Name: "Evaluate Weather Threat Level"
  Code:
    ```javascript
    const data = $input.item.json;
    
    let threat_level = 'GREEN';
    let threats = [];
    let sops_to_trigger = [];
    
    // Lightning check (NFL 8-mile rule)
    if (data.lightning.within_nfl_range) {
      threat_level = 'RED';
      threats.push({
        type: 'lightning',
        severity: 'critical',
        detail: `Lightning detected ${data.lightning.closest_strike_miles} miles from venue`,
        nfl_rule: '8-mile evacuation required'
      });
      sops_to_trigger.push('sop_lightning_response_v3');
    } else if (data.lightning.closest_strike_miles && data.lightning.closest_strike_miles <= 15) {
      threat_level = Math.max(threat_level === 'RED' ? 'RED' : 'YELLOW');
      threats.push({
        type: 'lightning_approaching',
        severity: 'warning',
        detail: `Lightning detected ${data.lightning.closest_strike_miles} miles — monitoring`
      });
    }
    
    // Severe weather checks
    const wind = data.station_data?.wind_speed || data.current.wind_speed || 0;
    if (wind > 50) {
      threat_level = 'RED';
      threats.push({ type: 'high_wind', severity: 'critical', detail: `Wind speed: ${wind} mph` });
      sops_to_trigger.push('sop_severe_weather_v2');
    } else if (wind > 35) {
      if (threat_level !== 'RED') threat_level = 'YELLOW';
      threats.push({ type: 'wind_advisory', severity: 'warning', detail: `Wind speed: ${wind} mph` });
    }
    
    // Tornado warning
    if (data.current.alerts?.some(a => a.type === 'tornado_warning')) {
      threat_level = 'RED';
      threats.push({ type: 'tornado', severity: 'critical', detail: 'Active tornado warning' });
      sops_to_trigger.push('sop_tornado_response_v1');
    }
    
    // Heavy precipitation
    const precip = data.station_data?.precipitation_rate || 0;
    if (precip > 2.0) { // inches per hour
      if (threat_level !== 'RED') threat_level = 'YELLOW';
      threats.push({ type: 'heavy_rain', severity: 'warning', detail: `Precip rate: ${precip} in/hr` });
    }
    
    // Extreme temperature
    const temp = data.station_data?.temperature || data.current.temperature || 72;
    if (temp > 105 || temp < 10) {
      threats.push({
        type: temp > 105 ? 'extreme_heat' : 'extreme_cold',
        severity: 'warning',
        detail: `Temperature: ${temp}°F`
      });
      sops_to_trigger.push(temp > 105 ? 'sop_heat_emergency_v1' : 'sop_cold_weather_v1');
    }
    
    // Store reading
    await $timescale.query(`
      INSERT INTO weather_readings (
        event_id, venue_id, threat_level, temperature, humidity,
        wind_speed, precipitation_rate, lightning_closest_miles,
        threats_json, reading_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [data.event_id, data.venue_id, threat_level,
        temp, data.station_data?.humidity,
        wind, precip, data.lightning.closest_strike_miles,
        JSON.stringify(threats)]);
    
    return {
      event_id: data.event_id,
      threat_level,
      previous_threat_active: data.threat_active,
      threats,
      sops_to_trigger,
      adjust_interval: threat_level !== 'GREEN',
      weather_summary: {
        temperature: temp,
        humidity: data.station_data?.humidity,
        wind_speed: wind,
        precipitation: precip,
        lightning_miles: data.lightning.closest_strike_miles
      }
    };
    ```
  → connects to: 005

Node 005: weather_action_router
  Type: switch
  Name: "Route by Threat Level"
  Conditions:
    RED → connects to: 006 (trigger SOPs)
    YELLOW → connects to: 007 (warning alerts)
    GREEN → connects to: 008 (wait and loop)

Node 006: trigger_weather_sops
  Type: function
  Name: "Trigger Weather Response SOPs"
  Code:
    ```javascript
    const data = $input.item.json;
    
    for (const sop_id of data.sops_to_trigger) {
      await $workflow.execute('RESPONSE_SOP_Executor', {
        event_id: data.event_id,
        sop_id: sop_id,
        trigger_source: 'RUN_Monitor_Weather',
        trigger_data: data.threats,
        auto_activated: true
      });
    }
    
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: data.event_id,
      evidence_type: 'weather_threat',
      category: 'weather',
      source: 'RUN_Monitor_Weather',
      data: { threat_level: data.threat_level, threats: data.threats, sops_triggered: data.sops_to_trigger },
      compliance_tags: ['NFL_GOM', 'WEATHER_SAFETY', 'NIMS']
    });
    
    await $workflow.execute('SHARED_Notification_Service', {
      event_id: data.event_id,
      notification_type: 'weather_critical',
      severity: 'critical',
      channels: ['push', 'sms', 'radio', 'pa_system', 'signage'],
      recipients: ['role:all_command', 'role:all_field'],
      message: {
        title: `WEATHER ALERT: ${data.threat_level}`,
        body: data.threats.map(t => t.detail).join('. '),
        action_url: '/command/weather'
      }
    });
    
    return { ...data, threat_active: true };
    ```
  → connects to: 008 (with shortened interval)

Node 007: warning_alerts
  Type: function
  Name: "Issue Weather Warnings"
  Code:
    ```javascript
    // Similar to 006 but severity: 'warning', fewer channels
    // Notify command center only, not field staff
    ```
  → connects to: 008

Node 008: wait_interval
  Type: wait
  Name: "Wait (Dynamic Interval)"
  Config:
    seconds: data.adjust_interval ? 15 : 60
  → connects to: 002 (loop)
```

---

## 1.5 RUN_Incident_Handler

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `RUN_Incident_Handler` |
| Description | Creates, manages, and resolves incidents during live operations. Acts as the central incident lifecycle manager, coordinating with SOPs, evidence capture, and notifications. |
| Version | `2.0.0` |
| Trigger | Webhook (from Command Center UI, monitor alerts, or SOP triggers) |

**Input Schema**

```json
{
  "event_id": "evt_20260208_nfl_mbs",
  "incident_type": "medical|security|weather|operational|crowd|fire|utility",
  "severity": "critical|high|medium|low",
  "source": "monitor_crowd|manual|sop_executor|prediction",
  "location": {
    "zone_id": "zone_concourse_a",
    "coordinates": { "lat": 33.7553, "lng": -84.4006 },
    "description": "Concourse A, Section 118 entrance"
  },
  "description": "Fan reported medical emergency",
  "reporter": { "user_id": "usr_045", "role": "security_staff" },
  "initial_data": {}
}
```

**Node Definitions**

```
Node 001: receive_incident
  Type: webhook
  Name: "Receive Incident Report"
  → connects to: 002

Node 002: create_incident
  Type: function
  Name: "Create Incident Record"
  Code:
    ```javascript
    const input = $input.item.json;
    
    // Create incident in PostgreSQL
    const incident = await $pg.query(`
      INSERT INTO incidents (
        event_id, incident_type, severity, status, location_zone,
        location_coords, location_description, description,
        reported_by, source, created_at
      ) VALUES ($1, $2, $3, 'open', $4, ST_MakePoint($5, $6), $7, $8, $9, $10, NOW())
      RETURNING incident_id, created_at
    `, [input.event_id, input.incident_type, input.severity,
        input.location.zone_id, input.location.coordinates.lng, input.location.coordinates.lat,
        input.location.description, input.description, input.reporter.user_id, input.source]);
    
    const incident_id = incident.rows[0].incident_id;
    
    // Initialize timeline
    await $pg.query(`
      INSERT INTO incident_timeline (
        incident_id, event_type, actor, description, data, created_at
      ) VALUES ($1, 'created', $2, $3, $4, NOW())
    `, [incident_id, input.reporter.user_id, 'Incident created',
        JSON.stringify(input)]);
    
    // State machine
    await $workflow.execute('SHARED_State_Machine', {
      entity_type: 'incident',
      entity_id: incident_id,
      from_state: null,
      to_state: 'open',
      actor: input.reporter.user_id,
      metadata: input
    });
    
    // Evidence
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: input.event_id,
      evidence_type: 'incident_created',
      category: 'incident',
      source: 'RUN_Incident_Handler',
      data: { incident_id, ...input },
      compliance_tags: ['INCIDENT', 'NIMS', incident.incident_type.toUpperCase()]
    });
    
    // Update run metrics
    await $pg.query(`
      UPDATE event_run_metrics
      SET incidents_count = incidents_count + 1
      WHERE event_id = $1
    `, [input.event_id]);
    
    return { incident_id, ...input };
    ```
  → connects to: 003

Node 003: classify_and_route
  Type: switch
  Name: "Route by Incident Type & Severity"
  Conditions:
    severity === 'critical' → connects to: 004 (immediate multi-agency)
    incident_type === 'medical' → connects to: 005 (medical protocol)
    incident_type === 'security' → connects to: 006 (security protocol)
    incident_type === 'weather' → connects to: 007 (weather protocol)
    default → connects to: 008 (standard response)

Node 004: critical_incident_response
  Type: function
  Name: "Critical Incident — Full Activation"
  Code:
    ```javascript
    const data = $input.item.json;
    
    // Notify ALL command staff immediately
    await $workflow.execute('SHARED_Notification_Service', {
      event_id: data.event_id,
      notification_type: 'incident_critical',
      severity: 'critical',
      channels: ['push', 'sms', 'radio', 'pa_system'],
      recipients: ['role:all_command'],
      message: {
        title: `CRITICAL INCIDENT: ${data.incident_type.toUpperCase()}`,
        body: `${data.description} — Location: ${data.location.description}`,
        action_url: `/command/incidents/${data.incident_id}`,
        require_acknowledgment: true
      }
    });
    
    // Find and trigger matching SOPs
    const matching_sops = await $mongo.find('sops', {
      'trigger_conditions': {
        $elemMatch: {
          'source': data.incident_type,
          'condition': { $in: ['severity_critical', `type_${data.incident_type}`] }
        }
      },
      'metadata.status': 'active'
    });
    
    for (const sop of matching_sops) {
      await $workflow.execute('RESPONSE_SOP_Executor', {
        event_id: data.event_id,
        incident_id: data.incident_id,
        sop_id: sop._id,
        trigger_source: 'RUN_Incident_Handler',
        trigger_data: data,
        auto_activated: true
      });
    }
    
    // Assign nearest resources
    const resources = await $pg.query(`
      SELECT rp.user_id, rp.role, rp.current_zone,
             ST_Distance(rp.current_coords, ST_MakePoint($2, $3)) as distance_meters
      FROM resource_positions rp
      WHERE rp.event_id = $1
        AND rp.status = 'available'
        AND rp.role IN ('emt', 'security_officer', 'supervisor')
      ORDER BY distance_meters ASC
      LIMIT 5
    `, [data.event_id, data.location.coordinates.lng, data.location.coordinates.lat]);
    
    // Assign resources to incident
    for (const resource of resources.rows) {
      await $pg.query(`
        UPDATE resource_positions
        SET status = 'assigned', assigned_incident = $2
        WHERE user_id = $1 AND event_id = $3
      `, [resource.user_id, data.incident_id, data.event_id]);
      
      await $workflow.execute('SHARED_Notification_Service', {
        event_id: data.event_id,
        notification_type: 'resource_assignment',
        severity: 'high',
        channels: ['push', 'radio'],
        recipients: [resource.user_id],
        message: {
          title: `ASSIGNED: ${data.incident_type} Incident`,
          body: `Report to ${data.location.description}. Distance: ${Math.round(resource.distance_meters)}m`,
          action_url: `/incidents/${data.incident_id}/respond`
        }
      });
    }
    
    return {
      ...data,
      sops_triggered: matching_sops.map(s => s._id),
      resources_assigned: resources.rows.map(r => r.user_id)
    };
    ```
  → connects to: 009 (monitor resolution)

// Nodes 005-008: Type-specific routing (similar patterns with specialized SOP triggers)

Node 009: monitor_resolution
  Type: function (webhook listener)
  Name: "Monitor Incident Resolution"
  Code:
    ```javascript
    // Listen for resolution events:
    //  - Manual close from Command Center
    //  - SOP completion signals
    //  - Timeout escalation
    
    // On resolution:
    const data = $input.item.json;
    
    await $pg.query(`
      UPDATE incidents
      SET status = 'resolved', resolved_at = NOW(), resolution_notes = $2
      WHERE incident_id = $1
    `, [data.incident_id, data.resolution_notes]);
    
    await $pg.query(`
      INSERT INTO incident_timeline (
        incident_id, event_type, actor, description, data, created_at
      ) VALUES ($1, 'resolved', $2, $3, $4, NOW())
    `, [data.incident_id, data.resolved_by, 'Incident resolved', JSON.stringify(data.resolution_data)]);
    
    // Release assigned resources
    await $pg.query(`
      UPDATE resource_positions
      SET status = 'available', assigned_incident = NULL
      WHERE assigned_incident = $1
    `, [data.incident_id]);
    
    // Evidence
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: data.event_id,
      evidence_type: 'incident_resolved',
      category: 'incident',
      source: 'RUN_Incident_Handler',
      data: { incident_id: data.incident_id, duration_seconds: data.duration, resolution: data.resolution_notes },
      compliance_tags: ['INCIDENT', 'NIMS']
    });
    
    return { incident_id: data.incident_id, status: 'resolved' };
    ```
  → END
```

---

# 2. REVIEW Phase Workflows

## 2.1 LIFECYCLE_Review_Phase

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `LIFECYCLE_Review_Phase` |
| Description | Master orchestrator for post-event analysis from T+0 through T+30 days. Generates after-action reports, identifies patterns, scores performance, captures lessons learned, and feeds improvements back into the PREPARE zone. |
| Version | `2.0.0` |
| Trigger | Called by `LIFECYCLE_Run_Phase` handoff OR scheduled cron |
| Schedule | T+1 hour: automated analysis. T+24 hours: draft AAR. T+7 days: final AAR. T+30 days: improvement integration. |

**Input Schema**

```json
{
  "event_id": "evt_20260208_nfl_mbs",
  "review_id": "rev_20260208_nfl_mbs",
  "run_summary": { "/* from LIFECYCLE_Run_Phase compile_run_summary */" },
  "review_config": {
    "auto_aar": true,
    "benchmark_against": ["evt_20260125_nfl_mbs", "evt_20260201_nfl_mbs"],
    "kpi_targets": {
      "incident_count_max": 5,
      "avg_response_time_max_seconds": 300,
      "fan_satisfaction_min": 4.5,
      "system_uptime_min_pct": 99.9
    }
  }
}
```

**Node Definitions**

```
Node 001: init_review
  Type: function
  Name: "Initialize Review Phase"
  Code:
    ```javascript
    const input = $input.item.json;
    
    await $workflow.execute('SHARED_State_Machine', {
      entity_type: 'event',
      entity_id: input.event_id,
      from_state: 'review.pending',
      to_state: 'review.analysis',
      actor: 'system'
    });
    
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: input.event_id,
      evidence_type: 'phase_transition',
      category: 'lifecycle',
      source: 'LIFECYCLE_Review_Phase',
      data: { phase: 'review', sub_phase: 'analysis' },
      compliance_tags: ['NIMS', 'AAR']
    });
    
    return input;
    ```
  → connects to: 002

Node 002: gather_all_event_data
  Type: function
  Name: "Gather Complete Event Dataset"
  Code:
    ```javascript
    const input = $input.item.json;
    const event_id = input.event_id;
    
    // Incidents
    const incidents = await $pg.query(`
      SELECT i.*, 
             json_agg(json_build_object(
               'event_type', it.event_type, 'actor', it.actor,
               'description', it.description, 'created_at', it.created_at
             ) ORDER BY it.created_at) as timeline
      FROM incidents i
      LEFT JOIN incident_timeline it ON i.incident_id = it.incident_id
      WHERE i.event_id = $1
      GROUP BY i.incident_id
    `, [event_id]);
    
    // Response times
    const response_times = await $pg.query(`
      SELECT incident_type, severity,
             AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))) as avg_response_seconds,
             MIN(EXTRACT(EPOCH FROM (first_response_at - created_at))) as min_response_seconds,
             MAX(EXTRACT(EPOCH FROM (first_response_at - created_at))) as max_response_seconds
      FROM incidents
      WHERE event_id = $1 AND first_response_at IS NOT NULL
      GROUP BY incident_type, severity
    `, [event_id]);
    
    // Crowd flow data
    const crowd_data = await $timescale.query(`
      SELECT zone_id,
             MAX(occupancy) as peak_occupancy,
             AVG(occupancy_pct) as avg_occupancy_pct,
             MAX(anomaly_score) as max_anomaly_score,
             COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_readings
      FROM crowd_readings
      WHERE event_id = $1
      GROUP BY zone_id
    `, [event_id]);
    
    // System health
    const system_health = await $timescale.query(`
      SELECT system_id,
             AVG(CASE WHEN status = 'healthy' THEN 100 ELSE 0 END) as uptime_pct,
             AVG(response_ms) as avg_response_ms,
             COUNT(CASE WHEN status = 'offline' THEN 1 END) as offline_events
      FROM system_health_ts
      WHERE event_id = $1
      GROUP BY system_id
    `, [event_id]);
    
    // Evidence entries
    const evidence_stats = await $pg.query(`
      SELECT category, COUNT(*) as count
      FROM evidence_ledger
      WHERE event_id = $1
      GROUP BY category
    `, [event_id]);
    
    // Weather readings
    const weather_summary = await $timescale.query(`
      SELECT 
        MAX(CASE WHEN threat_level = 'RED' THEN 1 ELSE 0 END) as had_red_weather,
        COUNT(CASE WHEN threat_level != 'GREEN' THEN 1 END) as threat_readings,
        MIN(lightning_closest_miles) as closest_lightning_miles,
        MAX(wind_speed) as max_wind_mph
      FROM weather_readings
      WHERE event_id = $1
    `, [event_id]);
    
    // SOP executions
    const sop_executions = await $pg.query(`
      SELECT sop_id, status, trigger_source, 
             EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds,
             steps_completed, steps_total
      FROM sop_executions
      WHERE event_id = $1
    `, [event_id]);
    
    return {
      event_id,
      review_id: input.review_id,
      kpi_targets: input.review_config.kpi_targets,
      benchmark_events: input.review_config.benchmark_against,
      data: {
        incidents: incidents.rows,
        response_times: response_times.rows,
        crowd: crowd_data.rows,
        systems: system_health.rows,
        evidence: evidence_stats.rows,
        weather: weather_summary.rows[0],
        sop_executions: sop_executions.rows
      }
    };
    ```
  → connects to: 003

Node 003: score_performance
  Type: function
  Name: "Score Performance Against KPIs"
  Code:
    ```javascript
    const dataset = $input.item.json;
    const targets = dataset.kpi_targets;
    const data = dataset.data;
    
    const scores = {};
    
    // Incident score
    const incident_count = data.incidents.length;
    scores.incidents = {
      value: incident_count,
      target: targets.incident_count_max,
      score: incident_count <= targets.incident_count_max ? 100 :
             Math.max(0, 100 - ((incident_count - targets.incident_count_max) * 10)),
      status: incident_count <= targets.incident_count_max ? 'pass' : 'fail'
    };
    
    // Response time score
    const avg_response = data.response_times.reduce(
      (sum, r) => sum + parseFloat(r.avg_response_seconds), 0
    ) / Math.max(data.response_times.length, 1);
    scores.response_time = {
      value: Math.round(avg_response),
      target: targets.avg_response_time_max_seconds,
      score: avg_response <= targets.avg_response_time_max_seconds ? 100 :
             Math.max(0, 100 - ((avg_response - targets.avg_response_time_max_seconds) / targets.avg_response_time_max_seconds * 100)),
      status: avg_response <= targets.avg_response_time_max_seconds ? 'pass' : 'fail'
    };
    
    // System uptime score
    const avg_uptime = data.systems.reduce(
      (sum, s) => sum + parseFloat(s.uptime_pct), 0
    ) / Math.max(data.systems.length, 1);
    scores.system_uptime = {
      value: Math.round(avg_uptime * 100) / 100,
      target: targets.system_uptime_min_pct,
      score: avg_uptime >= targets.system_uptime_min_pct ? 100 :
             Math.max(0, (avg_uptime / targets.system_uptime_min_pct) * 100),
      status: avg_uptime >= targets.system_uptime_min_pct ? 'pass' : 'fail'
    };
    
    // SOP execution score
    const completed_sops = data.sop_executions.filter(s => s.status === 'completed');
    const sop_completion_rate = completed_sops.length / Math.max(data.sop_executions.length, 1);
    scores.sop_execution = {
      value: Math.round(sop_completion_rate * 100),
      target: 95,
      score: sop_completion_rate * 100,
      status: sop_completion_rate >= 0.95 ? 'pass' : 'fail'
    };
    
    // Overall score (weighted)
    const overall = (
      scores.incidents.score * 0.3 +
      scores.response_time.score * 0.3 +
      scores.system_uptime.score * 0.2 +
      scores.sop_execution.score * 0.2
    );
    
    scores.overall = {
      value: Math.round(overall),
      grade: overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'F'
    };
    
    // Store scores
    await $pg.query(`
      UPDATE event_reviews
      SET performance_scores = $2, scored_at = NOW()
      WHERE review_id = $1
    `, [dataset.review_id, JSON.stringify(scores)]);
    
    return { ...dataset, scores };
    ```
  → connects to: 004

Node 004: detect_patterns
  Type: function
  Name: "Pattern Detection & Analysis"
  Code:
    ```javascript
    const dataset = $input.item.json;
    const patterns = [];
    
    // Pattern 1: Recurring incident types
    const type_counts = {};
    for (const inc of dataset.data.incidents) {
      type_counts[inc.incident_type] = (type_counts[inc.incident_type] || 0) + 1;
    }
    for (const [type, count] of Object.entries(type_counts)) {
      if (count >= 3) {
        patterns.push({
          pattern_type: 'recurring_incident',
          description: `${count} incidents of type '${type}' in single event`,
          severity: 'medium',
          recommendation: `Review ${type} prevention protocols and staffing levels`
        });
      }
    }
    
    // Pattern 2: Crowd bottlenecks
    const bottleneck_zones = dataset.data.crowd.filter(z => z.critical_readings > 5);
    for (const zone of bottleneck_zones) {
      patterns.push({
        pattern_type: 'crowd_bottleneck',
        description: `Zone ${zone.zone_id} had ${zone.critical_readings} critical density readings`,
        severity: 'high',
        recommendation: `Review flow management for zone ${zone.zone_id}. Consider additional egress points or staffing.`
      });
    }
    
    // Pattern 3: System reliability issues
    const unreliable_systems = dataset.data.systems.filter(s => parseFloat(s.uptime_pct) < 99);
    for (const sys of unreliable_systems) {
      patterns.push({
        pattern_type: 'system_reliability',
        description: `System ${sys.system_id} uptime was ${sys.uptime_pct}% with ${sys.offline_events} offline events`,
        severity: parseFloat(sys.uptime_pct) < 95 ? 'high' : 'medium',
        recommendation: `Review infrastructure and failover for ${sys.system_id}`
      });
    }
    
    // Pattern 4: Response time degradation (compare to benchmarks)
    if (dataset.benchmark_events.length > 0) {
      const benchmarks = await $pg.query(`
        SELECT AVG((performance_scores->>'response_time'->>'value')::int) as avg_benchmark_response
        FROM event_reviews
        WHERE event_id = ANY($1)
      `, [dataset.benchmark_events]);
      
      if (benchmarks.rows[0]?.avg_benchmark_response) {
        const current = dataset.scores.response_time.value;
        const benchmark = parseInt(benchmarks.rows[0].avg_benchmark_response);
        if (current > benchmark * 1.2) {
          patterns.push({
            pattern_type: 'response_degradation',
            description: `Average response time (${current}s) is ${Math.round((current/benchmark - 1) * 100)}% worse than benchmark (${benchmark}s)`,
            severity: 'high',
            recommendation: 'Investigate staffing, resource positioning, and notification latency'
          });
        }
      }
    }
    
    // Store patterns
    await $pg.query(`
      UPDATE event_reviews
      SET patterns_detected = $2, analysis_completed_at = NOW()
      WHERE review_id = $1
    `, [dataset.review_id, JSON.stringify(patterns)]);
    
    return { ...dataset, patterns };
    ```
  → connects to: 005

Node 005: generate_lessons_learned
  Type: function
  Name: "Generate Lessons Learned"
  Code:
    ```javascript
    const dataset = $input.item.json;
    const lessons = [];
    
    // Convert patterns to structured lessons
    for (const pattern of dataset.patterns) {
      lessons.push({
        lesson_id: `lesson_${dataset.event_id}_${lessons.length + 1}`,
        category: pattern.pattern_type,
        observation: pattern.description,
        root_cause: null, // Populated during human review
        recommendation: pattern.recommendation,
        priority: pattern.severity === 'high' ? 1 : pattern.severity === 'medium' ? 2 : 3,
        applies_to: ['blueprint', 'sop', 'training'],
        status: 'pending_review',
        created_at: new Date().toISOString()
      });
    }
    
    // SOP effectiveness lessons
    for (const sop of dataset.data.sop_executions) {
      if (sop.status !== 'completed' || sop.steps_completed < sop.steps_total) {
        lessons.push({
          lesson_id: `lesson_${dataset.event_id}_sop_${sop.sop_id}`,
          category: 'sop_effectiveness',
          observation: `SOP ${sop.sop_id} ${sop.status === 'completed' ? 'completed with skipped steps' : 'did not complete'} (${sop.steps_completed}/${sop.steps_total} steps)`,
          recommendation: `Review SOP ${sop.sop_id} for completeness and feasibility`,
          priority: 2,
          applies_to: ['sop'],
          status: 'pending_review'
        });
      }
    }
    
    // Store lessons
    for (const lesson of lessons) {
      await $pg.query(`
        INSERT INTO lessons_learned (
          lesson_id, event_id, review_id, category, observation,
          recommendation, priority, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [lesson.lesson_id, dataset.event_id, dataset.review_id,
          lesson.category, lesson.observation, lesson.recommendation,
          lesson.priority, lesson.status]);
    }
    
    return { ...dataset, lessons };
    ```
  → connects to: 006

Node 006: generate_aar_report
  Type: function
  Name: "Generate After-Action Report"
  Code:
    ```javascript
    // Trigger REPORTING_After_Action workflow
    await $workflow.execute('REPORTING_After_Action', {
      event_id: $input.item.json.event_id,
      review_id: $input.item.json.review_id,
      scores: $input.item.json.scores,
      patterns: $input.item.json.patterns,
      lessons: $input.item.json.lessons,
      data: $input.item.json.data
    });
    
    return $input.item.json;
    ```
  → connects to: 007

Node 007: generate_improvement_tasks
  Type: function
  Name: "Create Improvement Tasks for PREPARE Zone"
  Code:
    ```javascript
    const dataset = $input.item.json;
    
    // Convert high-priority lessons into PREPARE zone tasks
    const high_priority = dataset.lessons.filter(l => l.priority === 1);
    
    for (const lesson of high_priority) {
      await $pg.query(`
        INSERT INTO prepare_tasks (
          venue_id, source_event_id, source_lesson_id,
          task_type, description, priority, status,
          target_completion_date, created_at
        ) VALUES (
          (SELECT venue_id FROM events WHERE event_id = $1),
          $1, $2, 'improvement', $3, $4, 'pending',
          NOW() + INTERVAL '14 days', NOW()
        )
      `, [dataset.event_id, lesson.lesson_id, lesson.recommendation, lesson.priority]);
    }
    
    // Update SOPs if SOP lessons exist
    const sop_lessons = dataset.lessons.filter(l => l.category === 'sop_effectiveness');
    for (const lesson of sop_lessons) {
      await $mongo.updateOne('sops', 
        { _id: lesson.lesson_id.replace('lesson_' + dataset.event_id + '_sop_', '') },
        { $push: { 'metadata.review_notes': {
          event_id: dataset.event_id,
          observation: lesson.observation,
          recommendation: lesson.recommendation,
          date: new Date().toISOString()
        }}}
      );
    }
    
    // Final state transition
    await $workflow.execute('SHARED_State_Machine', {
      entity_type: 'event',
      entity_id: dataset.event_id,
      from_state: 'review.analysis',
      to_state: 'review.complete',
      actor: 'system',
      metadata: { 
        overall_score: dataset.scores.overall.value,
        lessons_count: dataset.lessons.length,
        improvement_tasks_created: high_priority.length
      }
    });
    
    // Evidence
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: dataset.event_id,
      evidence_type: 'review_complete',
      category: 'lifecycle',
      source: 'LIFECYCLE_Review_Phase',
      data: {
        scores: dataset.scores,
        patterns_count: dataset.patterns.length,
        lessons_count: dataset.lessons.length,
        improvement_tasks: high_priority.length
      },
      compliance_tags: ['NIMS', 'AAR', 'CONTINUOUS_IMPROVEMENT']
    });
    
    return {
      event_id: dataset.event_id,
      review_id: dataset.review_id,
      status: 'complete',
      overall_grade: dataset.scores.overall.grade,
      lessons_generated: dataset.lessons.length,
      improvement_tasks_created: high_priority.length
    };
    ```
  → END
```

---

# 3. Response Orchestration Workflows

## 3.1 RESPONSE_SOP_Executor

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `RESPONSE_SOP_Executor` |
| Description | Core engine that executes SOP phases and steps. Handles sequential and parallel execution, decision points, timeouts, escalation, evidence capture, and SOP chaining. This is the heart of operational orchestration. |
| Version | `2.0.0` |
| Trigger | Called by monitor workflows, incident handler, or manual activation |

**Input Schema**

```json
{
  "event_id": "evt_20260208_nfl_mbs",
  "incident_id": "inc_001",
  "sop_id": "sop_lightning_response_v3",
  "trigger_source": "RUN_Monitor_Weather",
  "trigger_data": {},
  "auto_activated": true,
  "override_params": {}
}
```

**Node Definitions**

```
Node 001: load_sop
  Type: function
  Name: "Load SOP Definition"
  Code:
    ```javascript
    const input = $input.item.json;
    
    // Load SOP from Document Store
    const sop = await $mongo.findOne('sops', { _id: input.sop_id });
    
    if (!sop || sop.metadata.status !== 'active') {
      throw new Error(`SOP ${input.sop_id} not found or inactive`);
    }
    
    // Create execution record
    const execution = await $pg.query(`
      INSERT INTO sop_executions (
        event_id, incident_id, sop_id, sop_version, status,
        trigger_source, trigger_data, auto_activated, started_at,
        steps_total, steps_completed
      ) VALUES ($1, $2, $3, $4, 'running', $5, $6, $7, NOW(), $8, 0)
      RETURNING execution_id
    `, [input.event_id, input.incident_id, input.sop_id,
        sop.metadata.version, input.trigger_source,
        JSON.stringify(input.trigger_data), input.auto_activated,
        sop.phases.reduce((sum, p) => sum + p.steps.length, 0)]);
    
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: input.event_id,
      evidence_type: 'sop_activated',
      category: 'sop_execution',
      source: 'RESPONSE_SOP_Executor',
      data: {
        execution_id: execution.rows[0].execution_id,
        sop_id: input.sop_id,
        sop_title: sop.metadata.title,
        trigger_source: input.trigger_source,
        auto_activated: input.auto_activated
      },
      compliance_tags: sop.compliance_mappings.map(c => c.regulation)
    });
    
    return {
      ...input,
      execution_id: execution.rows[0].execution_id,
      sop,
      current_phase_index: 0,
      execution_context: {}
    };
    ```
  → connects to: 002

Node 002: execute_phase
  Type: function
  Name: "Execute Current Phase"
  Code:
    ```javascript
    const ctx = $input.item.json;
    const phase = ctx.sop.phases[ctx.current_phase_index];
    
    if (!phase) {
      return { ...ctx, action: 'sop_complete' };
    }
    
    // Log phase start
    await $pg.query(`
      INSERT INTO sop_execution_log (
        execution_id, phase_id, phase_name, status, started_at
      ) VALUES ($1, $2, $3, 'running', NOW())
    `, [ctx.execution_id, phase.phase_id, phase.name]);
    
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: ctx.event_id,
      evidence_type: 'sop_phase_start',
      category: 'sop_execution',
      source: 'RESPONSE_SOP_Executor',
      data: { execution_id: ctx.execution_id, phase_id: phase.phase_id, phase_name: phase.name }
    });
    
    return {
      ...ctx,
      current_phase: phase,
      current_step_index: 0,
      phase_start_time: Date.now(),
      action: 'execute_steps'
    };
    ```
  → connects to: 003

Node 003: execute_step
  Type: function
  Name: "Execute Current Step"
  Code:
    ```javascript
    const ctx = $input.item.json;
    const step = ctx.current_phase.steps[ctx.current_step_index];
    
    if (!step) {
      return { ...ctx, action: 'phase_complete' };
    }
    
    // Log step start
    await $pg.query(`
      INSERT INTO sop_step_log (
        execution_id, phase_id, step_id, step_action, actor,
        automation_level, status, started_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'running', NOW())
    `, [ctx.execution_id, ctx.current_phase.phase_id, step.step_id,
        step.action, step.actor, step.automation]);
    
    let step_result;
    
    switch (step.automation) {
      case 'full':
        // Fully automated — execute directly
        step_result = await executeAutomatedStep(ctx, step);
        break;
        
      case 'triggered':
        // System triggers, human confirms
        await $workflow.execute('SHARED_Notification_Service', {
          event_id: ctx.event_id,
          notification_type: 'sop_step_trigger',
          severity: 'high',
          channels: ['push', 'radio'],
          recipients: [`role:${step.actor}`],
          message: {
            title: `SOP Step: ${step.action}`,
            body: `Action required: ${step.action}`,
            action_url: `/sop/${ctx.execution_id}/step/${step.step_id}`,
            require_acknowledgment: true,
            timeout_seconds: step.timeout_seconds
          }
        });
        step_result = { status: 'awaiting_confirmation', timeout: step.timeout_seconds };
        break;
        
      case 'assisted':
        // Human does it, system monitors
        await $workflow.execute('SHARED_Notification_Service', {
          event_id: ctx.event_id,
          notification_type: 'sop_step_assign',
          severity: 'high',
          channels: ['push', 'radio'],
          recipients: [`role:${step.actor}`],
          message: {
            title: `Action Required: ${step.action}`,
            body: `Complete and confirm: ${step.action}`,
            action_url: `/sop/${ctx.execution_id}/step/${step.step_id}/complete`
          }
        });
        step_result = { status: 'awaiting_human', timeout: step.timeout_seconds };
        break;
        
      case 'none':
        // Fully manual, just track
        step_result = { status: 'awaiting_human', timeout: step.timeout_seconds };
        break;
    }
    
    // Handle decision points
    if (step.decision_point) {
      return {
        ...ctx,
        current_step: step,
        step_result,
        action: 'decision_point'
      };
    }
    
    // If awaiting human/confirmation, set up timeout
    if (step_result.status.startsWith('awaiting')) {
      return {
        ...ctx,
        current_step: step,
        step_result,
        action: 'wait_for_completion'
      };
    }
    
    // Automated step completed — advance
    return {
      ...ctx,
      current_step_index: ctx.current_step_index + 1,
      execution_context: { ...ctx.execution_context, ...step_result.outputs },
      action: 'execute_steps'
    };
    ```
  → connects to: 004 (router)

Node 004: step_action_router
  Type: switch
  Name: "Route by Step Action"
  Conditions:
    action === 'execute_steps' → connects to: 003 (next step)
    action === 'phase_complete' → connects to: 005
    action === 'decision_point' → connects to: 006
    action === 'wait_for_completion' → connects to: 007
    action === 'sop_complete' → connects to: 009

Node 005: complete_phase
  Type: function
  Name: "Complete Phase & Advance"
  Code:
    ```javascript
    const ctx = $input.item.json;
    
    await $pg.query(`
      UPDATE sop_execution_log
      SET status = 'completed', completed_at = NOW()
      WHERE execution_id = $1 AND phase_id = $2
    `, [ctx.execution_id, ctx.current_phase.phase_id]);
    
    // Check phase duration against target
    const duration_ms = Date.now() - ctx.phase_start_time;
    const target_ms = ctx.current_phase.target_duration_seconds * 1000;
    if (duration_ms > target_ms) {
      await $workflow.execute('SHARED_Evidence_Writer', {
        event_id: ctx.event_id,
        evidence_type: 'sop_phase_overtime',
        category: 'sop_execution',
        source: 'RESPONSE_SOP_Executor',
        data: {
          phase_id: ctx.current_phase.phase_id,
          target_seconds: ctx.current_phase.target_duration_seconds,
          actual_seconds: Math.round(duration_ms / 1000)
        }
      });
    }
    
    return {
      ...ctx,
      current_phase_index: ctx.current_phase_index + 1,
      action: 'execute_phase'
    };
    ```
  → connects to: 002 (next phase)

Node 006: handle_decision_point
  Type: function
  Name: "Handle Decision Point"
  Code:
    ```javascript
    const ctx = $input.item.json;
    const step = ctx.current_step;
    
    // Present options to decision maker
    await $workflow.execute('SHARED_Notification_Service', {
      event_id: ctx.event_id,
      notification_type: 'sop_decision',
      severity: 'critical',
      channels: ['push'],
      recipients: [`role:${step.actor}`],
      message: {
        title: `Decision Required: ${step.action}`,
        body: `Options: ${step.options.map(o => o.label).join(' | ')}`,
        action_url: `/sop/${ctx.execution_id}/step/${step.step_id}/decide`,
        options: step.options,
        timeout_seconds: step.timeout_seconds,
        timeout_action: step.timeout_action
      }
    });
    
    // Wait for response or timeout
    // (In production: webhook listener with timeout)
    return { ...ctx, action: 'wait_for_completion' };
    ```
  → connects to: 007

Node 007: wait_for_completion
  Type: function (webhook + timer)
  Name: "Wait for Step Completion / Timeout"
  Code:
    ```javascript
    // Listen for:
    // 1. Step completion webhook from Command Center
    // 2. Decision selection webhook
    // 3. Timeout timer
    
    const ctx = $input.item.json;
    const timeout_ms = (ctx.current_step.timeout_seconds || 300) * 1000;
    
    // Race between webhook response and timeout
    // On completion: advance to next step
    // On timeout: trigger escalation
    
    const result = await Promise.race([
      waitForWebhook(`sop_step_${ctx.execution_id}_${ctx.current_step.step_id}`),
      waitForTimeout(timeout_ms)
    ]);
    
    if (result.type === 'timeout') {
      return { ...ctx, action: 'escalate' };
    }
    
    // Log step completion
    await $pg.query(`
      UPDATE sop_step_log
      SET status = 'completed', completed_at = NOW(),
          completion_data = $3, completed_by = $4
      WHERE execution_id = $1 AND step_id = $2
    `, [ctx.execution_id, ctx.current_step.step_id,
        JSON.stringify(result.data), result.actor]);
    
    // Update step counter
    await $pg.query(`
      UPDATE sop_executions
      SET steps_completed = steps_completed + 1
      WHERE execution_id = $1
    `, [ctx.execution_id]);
    
    // Evidence
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: ctx.event_id,
      evidence_type: 'sop_step_completed',
      category: 'sop_execution',
      source: 'RESPONSE_SOP_Executor',
      data: {
        step_id: ctx.current_step.step_id,
        action: ctx.current_step.action,
        completed_by: result.actor,
        decision: result.data?.selected_option || null
      },
      compliance_tags: ctx.sop.compliance_mappings.map(c => c.regulation)
    });
    
    // Handle SOP chaining (one step triggers another SOP)
    if (result.data?.chain_sop) {
      await $workflow.execute('RESPONSE_SOP_Executor', {
        event_id: ctx.event_id,
        incident_id: ctx.incident_id,
        sop_id: result.data.chain_sop,
        trigger_source: `sop_chain:${ctx.sop_id}`,
        trigger_data: { parent_execution: ctx.execution_id },
        auto_activated: true
      });
    }
    
    return {
      ...ctx,
      current_step_index: ctx.current_step_index + 1,
      action: 'execute_steps'
    };
    ```
  → connects to: 004 (router)

Node 008: handle_escalation
  Type: function
  Name: "Handle Timeout Escalation"
  // Triggered when step times out
  Code:
    ```javascript
    const ctx = $input.item.json;
    const step = ctx.current_step;
    
    // Apply timeout action
    switch (step.timeout_action) {
      case 'escalate':
        await $workflow.execute('RESPONSE_Escalation_Handler', {
          event_id: ctx.event_id,
          execution_id: ctx.execution_id,
          step_id: step.step_id,
          original_actor: step.actor,
          reason: 'timeout',
          timeout_seconds: step.timeout_seconds
        });
        break;
        
      case 'auto_proceed':
        // Use default option and continue
        break;
        
      case 'abort':
        // Mark execution as aborted
        await $pg.query(`
          UPDATE sop_executions
          SET status = 'aborted', completed_at = NOW(), abort_reason = 'step_timeout'
          WHERE execution_id = $1
        `, [ctx.execution_id]);
        return { ...ctx, action: 'sop_complete' };
    }
    
    return { ...ctx, action: 'wait_for_completion' }; // Re-wait after escalation
    ```
  → connects to: 004

Node 009: complete_sop
  Type: function
  Name: "Complete SOP Execution"
  Code:
    ```javascript
    const ctx = $input.item.json;
    
    await $pg.query(`
      UPDATE sop_executions
      SET status = 'completed', completed_at = NOW()
      WHERE execution_id = $1
    `, [ctx.execution_id]);
    
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: ctx.event_id,
      evidence_type: 'sop_completed',
      category: 'sop_execution',
      source: 'RESPONSE_SOP_Executor',
      data: {
        execution_id: ctx.execution_id,
        sop_id: ctx.sop_id,
        total_duration_seconds: Math.round((Date.now() - ctx.sop_start_time) / 1000),
        phases_completed: ctx.current_phase_index,
        execution_context: ctx.execution_context
      },
      compliance_tags: ctx.sop.compliance_mappings.map(c => c.regulation)
    });
    
    return { execution_id: ctx.execution_id, status: 'completed' };
    ```
  → END
```

---

## 3.2 RESPONSE_Escalation_Handler

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `RESPONSE_Escalation_Handler` |
| Description | Manages timeout and escalation logic for SOP steps. Escalates up the chain of command when steps are not completed within their timeout period. |
| Version | `2.0.0` |
| Trigger | Called by `RESPONSE_SOP_Executor` on step timeout |

**Node Definitions**

```
Node 001: determine_escalation_path
  Type: function
  Code:
    ```javascript
    const input = $input.item.json;
    
    // Load escalation chain for the role
    const chain = await $pg.query(`
      SELECT escalation_level, escalation_role, notification_channels,
             max_wait_seconds
      FROM escalation_chains
      WHERE base_role = $1 AND venue_id = (
        SELECT venue_id FROM events WHERE event_id = $2
      )
      ORDER BY escalation_level ASC
    `, [input.original_actor, input.event_id]);
    
    // Find next escalation level
    const current_level = input.current_escalation_level || 0;
    const next = chain.rows.find(c => c.escalation_level > current_level);
    
    if (!next) {
      // Top of chain reached — notify incident commander directly
      return {
        ...input,
        escalation_target: 'incident_commander',
        channels: ['push', 'sms', 'radio', 'phone'],
        final_escalation: true
      };
    }
    
    return {
      ...input,
      escalation_target: next.escalation_role,
      channels: next.notification_channels,
      max_wait_seconds: next.max_wait_seconds,
      escalation_level: next.escalation_level,
      final_escalation: false
    };
    ```
  → connects to: 002

Node 002: send_escalation
  Type: function
  Code:
    ```javascript
    const data = $input.item.json;
    
    await $workflow.execute('SHARED_Notification_Service', {
      event_id: data.event_id,
      notification_type: 'escalation',
      severity: 'critical',
      channels: data.channels,
      recipients: [`role:${data.escalation_target}`],
      message: {
        title: `ESCALATION: SOP Step Timeout`,
        body: `Step in SOP execution ${data.execution_id} was not completed by ${data.original_actor} within ${data.timeout_seconds}s. Requires immediate attention.`,
        action_url: `/sop/${data.execution_id}/step/${data.step_id}`,
        require_acknowledgment: true
      }
    });
    
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: data.event_id,
      evidence_type: 'escalation',
      category: 'sop_execution',
      source: 'RESPONSE_Escalation_Handler',
      data: {
        execution_id: data.execution_id,
        step_id: data.step_id,
        from_role: data.original_actor,
        to_role: data.escalation_target,
        reason: data.reason,
        escalation_level: data.escalation_level
      },
      compliance_tags: ['ESCALATION', 'NIMS']
    });
    
    return data;
    ```
  → END
```

---

# 4. Integration Workflows

## 4.1 INTEGRATION_System_Health_Monitor

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `INTEGRATION_System_Health_Monitor` |
| Description | Continuous background health monitoring for all integrated systems, running 24/7 independent of events. Detects degradation, manages circuit breakers, and triggers failover procedures. |
| Version | `2.0.0` |
| Trigger | Cron: every 60 seconds |

**Node Definitions**

```
Node 001: load_system_registry
  Type: function
  Code:
    ```javascript
    const systems = await $pg.query(`
      SELECT s.system_id, s.system_name, s.system_type,
             s.health_endpoint, s.expected_response_ms,
             s.circuit_breaker_state, s.consecutive_failures,
             s.failover_config, s.last_healthy_at
      FROM system_registry s
      WHERE s.active = true
      ORDER BY s.priority DESC
    `);
    return { systems: systems.rows };
    ```
  → connects to: 002

Node 002: parallel_health_checks
  // Same pattern as RUN_Monitor_Systems but with circuit breaker logic
  Code:
    ```javascript
    const system = $input.item.json;
    
    // Skip if circuit breaker is OPEN and cooldown hasn't elapsed
    if (system.circuit_breaker_state === 'open') {
      const cooldown_elapsed = Date.now() - new Date(system.last_failure_at).getTime() > 60000;
      if (!cooldown_elapsed) {
        return { ...system, status: 'circuit_open', skipped: true };
      }
      // Half-open: try one request
    }
    
    try {
      const start = Date.now();
      const response = await $http.request({
        method: 'GET',
        url: system.health_endpoint,
        timeout: system.expected_response_ms * 3
      });
      
      const response_ms = Date.now() - start;
      const healthy = response.statusCode >= 200 && response.statusCode < 300;
      
      // Reset circuit breaker on success
      if (healthy) {
        await $pg.query(`
          UPDATE system_registry
          SET circuit_breaker_state = 'closed', consecutive_failures = 0,
              last_healthy_at = NOW()
          WHERE system_id = $1
        `, [system.system_id]);
      }
      
      return {
        system_id: system.system_id,
        status: healthy ? 'healthy' : 'unhealthy',
        response_ms
      };
    } catch (error) {
      // Increment failure counter
      const failures = system.consecutive_failures + 1;
      const new_state = failures >= 5 ? 'open' : 
                        failures >= 3 ? 'half_open' : 'closed';
      
      await $pg.query(`
        UPDATE system_registry
        SET circuit_breaker_state = $2, consecutive_failures = $3,
            last_failure_at = NOW()
        WHERE system_id = $1
      `, [system.system_id, new_state, failures]);
      
      // Trigger failover if configured and threshold reached
      if (new_state === 'open' && system.failover_config) {
        await triggerFailover(system);
      }
      
      return {
        system_id: system.system_id,
        status: 'offline',
        error: error.message,
        circuit_breaker: new_state,
        consecutive_failures: failures
      };
    }
    ```
  → connects to: 003 (store results)
```

## 4.2 INTEGRATION_Data_Ingester

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `INTEGRATION_Data_Ingester` |
| Description | Generic data ingestion framework that normalizes data from external systems into the Sentrais data model. Handles schema validation, deduplication, and error quarantine. |
| Version | `2.0.0` |
| Trigger | Webhook (push from external systems) or Cron (pull from APIs) |

**Node Definitions**

```
Node 001: receive_data
  Type: webhook
  Name: "Receive External Data"
  Config:
    path: /api/v1/ingest/:source_system
    method: POST
    authentication: api_key
  → connects to: 002

Node 002: validate_and_normalize
  Type: function
  Name: "Validate Schema & Normalize"
  Code:
    ```javascript
    const input = $input.item.json;
    const source = input.params.source_system;
    
    // Load schema for this source
    const schema = await $mongo.findOne('ingestion_schemas', { source_system: source });
    
    if (!schema) {
      throw new Error(`No ingestion schema found for source: ${source}`);
    }
    
    // Validate
    const validationErrors = validateAgainstSchema(input.body, schema.input_schema);
    if (validationErrors.length > 0) {
      // Quarantine invalid data
      await $pg.query(`
        INSERT INTO data_quarantine (
          source_system, raw_data, validation_errors, quarantined_at
        ) VALUES ($1, $2, $3, NOW())
      `, [source, JSON.stringify(input.body), JSON.stringify(validationErrors)]);
      
      return { status: 'quarantined', errors: validationErrors };
    }
    
    // Normalize to Sentrais data model
    const normalized = applyTransformations(input.body, schema.transformations);
    
    // Dedup check
    const existing = await $pg.query(`
      SELECT data_id FROM ingested_data
      WHERE source_system = $1 AND source_id = $2
    `, [source, normalized.source_id]);
    
    if (existing.rows.length > 0) {
      return { status: 'duplicate', source_id: normalized.source_id };
    }
    
    return {
      source_system: source,
      normalized_data: normalized,
      target_store: schema.target_store,  // 'postgresql' | 'timescaledb' | 'mongodb'
      target_table: schema.target_table
    };
    ```
  → connects to: 003

Node 003: route_to_store
  Type: switch
  Name: "Route to Target Store"
  Conditions:
    target_store === 'postgresql' → PostgreSQL insert
    target_store === 'timescaledb' → TimescaleDB insert
    target_store === 'mongodb' → MongoDB insert
  → connects to: 004 (confirm)
```

---

# 5. Prediction Workflows

## 5.1 PREDICTION_Threshold_Monitor

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `PREDICTION_Threshold_Monitor` |
| Description | Real-time threshold checking across all operational metrics. Compares current readings against configured thresholds and generates alerts when boundaries are crossed. |
| Version | `2.0.0` |
| Trigger | Called by `LIFECYCLE_Run_Phase` during events; also runs on cron for non-event monitoring |

**Node Definitions**

```
Node 001: load_thresholds
  Type: function
  Code:
    ```javascript
    const thresholds = await $pg.query(`
      SELECT t.threshold_id, t.metric_name, t.metric_source,
             t.warning_value, t.critical_value, t.comparison_operator,
             t.evaluation_window_seconds, t.consecutive_breaches_required,
             t.current_consecutive_breaches, t.last_breach_at,
             t.notification_config, t.sop_trigger
      FROM metric_thresholds t
      WHERE t.venue_id = $1 AND t.active = true
    `, [$input.item.json.venue_id]);
    
    return { thresholds: thresholds.rows, event_id: $input.item.json.event_id };
    ```
  → connects to: 002

Node 002: evaluate_thresholds
  Type: function
  Name: "Evaluate All Thresholds"
  Code:
    ```javascript
    const ctx = $input.item.json;
    const breaches = [];
    
    for (const threshold of ctx.thresholds) {
      // Get current metric value from appropriate source
      let current_value;
      
      switch (threshold.metric_source) {
        case 'crowd':
          const crowd = await $timescale.query(`
            SELECT AVG(occupancy_pct) as value
            FROM crowd_readings
            WHERE event_id = $1
              AND reading_time > NOW() - INTERVAL '${threshold.evaluation_window_seconds} seconds'
          `, [ctx.event_id]);
          current_value = parseFloat(crowd.rows[0]?.value || 0);
          break;
          
        case 'system_health':
          const health = await $timescale.query(`
            SELECT AVG(response_ms) as value
            FROM system_health_ts
            WHERE system_id = $1
              AND checked_at > NOW() - INTERVAL '${threshold.evaluation_window_seconds} seconds'
          `, [threshold.metric_name.split('.')[1]]);
          current_value = parseFloat(health.rows[0]?.value || 0);
          break;
          
        case 'weather':
          const weather = await $timescale.query(`
            SELECT value FROM weather_readings
            WHERE event_id = $1
            ORDER BY reading_time DESC LIMIT 1
          `, [ctx.event_id]);
          current_value = parseFloat(weather.rows[0]?.value || 0);
          break;
      }
      
      // Evaluate
      let breached = false;
      let severity = 'normal';
      
      switch (threshold.comparison_operator) {
        case '>':
          if (current_value > threshold.critical_value) { breached = true; severity = 'critical'; }
          else if (current_value > threshold.warning_value) { breached = true; severity = 'warning'; }
          break;
        case '<':
          if (current_value < threshold.critical_value) { breached = true; severity = 'critical'; }
          else if (current_value < threshold.warning_value) { breached = true; severity = 'warning'; }
          break;
      }
      
      if (breached) {
        const consecutive = threshold.current_consecutive_breaches + 1;
        
        // Update breach counter
        await $pg.query(`
          UPDATE metric_thresholds
          SET current_consecutive_breaches = $2, last_breach_at = NOW()
          WHERE threshold_id = $1
        `, [threshold.threshold_id, consecutive]);
        
        if (consecutive >= threshold.consecutive_breaches_required) {
          breaches.push({
            threshold_id: threshold.threshold_id,
            metric_name: threshold.metric_name,
            current_value,
            threshold_value: severity === 'critical' ? threshold.critical_value : threshold.warning_value,
            severity,
            consecutive_breaches: consecutive,
            notification_config: threshold.notification_config,
            sop_trigger: threshold.sop_trigger
          });
        }
      } else {
        // Reset counter
        if (threshold.current_consecutive_breaches > 0) {
          await $pg.query(`
            UPDATE metric_thresholds
            SET current_consecutive_breaches = 0
            WHERE threshold_id = $1
          `, [threshold.threshold_id]);
        }
      }
    }
    
    return { event_id: ctx.event_id, breaches };
    ```
  → connects to: 003

Node 003: handle_breaches
  Type: function
  Code:
    ```javascript
    const data = $input.item.json;
    
    for (const breach of data.breaches) {
      // Create alert
      await $pg.query(`
        INSERT INTO alerts (
          event_id, alert_type, severity, source_metric,
          current_value, threshold_value, message, created_at
        ) VALUES ($1, 'threshold_breach', $2, $3, $4, $5, $6, NOW())
      `, [data.event_id, breach.severity, breach.metric_name,
          breach.current_value, breach.threshold_value,
          `${breach.metric_name} = ${breach.current_value} (threshold: ${breach.threshold_value})`]);
      
      // Notify
      await $workflow.execute('SHARED_Notification_Service', {
        event_id: data.event_id,
        notification_type: 'threshold_breach',
        severity: breach.severity,
        channels: breach.notification_config?.channels || ['push'],
        recipients: breach.notification_config?.recipients || ['role:operations_chief'],
        message: {
          title: `${breach.severity.toUpperCase()}: ${breach.metric_name}`,
          body: `Current: ${breach.current_value} | Threshold: ${breach.threshold_value} | Breaches: ${breach.consecutive_breaches}`,
          action_url: `/command/metrics/${breach.metric_name}`
        }
      });
      
      // Trigger SOP if configured
      if (breach.sop_trigger && breach.severity === 'critical') {
        await $workflow.execute('RESPONSE_SOP_Executor', {
          event_id: data.event_id,
          sop_id: breach.sop_trigger,
          trigger_source: 'PREDICTION_Threshold_Monitor',
          trigger_data: breach,
          auto_activated: true
        });
      }
      
      // Evidence
      await $workflow.execute('SHARED_Evidence_Writer', {
        event_id: data.event_id,
        evidence_type: 'threshold_breach',
        category: 'prediction',
        source: 'PREDICTION_Threshold_Monitor',
        data: breach
      });
    }
    ```
  → END (loop continues via parent caller)
```

## 5.2 PREDICTION_Equipment_Failure

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `PREDICTION_Equipment_Failure` |
| Description | Predictive maintenance engine that analyzes equipment telemetry to forecast failures 30 days in advance. Generates work orders and pre-orders parts. |
| Version | `2.0.0` |
| Trigger | Cron: daily at 06:00 UTC |

**Node Definitions**

```
Node 001: load_equipment_telemetry
  Type: function
  Code:
    ```javascript
    // Load last 90 days of telemetry for all monitored equipment
    const equipment = await $pg.query(`
      SELECT e.equipment_id, e.equipment_name, e.equipment_type,
             e.install_date, e.last_maintenance_date, e.failure_history
      FROM equipment_registry e
      WHERE e.predictive_monitoring = true AND e.active = true
    `);
    
    const telemetry = {};
    for (const eq of equipment.rows) {
      const readings = await $timescale.query(`
        SELECT reading_type, value, reading_time
        FROM equipment_telemetry
        WHERE equipment_id = $1
          AND reading_time > NOW() - INTERVAL '90 days'
        ORDER BY reading_time ASC
      `, [eq.equipment_id]);
      
      telemetry[eq.equipment_id] = {
        equipment: eq,
        readings: readings.rows
      };
    }
    
    return { equipment_data: telemetry };
    ```
  → connects to: 002

Node 002: run_prediction_models
  Type: function
  Name: "Run Failure Prediction Models"
  Code:
    ```javascript
    const data = $input.item.json;
    const predictions = [];
    
    for (const [eq_id, eq_data] of Object.entries(data.equipment_data)) {
      // Call ML prediction service
      const prediction = await $http.request({
        method: 'POST',
        url: `${process.env.SIPE_ENGINE_URL}/predict/equipment_failure`,
        body: {
          equipment_id: eq_id,
          equipment_type: eq_data.equipment.equipment_type,
          readings: eq_data.readings,
          failure_history: eq_data.equipment.failure_history,
          days_since_maintenance: daysSince(eq_data.equipment.last_maintenance_date)
        }
      });
      
      if (prediction.body.failure_probability > 0.4) {
        predictions.push({
          equipment_id: eq_id,
          equipment_name: eq_data.equipment.equipment_name,
          failure_probability: prediction.body.failure_probability,
          predicted_failure_date: prediction.body.predicted_date,
          failure_mode: prediction.body.failure_mode,
          confidence: prediction.body.confidence,
          recommended_action: prediction.body.recommended_action,
          parts_needed: prediction.body.parts_needed || []
        });
      }
    }
    
    return { predictions };
    ```
  → connects to: 003

Node 003: create_maintenance_tasks
  Type: function
  Code:
    ```javascript
    const data = $input.item.json;
    
    for (const pred of data.predictions) {
      // Create predictive maintenance work order
      await $pg.query(`
        INSERT INTO maintenance_work_orders (
          equipment_id, order_type, priority,
          predicted_failure_date, failure_probability,
          recommended_action, parts_needed, status, created_at
        ) VALUES ($1, 'predictive', $2, $3, $4, $5, $6, 'pending', NOW())
      `, [pred.equipment_id,
          pred.failure_probability > 0.8 ? 'critical' : 
          pred.failure_probability > 0.6 ? 'high' : 'medium',
          pred.predicted_failure_date, pred.failure_probability,
          pred.recommended_action, JSON.stringify(pred.parts_needed)]);
      
      // Auto-order parts if probability > 0.7
      if (pred.failure_probability > 0.7 && pred.parts_needed.length > 0) {
        for (const part of pred.parts_needed) {
          await $pg.query(`
            INSERT INTO parts_orders (
              equipment_id, part_number, part_name, quantity,
              source, urgency, status, created_at
            ) VALUES ($1, $2, $3, $4, 'predictive_maintenance', $5, 'ordered', NOW())
          `, [pred.equipment_id, part.part_number, part.name,
              part.quantity, pred.failure_probability > 0.8 ? 'urgent' : 'standard']);
        }
      }
      
      // Notify maintenance team
      await $workflow.execute('SHARED_Notification_Service', {
        notification_type: 'predictive_maintenance',
        severity: pred.failure_probability > 0.8 ? 'high' : 'medium',
        channels: ['push', 'email'],
        recipients: ['role:maintenance_supervisor'],
        message: {
          title: `Predicted Failure: ${pred.equipment_name}`,
          body: `${Math.round(pred.failure_probability * 100)}% failure probability by ${pred.predicted_failure_date}. Action: ${pred.recommended_action}`,
          action_url: `/maintenance/equipment/${pred.equipment_id}`
        }
      });
    }
    ```
  → END
```

---

# 6. Reporting Workflows

## 6.1 REPORTING_After_Action

**Workflow Metadata**

| Field | Value |
|-------|-------|
| Name | `REPORTING_After_Action` |
| Description | Generates comprehensive after-action reports following NIMS/ICS standards. Compiles incident data, response metrics, lessons learned, and improvement recommendations into a structured document. |
| Version | `2.0.0` |
| Trigger | Called by `LIFECYCLE_Review_Phase` |

**Node Definitions**

```
Node 001: compile_aar_data
  Type: function
  Code:
    ```javascript
    const input = $input.item.json;
    
    // Structure AAR per NIMS guidelines
    const aar = {
      header: {
        report_id: `AAR_${input.event_id}`,
        event_id: input.event_id,
        event_name: null, // populated below
        generated_at: new Date().toISOString(),
        classification: 'INTERNAL',
        report_version: '1.0'
      },
      executive_summary: {
        overall_grade: input.scores.overall.grade,
        overall_score: input.scores.overall.value,
        incidents_total: input.data.incidents.length,
        incidents_resolved: input.data.incidents.filter(i => i.status === 'resolved').length,
        response_time_avg: null,
        key_findings: [],
        key_recommendations: []
      },
      chronology: [],
      incident_analysis: [],
      performance_scores: input.scores,
      patterns_detected: input.patterns,
      lessons_learned: input.lessons,
      recommendations: [],
      appendices: {
        evidence_summary: input.data.evidence,
        system_health_report: input.data.systems,
        crowd_analytics: input.data.crowd,
        weather_summary: input.data.weather,
        sop_execution_log: input.data.sop_executions
      }
    };
    
    // Build event chronology from evidence ledger
    const chronology = await $pg.query(`
      SELECT evidence_type, category, data, created_at
      FROM evidence_ledger
      WHERE event_id = $1
      ORDER BY created_at ASC
    `, [input.event_id]);
    
    aar.chronology = chronology.rows.map(e => ({
      time: e.created_at,
      type: e.evidence_type,
      category: e.category,
      summary: extractSummary(e.data)
    }));
    
    // Build incident analysis
    for (const inc of input.data.incidents) {
      aar.incident_analysis.push({
        incident_id: inc.incident_id,
        type: inc.incident_type,
        severity: inc.severity,
        description: inc.description,
        timeline: inc.timeline,
        response_time_seconds: calculateResponseTime(inc),
        resolution: inc.resolution_notes,
        root_cause: null, // To be filled during review
        corrective_actions: []
      });
    }
    
    // Generate recommendations from patterns
    aar.recommendations = input.patterns.map((p, i) => ({
      recommendation_id: i + 1,
      priority: p.severity === 'high' ? 'CRITICAL' : 'STANDARD',
      area: p.pattern_type,
      finding: p.description,
      recommendation: p.recommendation,
      responsible_party: 'TBD',
      target_date: 'TBD'
    }));
    
    aar.executive_summary.key_findings = input.patterns.slice(0, 5).map(p => p.description);
    aar.executive_summary.key_recommendations = aar.recommendations.slice(0, 5).map(r => r.recommendation);
    
    return aar;
    ```
  → connects to: 002

Node 002: generate_report_document
  Type: function
  Name: "Generate AAR Document"
  Code:
    ```javascript
    const aar = $input.item.json;
    
    // Store structured AAR in database
    await $pg.query(`
      UPDATE event_reviews
      SET aar_report = $2, aar_generated_at = NOW()
      WHERE review_id = $1
    `, [aar.review_id, JSON.stringify(aar)]);
    
    // Store in Document Store for rich querying
    await $mongo.insertOne('after_action_reports', {
      _id: aar.header.report_id,
      ...aar,
      searchable: true,
      metadata: {
        event_id: aar.header.event_id,
        grade: aar.executive_summary.overall_grade,
        incident_count: aar.executive_summary.incidents_total,
        patterns_count: aar.patterns_detected.length,
        generated_at: aar.header.generated_at
      }
    });
    
    // Evidence
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: aar.header.event_id,
      evidence_type: 'aar_generated',
      category: 'reporting',
      source: 'REPORTING_After_Action',
      data: { report_id: aar.header.report_id, grade: aar.executive_summary.overall_grade },
      compliance_tags: ['AAR', 'NIMS', 'CONTINUOUS_IMPROVEMENT']
    });
    
    // Notify stakeholders
    await $workflow.execute('SHARED_Notification_Service', {
      event_id: aar.header.event_id,
      notification_type: 'aar_ready',
      severity: 'info',
      channels: ['email'],
      recipients: ['role:incident_commander', 'role:operations_chief', 'role:venue_gm'],
      message: {
        title: `After-Action Report Ready: ${aar.header.event_id}`,
        body: `Overall Grade: ${aar.executive_summary.overall_grade} (${aar.executive_summary.incidents_total} incidents, ${aar.recommendations.length} recommendations). Review available in Sentrais OS.`,
        attachments: [{ type: 'report_link', report_id: aar.header.report_id }]
      }
    });
    
    return {
      report_id: aar.header.report_id,
      grade: aar.executive_summary.overall_grade,
      incident_count: aar.executive_summary.incidents_total,
      recommendation_count: aar.recommendations.length,
      status: 'published'
    };
    ```
  → END

Error Handling:
  - aar_compilation_error → Log partial data, flag for manual review
  - document_storage_error → Retry 3x, fallback to local file storage
  - notification_failure → Log warning, AAR still available in system

---

## 6.2 REPORTING_Dashboard_Update

| Field | Value |
|-------|-------|
| **Workflow Name** | `REPORTING_Dashboard_Update` |
| **Description** | Real-time dashboard metric aggregation and push to all connected clients. Computes KPIs from time-series data and pushes to WebSocket channels for live displays. |
| **Version** | 1.0.0 |
| **Trigger** | Cron (every 30 seconds during events, every 5 minutes otherwise) |
| **Schedule** | `*/30 * * * * *` (event mode) / `*/5 * * * *` (standby mode) |
| **Dependencies** | TimescaleDB, PostgreSQL, Redis, WebSocket Gateway |

Input Schema:
```json
{
  "venue_id": "string",
  "event_id": "string | null",
  "mode": "event | standby",
  "dashboard_targets": ["command_center", "executive", "security", "operations"]
}
```

Output Schema:
```json
{
  "dashboard_id": "string",
  "computed_at": "ISO8601",
  "metrics": {
    "operational": {
      "system_health_score": "number (0-100)",
      "active_incidents": "number",
      "avg_response_time_seconds": "number",
      "sop_completion_rate": "number (0-1)",
      "staff_coverage_pct": "number (0-100)"
    },
    "crowd": {
      "total_occupancy": "number",
      "occupancy_pct": "number (0-100)",
      "peak_density_zone": "string",
      "flow_rate_per_minute": "number",
      "zones_at_warning": "number"
    },
    "safety": {
      "active_threats": "number",
      "weather_status": "string",
      "evacuation_readiness": "string (GREEN|YELLOW|RED)",
      "medical_incidents_open": "number"
    },
    "experience": {
      "avg_wait_time_minutes": "number",
      "concession_throughput": "number",
      "guest_satisfaction_live": "number (0-5)"
    }
  },
  "alerts_summary": {
    "critical": "number",
    "high": "number",
    "medium": "number",
    "low": "number"
  }
}
```

### Node Definitions

Node 001: aggregate_metrics
  Type: function
  Name: "Aggregate Real-Time KPIs"
  Code:
    ```javascript
    const venue_id = $input.item.json.venue_id;
    const event_id = $input.item.json.event_id;
    const now = new Date().toISOString();
    const window = '5 minutes';
    
    // System health from latest health checks
    const systemHealth = await $pg.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 / COUNT(*) as health_score,
        COUNT(*) FILTER (WHERE status != 'healthy') as unhealthy_count
      FROM integration_health
      WHERE venue_id = $1 AND last_check > NOW() - INTERVAL '2 minutes'
    `, [venue_id]);
    
    // Active incidents
    const incidents = await $pg.query(`
      SELECT COUNT(*) as active, 
        AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_age_seconds
      FROM incidents
      WHERE venue_id = $1 AND status IN ('open', 'in_progress', 'escalated')
    `, [venue_id]);
    
    // Response time from recent incidents
    const responseTimes = await $timescale.query(`
      SELECT AVG(response_time_seconds) as avg_response
      FROM incident_metrics
      WHERE venue_id = $1 AND time > NOW() - INTERVAL '${window}'
    `, [venue_id]);
    
    // Crowd metrics from latest readings
    const crowd = await $timescale.query(`
      SELECT 
        last(total_occupancy, time) as occupancy,
        last(occupancy_pct, time) as occupancy_pct,
        last(peak_zone, time) as peak_zone,
        avg(flow_rate) as flow_rate,
        COUNT(DISTINCT zone_id) FILTER (WHERE density_level = 'warning') as zones_warning
      FROM crowd_metrics
      WHERE venue_id = $1 AND time > NOW() - INTERVAL '1 minute'
    `, [venue_id]);
    
    // Alerts summary
    const alerts = await $pg.query(`
      SELECT severity, COUNT(*) as count
      FROM active_alerts
      WHERE venue_id = $1 AND acknowledged = false
      GROUP BY severity
    `, [venue_id]);
    
    const alertMap = {};
    for (const a of alerts.rows) alertMap[a.severity] = parseInt(a.count);
    
    const dashboard = {
      dashboard_id: `dash_${venue_id}_${Date.now()}`,
      computed_at: now,
      metrics: {
        operational: {
          system_health_score: parseFloat(systemHealth.rows[0]?.health_score || 100),
          active_incidents: parseInt(incidents.rows[0]?.active || 0),
          avg_response_time_seconds: parseFloat(responseTimes.rows[0]?.avg_response || 0),
          sop_completion_rate: 0,
          staff_coverage_pct: 0
        },
        crowd: {
          total_occupancy: parseInt(crowd.rows[0]?.occupancy || 0),
          occupancy_pct: parseFloat(crowd.rows[0]?.occupancy_pct || 0),
          peak_density_zone: crowd.rows[0]?.peak_zone || 'none',
          flow_rate_per_minute: parseFloat(crowd.rows[0]?.flow_rate || 0),
          zones_at_warning: parseInt(crowd.rows[0]?.zones_warning || 0)
        },
        safety: {
          active_threats: alertMap['critical'] || 0,
          weather_status: 'CLEAR',
          evacuation_readiness: 'GREEN',
          medical_incidents_open: 0
        },
        experience: {
          avg_wait_time_minutes: 0,
          concession_throughput: 0,
          guest_satisfaction_live: 0
        }
      },
      alerts_summary: {
        critical: alertMap['critical'] || 0,
        high: alertMap['high'] || 0,
        medium: alertMap['medium'] || 0,
        low: alertMap['low'] || 0
      }
    };
    
    return dashboard;
    ```
  → connects to: 002

Node 002: push_to_clients
  Type: function
  Name: "Push Dashboard via WebSocket"
  Code:
    ```javascript
    const dashboard = $input.item.json;
    
    // Cache in Redis for new client connections
    await $redis.set(
      `dashboard:${dashboard.dashboard_id.split('_')[1]}:latest`,
      JSON.stringify(dashboard),
      'EX', 60
    );
    
    // Push to WebSocket channels by dashboard type
    const targets = ['command_center', 'executive', 'security', 'operations'];
    for (const target of targets) {
      await $http.post(process.env.WS_GATEWAY_URL + '/publish', {
        channel: `dashboard:${target}`,
        payload: dashboard
      });
    }
    
    // Store snapshot for historical trending (every 5 minutes)
    const minute = new Date().getMinutes();
    if (minute % 5 === 0) {
      await $timescale.query(`
        INSERT INTO dashboard_snapshots (time, venue_id, event_id, metrics)
        VALUES (NOW(), $1, $2, $3)
      `, [
        dashboard.dashboard_id.split('_')[1],
        $input.item.json.event_id,
        JSON.stringify(dashboard.metrics)
      ]);
    }
    
    return { pushed: targets.length, cached: true };
    ```
  → END

Error Handling:
  - query_timeout → Return cached dashboard from Redis
  - websocket_failure → Log warning, clients will poll on next cycle
  - partial_data → Push with available metrics, flag incomplete fields

---

## 6.3 REPORTING_Compliance_Report

| Field | Value |
|-------|-------|
| **Workflow Name** | `REPORTING_Compliance_Report` |
| **Description** | Generates compliance reports against NFL Game Operations Manual, federal regulations (ADA, OSHA), state requirements, and SEAR certification standards. Produces audit-ready documentation. |
| **Version** | 1.0.0 |
| **Trigger** | Scheduled (weekly) + On-demand |
| **Schedule** | `0 6 * * 1` (Monday 06:00 UTC) |
| **Dependencies** | PostgreSQL, MongoDB, Evidence Ledger, SHARED_Notification_Service |

Input Schema:
```json
{
  "venue_id": "string",
  "report_type": "weekly | monthly | quarterly | annual | on_demand",
  "frameworks": ["NFL_GOM", "ADA", "OSHA", "NFPA", "SEAR", "STATE_SPECIFIC"],
  "period_start": "ISO8601",
  "period_end": "ISO8601",
  "requested_by": "string | null"
}
```

Output Schema:
```json
{
  "report_id": "string",
  "venue_id": "string",
  "overall_compliance_score": "number (0-100)",
  "framework_scores": [
    {
      "framework": "string",
      "score": "number (0-100)",
      "requirements_total": "number",
      "requirements_met": "number",
      "requirements_failed": "number",
      "critical_gaps": ["string"]
    }
  ],
  "violations": [
    {
      "violation_id": "string",
      "framework": "string",
      "severity": "critical | high | medium | low",
      "description": "string",
      "remediation_plan": "string",
      "due_date": "ISO8601"
    }
  ],
  "certifications": {
    "current_level": "BRONZE | SILVER | GOLD | PLATINUM",
    "next_level_requirements": ["string"],
    "renewal_date": "ISO8601"
  }
}
```

### Node Definitions

Node 001: gather_compliance_data
  Type: function
  Name: "Gather Compliance Evidence"
  Code:
    ```javascript
    const { venue_id, frameworks, period_start, period_end } = $input.item.json;
    
    const requirements = await $mongo.find('compliance_requirements', {
      framework: { $in: frameworks },
      active: true
    });
    
    const evidence = await $pg.query(`
      SELECT * FROM evidence_ledger
      WHERE venue_id = $1 
        AND created_at BETWEEN $2 AND $3
        AND compliance_tags && $4::text[]
      ORDER BY created_at
    `, [venue_id, period_start, period_end, frameworks]);
    
    const training = await $pg.query(`
      SELECT sc.certification_type, COUNT(*) as total,
        COUNT(*) FILTER (WHERE sc.status = 'current') as current,
        COUNT(*) FILTER (WHERE sc.status = 'expired') as expired
      FROM staff_certifications sc
      JOIN staff s ON s.staff_id = sc.staff_id
      WHERE s.venue_id = $1
      GROUP BY sc.certification_type
    `, [venue_id]);
    
    const inspections = await $pg.query(`
      SELECT * FROM inspections
      WHERE venue_id = $1 
        AND inspection_date BETWEEN $2 AND $3
    `, [venue_id, period_start, period_end]);
    
    return {
      requirements,
      evidence: evidence.rows,
      training: training.rows,
      inspections: inspections.rows
    };
    ```
  → connects to: 002

Node 002: evaluate_compliance
  Type: function
  Name: "Evaluate Against Frameworks"
  Code:
    ```javascript
    const data = $input.item.json;
    const frameworkScores = [];
    const allViolations = [];
    
    for (const framework of [...new Set(data.requirements.map(r => r.framework))]) {
      const reqs = data.requirements.filter(r => r.framework === framework);
      let met = 0, partial = 0, failed = 0;
      const criticalGaps = [];
      
      for (const req of reqs) {
        const matchingEvidence = data.evidence.filter(e => 
          e.compliance_tags.includes(req.requirement_id) || 
          e.compliance_tags.includes(framework)
        );
        
        if (matchingEvidence.length >= req.evidence_threshold) {
          met++;
        } else if (matchingEvidence.length > 0) {
          partial++;
        } else {
          failed++;
          if (req.severity === 'critical') {
            criticalGaps.push(req.description);
            allViolations.push({
              violation_id: `VIO_${Date.now()}_${req.requirement_id}`,
              framework,
              severity: req.severity,
              description: `Missing evidence for: ${req.description}`,
              remediation_plan: req.default_remediation || 'TBD',
              due_date: new Date(Date.now() + 30 * 86400000).toISOString()
            });
          }
        }
      }
      
      const total = reqs.length;
      const score = total > 0 ? ((met + partial * 0.5) / total) * 100 : 0;
      
      frameworkScores.push({
        framework,
        score: Math.round(score * 10) / 10,
        requirements_total: total,
        requirements_met: met,
        requirements_failed: failed,
        critical_gaps: criticalGaps
      });
    }
    
    const overallScore = frameworkScores.length > 0
      ? frameworkScores.reduce((sum, f) => sum + f.score, 0) / frameworkScores.length
      : 0;
    
    return { overall_compliance_score: Math.round(overallScore * 10) / 10, framework_scores: frameworkScores, violations: allViolations };
    ```
  → connects to: 003

Node 003: generate_and_store
  Type: function
  Name: "Generate Compliance Report"
  Code:
    ```javascript
    const evaluation = $input.item.json;
    const input = $input.first().json;
    
    const report = {
      report_id: `CR_${input.venue_id}_${Date.now()}`,
      venue_id: input.venue_id,
      report_type: input.report_type,
      period: { start: input.period_start, end: input.period_end },
      ...evaluation,
      certifications: {
        current_level: determineCertLevel(evaluation.overall_compliance_score),
        next_level_requirements: getNextLevelReqs(evaluation),
        renewal_date: getNextRenewalDate()
      },
      generated_at: new Date().toISOString()
    };
    
    await $pg.query(`
      INSERT INTO compliance_reports (report_id, venue_id, report_type, period_start, period_end, 
        overall_score, framework_scores, violations, certifications, generated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [report.report_id, report.venue_id, report.report_type,
      report.period.start, report.period.end, report.overall_compliance_score,
      JSON.stringify(report.framework_scores), JSON.stringify(report.violations),
      JSON.stringify(report.certifications)]);
    
    await $workflow.execute('SHARED_Evidence_Writer', {
      event_id: null,
      evidence_type: 'compliance_report_generated',
      category: 'compliance',
      source: 'REPORTING_Compliance_Report',
      data: { report_id: report.report_id, score: report.overall_compliance_score },
      compliance_tags: ['COMPLIANCE', 'AUDIT', ...input.frameworks]
    });
    
    if (report.violations.filter(v => v.severity === 'critical').length > 0) {
      await $workflow.execute('SHARED_Notification_Service', {
        notification_type: 'compliance_critical',
        severity: 'high',
        channels: ['email', 'sms'],
        recipients: ['role:compliance_officer', 'role:venue_gm'],
        message: {
          title: 'CRITICAL Compliance Gaps Detected',
          body: `${report.violations.filter(v => v.severity === 'critical').length} critical gaps. Score: ${report.overall_compliance_score}%.`
        }
      });
    }
    
    return report;
    ```
  → END

---

## 6.4 REPORTING_Executive_Summary

| Field | Value |
|-------|-------|
| **Workflow Name** | `REPORTING_Executive_Summary` |
| **Description** | Generates executive-level summary reports aggregating KPIs, trends, ROI, and strategic recommendations for venue leadership, league office, and board presentations. |
| **Version** | 1.0.0 |
| **Trigger** | Scheduled (monthly) + On-demand |
| **Schedule** | `0 8 1 * *` (1st of month, 08:00 UTC) |
| **Dependencies** | PostgreSQL, TimescaleDB, MongoDB, SHARED_Notification_Service |

Input Schema:
```json
{
  "venue_id": "string",
  "period": "monthly | quarterly | annual",
  "include_sections": ["kpi_summary", "trends", "incidents", "compliance", "financial", "recommendations"],
  "audience": "venue_executive | league_office | board"
}
```

Output Schema:
```json
{
  "report_id": "string",
  "period_label": "string",
  "kpi_summary": {
    "operational_score": "number",
    "safety_score": "number",
    "experience_score": "number",
    "financial_score": "number",
    "overall_score": "number"
  },
  "trends": {
    "metrics": [
      { "name": "string", "current": "number", "previous": "number", "change_pct": "number", "direction": "improving | stable | declining" }
    ]
  },
  "financial_impact": {
    "cost_avoidance": "number",
    "revenue_optimization": "number",
    "efficiency_gains": "number",
    "total_value": "number",
    "roi_pct": "number"
  },
  "top_recommendations": [
    { "priority": "number", "area": "string", "recommendation": "string", "expected_impact": "string" }
  ]
}
```

### Node Definitions

Node 001: compile_executive_data
  Type: function
  Name: "Compile Executive Metrics"
  Code:
    ```javascript
    const { venue_id, period } = $input.item.json;
    const periodDays = period === 'monthly' ? 30 : period === 'quarterly' ? 90 : 365;
    const currStart = new Date(Date.now() - periodDays * 86400000).toISOString();
    const prevStart = new Date(Date.now() - 2 * periodDays * 86400000).toISOString();
    const now = new Date().toISOString();
    
    // KPI aggregation
    const kpis = await $timescale.query(`
      SELECT AVG(system_health_score) as op_score, AVG(safety_score) as safety_score,
        AVG(experience_score) as experience_score
      FROM dashboard_snapshots
      WHERE venue_id = $1 AND time BETWEEN $2 AND $3
    `, [venue_id, currStart, now]);
    
    // Trend comparison
    const trendMetrics = ['incident_count', 'avg_response_time', 'system_uptime', 'guest_satisfaction'];
    const trends = [];
    for (const metric of trendMetrics) {
      const curr = await $timescale.query(`
        SELECT AVG(value) as val FROM metric_values 
        WHERE venue_id = $1 AND metric_name = $2 AND time BETWEEN $3 AND $4
      `, [venue_id, metric, currStart, now]);
      const prev = await $timescale.query(`
        SELECT AVG(value) as val FROM metric_values
        WHERE venue_id = $1 AND metric_name = $2 AND time BETWEEN $3 AND $4
      `, [venue_id, metric, prevStart, currStart]);
      
      const c = parseFloat(curr.rows[0]?.val || 0);
      const p = parseFloat(prev.rows[0]?.val || 0);
      const changePct = p > 0 ? ((c - p) / p) * 100 : 0;
      trends.push({
        name: metric, current: c, previous: p,
        change_pct: Math.round(changePct * 10) / 10,
        direction: changePct > 2 ? 'improving' : changePct < -2 ? 'declining' : 'stable'
      });
    }
    
    // Financial impact
    const financial = await $pg.query(`
      SELECT 
        SUM(CASE WHEN category = 'cost_avoidance' THEN amount ELSE 0 END) as cost_avoidance,
        SUM(CASE WHEN category = 'revenue_optimization' THEN amount ELSE 0 END) as revenue_opt,
        SUM(CASE WHEN category = 'efficiency_gains' THEN amount ELSE 0 END) as efficiency,
        SUM(amount) as total
      FROM financial_impact
      WHERE venue_id = $1 AND recorded_at BETWEEN $2 AND $3
    `, [venue_id, currStart, now]);
    
    // Top recommendations from latest AAR
    const latestAAR = await $mongo.findOne('after_action_reports', 
      { 'metadata.event_id': { $regex: venue_id } },
      { sort: { 'metadata.generated_at': -1 } }
    );
    
    return { kpis: kpis.rows[0], trends, financial: financial.rows[0], recommendations: latestAAR?.recommendations?.slice(0, 5) || [] };
    ```
  → connects to: 002

Node 002: format_and_publish
  Type: function
  Name: "Format Executive Report"
  Code:
    ```javascript
    const data = $input.item.json;
    const input = $input.first().json;
    
    const report = {
      report_id: `EXEC_${input.venue_id}_${Date.now()}`,
      period_label: `${input.period} ending ${new Date().toISOString().split('T')[0]}`,
      kpi_summary: {
        operational_score: Math.round(data.kpis?.op_score || 0),
        safety_score: Math.round(data.kpis?.safety_score || 0),
        experience_score: Math.round(data.kpis?.experience_score || 0),
        financial_score: 0,
        overall_score: 0
      },
      trends: { metrics: data.trends },
      financial_impact: {
        cost_avoidance: parseFloat(data.financial?.cost_avoidance || 0),
        revenue_optimization: parseFloat(data.financial?.revenue_opt || 0),
        efficiency_gains: parseFloat(data.financial?.efficiency || 0),
        total_value: parseFloat(data.financial?.total || 0),
        roi_pct: 0
      },
      top_recommendations: data.recommendations.map((r, i) => ({
        priority: i + 1, area: r.area, recommendation: r.recommendation, expected_impact: r.finding
      }))
    };
    
    // Overall score weighted
    report.kpi_summary.overall_score = Math.round(
      report.kpi_summary.operational_score * 0.3 +
      report.kpi_summary.safety_score * 0.35 +
      report.kpi_summary.experience_score * 0.2 +
      report.kpi_summary.financial_score * 0.15
    );
    
    await $mongo.insertOne('executive_reports', {
      _id: report.report_id, ...report,
      audience: input.audience, generated_at: new Date().toISOString()
    });
    
    await $workflow.execute('SHARED_Notification_Service', {
      notification_type: 'executive_report_ready',
      severity: 'info',
      channels: ['email'],
      recipients: [`role:${input.audience}`],
      message: {
        title: `Executive Summary Ready: ${report.period_label}`,
        body: `Overall Score: ${report.kpi_summary.overall_score}/100. Total Value: $${(report.financial_impact.total_value / 1000000).toFixed(1)}M`
      }
    });
    
    return report;
    ```
  → END

---

# Section 7: API Layer Design

The API layer provides external access to Sentrais OS capabilities. All workflows expose functionality through a unified API gateway.

## 7.1 API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Kong/Traefik)                │
│  Rate Limiting · Auth · Routing · Logging · CORS            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Auth     │  │ Events   │  │ Incidents│  │ Reports  │  │
│  │ Service  │  │ API      │  │ API      │  │ API      │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Systems  │  │ Crowd    │  │ SOPs     │  │ Predict  │  │
│  │ API      │  │ API      │  │ API      │  │ API      │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Evidence │  │ Compliance│ │ WebSocket│                 │
│  │ API      │  │ API      │  │ Gateway  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
├─────────────────────────────────────────────────────────────┤
│             n8n Workflow Execution Engine                    │
│  (Workflows triggered via n8n Webhook nodes)                │
└─────────────────────────────────────────────────────────────┘
```

## 7.2 Authentication & Authorization

```
Authentication: OAuth 2.0 + JWT
  - Access tokens: 15-minute TTL
  - Refresh tokens: 7-day TTL (event mode: 24-hour)
  - Service-to-service: API keys + mutual TLS
  
Authorization: RBAC (Role-Based Access Control)
  Roles:
    - venue_admin       → Full venue access
    - operations_chief  → Operational workflows, dashboards, incidents
    - security_chief    → Security incidents, threats, evidence
    - incident_commander → Active incident management
    - medical_lead      → Medical incidents, resources
    - compliance_officer → Compliance reports, evidence, certifications
    - league_admin      → Cross-venue read access, benchmarking
    - system_integrator → Integration endpoints, health checks
    - read_only         → Dashboard viewing only

  Row-Level Security:
    - All queries filtered by venue_id from JWT claims
    - Cross-venue access requires league_admin role
    - Evidence ledger: write-once, read based on classification level
```

## 7.3 Core API Endpoints

### Events API
```
POST   /api/v1/events                         → Create event (triggers LIFECYCLE_Prepare_Phase)
GET    /api/v1/events/:event_id               → Get event details
PUT    /api/v1/events/:event_id               → Update event parameters
POST   /api/v1/events/:event_id/advance       → Advance lifecycle phase
GET    /api/v1/events/:event_id/status         → Current phase, sub-phase, health
GET    /api/v1/events/:event_id/timeline       → Full event timeline with milestones
```

### Incidents API
```
POST   /api/v1/incidents                       → Create incident (triggers RUN_Incident_Handler)
GET    /api/v1/incidents/:incident_id          → Get incident with full timeline
PUT    /api/v1/incidents/:incident_id          → Update incident (status, notes, severity)
POST   /api/v1/incidents/:incident_id/assign   → Assign/reassign resources
POST   /api/v1/incidents/:incident_id/escalate → Manual escalation
POST   /api/v1/incidents/:incident_id/resolve  → Close with resolution notes
GET    /api/v1/incidents?status=open&severity=critical → Query with filters
```

### SOPs API
```
GET    /api/v1/sops                            → List SOPs for venue
GET    /api/v1/sops/:sop_id                    → Get SOP definition
POST   /api/v1/sops/:sop_id/execute            → Trigger SOP (triggers RESPONSE_SOP_Executor)
GET    /api/v1/sops/executions/:execution_id   → Execution status and progress
POST   /api/v1/sops/executions/:exec_id/steps/:step_id/complete → Complete manual step
POST   /api/v1/sops/executions/:exec_id/abort  → Abort execution
```

### Systems Integration API
```
GET    /api/v1/systems                         → List integrated systems and health
GET    /api/v1/systems/:system_id/health       → Individual system health
POST   /api/v1/systems/:system_id/data         → Ingest data (triggers INTEGRATION_Data_Ingester)
GET    /api/v1/systems/health/summary           → Aggregate health dashboard
POST   /api/v1/systems/:system_id/failover     → Trigger manual failover
```

### Crowd API
```
GET    /api/v1/crowd/current                   → Current occupancy and density map
GET    /api/v1/crowd/zones                     → Zone-level density breakdown
GET    /api/v1/crowd/predictions?horizon=30m   → Crowd predictions for time horizon
GET    /api/v1/crowd/history?start=X&end=Y     → Historical crowd data
```

### Reports API
```
POST   /api/v1/reports/aar                     → Generate AAR (triggers REPORTING_After_Action)
GET    /api/v1/reports/aar/:report_id          → Get AAR
POST   /api/v1/reports/compliance              → Generate compliance report
GET    /api/v1/reports/compliance/:report_id   → Get compliance report
POST   /api/v1/reports/executive               → Generate executive summary
GET    /api/v1/reports?type=aar&venue_id=X     → Query reports
```

### Evidence API
```
GET    /api/v1/evidence?event_id=X             → Query evidence by event
GET    /api/v1/evidence/:evidence_id           → Get individual entry
GET    /api/v1/evidence/chain/:incident_id     → Full evidence chain for incident
POST   /api/v1/evidence/export                 → Export evidence package (PDF/ZIP)
GET    /api/v1/evidence/integrity/:evidence_id → Verify hash integrity
```

### Predictions API
```
GET    /api/v1/predictions/equipment           → Equipment failure predictions
GET    /api/v1/predictions/crowd               → Crowd behavior predictions
GET    /api/v1/predictions/weather             → Weather impact predictions
GET    /api/v1/predictions/thresholds          → Current threshold status
```

### WebSocket Channels
```
ws://host/ws/v1/dashboards/command_center    → Full operational view
ws://host/ws/v1/dashboards/executive         → Executive KPIs
ws://host/ws/v1/dashboards/security          → Security-focused view
ws://host/ws/v1/dashboards/operations        → Operations-focused view
ws://host/ws/v1/dashboards/crowd             → Crowd analytics stream
ws://host/ws/v1/alerts                       → Real-time alert stream
```

## 7.4 API Standards

```
Versioning:        URL path (/api/v1/...)
Content Type:      application/json
Date Format:       ISO 8601 (UTC)
Pagination:        Cursor-based (?cursor=X&limit=50)
Rate Limiting:     
  - Standard:      100 req/min per API key
  - Event mode:    500 req/min per API key
  - Bulk ingestion: 1000 req/min per integration key

Error Format:
{
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "Incident inc_abc123 not found",
    "request_id": "req_xyz789",
    "timestamp": "ISO8601"
  }
}

Status Codes: 200, 201, 202 (async), 400, 401, 403, 404, 409 (state violation), 429, 500, 503
```

---

# Section 8: Cross-Cutting Concerns

## 8.1 Error Handling Strategy

```
Tier 1: Retry (Transient Errors)
  - Network timeouts, database locks, API rate limits
  - Exponential backoff: 1s, 2s, 4s, 8s, 16s
  - Max retries: 5 (non-critical), 10 (critical paths)
  - Circuit breaker after consecutive failures

Tier 2: Fallback (Degraded Operation)
  - Service unavailable, partial data, integration down
  - Use cached data, skip non-critical steps, log degradation
  - Examples:
    - Weather API down → Use last-known weather + flag stale
    - Dashboard push fails → Clients poll from Redis cache
    - Prediction service down → Fall back to threshold-only alerts

Tier 3: Escalation (Critical Failures)
  - Data corruption, security breach, complete service loss
  - Alert on-call, halt affected workflows, preserve state
  - All critical failures logged to evidence ledger
  - Manual intervention required to resume
```

## 8.2 Observability

```
Logging: Structured JSON (ELK Stack / Google Cloud Logging)
  Fields: timestamp, workflow_id, node_id, event_id, venue_id, 
    execution_id, level, message, duration_ms, error

Metrics (Prometheus / Cloud Monitoring):
  - workflow_execution_duration_seconds{workflow, status}
  - workflow_error_total{workflow, error_type}
  - api_request_duration_seconds{endpoint, method, status}
  - integration_health{system_name, status}
  - incident_response_time_seconds{type, severity}
  - crowd_occupancy_current{venue, zone}
  - prediction_accuracy{model, timeframe}

Tracing (OpenTelemetry):
  - Distributed traces across workflow chains
  - Span per workflow node execution
  - Cross-service correlation via trace_id

Alerting:
  - PagerDuty: P1/P2 alerts
  - Slack: P3/P4 operational notifications
  - Email: Scheduled reports
  - Thresholds:
    - Workflow failure rate > 5% in 5 min → P1
    - API error rate > 1% in 5 min → P2
    - System health < 90% → P2
    - Dashboard latency > 5s → P3
```

## 8.3 Security

```
Data Classification:
  Level 1 (Public):       Venue capacity, event schedule
  Level 2 (Internal):     Operational metrics, crowd stats
  Level 3 (Confidential): Incident details, response plans, SOPs
  Level 4 (Restricted):   Evidence ledger, threat intelligence, PII

Encryption:
  At rest:   AES-256-GCM (PostgreSQL TDE, MongoDB encryption)
  In transit: TLS 1.3 (all connections)
  Evidence:  Additional SHA-256 hash chain for integrity

Access Control:
  - OAuth 2.0 + JWT (user access)
  - Mutual TLS (service-to-service)
  - API keys (integration partners)
  - Row-level security on all database queries
  - Full audit log for all data access

Network: VPC isolation, private DB endpoints, WAF, DDoS protection, IP allowlisting

Compliance: SOC 2 Type II, PCI DSS, HIPAA (medical), CJIS (law enforcement)
```

## 8.4 Data Retention & Lifecycle

```
Hot (0-30 days):    TimescaleDB raw metrics, PostgreSQL active records, Redis cache
Warm (30-365 days): TimescaleDB compressed (10:1), PostgreSQL partitions, MongoDB archives
Cold (1-7 years):   Cloud object storage (GCS/S3)
  - Evidence ledger: 7-year minimum
  - Compliance reports: Per regulatory requirement
  - Financial data: Per SOX requirements

Deletion:
  - PII: Purged after retention + 30-day grace
  - Operational metrics: Aggregated then purged after 2 years
  - Evidence: Never deleted within retention; court-hold support
  - Logs: 90-day hot, 1-year cold, then purge
```

## 8.5 Performance Targets

```
API Response Times:
  - Read endpoints:     p50 < 50ms,  p99 < 200ms
  - Write endpoints:    p50 < 100ms, p99 < 500ms
  - Report generation:  < 30 seconds

Workflow Execution:
  - Monitoring loops:    < 5s per cycle
  - Incident creation:   < 2s end-to-end
  - SOP step execution:  < 1s for automated steps
  - Dashboard update:    < 3s aggregation + push
  - AAR generation:      < 60s for standard events

Scalability:
  - 50 concurrent events across venues
  - 10,000 concurrent WebSocket connections
  - 100,000 time-series writes per second
  - 50,000 API requests per minute (burst)

Availability:
  - Platform SLA:        99.97% uptime
  - API availability:    99.99%
  - Data durability:     99.999999999% (11 nines)
```

---

# Appendix A: Workflow Dependency Graph

```
LIFECYCLE_Prepare_Phase
  └── LIFECYCLE_Ready_Phase
       └── LIFECYCLE_Run_Phase
            ├── RUN_Monitor_Systems ──────────┐
            ├── RUN_Monitor_Crowd ────────────┤
            ├── RUN_Monitor_Weather ──────────┤
            └── RUN_Incident_Handler ─────────┤
                 └── RESPONSE_SOP_Executor    │
                      └── RESPONSE_Escalation │
            └── LIFECYCLE_Review_Phase ◄──────┘
                 ├── REPORTING_After_Action
                 ├── REPORTING_Compliance_Report
                 └── REPORTING_Executive_Summary

Background (24/7):
  INTEGRATION_System_Health_Monitor
  INTEGRATION_Data_Ingester
  PREDICTION_Threshold_Monitor
  PREDICTION_Equipment_Failure (daily)
  REPORTING_Dashboard_Update (continuous)
```

# Appendix B: Database Schema Quick Reference

```
PostgreSQL (Operational):
  events, event_phases, venues, staff, staff_assignments,
  incidents, incident_resources, incident_timelines,
  sop_definitions, sop_executions, sop_step_completions,
  active_alerts, alert_history, escalation_chains,
  integration_health, compliance_reports, compliance_requirements,
  staff_certifications, inspections, financial_impact,
  event_reviews, improvement_tasks

TimescaleDB (Time-Series):
  sensor_readings, crowd_metrics, weather_readings,
  system_health_ts, incident_metrics, metric_values,
  dashboard_snapshots, prediction_results, threshold_breaches

MongoDB (Documents):
  sops, after_action_reports, executive_reports,
  evidence_documents, sop_templates, compliance_frameworks

Redis (Cache/State):
  dashboard:{venue_id}:latest, event:{event_id}:state,
  circuit:{system_name}, session:{token}, lock:{resource}

Evidence Ledger (Immutable):
  evidence_id, event_id, venue_id, timestamp,
  evidence_type, category, source_workflow,
  data (JSON), compliance_tags[], hash, prev_hash,
  classification_level
```

---

*Document Version: 2.0.0*
*Part: 2 of 2*
*Covers: RUN Phase, REVIEW Phase, Response Orchestration, Integrations, Predictions, Reporting, API Layer, Cross-Cutting Concerns*
*Companion to: sentrais_n8n_architecture_part1.md (PREPARE Phase, READY Phase, Shared Utilities, Data Model)*
*Architecture Team | Sentrais Corporation*
*SENTRAIS CORPORATION | N8N WORKFLOW ARCHITECTURE | sentrais.com*