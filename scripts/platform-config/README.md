# Sentrais Platform Configuration Scripts

Automated setup for HubSpot CRM and Monday.com per GTM Playbook v1.0.

## Prerequisites

```bash
pip install requests
```

## Run order (follow exactly — Day 1 through Day 7 per config doc)

### Step 1 — HubSpot (Days 1–3)

```bash
# Dry run first — review all actions before committing
python3 hubspot_config.py --token pat-na2-XXXX --dry-run

# Execute
python3 hubspot_config.py --token pat-na2-XXXX
```

**What it creates:**
- All Contact/Company custom properties (GTM_module, Entry_route, Vertical, Buyer_persona, Register_status, Entity)
- All Deal custom properties (Gate_stage, Hard_block_flag, NIN_phase, Doctrine_mode, Advisor_class, Claims_confirmed, Monday_board_ID, Revenue_type, FedRAMP_status, Delivery_status, Intercompany)
- Claims Register custom object + all 15 seed rows (status = Open)
- All 6 deal pipelines (A–F) with correct stage names
- 10 workflow shells (DISABLED — configure actions in HubSpot UI per Appendix B)

**After running — manual steps in HubSpot UI:**
1. Assign teams to each pipeline (5 teams: Academy/Corp, SRI Partnerships, Federal BD, NovateUS Programs, Ventures/NCICC)
2. Enable each workflow and configure triggers/actions per Appendix B of the config doc
3. Connect Gmail/Outlook inboxes per team; disable sequences on Federal BD and NovateUS inboxes
4. Set up Business Units (Marketing Hub Enterprise) for SRI/Corp separation

---

### Step 2 — Monday.com (Days 4–5)

```bash
# Dry run first
python3 monday_config.py --token eyJhbGci... --dry-run

# Execute
python3 monday_config.py --token eyJhbGci...
```

**What it creates:**
- 4 workspaces: Sentrais Corp, SRI, NOVATELabs.org, Sentrais Ventures
- All boards per workspace with full column schemas
- All 11 FIFA host city node detail boards (6 groups each, gate items, integration feed items)
- SEAR 2026 Master Tracker (11 city items, all columns)
- NCICC Federation Status board (NC-G0 through NC-G6 items)
- SEAR Event Calendar (FIFA 2026 + LA 2028 placeholder)
- Playbook Change Control board with groups

**After running — manual steps in Monday UI:**
1. Set workspace access: NOVATELabs.org → research team only; Sentrais Ventures → leadership + legal only
2. Configure Automation 10: SEAR hard-block propagation (#federal-ncicc Slack alert)
3. Configure Automation 11: NC-G3 SIPE alert (SecOps + founder immediate alert)
4. Configure Automation 12: Exercise risk warning (30 days before exercise date, if feeds pending)
5. Configure Automation 14: NovateUS inurement guard (block Sentrais Corp member addition)
6. Connect HubSpot ↔ Monday via Monday marketplace (install HubSpot CRM app, configure 5 sync pairs)
7. Set formula on SEAR Master Tracker: `Days to T-0 = DATIF(TODAY(), DATE(2026,6,11), "D")`

---

## Automation rules reference (Appendix B)

| # | Name | Platform | Configure in |
|---|------|----------|--------------|
| 1 | Claims gate — block Propose | HubSpot | Workflow 1 (UI) |
| 2 | Pipeline F federal entry guard | HubSpot | Workflow 2 (UI) |
| 3 | Research contact — no sequences | HubSpot | Workflow 3 (UI) |
| 4 | Inbound lead routing | HubSpot | Workflow 4 (UI) |
| 5 | Blueprint360 POC conversion | HubSpot + Monday | Workflow 5 (UI) |
| 6 | SRI intercompany alert | HubSpot | Workflow 6 (UI) |
| 7 | Gate hard-block alerts | Both | Workflow 7 + Monday Automation |
| 8 | Claims confirmed — clear gate | HubSpot | Workflow 8 (UI) |
| 9 | GTM version alignment reset | HubSpot | Workflow 9 (UI) |
| 10 | SEAR hard-block propagation | Monday | Manual (Monday UI) |
| 11 | NC-G3 SIPE alert | Monday | Manual (Monday UI) |
| 12 | Exercise risk warning (T-30) | Monday | Manual (Monday UI) |
| 13 | Claims age alert (90-day) | HubSpot | Workflow 10 (UI) |
| 14 | NovateUS inurement guard | Monday | Manual (Monday UI) |

---

## Token requirements

**HubSpot Private App** — required scopes:
- `crm.objects.contacts.write`
- `crm.objects.companies.write`
- `crm.objects.deals.write`
- `crm.schemas.contacts.write`
- `crm.schemas.deals.write`
- `crm.schemas.custom.write`
- `automation`

**Monday.com** — API token with `me:write` scope (account-level token from Profile → Developers)
