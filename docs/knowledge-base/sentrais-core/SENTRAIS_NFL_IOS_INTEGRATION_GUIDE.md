# SENTRAIS + NFL iOS INTEGRATION GUIDE
## Multi-Location Engine 2025 Platform Integration

**Classification**: TECHNICAL INTEGRATION SPECIFICATION  
**Version**: 1.0  
**Date**: November 21, 2025  
**Audience**: Integration Engineers, Mobile Developers, Backend Architects

---

## 🎯 INTEGRATION OVERVIEW

The Multi-Location Engine integrates with two critical platforms:

1. **Sentrais OS Core**: Temporal orchestration framework (NIN 5-phase governance)
2. **NFL iOS Playbook System**: Mobile field operations platform

```
┌─────────────────────────────────────────────────────────────┐
│          MULTI-LOCATION ENGINE 2025                         │
└─────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────────┐       ┌────────────────────────┐
│   SENTRAIS OS CORE    │       │   NFL iOS PLAYBOOK     │
│                       │       │       SYSTEM           │
│ - NIN Phase Tracking  │       │ - Position Assignment  │
│ - State Machine       │       │ - Playbook Loading     │
│ - Temporal Workflow   │       │ - Evidence Capture     │
│ - Dashboard Sync      │       │ - Real-Time Status     │
└───────────────────────┘       └────────────────────────┘
```

**Integration Points**:
- **Sentrais**: Bi-directional REST API + WebSocket for real-time updates
- **NFL iOS**: Webhook notifications + RESTful callbacks

---

## 🔗 PART 1: SENTRAIS OS CORE INTEGRATION

### Architecture Overview

```
Multi-Location Engine                Sentrais OS Core
┌─────────────────┐                 ┌──────────────────┐
│                 │                 │                  │
│ Position        │  NIN Phase      │ NIN State        │
│ Assignment      │  Update         │ Machine          │
│ Created         ├────────────────>│                  │
│                 │                 │ M1: DISCOVER     │
│                 │                 │ M2: DIAGNOSE     │
│ AI Assigns      │  Phase          │ M3: DESIGN       │
│ GDA             │  Transition     │ M4: DEPLOY       │
│                 ├────────────────>│ M5: DEBRIEF      │
│                 │                 │                  │
│ GDA Confirms    │  State          │ Dashboard        │
│ Assignment      │  Update         │ Update           │
│                 ├────────────────>│                  │
│                 │                 │                  │
│ GDA Checks In   │  Real-Time      │ EVERGAME 360     │
│                 │  Sync           │ Executive        │
│                 ├────────────────>│ Dashboard        │
│                 │                 │                  │
└─────────────────┘                 └──────────────────┘
        │                                    │
        │                                    │
        └────────────────────────────────────┘
              WebSocket (5-second updates)
```

### NIN Phase Mapping

#### M1: DISCOVER (Game Day - 10 to Game Day - 7)

**Multi-Location Engine Activities**:
```python
# When game is created in system
async def game_created_handler(game_id: str):
    # 1. Identify position requirements
    positions = await load_playbook_positions(game_id)
    
    # 2. Query available GDAs from UKG
    available_gdas = await ukg_client.get_available_gdas(game_id)
    
    # 3. Pull certification matrix
    certifications = await db.get_certification_matrix()
    
    # 4. Notify Sentrais: entering DISCOVER phase
    await sentrais_client.update_nin_phase(
        game_id=game_id,
        phase="DISCOVER",
        metadata={
            "total_positions": len(positions),
            "available_gdas": len(available_gdas),
            "timestamp": datetime.utcnow()
        }
    )
```

**Sentrais API Call**:
```http
POST https://sentrais.evergame360.com/api/v1/games/{game_id}/nin-phase
Authorization: Bearer {SENTRAIS_API_KEY}
Content-Type: application/json

{
  "phase": "DISCOVER",
  "milestone": "M1",
  "time_offset": "-10_days_to_kickoff",
  "metadata": {
    "total_positions": 320,
    "available_gdas": 238,
    "systems": ["IVRS", "C2C", "C2P", "SVS", "EFC", "FTC"],
    "timestamp": "2025-11-21T14:30:00Z"
  }
}
```

#### M2: DIAGNOSE (Game Day - 7 to Game Day - 5)

**Multi-Location Engine Activities**:
```python
async def run_ai_optimization(game_id: str):
    # 1. AI runs position assignment algorithm
    ai_assignments = await position_optimizer.optimize(game_id)
    
    # 2. Detect potential conflicts
    conflicts = await conflict_detector.analyze(ai_assignments)
    
    # 3. Calculate equity compliance
    equity_score = await equity_analyzer.calculate(ai_assignments)
    
    # 4. Notify Sentrais: entering DIAGNOSE phase
    await sentrais_client.update_nin_phase(
        game_id=game_id,
        phase="DIAGNOSE",
        metadata={
            "ai_confidence_avg": 0.9234,
            "conflicts_detected": len(conflicts),
            "equity_compliant": equity_score.is_compliant,
            "recommended_assignments": len(ai_assignments)
        }
    )
```

**Sentrais API Call**:
```http
POST https://sentrais.evergame360.com/api/v1/games/{game_id}/nin-phase
Authorization: Bearer {SENTRAIS_API_KEY}
Content-Type: application/json

{
  "phase": "DIAGNOSE",
  "milestone": "M2",
  "time_offset": "-7_days_to_kickoff",
  "ai_analysis": {
    "algorithm": "claude-sonnet-4",
    "confidence_avg": 0.9234,
    "recommendations": 320,
    "conflicts_flagged": 0,
    "equity_forecast": "COMPLIANT"
  }
}
```

#### M3: DESIGN (Game Day - 5 to Game Day - 3)

**Multi-Location Engine Activities**:
```python
async def finalize_assignments(game_id: str):
    # 1. Finalize position assignments (auto or manual)
    final_assignments = await assignment_manager.finalize(game_id)
    
    # 2. Send GDA notifications (72-hour notice)
    for assignment in final_assignments:
        await notify_gda(assignment)
        await nfl_ios_client.trigger_playbook_load(assignment)
    
    # 3. Enforce equity requirements
    equity_status = await equity_enforcer.validate(game_id)
    
    # 4. Notify Sentrais: entering DESIGN phase
    await sentrais_client.update_nin_phase(
        game_id=game_id,
        phase="DESIGN",
        metadata={
            "assignments_finalized": len(final_assignments),
            "gda_confirmations_pending": count_pending(final_assignments),
            "equity_certified": equity_status.is_certified
        }
    )
```

**Sentrais API Call**:
```http
POST https://sentrais.evergame360.com/api/v1/games/{game_id}/nin-phase
Authorization: Bearer {SENTRAIS_API_KEY}
Content-Type: application/json

{
  "phase": "DESIGN",
  "milestone": "M3",
  "time_offset": "-5_days_to_kickoff",
  "assignments": {
    "total_finalized": 320,
    "pending_confirmation": 15,
    "equity_certified": true,
    "playbooks_loaded": 305,
    "gda_acceptance_rate": 95.3
  }
}
```

#### M4: DEPLOY (Game Day - 3 hours to Kickoff)

**Multi-Location Engine Activities**:
```python
async def live_operations(game_id: str):
    # 1. Real-time position tracking
    await position_tracker.start_monitoring(game_id)
    
    # 2. Live equity monitoring (5-second refresh)
    await equity_monitor.start_realtime(game_id)
    
    # 3. Conflict prevention (no-show alerts)
    await conflict_monitor.watch_for_noshows(game_id)
    
    # 4. WebSocket sync to Sentrais dashboard
    async for update in position_tracker.stream():
        await sentrais_websocket.send(update)
```

**Sentrais WebSocket**:
```javascript
// Sentrais subscribes to Multi-Location Engine WebSocket
const ws = new WebSocket('wss://multi-location.evergame360.com/ws/realtime/{game_id}');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  // Update types:
  // - POSITION_CHECKED_IN
  // - POSITION_ACTIVATED
  // - EQUITY_STATUS_CHANGED
  // - CONFLICT_DETECTED
  
  sentraisDashboard.updatePositionStatus(update);
};
```

**Real-Time Update Format**:
```json
{
  "type": "POSITION_CHECKED_IN",
  "game_id": "GAME-2025-W12-ATL-NO",
  "position_id": "IVRS_HOME_BOOTH",
  "gda_id": "GDA-0042",
  "timestamp": "2025-11-21T17:30:00Z",
  "nin_phase": "DEPLOY",
  "metadata": {
    "location_verified": true,
    "geofence_match": true,
    "playbook_loaded": true,
    "task_count": 15
  }
}
```

#### M5: DEBRIEF (Post-Game)

**Multi-Location Engine Activities**:
```python
async def post_game_analysis(game_id: str):
    # 1. Calculate position fill rate
    fill_rate = await analytics.calculate_fill_rate(game_id)
    
    # 2. Validate equity compliance
    equity_audit = await equity_analyzer.audit(game_id)
    
    # 3. AI accuracy vs. actual performance
    ai_accuracy = await ai_validator.compare_predictions(game_id)
    
    # 4. Notify Sentrais: entering DEBRIEF phase
    await sentrais_client.update_nin_phase(
        game_id=game_id,
        phase="DEBRIEF",
        metadata={
            "position_fill_rate": fill_rate,
            "equity_violations": equity_audit.violation_count,
            "ai_accuracy": ai_accuracy,
            "lessons_learned": generate_lessons(game_id)
        }
    )
```

**Sentrais API Call**:
```http
POST https://sentrais.evergame360.com/api/v1/games/{game_id}/nin-phase
Authorization: Bearer {SENTRAIS_API_KEY}
Content-Type: application/json

{
  "phase": "DEBRIEF",
  "milestone": "M5",
  "time_offset": "post_game",
  "results": {
    "position_fill_rate": 100.0,
    "equity_violations": 0,
    "ai_confidence_actual_correlation": 0.94,
    "conflicts_resolved": 0,
    "gda_no_shows": 0,
    "lessons_learned": [
      "AI accurately predicted GDA-0042 for IVRS_HOME_BOOTH (confidence 0.95, actual excellent performance)",
      "Zero equity violations throughout game day operations"
    ]
  }
}
```

---

## 📱 PART 2: NFL iOS PLAYBOOK INTEGRATION

### Architecture Overview

```
Multi-Location Engine               NFL iOS App
┌─────────────────┐                ┌──────────────────┐
│                 │                │                  │
│ AI Assigns      │  Webhook       │ Receive          │
│ GDA to Position │  Notification  │ Assignment       │
│                 ├───────────────>│                  │
│                 │                │ Download         │
│                 │                │ Playbook         │
│                 │                │                  │
│                 │  Callback      │ GDA Confirms     │
│ Update Status   │<───────────────┤ Assignment       │
│                 │                │                  │
│                 │  Callback      │ GDA Checks In    │
│ Track Position  │<───────────────┤                  │
│                 │                │                  │
│                 │  Callback      │ Task Completed   │
│ Update Progress │<───────────────┤                  │
│                 │                │                  │
└─────────────────┘                └──────────────────┘
```

### Webhook: Position Assignment Notification

**When**: GDA is assigned to a position (AI auto-assignment or manual selection)

**Multi-Location Engine → NFL iOS**:
```http
POST https://nfl-ios-backend.com/webhooks/position-assigned
Content-Type: application/json
X-Signature: {HMAC-SHA256 signature}

{
  "event": "POSITION_ASSIGNED",
  "event_id": "evt_abc123",
  "timestamp": "2025-11-21T14:30:00Z",
  
  "assignment": {
    "assignment_id": "asn_xyz789",
    "game_id": "GAME-2025-W12-ATL-NO",
    "gda_id": "GDA-0042",
    "position_id": "IVRS_HOME_BOOTH",
    "system_id": "IVRS",
    
    "position_details": {
      "position_name": "IVRS Home Booth",
      "location": "Press Box Level 5, Booth 12",
      "team_affiliation": "HOME",
      "certification_required": "IVRS_CERTIFIED",
      "estimated_duration": "3.5_hours"
    },
    
    "playbook": {
      "file_name": "IVRS_HOME_BOOTH_GDA.json",
      "download_url": "https://playbooks.evergame360.com/v1/IVRS_HOME_BOOTH_GDA.json",
      "version": "2025.1.0",
      "task_count": 15,
      "checksum": "sha256:abc123..."
    },
    
    "metadata": {
      "assigned_at": "2025-11-21T14:30:00Z",
      "assignment_method": "AI_AUTO",
      "ai_confidence": 0.9534,
      "confirmation_deadline": "2025-11-24T14:30:00Z",
      "game_datetime": "2025-12-01T13:00:00Z"
    }
  }
}
```

**NFL iOS Response** (acknowledge receipt):
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "received": true,
  "event_id": "evt_abc123",
  "processed_at": "2025-11-21T14:30:01Z"
}
```

### NFL iOS: Automatic Playbook Loading

**Swift Implementation**:
```swift
// NFL iOS - Webhook Handler
class PositionAssignmentHandler {
    func handleWebhook(_ payload: PositionAssignedPayload) async {
        // Step 1: Validate signature
        guard validateHMAC(payload) else {
            logger.error("Invalid webhook signature")
            return
        }
        
        // Step 2: Download playbook
        let playbookURL = payload.assignment.playbook.downloadUrl
        guard let playbook = await PlaybookService.download(playbookURL) else {
            logger.error("Failed to download playbook")
            return
        }
        
        // Step 3: Inject position metadata into every task
        let enrichedPlaybook = enrichPlaybookWithPosition(
            playbook: playbook,
            position: payload.assignment.positionDetails
        )
        
        // Step 4: Load into GDA's task list
        await TaskManager.shared.loadPlaybook(enrichedPlaybook)
        
        // Step 5: Show notification to GDA
        await NotificationService.show(
            title: "New Position Assignment",
            body: "You've been assigned to \(payload.assignment.positionDetails.positionName). Tap to review."
        )
        
        // Step 6: Callback to Multi-Location Engine
        await confirmPlaybookLoaded(assignmentId: payload.assignment.assignmentId)
    }
    
    func enrichPlaybookWithPosition(
        playbook: Playbook,
        position: PositionDetails
    ) -> Playbook {
        var enriched = playbook
        
        enriched.tasks = playbook.tasks.map { task in
            var enrichedTask = task
            
            // Add position context to every task
            enrichedTask.metadata.assignedPosition = position.positionId
            enrichedTask.metadata.positionLocation = position.location
            enrichedTask.metadata.teamAffiliation = position.teamAffiliation
            enrichedTask.metadata.certificationRequired = position.certificationRequired
            
            return enrichedTask
        }
        
        return enriched
    }
}
```

### Callback: GDA Confirms Assignment

**NFL iOS → Multi-Location Engine**:
```http
POST https://multi-location.evergame360.com/api/v1/assignments/{assignment_id}/confirm
Authorization: Bearer {GDA_JWT_TOKEN}
Content-Type: application/json

{
  "gda_id": "GDA-0042",
  "assignment_id": "asn_xyz789",
  "confirmed_at": "2025-11-21T15:00:00Z",
  "device_info": {
    "device_id": "iPhone-ABC123",
    "app_version": "2025.1.0",
    "os_version": "iOS 17.1"
  }
}
```

**Multi-Location Engine Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "CONFIRMED",
  "assignment_id": "asn_xyz789",
  "position_id": "IVRS_HOME_BOOTH",
  "next_actions": [
    {
      "action": "CHECK_IN",
      "deadline": "2025-12-01T11:30:00Z",
      "description": "Check in at Press Box Level 5, Booth 12 before 11:30 AM on game day"
    }
  ]
}
```

### Callback: GDA Checks In

**NFL iOS → Multi-Location Engine**:
```http
POST https://multi-location.evergame360.com/api/v1/assignments/{assignment_id}/checkin
Authorization: Bearer {GDA_JWT_TOKEN}
Content-Type: application/json

{
  "gda_id": "GDA-0042",
  "assignment_id": "asn_xyz789",
  "checked_in_at": "2025-12-01T11:15:00Z",
  "location": {
    "latitude": 33.7676,
    "longitude": -84.3935,
    "accuracy": 10.0,
    "geofence_match": true
  },
  "device_info": {
    "device_id": "iPhone-ABC123",
    "battery_level": 95,
    "network": "WiFi"
  }
}
```

**Multi-Location Engine Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "CHECKED_IN",
  "assignment_id": "asn_xyz789",
  "playbook_activated": true,
  "tasks_ready": 15,
  "first_task": {
    "task_id": "task_001",
    "title": "Pre-Game Equipment Check",
    "description": "Verify all IVRS cameras and tablets are operational",
    "start_time": "2025-12-01T11:30:00Z"
  }
}
```

### Callback: Task Completed

**NFL iOS → Multi-Location Engine**:
```http
POST https://multi-location.evergame360.com/api/v1/assignments/{assignment_id}/tasks/{task_id}/complete
Authorization: Bearer {GDA_JWT_TOKEN}
Content-Type: application/json

{
  "gda_id": "GDA-0042",
  "assignment_id": "asn_xyz789",
  "task_id": "task_001",
  "completed_at": "2025-12-01T11:45:00Z",
  "evidence": [
    {
      "type": "PHOTO",
      "evidence_id": "evi_abc123",
      "upload_url": "https://evidence.evergame360.com/uploads/evi_abc123.jpg",
      "checksum": "sha256:def456..."
    }
  ]
}
```

**Multi-Location Engine Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "TASK_COMPLETED",
  "task_id": "task_001",
  "next_task": {
    "task_id": "task_002",
    "title": "Connect to IVRS Control System",
    "start_time": "2025-12-01T12:00:00Z"
  },
  "progress": {
    "completed_tasks": 1,
    "total_tasks": 15,
    "completion_percentage": 6.67
  }
}
```

---

## 🔄 REAL-TIME SYNC MECHANISMS

### WebSocket: Live Position Updates

**Multi-Location Engine → EVERGAME 360 Dashboard**:

```javascript
// EVERGAME 360 Dashboard connects to WebSocket
const ws = new WebSocket(
  'wss://multi-location.evergame360.com/ws/positions/{game_id}'
);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  switch (update.type) {
    case 'POSITION_ASSIGNED':
      dashboard.updatePositionCard(update.position_id, {
        status: 'ASSIGNED_PENDING',
        gda_name: update.gda_name,
        assigned_at: update.timestamp
      });
      break;
    
    case 'POSITION_CONFIRMED':
      dashboard.updatePositionCard(update.position_id, {
        status: 'ASSIGNED_CONFIRMED',
        confirmed_at: update.timestamp
      });
      break;
    
    case 'POSITION_CHECKED_IN':
      dashboard.updatePositionCard(update.position_id, {
        status: 'CHECKED_IN',
        location_verified: update.geofence_match,
        checked_in_at: update.timestamp
      });
      break;
    
    case 'TASK_COMPLETED':
      dashboard.updateTaskProgress(update.position_id, {
        completed_tasks: update.completed_tasks,
        total_tasks: update.total_tasks
      });
      break;
    
    case 'EQUITY_UPDATED':
      dashboard.updateEquityStatus({
        is_compliant: update.is_compliant,
        home_count: update.home_count,
        visitor_count: update.visitor_count
      });
      break;
  }
};
```

**Update Frequency**: Every 5 seconds (configurable)

---

## 🔐 SECURITY & AUTHENTICATION

### Webhook Signature Verification

**HMAC-SHA256 Signature**:
```python
import hmac
import hashlib

def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """
    Verify webhook came from Multi-Location Engine
    """
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

**NFL iOS Implementation**:
```swift
func validateWebhookSignature(
    payload: String,
    signature: String,
    secret: String
) -> Bool {
    guard let payloadData = payload.data(using: .utf8),
          let secretData = secret.data(using: .utf8) else {
        return false
    }
    
    var hmac = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
    CCHmac(CCHmacAlgorithm(kCCHmacAlgSHA256),
           secretData.bytes, secretData.count,
           payloadData.bytes, payloadData.count,
           &hmac)
    
    let expectedSignature = Data(hmac).hexString
    return expectedSignature == signature
}
```

### API Authentication

**JWT Tokens for GDA Callbacks**:
```python
from jose import jwt
from datetime import datetime, timedelta

def generate_gda_token(gda_id: str) -> str:
    """
    Generate short-lived JWT for GDA API calls
    """
    payload = {
        "sub": gda_id,
        "role": "GDA",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow()
    }
    
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
```

---

## 📊 ERROR HANDLING

### Webhook Retry Logic

**Multi-Location Engine** implements exponential backoff:

```python
async def send_webhook_with_retry(
    url: str,
    payload: dict,
    max_retries: int = 5
):
    """
    Send webhook with retry on failure
    """
    for attempt in range(max_retries):
        try:
            response = await httpx.AsyncClient().post(url, json=payload)
            
            if response.status_code == 200:
                return True
            
            # Retry on 5xx errors
            if response.status_code >= 500:
                wait_time = 2 ** attempt  # Exponential backoff
                await asyncio.sleep(wait_time)
                continue
            
            # Don't retry on 4xx errors
            return False
        
        except Exception as e:
            logger.error(f"Webhook failed: {e}")
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                await asyncio.sleep(wait_time)
            else:
                # Final attempt failed
                await notify_dead_letter_queue(url, payload)
                return False
```

---

## 🧪 TESTING & VALIDATION

### Integration Test Example

```python
@pytest.mark.asyncio
async def test_full_integration_flow():
    """
    Test complete flow: Assignment → Playbook Load → Check-In → Task Complete
    """
    # Step 1: Create game in Multi-Location Engine
    game = await create_test_game()
    
    # Step 2: AI assigns GDA to position
    assignment = await assign_position(
        game_id=game.id,
        position_id="IVRS_HOME_BOOTH",
        gda_id="GDA-TEST-001"
    )
    
    # Step 3: Verify Sentrais received NIN phase update
    sentrais_phase = await sentrais_client.get_nin_phase(game.id)
    assert sentrais_phase.phase == "DESIGN"
    
    # Step 4: Simulate NFL iOS receiving webhook
    webhook_payload = {
        "event": "POSITION_ASSIGNED",
        "assignment": assignment
    }
    nfl_ios_response = await simulate_nfl_ios_webhook(webhook_payload)
    assert nfl_ios_response.status_code == 200
    
    # Step 5: Simulate GDA confirming assignment
    confirm_response = await multi_location_api.post(
        f"/assignments/{assignment.id}/confirm",
        json={"gda_id": "GDA-TEST-001"}
    )
    assert confirm_response.status_code == 200
    
    # Step 6: Verify EVERGAME 360 dashboard updated
    dashboard_state = await evergame_dashboard.get_position_status(
        assignment.position_id
    )
    assert dashboard_state.status == "ASSIGNED_CONFIRMED"
    
    print("✅ Full integration test passed!")
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue 1: Webhook not received by NFL iOS**
- Check webhook URL configuration
- Verify network connectivity
- Check HMAC signature validation
- Review dead letter queue for failed deliveries

**Issue 2: Sentrais NIN phase not updating**
- Verify SENTRAIS_API_KEY is valid
- Check Sentrais API endpoint is reachable
- Review Multi-Location Engine logs for API errors

**Issue 3: Playbook not loading in NFL iOS app**
- Verify playbook download URL is accessible
- Check playbook file checksum matches
- Ensure GDA has correct permissions
- Review NFL iOS app logs

---

**This integration guide provides the foundation for seamless communication between Multi-Location Engine, Sentrais OS Core, and NFL iOS Playbook System. Follow the specifications exactly to ensure reliable, real-time operations on game day.** 🏈

---

*Sentrais + NFL iOS Integration Guide*  
*Multi-Location Engine 2025*  
*© 2025 NOVATE Labs | CONFIDENTIAL*
