# Sentrais Platform Configuration — Manual Handoff

GTM Playbook v1.0 · All six vertical modules · Four-entity structure  
**Prepared after automated configuration scripts have been run.**

---

## How to use this document

Everything automated by the scripts is marked ✅ DONE. Everything below requires human configuration in the relevant UI. Work through each section in order — later steps depend on earlier ones.

---

## Part 1 — HubSpot CRM

### 1.1 Teams — create before assigning pipelines

Go to: **Settings → Users & Teams → Teams → Create team**

Create these five teams exactly as named:

| Team name | Pipelines they own | Inboxes |
|---|---|---|
| Academy/Corp | Pipeline A (League), Pipeline B (Venue) | sales@sentrais.com |
| SRI Partnerships | Pipeline B (SRI curriculum side) | partnerships@sentrais.com |
| Federal BD | Pipeline C (Gov/EM), Pipeline E (AeroGrid) | gov@sentrais.com, aviation@sentrais.com |
| NovateUS Programs | Pipeline D (Academic/CampusGrid) | research@novatelabs.org, campus@novatelabs.org |
| Ventures/NCICC | Pipeline F (Federal Apex) | ventures@sentrais.com (group alias) |

### 1.2 Assign teams to pipelines

Go to: **CRM → Deals → Settings → Pipelines**

For each pipeline, click the pipeline name → Settings → assign the owning team:

| Pipeline | Owning team |
|---|---|
| Pipeline A — League/Sports | Academy/Corp |
| Pipeline B — Venue/Facility | Academy/Corp + SRI Partnerships |
| Pipeline C — Gov/EM | Federal BD |
| Pipeline D — Academic/CampusGrid | NovateUS Programs |
| Pipeline E — Aviation/AeroGrid | Federal BD |
| Pipeline F — NCICC/Federal Apex | Ventures/NCICC |

### 1.3 Connect email inboxes

Go to: **Settings → General → Email → Connect inbox**

Connect each inbox to the corresponding team. Then for **Federal BD**, **NovateUS Programs**, and **Ventures/NCICC** inboxes:
- Settings → Sequences → disable "Allow sequences to send from connected inboxes" at the team level
- This prevents any automated sequence from touching research/federal contacts

Inboxes to connect:

| Inbox | Team | Sequences enabled? |
|---|---|---|
| sales@sentrais.com | Academy/Corp | Yes |
| partnerships@sentrais.com | SRI Partnerships | Yes |
| pocs@sentrais.com | Academy/Corp | Yes |
| aviation@sentrais.com | Federal BD | Yes |
| gov@sentrais.com | Federal BD | Yes |
| research@novatelabs.org | NovateUS Programs | **NO** |
| campus@novatelabs.org | NovateUS Programs | **NO** |
| ventures@sentrais.com | Ventures/NCICC | **NO** |

### 1.4 Configure workflow triggers and actions

Go to: **Automation → Workflows**

All 10 workflows are already created. Configure triggers and actions as follows:

---

**Workflow 1 — Claims gate: block Propose stage** *(DISABLED — enable after configuring)*

- **Trigger:** Deal stage is changed to `Propose`
- **Condition:** `Claims_confirmed` is `false`
- **Actions:**
  1. Set deal stage back to previous stage (use "Set property" → `dealstage`)
  2. Send internal email to deal owner: *"Claims Register has unconfirmed rows. Deal cannot advance to Propose until §3 claims are Confirmed."*
  3. Create task for deal owner: *"Review Claims Register — §3 gate blocked"*

---

**Workflow 2 — Pipeline F federal entry route guard** *(ENABLED)*

- **Trigger:** Deal is created or updated in Pipeline F
- **Condition:** Associated contact's `Entry_route` is `Sentrais`
- **Actions:**
  1. Send internal notification to founder (set notification recipient manually)
  2. Create task: *"DOCTRINE VIOLATION — Federal contact routed as commercial. Review immediately."*
  3. Add internal note to deal: *"Federal contact assigned commercial entry route — doctrine violation."*

---

**Workflow 3 — Research contact: suppress all sequences** *(ENABLED — property actions already set)*

- **Trigger:** Contact is created or updated
- **Condition (branch 1):** `Entry_route` is `NOVATELabs`
- **Condition (branch 2):** `GTM_module` is `D` or `F`
- **Actions already set:** `Sequence_suppressed = true`, `hs_email_optout = true`
- **Add:** Enroll in suppression list "Sentrais — Research contacts (suppress sequences)"
- **Add:** Send internal alert to pipeline owner: *"Research contact added — sequences permanently suppressed."*

---

**Workflow 4 — Inbound lead routing by GTM module** *(ENABLED)*

- **Trigger:** Contact is created via form, import, or API
- **Branch logic (if/then branches):**

| If `Vertical` equals | Then |
|---|---|
| `Aviation` | Assign to Pipeline E, Team = Federal BD |
| `Academic` | Assign to Pipeline D, set `Entry_route = NOVATELabs`, Team = NovateUS Programs |
| `GovEM` or `Federal` | Assign to Pipeline C, Team = Federal BD |
| `GTM_module = F` | Assign to Pipeline F, send founder alert |
| Default | Assign to Pipeline A, Team = Academy/Corp |

---

**Workflow 5 — Blueprint360 POC conversion** *(DISABLED — enable when Blueprint360 POCs are active)*

- **Trigger:** Deal stage changes to `Validate / POC`
- **Condition:** `Entry_route` is `Blueprint360`
- **Actions:**
  1. Create linked deal record in same pipeline (use "Create record" action)
  2. Set `Entry_route = Blueprint360` on new deal
  3. Send task to deal owner: *"Blueprint360 POC active — create Monday board item"*
  4. On POC close (Converted): promote deal to next stage
  5. On POC close (No conversion): set deal to Closed Lost, reason = *"Blueprint360 — no conversion"*

---

**Workflow 6 — SRI intercompany alert** *(ENABLED — Intercompany property action already set)*

- **Trigger:** Deal in Pipeline B moves to `Close` (Closed/Won)
- **Actions already set:** `Intercompany = true`
- **Add:** Send Slack notification to #sentrais-commercial (connect Slack in Settings first)
- **Add:** Create task for Finance: *"NetSuite intercompany entry required — Pipeline B closed"*

---

**Workflow 7 — Hard block gate alerts** *(ENABLED)*

- **Trigger:** Deal property `Hard_block_flag` is changed to `true`
- **Actions:**
  1. Send internal email to `Delivery Lead` (deal owner) and `Advisor_class` contact
  2. Create task: *"HARD BLOCK active — gate cannot advance. Resolve before proceeding."*
  3. Set deal `Gate_stage` property to add "-BLOCKED" suffix (or use a status flag)

---

**Workflow 8 — Claims confirmed: auto-clear Propose gate** *(ENABLED)*

- **Trigger:** Associated Claims Register object's `Status` changes to `Confirmed`
- **Condition:** Deal is currently in `Propose` stage or blocked by Workflow 1
- **Actions:**
  1. Re-calculate `Claims_confirmed` on all associated deal records
  2. If all Claims Register rows = Confirmed: set `Claims_confirmed = true`
  3. Send task to deal owner: *"Claims Register updated — verify §3 gate is cleared"*

*Note: Association-based triggers require Operations Hub. If not available, set this as a manual task.*

---

**Workflow 9 — GTM version alignment reset** *(DISABLED — trigger manually when playbook updates)*

- **Trigger:** Manual enrollment (triggered by founder when GTM version bumps)
- **Enrollment list:** All active contacts with team member roles
- **Actions already set:** `GTM_alignment_status = PendingReview`
- **Add:** Send email to all enrolled contacts: *"GTM Playbook has been updated. Review and confirm alignment before next buyer conversation."*

---

**Workflow 10 — Claims age alert (90-day re-verify)** *(ENABLED)*

- **Trigger:** Daily, based on date property
- **Condition:** Claims Register `Last_verified` date is more than 90 days ago AND `Status = Confirmed`
- **Actions:**
  1. Send internal alert to pipeline owner: *"Confirmed claim requires re-verification — last verified >90 days ago"*
  2. Create task: *"Re-verify Claims Register row"*

---

### 1.5 Business Units (requires Marketing Hub Enterprise)

Go to: **Settings → Business Units → Create Business Unit**

Create two units:
- `Sentrais Corp` — commercial marketing communications
- `SRI` — IP and curriculum communications

Assign marketing email templates, landing pages, and forms to the correct business unit. This keeps SRI communications separate from Sentrais Corp in all reporting.

### 1.6 Claims Register — associate with deal records

Go to: **CRM → Deals** → open each deal → scroll to "Associated Objects" → associate relevant Claims Register rows.

The `Claims_confirmed` deal property auto-calculates once rows are associated. Do this for every active deal before enabling Workflow 1.

---

## Part 2 — Monday.com

### 2.1 Workspace access restrictions

**NOVATELabs.org — Research & Program Converge workspace:**
- Go to: Workspace settings → Members → set to "Invite only"
- Remove any Sentrais Corp team members
- Permitted members: research leads, NovateUS Programs team, legal counsel only

**Sentrais Ventures — Federal PPP & NCICC workspace:**
- Go to: Workspace settings → Members → set to "Invite only"
- Permitted members: founder, legal counsel, NCICC Coordinator only

### 2.2 Manual automations to configure

Go to each board → **Automations tab → + Add automation**

---

**Automation 10 — SEAR hard-block propagation**  
Board: `SEAR 2026 Master Tracker` (Sentrais Ventures workspace)

```
When Hard Block Flag changes to any value that is not "None"
→ Notify NCICC Coordinator (person column)
→ Post to Slack channel #federal-ncicc: "HARD BLOCK on [City node] — gate advancement blocked"
→ Create item in NCICC Federation Status board: "[City] hard block — NC-G1 at risk"
```

---

**Automation 11 — NC-G3 SIPE alert**  
Board: `NCICC Federation Status` (Sentrais Ventures workspace)

```
When Status of NC-G3 item changes to "Hard block"
→ Immediately notify: SecOps lead + founder + NCICC Coordinator
→ Post to Slack #federal-ncicc: "CRITICAL — SIPE feed detected. NC-G3 blocked. All node feeds must be validated."
→ Create high-priority task assigned to SecOps lead
```

*Note: SIPE detection itself is a platform-level security check — this automation fires when someone manually flags NC-G3 as hard-blocked after detection.*

---

**Automation 12 — Exercise risk warning (T-30)**  
Board: Each of the 11 City Node Detail boards

```
When Exercise Date is 30 days from today
AND any item in "Integration Feeds" group has Status = "In progress" or "Not started"
→ Notify Delivery Lead: "Exercise at risk — G2 integration feeds not fully cleared. Resolve before exercise date."
→ Create task: "Verify all G2 integration feeds are Live & tested"
```

*Apply this automation to all 11 city boards individually.*

---

**Automation 14 — NovateUS inurement guard**  
Board: Any board in NOVATELabs.org workspace

```
When a new member is added to this workspace
→ If member belongs to Sentrais Corp team: block addition, notify workspace admin
→ Log: "Inurement guard triggered — Sentrais Corp member blocked from NovateUS workspace"
```

*Monday.com does not have a native "block member" automation — implement this as: notify admin immediately, admin manually removes the member. Document this as a compliance alert, not a hard technical block.*

### 2.3 SEAR Master Tracker formula

Board: `SEAR 2026 Master Tracker` → `Days to T-0` column

Click the column → Edit → set formula:
```
DATIF(TODAY(), DATE(2026,6,11), "D")
```

Display this on the board header as a dashboard widget.

### 2.4 HubSpot ↔ Monday integration

Go to: Monday.com marketplace → search **"HubSpot CRM"** → Install

Configure these 5 sync pairs after installing:

| Monday board | HubSpot trigger | Direction | Key fields |
|---|---|---|---|
| Active Deployments | Deal Closed/Won (Pipelines A–C, E) | HubSpot → Monday | Deal name, owner, gate stage, NIN phase |
| Blueprint360 POC Tracker | Deal reaches Validate/POC stage | Both ways | Contact ID, entry route, conversion status |
| Program Converge Engagements | Pipeline D contact created | Monday-led | Contact ID only (no commercial deal stages) |
| NCICC Partnership Tracker | Pipeline F contact updated | Monday-led | Contact ID, Register_status |
| Active Deployments (return) | Monday NIN phase → D5 Debrief | Monday → HubSpot | Set Delivery_status = Debrief |

### 2.5 Playbook Change Control board — approval workflow

Board: `Playbook Change Control` (SRI workspace)

Go to: Board → **Automations → Approval workflow**

Set up:
- Item type `Core section change` (§1/§3/§4): requires 3-step approval — Author → Reviewer → Founder
- Item type `Module GTM update`: requires 1-step review, no founder sign-off
- When approved: notify all pipeline owners to re-confirm GTM alignment
- When founder approves: bump version number in item name, trigger Workflow 9 in HubSpot

---

## Part 3 — Google Workspace / Email

### 3.1 Create Ventures group alias

In Google Workspace Admin (`admin.google.com`):

1. **Groups → Create group**
   - Name: `Sentrais Ventures`
   - Email: `ventures@sentrais.com`
   - Access: Private (invite only)
2. Add members: founder + legal counsel only
3. Enable "Allow members to post from group address" so outbound shows `ventures@sentrais.com`

### 3.2 Create remaining inboxes

If not already done, create these in Google Workspace:

| Email | Type | Notes |
|---|---|---|
| pocs@sentrais.com | Individual or alias | Blueprint360 POC contacts |
| aviation@sentrais.com | Individual or alias | Module E / AeroGrid BD |
| gov@sentrais.com | Individual or alias | Module C Gov/EM |
| research@novatelabs.org | Individual | NOVATELabs.org domain required |
| campus@novatelabs.org | Individual | NOVATELabs.org domain required |

*`novatelabs.org` must be added as a secondary domain in Google Workspace Admin → Domains → Add domain.*

---

## Part 4 — Governance (Day 7)

### 4.1 Team alignment confirmations (§III requirement)

Before any buyer conversations begin:

1. Distribute GTM Playbook v1.0 to all team members and advisors
2. Each person logs alignment confirmation in HubSpot (set `GTM_alignment_status = Aligned` on their contact record)
3. Track on Monday `Playbook Change Control` board → "Team alignment confirmations" group — one item per person, status = Confirmed when done

### 4.2 Brief all teams on entry route rules

Hold a single 30-minute session covering:
- Why NOVATELabs.org contacts must never receive commercial sequences
- What to do if a federal contact is accidentally entered as Sentrais (commercial) — Workflow 2 fires, founder reviews
- Claims Register — no one references a claim below Confirmed status externally, ever

### 4.3 NCICC doctrine activation

On the `NCICC Federation Status` board (Sentrais Ventures workspace):
- Set NC-G0 item status to **"In progress"**
- Assign NCICC Coordinator as owner
- Set SEAR Event Calendar items to reflect current FIFA 2026 match schedule

### 4.4 Activate platform for buyer conversations

Once all above is complete:
- Enable Workflow 1 (Claims gate) in HubSpot — this is the final gate before going live
- Confirm all Claims Register rows have evidence links (even if status = Open — links should be populated as evidence is gathered)
- Set all 11 city nodes on SEAR 2026 Master Tracker to **G0 / AV-G0** (script already seeded these)

---

## Summary checklist

### HubSpot
- [ ] Create 5 user teams
- [ ] Assign teams to 6 pipelines
- [ ] Connect 8 email inboxes; disable sequences on 3 research/federal inboxes
- [ ] Configure Workflow 1 triggers and actions (Claims gate — enable last)
- [ ] Configure Workflow 2 notification recipient (founder email)
- [ ] Configure Workflow 3 list enrollment + internal alert
- [ ] Configure Workflow 4 branch logic (lead routing)
- [ ] Configure Workflow 5 linked deal creation (enable when Blueprint360 active)
- [ ] Configure Workflow 6 Slack notification + NetSuite task
- [ ] Configure Workflow 7 notification recipients (delivery lead + advisor)
- [ ] Configure Workflow 8 association-based trigger (requires Ops Hub)
- [ ] Configure Workflow 9 enrollment list (team members only)
- [ ] Configure Workflow 10 date-based trigger
- [ ] Set up Business Units for SRI/Corp separation (Marketing Hub Enterprise)
- [ ] Associate Claims Register rows with active deal records
- [ ] Enable Workflow 1 — platform is now live for buyer conversations

### Monday.com
- [ ] Restrict NOVATELabs.org workspace access (research team only)
- [ ] Restrict Sentrais Ventures workspace access (leadership + legal only)
- [ ] Configure Automation 10 (SEAR hard-block propagation + Slack)
- [ ] Configure Automation 11 (NC-G3 SIPE alert)
- [ ] Configure Automation 12 on all 11 city node boards (exercise risk warning)
- [ ] Configure Automation 14 (NovateUS inurement guard — alert-based)
- [ ] Install HubSpot CRM app from marketplace + configure 5 sync pairs
- [ ] Set Days to T-0 formula on SEAR Master Tracker
- [ ] Set up Playbook Change Control approval workflow (3-step for §1/§3/§4)

### Google Workspace / Email
- [ ] Add novatelabs.org as secondary domain
- [ ] Create research@novatelabs.org and campus@novatelabs.org inboxes
- [ ] Create ventures@sentrais.com group alias (founder + legal only)
- [ ] Create pocs@sentrais.com, aviation@sentrais.com, gov@sentrais.com

### Governance
- [ ] Distribute GTM Playbook v1.0 to all team members and advisors
- [ ] Collect written alignment confirmations (§III)
- [ ] Hold entry route briefing (especially federal/NOVATELabs.org rules)
- [ ] Set NC-G0 to "In progress" on NCICC Federation Status board
- [ ] Enable Workflow 1 — platform live
