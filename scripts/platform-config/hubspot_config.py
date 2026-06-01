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
import sys
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
    time.sleep(0.15)  # rate limit buffer
    if resp.status_code in (200, 201):
        return resp.json()
    if resp.status_code == 409:
        print(f"  SKIP (already exists): {label or path}")
        return None
    print(f"  ERROR {resp.status_code} {path}: {resp.text[:200]}")
    return None


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
        for obj in ("contacts", "companies"):
            req("POST", f"/crm/v3/properties/{obj}", token, payload, dry_run,
                label=f"{prop['name']} on {obj}")

    print("\n[Day 1] Creating Deal custom properties...")
    for prop in DEAL_PROPS:
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
    {
        "label": "Pipeline A — League / Sports",
        "stages": [
            ("Identify", "appointmentscheduled"),
            ("Engage", "qualifiedtobuy"),
            ("Discover", "presentationscheduled"),
            ("Validate / POC", "decisionmakerboughtin"),
            ("Propose", "contractsent"),
            ("Close", "closedwon"),
            ("Onboard", "closedwon"),
        ],
    },
    {
        "label": "Pipeline B — Venue / Facility",
        "stages": [
            ("Identify", "appointmentscheduled"),
            ("Engage", "qualifiedtobuy"),
            ("Discover", "presentationscheduled"),
            ("Validate / POC", "decisionmakerboughtin"),
            ("Propose", "contractsent"),
            ("Close", "closedwon"),
            ("Onboard", "closedwon"),
        ],
    },
    {
        "label": "Pipeline C — Government / EM",
        "stages": [
            ("Identify", "appointmentscheduled"),
            ("Engage", "qualifiedtobuy"),
            ("Discover", "presentationscheduled"),
            ("Validate / POC", "decisionmakerboughtin"),
            ("Propose", "contractsent"),
            ("Close", "closedwon"),
            ("Onboard", "closedwon"),
        ],
    },
    {
        "label": "Pipeline D — Academic / CampusGrid",
        "stages": [
            ("Research contact", "appointmentscheduled"),
            ("Research engage", "qualifiedtobuy"),
            ("Discover", "presentationscheduled"),
            ("Validate / POC", "decisionmakerboughtin"),
            ("Commercial propose", "contractsent"),
            ("Close", "closedwon"),
            ("Onboard", "closedwon"),
        ],
    },
    {
        "label": "Pipeline E — Aviation / AeroGrid",
        "stages": [
            ("Identify", "appointmentscheduled"),
            ("Engage", "qualifiedtobuy"),
            ("Discover", "presentationscheduled"),
            ("Validate / POC", "decisionmakerboughtin"),
            ("Propose", "contractsent"),
            ("Close", "closedwon"),
            ("Onboard", "closedwon"),
        ],
    },
    {
        "label": "Pipeline F — NCICC / Federal Apex",
        "stages": [
            ("Federal contact", "appointmentscheduled"),
            ("Program Converge", "qualifiedtobuy"),
            ("Partnership scoping", "presentationscheduled"),
            ("Instrument signed", "decisionmakerboughtin"),
            ("PPP structuring", "contractsent"),
            ("Active partnership", "closedwon"),
            ("National surveillance", "closedwon"),
        ],
    },
]


def create_pipelines(token, dry_run):
    print("\n[Day 2] Creating deal pipelines...")
    for pl in PIPELINES:
        stages = [
            {
                "label": stage_label,
                "metadata": {"probability": "0.5", "isClosed": "false"},
                "displayOrder": i,
            }
            for i, (stage_label, _) in enumerate(pl["stages"])
        ]
        # Mark Close stage
        stages[-2]["metadata"]["isClosed"] = "true"
        stages[-2]["metadata"]["probability"] = "1.0"

        payload = {"label": pl["label"], "displayOrder": 0, "stages": stages}
        result = req("POST", "/crm/v3/pipelines/deals", token, payload, dry_run, label=pl["label"])
        if result and not dry_run:
            print(f"  Created: {pl['label']} (id={result.get('id')})")


# ---------------------------------------------------------------------------
# 3. CLAIMS REGISTER CUSTOM OBJECT
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
            print(f"  [DRY RUN] Would create: {slot} ({vertical})")
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
# 4. WORKFLOWS (Automations)
# NOTE: HubSpot Workflows API requires Marketing Hub Professional+.
# These are created via the Automation API v4 (actions-based).
# ---------------------------------------------------------------------------

def create_workflows(token, dry_run):
    print("\n[Day 3] Creating HubSpot workflows...")

    workflows = [
        {
            "name": "Sentrais — Claims gate: block Propose stage",
            "description": "If Claims_confirmed = FALSE when deal moves to Propose, revert and alert.",
            "type": "DEAL_BASED",
        },
        {
            "name": "Sentrais — Pipeline F federal entry route guard",
            "description": "Alert founder immediately if Pipeline F deal has Entry_route = Sentrais.",
            "type": "DEAL_BASED",
        },
        {
            "name": "Sentrais — Research contact: suppress all sequences",
            "description": "Permanently suppress sequences for GTM_module=D or Entry_route=NOVATELabs.",
            "type": "CONTACT_BASED",
        },
        {
            "name": "Sentrais — Inbound lead routing by GTM module",
            "description": "Route new contacts to correct pipeline based on Vertical/GTM_module.",
            "type": "CONTACT_BASED",
        },
        {
            "name": "Sentrais — Blueprint360 POC conversion",
            "description": "On Validate/POC stage + Blueprint360 entry route, create linked full deal.",
            "type": "DEAL_BASED",
        },
        {
            "name": "Sentrais — SRI intercompany alert (Pipeline B closed)",
            "description": "Pipeline B closed/won: set Intercompany=TRUE, Slack Finance, NetSuite task.",
            "type": "DEAL_BASED",
        },
        {
            "name": "Sentrais — Hard block gate alerts (AV-G2/G3, UN-G2, NC-G1/G3)",
            "description": "When Hard_block_flag=TRUE on gate stage, alert delivery lead + block advancement.",
            "type": "DEAL_BASED",
        },
        {
            "name": "Sentrais — Claims confirmed: auto-clear Propose gate",
            "description": "When Claims Register row → Confirmed, re-evaluate Claims_confirmed on linked deals.",
            "type": "DEAL_BASED",
        },
        {
            "name": "Sentrais — GTM version alignment reset",
            "description": "When GTM playbook version bumps, reset all team alignment statuses.",
            "type": "CONTACT_BASED",
        },
        {
            "name": "Sentrais — Claims age alert (90-day re-verify)",
            "description": "Daily: if Confirmed claim Last_verified > 90 days, alert pipeline owner.",
            "type": "DEAL_BASED",
        },
    ]

    # HubSpot Workflows v3 API (simple enrollment-trigger format)
    for wf in workflows:
        payload = {
            "name": wf["name"],
            "type": "CONTACT_CENTERED" if wf["type"] == "CONTACT_BASED" else "DEAL_CENTERED",
            "enabled": False,  # start disabled — enable after manual review of each
            "actions": [],     # actions require UI configuration after creation
        }
        result = req("POST", "/automation/v4/flows", token, payload, dry_run, label=wf["name"])
        if result and not dry_run:
            print(f"  Created (disabled, configure actions in UI): {wf['name']}")
        else:
            print(f"  [DRY RUN] Would create: {wf['name']}")

    print("\n  NOTE: Workflow triggers and actions must be configured in HubSpot UI.")
    print("  Each workflow is created in DISABLED state. Logic per Appendix B of the config doc.")


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
    create_pipelines(args.token, args.dry_run)
    create_claims_register(args.token, args.dry_run)
    create_workflows(args.token, args.dry_run)

    print("\n" + "=" * 60)
    print("HubSpot configuration complete.")
    print("Next steps:")
    print("  1. In HubSpot UI: assign teams to each pipeline")
    print("  2. Enable and configure workflow actions (each workflow is DISABLED)")
    print("  3. Connect Business Units for SRI/Corp marketing separation")
    print("  4. Run: python3 monday_config.py --token YOUR_MONDAY_TOKEN")
    print("=" * 60)


if __name__ == "__main__":
    main()
