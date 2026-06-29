# NFLIT360 Build 8.3.1 - What to Expect: Role Quick Reference

## At-a-Glance: Every Role, Every Phase

---

## IT EXECUTIVE

### What You'll Experience

| Time | Dashboard Shows | Your Focus | Action Required |
|------|-----------------|------------|-----------------|
| **Weekly** | All upcoming games, staffing %, certifications expiring | Verify coverage | Approve any gaps |
| **T-4h** | Compliance countdown starts, all games visible | League-wide readiness | Monitor threshold compliance |
| **T-2h** | All open issues surface to your view | Games at risk | Review escalated issues |
| **T-1h** | Final gate - games must hit 100% | Any game <100% | Approve overrides if needed |
| **T0** | All games active, system status | Nominal operations | Monitor for critical only |
| **T+4h** | Game summaries, issue logs | Performance review | Review reports |

### Key Expectations
- **You see:** League aggregate + drill into any game
- **You don't see:** Individual task details (that's NFL Lead level)
- **You decide:** Emergency overrides, escalation responses
- **Notifications:** CRITICAL issues only (except T-2h visibility window)

---

## NFL LEAD

### What You'll Experience

| Time | Dashboard Shows | Your Focus | Action Required |
|------|-----------------|------------|-----------------|
| **T-7 days** | Assignment, venue status, GDA roster | Confirm staffing | Send reminders, fill gaps |
| **T-6h** | Game opens, GDAs en route | Team readiness | Track arrivals |
| **T-5h (M1)** | EFC starting, dependencies blocked | Gatekeeper progress | Monitor CBRS scan |
| **T-4h (M2)** | 70% threshold, cascade unblocking | Readiness velocity | Resolve blockers |
| **T-3h (M3)** | 90% threshold, issues visible | Issue resolution | Triage, assign resources |
| **T-2h** | Issues visible to IT Exec | Resolution updates | Close issues or escalate |
| **T-1h (M4)** | 100% required | Final tasks | Push completion, request overrides |
| **T0** | Kickoff confirmation | All systems green | Confirm ready |
| **T+3h** | Game winding down | Post-game prep | Begin report |
| **T+4h** | Report due | GMS submission | Complete and submit |

### Key Expectations
- **You see:** Your game only, all systems, all GDAs, all tasks
- **You control:** Playbook edits, issue resolution, GDA management
- **You decide:** Issue priority, resource allocation, escalation timing
- **Notifications:** All game events, threshold warnings, GDA requests

---

## GDA SUPERVISOR

### What You'll Experience

| Time | App Shows | Your Focus | Action Required |
|------|-----------|------------|-----------------|
| **T-6h** | Team roster, locations | Confirm arrivals | Check in GDAs |
| **T-5h** | EFC active, blocked GDAs waiting | Support gatekeepers | Stay near critical systems |
| **T-4h** | Cascade unblocking | Team movement | Redirect resources |
| **T-3h** | Active work across team | Progress tracking | Assist stuck GDAs |
| **T-2h** | Issues requiring attention | Triage | Help resolve or escalate |
| **T-1h** | Final push | Coverage | All hands on deck |
| **T0** | Team status: all green | Confirm | Verify all complete |

### Key Expectations
- **You see:** Your assigned GDAs, their tasks, their status
- **You control:** Field coordination, resource movement
- **You decide:** Where to go, who needs help
- **Notifications:** GDA help requests, issue alerts, NFL Lead messages

---

## GDA FIELD OPERATOR

### What You'll Experience

| Phase | App Shows | Your Focus | Action Required |
|-------|-----------|------------|-----------------|
| **Arrival** | Task list, blocked status | Get to location | Check in |
| **Blocked** | "Waiting for [dependency]" | Prep work | Complete prep tasks |
| **Unblocked** | Tasks now actionable | Execute | Complete tasks in order |
| **Working** | Active task + evidence required | Quality work | Capture evidence |
| **Complete** | All green checkmarks | Confirm | Notify supervisor |
| **Issue** | Problem encountered | Report | Create issue, add details |

### System-Specific Expectations

#### EFC Coordinator (🟠 Gatekeeper)
| Arrival | Work | Impact |
|---------|------|--------|
| T-5h | CBRS spectrum scan | Unblocks C2P + WiFi |
| **You are first.** Others wait for you. Priority: scan accuracy + speed. |

#### IVRS Tech (🔵)
| Arrival | Work | Impact |
|---------|------|--------|
| T-5h | Booth setup, tablets | Gates C2P voice check |
| 4 positions (booths + fields). Each works independently. |

#### C2P Tech (🟠 Blocked)
| Blocked Until | Work | Impact |
|---------------|------|--------|
| EFC complete | Radio programming, coach distribution | Game communication |
| Wait for spectrum clearance, then move fast. |

#### SVS Tech (🟣 Blocked)
| Blocked Until | Work | Impact |
|---------------|------|--------|
| FTR complete | Tablet deployment, sync testing | Sideline video |
| Prep tablets while waiting. Network test unlocks last. |

#### FTR Tech (⚪ Gatekeeper)
| Arrival | Work | Impact |
|---------|------|--------|
| T-5h | Network validation | Unblocks SVS + Hawk-Eye |
| **Critical path.** Your network sign-off releases video systems. |

#### IR_Tech (⚪ Gatekeeper)
| Arrival | Work | Impact |
|---------|------|--------|
| T-5h | Calibration | Unblocks Hawk-Eye |
| Work parallel to FTR. Hawk-Eye needs both. |

#### Hawk-Eye Tech (🏷️ Blocked)
| Blocked Until | Work | Early Advantage |
|---------------|------|-----------------|
| FTR + IR_Tech | Video integration | Arrive T-9h for camera setup |
| Most tasks blocked. Do camera work early, wait for network. |

#### O2O Tech (⚪ Independent)
| Arrival | Work | Impact |
|---------|------|--------|
| T-5h | Official radio setup | Game officiating |
| No dependencies. Work at your own pace. |

#### WiFi Tech (Blocked)
| Blocked Until | Work | Impact |
|---------------|------|--------|
| EFC complete | Stadium WiFi validation | Fan/staff connectivity |
| Wait for spectrum clearance like C2P. |

---

## Evidence Capture Expectations

### What's Required

| Evidence Type | When | How | Stored |
|---------------|------|-----|--------|
| **Photo** | Equipment inventory, setup confirmation | Camera button in app | Immutable ledger |
| **Text Entry** | Serial numbers, test results | Form fields | Task record |
| **Timestamp** | Every task | Auto-captured | Cannot be edited |
| **Location** | Key tasks | GPS auto-capture | Verified |
| **Notes** | Issues, deviations | Text field | Audit trail |

### Quality Standards
- Photos: Clear, shows what's required
- Serial numbers: Exact match to equipment
- Notes: Specific, actionable
- Issues: Detailed enough for remote triage

---

## Issue Reporting Expectations

### Severity Guide

| Severity | Definition | Example | Escalation |
|----------|------------|---------|------------|
| **🟢 LOW** | Minor, can work around | Cosmetic damage | Supervisor sees |
| **🟡 MEDIUM** | Impacts efficiency | Slow network | NFL Lead notified |
| **🟠 HIGH** | Blocks your tasks | Equipment failure | NFL Lead + IT Exec at T-2h |
| **🔴 CRITICAL** | Game at risk | System down | Immediate all-level |

### What Happens When You Report
1. Issue created with your details
2. Supervisor notified immediately
3. NFL Lead sees on dashboard
4. IT Exec sees HIGH+ at T-2h (or immediately for CRITICAL)
5. Updates flow back to you

---

## Notification Expectations

### What You'll Receive

| Role | Push Notifications | Feed Updates | Email |
|------|-------------------|--------------|-------|
| **IT Exec** | CRITICAL only + T-2h issues | All games | Daily summary |
| **NFL Lead** | All game events | Everything | Pre-game, post-game |
| **Supervisor** | GDA requests, issues | Team status | Roster confirmation |
| **GDA** | Your tasks, unblocks | Your status | Assignment |

### Notification Timing

```
T-7 days ─── Assignment notification (all)
T-24h ────── Reminder (GDAs)
T-6h ─────── Game open (all)
T-5h ─────── Milestone M1 (leads+)
T-4h ─────── Threshold alerts (leads+)
T-3h ─────── Threshold alerts (leads+)
T-2h ─────── Issue visibility (exec)
T-1h ─────── Final gate alerts (all)
T-30m ────── Final push (leads+)
T0 ────────── Kickoff confirmation (all)
T+4h ─────── Report reminder (NFL Lead)
```

---

## Success Metrics by Role

| Role | Primary Success Metric | Target |
|------|----------------------|--------|
| **IT Executive** | All games at 100% at kickoff | 100% of games |
| **NFL Lead** | Game readiness + report submitted | 100% + on-time |
| **Supervisor** | Team tasks complete | All GDAs done |
| **EFC** | Spectrum clearance on time | Before T-4h |
| **FTR** | Network validation on time | Before T-3h |
| **All GDAs** | Tasks complete with evidence | 100% + quality |

---

## Common Questions

### "What if I'm blocked and have nothing to do?"
- Complete any non-blocked prep tasks
- Verify equipment condition
- Coordinate with booth/sideline partner
- Check in with supervisor
- The app will notify you when unblocked

### "What if I find a problem?"
- Report issue immediately via app
- Add photo and details
- Continue other tasks if possible
- Supervisor will coordinate help

### "What if I can't complete a task?"
- Try alternative approaches first
- Report issue with details
- Ask supervisor for help
- NFL Lead can authorize skip if needed

### "What if I finish early?"
- Check with supervisor
- Assist nearby GDAs
- Verify all evidence uploaded
- Stay available until kickoff

---

**Version:** 8.3.1  
**Quick Reference Guide**
