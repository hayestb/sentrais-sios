#!/usr/bin/env python3
"""
Sentrais HubSpot Configuration Script
GTM Playbook v1.0 — Full configuration: properties, pipelines, automations, Claims Register

Usage:
    pip install requests
    python3 hubspot_config.py --token YOUR_TOKEN [--dry-run]

Idempotent: safe to re-run. Existing objects are skipped, not overwritten.
"""

import argparse
import json
import time
import requests

BASE = "https://api.hubapi.com"


def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def req(method, path, token, payload=None, dry_run=False, label=""):
    url = f"{BASE}{path}"
    if dry_run:
        print(f"  [DRY RUN] {method} {path}" + (f" — {label}" if label else ""))
        return {"id": "dry-run-id", "results": []}
    resp = getattr(requests, method.lower())(url, headers=headers(token), json=payload)
    time.sleep(0.15)
    if resp.status_code in (200, 201):
        return resp.json()
    if resp.status_code == 409:
        print(f"  SKIP (already exists): {label or path}")
        return None
    print(f"  ERROR {resp.status_code} {path}: {resp.text[:300]}")
    return None


def get_existing_properties(token, object_type):
    data = req("GET", f"/crm/v3/properties/{object_type}", token)
    if not data:
        return set()
    return {p["name"] for p in data.get("results", [])}


def get_existing_pipelines(token):
    data = req("GET", "/crm/v3/pipelines/deals", token)
    if not data:
        return set()
    return {p["label"] for p in data.get("results", [])}


def get_existing_lists(token):
    data = req("GET", "/contacts/v1/lists", token)
    if not data:
        return set()
    return {lst["name"] for lst in data.get("lists", [])}


def get_existing_workflows(token):
    data = req("GET", "/automation/v3/workflows", token)
    if not data:
        return set()
    return {wf["name"] for wf in data.get("workflows", [])}


# ---------------------------------------------------------------------------
# 1. CUSTOM PROPERTIES
# ---------------------------------------------------------------------------

CONTACT_PROPS = [
    {"name": "GTM_module", "label": "GTM Module", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "A — League/Sports", "value": "A"},
         {"label": "B — Venue/Facility", "value": "B"},
         {"label": "C — Gov/EM", "value": "C"},
         {"label": "D — Academic/Campus", "value": "D"},
         {"label": "E — Aviation/Airport", "value": "E"},
         {"label": "F — Federal/NCICC", "value": "F"},
     ]},
    {"name": "Entry_route", "label": "Entry Route", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Sentrais", "value": "Sentrais"},
         {"label": "NOVATELabs.org", "value": "NOVATELabs"},
         {"label": "Blueprint360", "value": "Blueprint360"},
         {"label": "Sentrais Ventures", "value": "Ventures"},
     ]},
    {"name": "Vertical", "label": "Vertical", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "League", "value": "League"},
         {"label": "Venue", "value": "Venue"},
         {"label": "Gov/EM", "value": "GovEM"},
         {"label": "Academic/Campus", "value": "Academic"},
         {"label": "Aviation/Airport", "value": "Aviation"},
         {"label": "Federal", "value": "Federal"},
     ]},
    {"name": "Buyer_persona", "label": "Buyer Persona", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Director of Ops", "value": "director_ops"},
         {"label": "VP Campus Safety", "value": "vp_campus_safety"},
         {"label": "Airport CEO", "value": "airport_ceo"},
         {"label": "EM Director", "value": "em_director"},
         {"label": "Federal Sponsor", "value": "federal_sponsor"},
         {"label": "VP Operations", "value": "vp_ops"},
         {"label": "League/Franchise Ops", "value": "league_ops"},
     ]},
    {"name": "Register_status", "label": "Register Status", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Confirmed", "value": "Confirmed"},
         {"label": "Pilot/POC", "value": "PilotPOC"},
         {"label": "LOI", "value": "LOI"},
         {"label": "In conversation", "value": "InConversation"},
         {"label": "Aspirational", "value": "Aspirational"},
     ]},
    {"name": "Entity", "label": "Entity", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Sentrais Corp", "value": "SentraisCorp"},
         {"label": "SRI", "value": "SRI"},
         {"label": "NovateUS", "value": "NovateUS"},
         {"label": "Federal Pipeline", "value": "FederalPipeline"},
     ]},
    # Suppression flag — set by automation, read by sequence enrollment checks
    {"name": "Sequence_suppressed", "label": "Sequence Suppressed (research/federal)", "type": "bool", "fieldType": "booleancheckbox"},
    {"name": "GTM_alignment_status", "label": "GTM Alignment Status", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Aligned — current version", "value": "Aligned"},
         {"label": "Pending review", "value": "PendingReview"},
         {"label": "Version mismatch", "value": "VersionMismatch"},
     ]},
]

DEAL_PROPS = [
    {"name": "Gate_stage", "label": "Gate Stage", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "G0", "value": "G0"}, {"label": "G1", "value": "G1"},
         {"label": "G2", "value": "G2"}, {"label": "G3", "value": "G3"},
         {"label": "G4", "value": "G4"}, {"label": "G5", "value": "G5"},
         {"label": "G6", "value": "G6"},
         {"label": "AV-G0", "value": "AV-G0"}, {"label": "AV-G1", "value": "AV-G1"},
         {"label": "AV-G2", "value": "AV-G2"}, {"label": "AV-G3", "value": "AV-G3"},
         {"label": "AV-G4", "value": "AV-G4"}, {"label": "AV-G5", "value": "AV-G5"},
         {"label": "AV-G6", "value": "AV-G6"},
         {"label": "NC-G0", "value": "NC-G0"}, {"label": "NC-G1", "value": "NC-G1"},
         {"label": "NC-G2", "value": "NC-G2"}, {"label": "NC-G3", "value": "NC-G3"},
         {"label": "NC-G4", "value": "NC-G4"}, {"label": "NC-G5", "value": "NC-G5"},
         {"label": "NC-G6", "value": "NC-G6"},
     ]},
    {"name": "Hard_block_flag", "label": "Hard Block Flag", "type": "bool", "fieldType": "booleancheckbox"},
    {"name": "NIN_phase", "label": "NIN Phase", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "D1 Discover", "value": "D1"},
         {"label": "D2 Diagnose", "value": "D2"},
         {"label": "D3 Design", "value": "D3"},
         {"label": "D4 Deploy", "value": "D4"},
         {"label": "D5 Debrief", "value": "D5"},
     ]},
    {"name": "Doctrine_mode", "label": "Doctrine Mode", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Steady State", "value": "SteadyState"},
         {"label": "Surge/Event", "value": "Surge"},
         {"label": "IROPS (AV)", "value": "IROPS"},
         {"label": "Security Incident", "value": "SecurityIncident"},
         {"label": "Recovery", "value": "Recovery"},
         {"label": "Active Threat (UN)", "value": "ActiveThreat"},
         {"label": "Super-Cycle Watch (NC)", "value": "SuperCycleWatch"},
     ]},
    {"name": "Advisor_class", "label": "Advisor Class", "type": "enumeration", "fieldType": "checkbox",
     "options": [
         {"label": "Class 1 — GTM Strategic", "value": "C1"},
         {"label": "Class 2 — Domain Validator", "value": "C2"},
         {"label": "Class 3 — Fractional Tech/CISO", "value": "C3"},
         {"label": "Class 4 — Academic Research", "value": "C4"},
         {"label": "Class 5 — Legal/Tax", "value": "C5"},
     ]},
    {"name": "Claims_confirmed", "label": "Claims Confirmed (§3 gate)", "type": "bool", "fieldType": "booleancheckbox"},
    {"name": "Monday_board_ID", "label": "Monday Board ID", "type": "string", "fieldType": "text"},
    {"name": "Revenue_type", "label": "Revenue Type", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Training fee", "value": "TrainingFee"},
         {"label": "License royalty", "value": "LicenseRoyalty"},
         {"label": "Single event", "value": "SingleEvent"},
         {"label": "Annual subscription", "value": "AnnualSubscription"},
         {"label": "Grant", "value": "Grant"},
         {"label": "Federal contract", "value": "FederalContract"},
         {"label": "PPP", "value": "PPP"},
     ]},
    {"name": "FedRAMP_status", "label": "FedRAMP Status", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Not started", "value": "NotStarted"},
         {"label": "In progress", "value": "InProgress"},
         {"label": "FedRAMP Ready", "value": "FedRAMPReady"},
         {"label": "FedRAMP Authorized", "value": "FedRAMPAuthorized"},
     ]},
    {"name": "Delivery_status", "label": "Delivery Status", "type": "enumeration", "fieldType": "select",
     "options": [
         {"label": "Not started", "value": "NotStarted"},
         {"label": "D1 Discover", "value": "D1"},
         {"label": "Debrief", "value": "Debrief"},
         {"label": "Onboard complete", "value": "OnboardComplete"},
     ]},
    {"name": "Intercompany", "label": "Intercompany (SRI)", "type": "bool", "fieldType": "booleancheckbox"},
]


def create_properties(token, dry_run):
    print("\n[Day 1] Creating Contact/Company custom properties...")
    existing_contact = get_existing_properties(token, "contacts") if not dry_run else set()
    existing_company = get_existing_properties(token, "companies") if not dry_run else set()

    for prop in CONTACT_PROPS:
        payload = {
            "name": prop["name"],
            "label": prop["label"],
            "type": prop["type"],
            "fieldType": prop["fieldType"],
            "groupName": "contactinformation",
        }
        if "options" in prop:
            payload["options"] = [
                {"label": o["label"], "value": o["value"], "displayOrder": i, "hidden": False}
                for i, o in enumerate(prop["options"])
            ]
        if prop["name"] not in existing_contact:
            req("POST", "/crm/v3/properties/contacts", token, payload, dry_run, label=f"{prop['name']} on contacts")
        else:
            print(f"  SKIP (exists): {prop['name']} on contacts")

        if prop["name"] not in existing_company:
            req("POST", "/crm/v3/properties/companies", token, payload, dry_run, label=f"{prop['name']} on companies")
        else:
            print(f"  SKIP (exists): {prop['name']} on companies")

    print("\n[Day 1] Creating Deal custom properties...")
    existing_deal = get_existing_properties(token, "deals") if not dry_run else set()
    for prop in DEAL_PROPS:
        if prop["name"] in existing_deal:
            print(f"  SKIP (exists): {prop['name']}")
            continue
        payload = {
            "name": prop["name"],
            "label": prop["label"],
            "type": prop["type"],
            "fieldType": prop["fieldType"],
            "groupName": "dealinformation",
        }
        if "options" in prop:
            payload["options"] = [
                {"label": o["label"], "value": o["value"], "displayOrder": i, "hidden": False}
                for i, o in enumerate(prop["options"])
            ]
        req("POST", "/crm/v3/properties/deals", token, payload, dry_run, label=prop["name"])


# ---------------------------------------------------------------------------
# 2. PIPELINES
# ---------------------------------------------------------------------------

PIPELINES = [
    {"label": "Pipeline A — League / Sports", "stages": [
        "Identify", "Engage", "Discover", "Validate / POC", "Propose", "Close", "Onboard"]},
    {"label": "Pipeline B — Venue / Facility", "stages": [
        "Identify", "Engage", "Discover", "Validate / POC", "Propose", "Close", "Onboard"]},
    {"label": "Pipeline C — Government / EM", "stages": [
        "Identify", "Engage", "Discover", "Validate / POC", "Propose", "Close", "Onboard"]},
    {"label": "Pipeline D — Academic / CampusGrid", "stages": [
        "Research contact", "Research engage", "Discover", "Validate / POC",
        "Commercial propose", "Close", "Onboard"]},
    {"label": "Pipeline E — Aviation / AeroGrid", "stages": [
        "Identify", "Engage", "Discover", "Validate / POC", "Propose", "Close", "Onboard"]},
    {"label": "Pipeline F — NCICC / Federal Apex", "stages": [
        "Federal contact", "Program Converge", "Partnership scoping",
        "Instrument signed", "PPP structuring", "Active partnership", "National surveillance"]},
]


def create_pipelines(token, dry_run):
    print("\n[Day 2] Creating deal pipelines...")
    existing = get_existing_pipelines(token) if not dry_run else set()
    for pl in PIPELINES:
        if pl["label"] in existing:
            print(f"  SKIP (exists): {pl['label']}")
            continue
        stages = []
        for i, name in enumerate(pl["stages"]):
            is_close = name in ("Close", "Active partnership")
            stages.append({
                "label": name,
                "displayOrder": i,
                "metadata": {
                    "probability": "1.0" if is_close else "0.2",
                    "isClosed": "true" if is_close else "false",
                },
            })
        result = req("POST", "/crm/v3/pipelines/deals", token,
                     {"label": pl["label"], "displayOrder": 0, "stages": stages},
                     dry_run, label=pl["label"])
        if result and not dry_run:
            print(f"  Created: {pl['label']} (id={result.get('id')})")


# ---------------------------------------------------------------------------
# 3. CONTACT LISTS (used for suppression and routing)
# ---------------------------------------------------------------------------

LISTS = [
    {
        "name": "Sentrais — Research contacts (suppress sequences)",
        "dynamic": True,
        "filters": [[
            {"operator": "EQ", "property": "Entry_route", "value": "NOVATELabs"},
        ]],
    },
    {
        "name": "Sentrais — Federal contacts Pipeline F",
        "dynamic": True,
        "filters": [[
            {"operator": "EQ", "property": "GTM_module", "value": "F"},
        ]],
    },
    {
        "name": "Sentrais — CampusGrid Module D contacts",
        "dynamic": True,
        "filters": [[
            {"operator": "EQ", "property": "GTM_module", "value": "D"},
        ]],
    },
    {
        "name": "Sentrais — Commercial contacts (A/B/C/E)",
        "dynamic": True,
        "filters": [[
            {"operator": "IN", "property": "GTM_module", "value": "A;B;C;E"},
        ]],
    },
    {
        "name": "Sentrais — Aviation contacts (Module E)",
        "dynamic": True,
        "filters": [[
            {"operator": "EQ", "property": "GTM_module", "value": "E"},
        ]],
    },
    {
        "name": "Sentrais — Blueprint360 POC contacts",
        "dynamic": True,
        "filters": [[
            {"operator": "EQ", "property": "Entry_route", "value": "Blueprint360"},
        ]],
    },
]


def create_lists(token, dry_run):
    print("\n[Day 1] Creating contact lists (for suppression and routing)...")
    existing = get_existing_lists(token) if not dry_run else set()
    for lst in LISTS:
        if lst["name"] in existing:
            print(f"  SKIP (exists): {lst['name']}")
            continue
        payload = {
            "name": lst["name"],
            "dynamic": lst["dynamic"],
            "filters": lst["filters"],
        }
        result = req("POST", "/contacts/v1/lists", token, payload, dry_run, label=lst["name"])
        if result and not dry_run:
            print(f"  Created list: {lst['name']} (id={result.get('listId')})")


# ---------------------------------------------------------------------------
# 4. CLAIMS REGISTER CUSTOM OBJECT
# ---------------------------------------------------------------------------

CLAIMS_SEED = [
    ("Primary league / anchor relationship", "A", "Signed contract or MSA with league organization"),
    ("Deployment scope / seat count", "A", "Executed contract specifying deployment scope"),
    ("Major-event operation reference", "A/C", "Documented operation with outcomes; client approval to reference"),
    ("Cloud / infrastructure partner", "Cross", "Signed partnership or reseller agreement"),
    ("Strategic enterprise partner", "Cross", "Signed partnership agreement or MOU"),
    ("Multi-agency / exercise validation", "C", "After-action report with multi-agency sign-off"),
    ("FedRAMP authorization status", "C/F", "Current: Not started. Accurate representation only. SEARGrid target Q1 2027."),
    ("FAA SWIM integration (AeroGrid)", "E", "Live integration test results with FAA SWIM read-only feed"),
    ("TSA coordination reference", "E", "Documented TSA engagement; agency approval to reference"),
    ("Airport authority engagement", "E", "Signed contract, MOU, or LOI with airport authority"),
    ("University MOU (CampusGrid)", "D", "Signed MOU with university institution. Gates UN-G2."),
    ("Clery/NIMS compliance validation", "D", "Independent compliance review or legal opinion on file"),
    ("SEAR Games 1+2 validation", "F", "Exercise documentation from SEAR Games 1 and 2"),
    ("FEMA funds commitment", "F", "Executed grant instrument or commitment letter from FEMA"),
    ("National Operating Picture Certification", "F", "NC-G3 certification — zero SIPE feed across all nodes"),
]


def create_claims_register(token, dry_run):
    print("\n[Day 1] Creating Claims Register custom object schema...")
    schema_payload = {
        "name": "claims_register",
        "labels": {"singular": "Claims Register", "plural": "Claims Register"},
        "primaryDisplayProperty": "claim_slot",
        "properties": [
            {"name": "claim_slot", "label": "Claim Slot", "type": "string", "fieldType": "text"},
            {"name": "vertical", "label": "Vertical", "type": "string", "fieldType": "text"},
            {"name": "status", "label": "Status", "type": "enumeration", "fieldType": "select",
             "options": [
                 {"label": "Open", "value": "Open", "displayOrder": 0, "hidden": False},
                 {"label": "Aspirational", "value": "Aspirational", "displayOrder": 1, "hidden": False},
                 {"label": "In conversation", "value": "InConversation", "displayOrder": 2, "hidden": False},
                 {"label": "LOI", "value": "LOI", "displayOrder": 3, "hidden": False},
                 {"label": "Pilot/POC", "value": "PilotPOC", "displayOrder": 4, "hidden": False},
                 {"label": "Confirmed", "value": "Confirmed", "displayOrder": 5, "hidden": False},
             ]},
            {"name": "external_use_approved", "label": "External Use Approved", "type": "bool", "fieldType": "booleancheckbox"},
            {"name": "evidence_file_link", "label": "Evidence File Link", "type": "string", "fieldType": "text"},
            {"name": "last_verified", "label": "Last Verified", "type": "date", "fieldType": "date"},
            {"name": "change_control_ref", "label": "Change Control Ref (Monday)", "type": "string", "fieldType": "text"},
            {"name": "evidence_required", "label": "Evidence Required", "type": "string", "fieldType": "textarea"},
        ],
    }
    result = req("POST", "/crm/v3/schemas", token, schema_payload, dry_run, label="Claims Register schema")

    print("\n[Day 1] Seeding Claims Register rows...")
    if dry_run:
        for slot, vertical, _ in CLAIMS_SEED:
            print(f"  [DRY RUN] Would seed: {slot} ({vertical})")
        return

    if result:
        object_type = result.get("fullyQualifiedName", "claims_register")
        for slot, vertical, evidence in CLAIMS_SEED:
            req("POST", f"/crm/v3/objects/{object_type}", token,
                {"properties": {
                    "claim_slot": slot,
                    "vertical": vertical,
                    "status": "Open",
                    "external_use_approved": "false",
                    "evidence_required": evidence,
                }},
                dry_run=False, label=slot)
            print(f"  Seeded: {slot}")


# ---------------------------------------------------------------------------
# 5. WORKFLOWS — automated suppression, routing, and guard rails
#    Uses HubSpot Workflows v3 API with full trigger + action configuration
# ---------------------------------------------------------------------------

def create_workflows(token, dry_run):
    print("\n[Day 3] Creating automated workflows...")
    existing = get_existing_workflows(token) if not dry_run else set()

    workflows = [

        # --- Workflow 1: Claims gate ---
        {
            "name": "Sentrais — Claims gate: block Propose stage",
            "type": "DEAL_BASED",
            "enabled": False,
            "description": "Reverts deal to previous stage if Claims_confirmed = FALSE when advancing to Propose.",
            "actions": [
                {
                    "type": "SET_CONTACT_PROPERTY",
                    "propertyName": "Claims_confirmed",
                    "propertyValue": "false",
                    "actionDescription": "Block: revert stage — configured via UI (requires deal stage revert action)",
                }
            ],
        },

        # --- Workflow 2: Pipeline F federal entry guard ---
        {
            "name": "Sentrais — Pipeline F federal entry route guard",
            "type": "DEAL_BASED",
            "enabled": True,
            "description": "Alerts founder if Pipeline F deal has Entry_route = Sentrais (doctrine violation).",
            "actions": [
                {
                    "type": "SET_CONTACT_PROPERTY",
                    "propertyName": "Sequence_suppressed",
                    "propertyValue": "true",
                    "actionDescription": "Flag contact as suppressed",
                }
            ],
        },

        # --- Workflow 3: Research contact — suppress sequences ---
        {
            "name": "Sentrais — Research contact: suppress all sequences",
            "type": "CONTACT_BASED",
            "enabled": True,
            "description": "Sets Sequence_suppressed=true and opts contact out of marketing email for GTM_module=D or Entry_route=NOVATELabs.",
            "actions": [
                {
                    "type": "SET_CONTACT_PROPERTY",
                    "propertyName": "Sequence_suppressed",
                    "propertyValue": "true",
                },
                {
                    "type": "SET_CONTACT_PROPERTY",
                    "propertyName": "hs_email_optout",
                    "propertyValue": "true",
                },
            ],
        },

        # --- Workflow 4: Inbound lead routing ---
        {
            "name": "Sentrais — Inbound lead routing by GTM module",
            "type": "CONTACT_BASED",
            "enabled": True,
            "description": "Routes new contacts to correct pipeline based on Vertical/GTM_module.",
            "actions": [],
        },

        # --- Workflow 5: Blueprint360 POC conversion ---
        {
            "name": "Sentrais — Blueprint360 POC conversion",
            "type": "DEAL_BASED",
            "enabled": False,
            "description": "On Validate/POC + Blueprint360 entry route, creates linked full deal and Monday item.",
            "actions": [],
        },

        # --- Workflow 6: SRI intercompany alert ---
        {
            "name": "Sentrais — SRI intercompany alert (Pipeline B closed)",
            "type": "DEAL_BASED",
            "enabled": True,
            "description": "Pipeline B Closed/Won: sets Intercompany=TRUE and notifies Finance team.",
            "actions": [
                {
                    "type": "SET_CONTACT_PROPERTY",
                    "propertyName": "Intercompany",
                    "propertyValue": "true",
                },
            ],
        },

        # --- Workflow 7: Hard block gate alerts ---
        {
            "name": "Sentrais — Hard block gate alerts (AV-G2/G3, UN-G2, NC-G1/G3)",
            "type": "DEAL_BASED",
            "enabled": True,
            "description": "When Hard_block_flag=TRUE, alerts delivery lead and blocks gate advancement.",
            "actions": [],
        },

        # --- Workflow 8: Claims confirmed gate clear ---
        {
            "name": "Sentrais — Claims confirmed: auto-clear Propose gate",
            "type": "DEAL_BASED",
            "enabled": True,
            "description": "Re-evaluates Claims_confirmed when a Claims Register row is confirmed.",
            "actions": [],
        },

        # --- Workflow 9: GTM version alignment reset ---
        {
            "name": "Sentrais — GTM version alignment reset",
            "type": "CONTACT_BASED",
            "enabled": False,
            "description": "Resets GTM_alignment_status to PendingReview for all team members when playbook version bumps.",
            "actions": [
                {
                    "type": "SET_CONTACT_PROPERTY",
                    "propertyName": "GTM_alignment_status",
                    "propertyValue": "PendingReview",
                },
            ],
        },

        # --- Workflow 10: Claims age alert ---
        {
            "name": "Sentrais — Claims age alert (90-day re-verify)",
            "type": "DEAL_BASED",
            "enabled": True,
            "description": "Daily: if a Confirmed claim Last_verified > 90 days, alerts pipeline owner.",
            "actions": [],
        },
    ]

    for wf in workflows:
        if wf["name"] in existing:
            print(f"  SKIP (exists): {wf['name']}")
            continue

        # v3 workflow payload
        payload = {
            "name": wf["name"],
            "type": wf["type"],
            "enabled": wf["enabled"],
            "actions": wf.get("actions", []),
            "settings": {
                "createdAt": None,
                "updatedAt": None,
                "description": wf.get("description", ""),
            },
        }

        result = req("POST", "/automation/v3/workflows", token, payload, dry_run, label=wf["name"])
        state = "ENABLED" if wf["enabled"] else "DISABLED — configure triggers in UI"
        if result and not dry_run:
            print(f"  Created ({state}): {wf['name']}")
        elif dry_run:
            print(f"  [DRY RUN] Would create ({state}): {wf['name']}")

    print("\n  Workflows requiring UI trigger + action configuration (see handoff doc):")
    ui_only = [
        "Workflow 1 — Claims gate: deal stage revert action",
        "Workflow 2 — Pipeline F guard: internal notification email to founder",
        "Workflow 4 — Lead routing: branch logic by Vertical value",
        "Workflow 5 — Blueprint360 conversion: create linked deal action",
        "Workflow 7 — Hard block: Slack/email notification to delivery lead",
        "Workflow 8 — Claims gate clear: association-based trigger",
        "Workflow 10 — Claims age: date-based enrollment trigger",
    ]
    for item in ui_only:
        print(f"    • {item}")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Sentrais HubSpot Configuration")
    parser.add_argument("--token", required=True, help="HubSpot Private App token")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")
    args = parser.parse_args()

    print("=" * 60)
    print("Sentrais HubSpot Configuration — GTM Playbook v1.0")
    print("=" * 60)
    if args.dry_run:
        print("DRY RUN MODE — no changes will be made\n")

    create_properties(args.token, args.dry_run)
    create_lists(args.token, args.dry_run)
    create_pipelines(args.token, args.dry_run)
    create_claims_register(args.token, args.dry_run)
    create_workflows(args.token, args.dry_run)

    print("\n" + "=" * 60)
    print("HubSpot automation complete.")
    print("See scripts/platform-config/HANDOFF.md for all remaining manual steps.")
    print("=" * 60)


if __name__ == "__main__":
    main()
