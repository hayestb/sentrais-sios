#!/usr/bin/env python3
"""
Sentrais Monday.com Configuration Script
GTM Playbook v1.0 — Full configuration: workspaces, boards, columns, items

Usage:
    pip install requests
    python3 monday_config.py --token YOUR_TOKEN [--dry-run]

Idempotent: checks for existing workspaces/boards before creating.
"""

import argparse
import json
import sys
import time
import requests

API_URL = "https://api.monday.com/v2"

FIFA_CITIES = [
    {"name": "Los Angeles", "abbr": "LA", "state": "CA", "matches": 13, "priority": "Tier 1", "opener": True},
    {"name": "New York / NJ", "abbr": "NYC", "state": "NY/NJ", "matches": 8, "priority": "Tier 1", "opener": False},
    {"name": "Dallas", "abbr": "DAL", "state": "TX", "matches": 9, "priority": "Tier 1", "opener": False},
    {"name": "San Francisco", "abbr": "SFO", "state": "CA", "matches": 7, "priority": "Tier 1", "opener": False},
    {"name": "Miami", "abbr": "MIA", "state": "FL", "matches": 8, "priority": "Tier 1", "opener": False},
    {"name": "Seattle", "abbr": "SEA", "state": "WA", "matches": 7, "priority": "Tier 2", "opener": False},
    {"name": "Boston", "abbr": "BOS", "state": "MA", "matches": 7, "priority": "Tier 2", "opener": False},
    {"name": "Atlanta", "abbr": "ATL", "state": "GA", "matches": 8, "priority": "Tier 2", "opener": False},
    {"name": "Houston", "abbr": "HOU", "state": "TX", "matches": 8, "priority": "Tier 2", "opener": False},
    {"name": "Kansas City", "abbr": "KC", "state": "MO/KS", "matches": 6, "priority": "Tier 2", "opener": False},
    {"name": "Philadelphia", "abbr": "PHI", "state": "PA", "matches": 7, "priority": "Tier 2", "opener": False},
]

NC_GATES = [
    ("NC-G0", False, "National Doctrine Activation. Ventures workspace live. SEAR Games 1+2 evidence on file."),
    ("NC-G1", True, "ALL 11 city nodes certified. Single uncertified node = hard block."),
    ("NC-G2", False, "Deconfliction readiness confirmed. No authority overlap. Multi-city body convened."),
    ("NC-G3", True, "National Operating Picture Certification. Zero SIPE feed. SecOps sign-off required."),
    ("NC-G4", True, "Federal Sponsor authorization. Sole authority — cannot be delegated. NC-G3 zero open items."),
    ("NC-G5", False, "National Surveillance. NCICC reading all nodes. SLA active: Critical 5 min."),
    ("NC-G6", False, "National After-Action. Unified chain of custody. Feeds LA 2028 NC-G0."),
]


def gql(token, query, variables=None, dry_run=False, label=""):
    if dry_run:
        print(f"  [DRY RUN] {label or query[:60]}")
        return {"data": {}}
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    resp = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json", "API-Version": "2024-01"},
        json=payload,
        timeout=30,
    )
    time.sleep(0.3)
    if resp.status_code != 200:
        print(f"  ERROR {resp.status_code}: {resp.text[:200]}")
        return None
    data = resp.json()
    if "errors" in data:
        errs = data["errors"]
        # Treat "already exists" style errors as skips
        if any("already" in str(e).lower() or "duplicate" in str(e).lower() for e in errs):
            print(f"  SKIP (already exists): {label}")
            return None
        print(f"  GQL ERROR {label}: {errs}")
        return None
    return data


def get_existing_workspaces(token):
    data = gql(token, "{ workspaces { id name } }")
    if not data:
        return {}
    return {ws["name"]: ws["id"] for ws in data.get("data", {}).get("workspaces", [])}


def create_workspace(token, name, dry_run):
    data = gql(token,
               'mutation($name: String!) { create_workspace(name: $name, kind: open) { id name } }',
               {"name": name}, dry_run=dry_run, label=f"workspace: {name}")
    if data and not dry_run:
        ws = data.get("data", {}).get("create_workspace", {})
        return ws.get("id")
    return "dry-run-ws-id"


def get_existing_boards(token, workspace_id):
    data = gql(token,
               f'{{ boards(workspace_ids: [{workspace_id}]) {{ id name }} }}',
               label="list boards")
    if not data:
        return {}
    return {b["name"]: b["id"] for b in data.get("data", {}).get("boards", [])}


def create_board(token, name, workspace_id, dry_run):
    data = gql(token,
               'mutation($name: String!, $ws: ID!) { create_board(board_name: $name, board_kind: public, workspace_id: $ws) { id name } }',
               {"name": name, "ws": workspace_id}, dry_run=dry_run, label=f"board: {name}")
    if data and not dry_run:
        return data.get("data", {}).get("create_board", {}).get("id")
    return "dry-run-board-id"


def add_column(token, board_id, title, col_type, dry_run, defaults=None):
    defaults_part = ', defaults: $defaults' if defaults else ''
    q = f'mutation($bid: ID!, $title: String!{", $defaults: JSON" if defaults else ""}) {{ create_column(board_id: $bid, title: $title, column_type: {col_type}{defaults_part}) {{ id title }} }}'
    vars_ = {"bid": board_id, "title": title}
    if defaults:
        vars_["defaults"] = json.dumps(defaults)
    gql(token, q, vars_, dry_run=dry_run, label=f"column: {title}")


def add_group(token, board_id, name, dry_run):
    q = 'mutation($bid: ID!, $name: String!) { create_group(board_id: $bid, group_name: $name) { id } }'
    data = gql(token, q, {"bid": board_id, "name": name}, dry_run=dry_run, label=f"group: {name}")
    if data and not dry_run:
        return data.get("data", {}).get("create_group", {}).get("id")
    return "dry-run-group-id"


def add_item(token, board_id, group_id, name, dry_run):
    q = 'mutation($bid: ID!, $gid: String!, $name: String!) { create_item(board_id: $bid, group_id: $gid, item_name: $name) { id } }'
    gql(token, q, {"bid": board_id, "gid": group_id, "name": name}, dry_run=dry_run, label=f"item: {name}")


# ---------------------------------------------------------------------------
# WORKSPACE 1: Sentrais Corp — Commercial Delivery
# ---------------------------------------------------------------------------

def setup_corp_workspace(token, ws_id, dry_run):
    existing = get_existing_boards(token, ws_id) if not dry_run else {}

    # --- Active Deployments board ---
    print("  Creating: Active Deployments (NIN tracker)")
    board_id = existing.get("Active Deployments (NIN tracker)") or \
        create_board(token, "Active Deployments (NIN tracker)", ws_id, dry_run)

    for col_name, col_type in [
        ("NIN Phase", "status"),
        ("Gate Status", "status"),
        ("Vertical", "dropdown"),
        ("Doctrine Mode", "dropdown"),
        ("Gate Stage", "dropdown"),
        ("HubSpot Deal ID", "text"),
        ("Client Type", "text"),
        ("Delivery Lead", "people"),
        ("Class 2 Advisor", "people"),
        ("AAR Due Date", "date"),
        ("Evidence Ledger Live?", "checkbox"),
    ]:
        add_column(token, board_id, col_name, col_type, dry_run)

    # --- Blueprint360 POC Tracker ---
    print("  Creating: Blueprint360 POC Tracker")
    bp_board = existing.get("Blueprint360 POC Tracker") or \
        create_board(token, "Blueprint360 POC Tracker", ws_id, dry_run)
    for col_name, col_type in [
        ("POC Status", "status"),
        ("Target Vertical", "dropdown"),
        ("Entry Route", "dropdown"),
        ("Class 2 Advisor", "people"),
        ("HubSpot Contact ID", "text"),
        ("Proof Output Type", "dropdown"),
        ("Conversion Likelihood", "dropdown"),
    ]:
        add_column(token, bp_board, col_name, col_type, dry_run)

    # --- Module A-B Pipeline ---
    print("  Creating: Module A-B Pipeline (League/Venue)")
    create_board(token, "Module A-B Pipeline (League/Venue)", ws_id, dry_run)

    # --- Module C Gov/EM Pipeline ---
    print("  Creating: Module C Gov/EM Pipeline")
    create_board(token, "Module C Gov/EM Pipeline", ws_id, dry_run)

    # --- Module E AeroGrid Pipeline ---
    print("  Creating: Module E AeroGrid Pipeline")
    create_board(token, "Module E AeroGrid Pipeline", ws_id, dry_run)

    # --- 11 City Node Detail boards ---
    print("  Creating: 11 City Node Detail boards...")
    for city in FIFA_CITIES:
        board_name = f"SEAR 2026 — {city['name']} Node"
        print(f"    {board_name}")
        city_board = existing.get(board_name) or create_board(token, board_name, ws_id, dry_run)

        groups = [
            "AeroGrid Gates (AV-G0 → AV-G6)",
            "CiviGrid Gates (G0 → G6)",
            "Integration Feeds",
            "MOUs & Legal Instruments",
            "Exercise & AAR",
            "NIN Delivery Phases",
        ]
        group_ids = {}
        for grp in groups:
            group_ids[grp] = add_group(token, city_board, grp, dry_run)

        # AeroGrid gate items
        for gate in ["AV-G0", "AV-G1", "AV-G2", "AV-G3", "AV-G4", "AV-G5", "AV-G6"]:
            add_item(token, city_board, group_ids["AeroGrid Gates (AV-G0 → AV-G6)"], gate, dry_run)

        # CiviGrid gate items
        for gate in ["G0", "G1", "G2", "G3", "G4", "G5", "G6"]:
            add_item(token, city_board, group_ids["CiviGrid Gates (G0 → G6)"], gate, dry_run)

        # Integration feeds
        for feed in ["FAA SWIM", "ASDE-X", "Airport AODB", "Airline DCS", "CAD/911",
                     "Mass notification", "Radio dispatch", "Access control", "CCTV/VMS",
                     "City/county CAD (mutual aid)", "Weather alerting"]:
            add_item(token, city_board, group_ids["Integration Feeds"], feed, dry_run)

        # Columns for city node board
        for col_name, col_type in [
            ("Status", "status"),
            ("Hard Block?", "checkbox"),
            ("Evidence on file?", "checkbox"),
            ("Owner", "people"),
            ("Target date", "date"),
            ("Notes", "long_text"),
        ]:
            add_column(token, city_board, col_name, col_type, dry_run)


# ---------------------------------------------------------------------------
# WORKSPACE 2: SRI — IP & Curriculum
# ---------------------------------------------------------------------------

def setup_sri_workspace(token, ws_id, dry_run):
    existing = get_existing_boards(token, ws_id) if not dry_run else {}

    print("  Creating: Doctrine Versioning")
    create_board(token, "Doctrine Versioning", ws_id, dry_run)

    print("  Creating: Playbook Change Control")
    pcc_board = existing.get("Playbook Change Control") or \
        create_board(token, "Playbook Change Control", ws_id, dry_run)

    for col_name, col_type in [
        ("Change Type", "dropdown"),
        ("Section affected", "dropdown"),
        ("Author", "people"),
        ("Reviewer", "people"),
        ("Founder Sign-off", "people"),
        ("Approval Status", "status"),
        ("Version bump", "text"),
        ("Effective date", "date"),
    ]:
        add_column(token, pcc_board, col_name, col_type, dry_run)

    for grp in ["Core section changes (§1/§3/§4 — founder sign-off required)",
                "Module GTM updates (Part II)",
                "New vertical modules",
                "Register status updates",
                "Team alignment confirmations"]:
        add_group(token, pcc_board, grp, dry_run)

    print("  Creating: IP Asset Registry")
    create_board(token, "IP Asset Registry", ws_id, dry_run)

    print("  Creating: Advisor Class Roster")
    advisor_board = existing.get("Advisor Class Roster") or \
        create_board(token, "Advisor Class Roster", ws_id, dry_run)

    for col_name, col_type in [
        ("Advisor Class", "dropdown"),
        ("Domain vertical", "dropdown"),
        ("§4.6 compliance status", "status"),
        ("Government deal carve-out?", "checkbox"),
        ("Agreement signed date", "date"),
        ("Contact owner", "people"),
    ]:
        add_column(token, advisor_board, col_name, col_type, dry_run)


# ---------------------------------------------------------------------------
# WORKSPACE 3: Barbara Geter Institute — Research & Program Converge
# ---------------------------------------------------------------------------

def setup_bgi_workspace(token, ws_id, dry_run):
    print("  Creating: Program Converge Engagements")
    create_board(token, "Program Converge Engagements", ws_id, dry_run)

    print("  Creating: Academic MOU Tracker (CampusGrid)")
    mou_board = create_board(token, "Academic MOU Tracker (CampusGrid)", ws_id, dry_run)
    for col_name, col_type in [
        ("Institution", "text"),
        ("MOU status", "status"),
        ("UN gate", "dropdown"),
        ("Signed date", "date"),
        ("Expiry date", "date"),
        ("Research contact", "people"),
    ]:
        add_column(token, mou_board, col_name, col_type, dry_run)

    print("  Creating: Federal Research Pipeline (NCICC/SEAR)")
    create_board(token, "Federal Research Pipeline (NCICC/SEAR)", ws_id, dry_run)

    print("  Creating: Grant Applications")
    create_board(token, "Grant Applications", ws_id, dry_run)

    print("  NOTE: Zero commercial deal items permitted on this workspace. Restrict access to BGI/Research teams only.")


# ---------------------------------------------------------------------------
# WORKSPACE 5: SENTRAIS_Operations — SIOS Sprint 1
# ---------------------------------------------------------------------------

def setup_sios_workspace(token, ws_id, dry_run):
    existing = get_existing_boards(token, ws_id) if not dry_run else {}

    print("  Creating: Daily Standup")
    ds_board = existing.get("Daily Standup") or \
        create_board(token, "Daily Standup", ws_id, dry_run)
    for col_name, col_type in [
        ("Status", "status"),
        ("Owner", "people"),
        ("Today's Focus", "long_text"),
        ("Blockers", "long_text"),
        ("Date", "date"),
    ]:
        add_column(token, ds_board, col_name, col_type, dry_run)

    print("  Creating: Partnership Pipeline")
    pp_board = existing.get("Partnership Pipeline") or \
        create_board(token, "Partnership Pipeline", ws_id, dry_run)
    for col_name, col_type in [
        ("Stage", "status"),
        ("Partner Name", "text"),
        ("Vertical", "dropdown"),
        ("Owner", "people"),
        ("Next Action", "long_text"),
        ("Close Date", "date"),
    ]:
        add_column(token, pp_board, col_name, col_type, dry_run)

    print("  Creating: Revenue Pipeline")
    rp_board = existing.get("Revenue Pipeline") or \
        create_board(token, "Revenue Pipeline", ws_id, dry_run)
    for col_name, col_type in [
        ("Stage", "status"),
        ("Deal Name", "text"),
        ("Revenue Type", "dropdown"),
        ("Amount", "numbers"),
        ("Owner", "people"),
        ("Close Date", "date"),
        ("HubSpot Deal ID", "text"),
    ]:
        add_column(token, rp_board, col_name, col_type, dry_run)

    print("  Creating: Community Impact")
    ci_board = existing.get("Community Impact") or \
        create_board(token, "Community Impact", ws_id, dry_run)
    for col_name, col_type in [
        ("Status", "status"),
        ("Program Name", "text"),
        ("Impact Area", "dropdown"),
        ("Lead", "people"),
        ("Target Date", "date"),
        ("Notes", "long_text"),
    ]:
        add_column(token, ci_board, col_name, col_type, dry_run)

    print("  Creating: Founder Decisions")
    fd_board = existing.get("Founder Decisions") or \
        create_board(token, "Founder Decisions", ws_id, dry_run)
    for col_name, col_type in [
        ("Priority", "status"),
        ("Decision", "long_text"),
        ("Owner", "people"),
        ("Due Date", "date"),
        ("Status", "status"),
    ]:
        add_column(token, fd_board, col_name, col_type, dry_run)

    print("  Creating: Founder Dashboard")
    fdb_board = existing.get("Founder Dashboard") or \
        create_board(token, "Founder Dashboard", ws_id, dry_run)
    for col_name, col_type in [
        ("Metric", "text"),
        ("Value", "numbers"),
        ("Status", "status"),
        ("Last Updated", "date"),
    ]:
        add_column(token, fdb_board, col_name, col_type, dry_run)


# ---------------------------------------------------------------------------
# WORKSPACE 4: Sentrais Ventures — Federal PPP & NCICC
# ---------------------------------------------------------------------------

def setup_ventures_workspace(token, ws_id, dry_run):
    existing = get_existing_boards(token, ws_id) if not dry_run else {}

    # --- NCICC Federation Status ---
    print("  Creating: NCICC Federation Status")
    ncicc_board = existing.get("NCICC Federation Status") or \
        create_board(token, "NCICC Federation Status", ws_id, dry_run)

    for col_name, col_type in [
        ("Gate", "text"),
        ("Hard Block?", "checkbox"),
        ("Status", "status"),
        ("Clearance criteria", "long_text"),
        ("Authority", "people"),
        ("Cleared date", "date"),
    ]:
        add_column(token, ncicc_board, col_name, col_type, dry_run)

    for gate_name, is_block, criteria in NC_GATES:
        add_item(token, ncicc_board, "topics", gate_name, dry_run)

    # --- SEAR 2026 Master Tracker ---
    print("  Creating: SEAR 2026 Master Tracker")
    sear_board = existing.get("SEAR 2026 Master Tracker") or \
        create_board(token, "SEAR 2026 Master Tracker", ws_id, dry_run)

    for col_name, col_type in [
        ("AeroGrid Gate", "dropdown"),
        ("CiviGrid Gate", "dropdown"),
        ("Hard Block Flag", "dropdown"),
        ("Node Certified?", "checkbox"),
        ("Federal MOU Status", "dropdown"),
        ("Integration Feed Status", "dropdown"),
        ("Exercise Date", "date"),
        ("Class 2 Advisor", "people"),
        ("HubSpot Pipeline F Contact", "text"),
        ("SEAR Mode", "dropdown"),
        ("Days to T-0", "formula"),
        ("Priority", "dropdown"),
    ]:
        add_column(token, sear_board, col_name, col_type, dry_run)

    sear_group_id = add_group(token, sear_board, "FIFA 2026 Host Cities", dry_run)
    for city in FIFA_CITIES:
        add_item(token, sear_board, sear_group_id or "Topics",
                 f"{city['name']} ({city['abbr']}) — {city['priority']} — {city['matches']} matches",
                 dry_run)

    # --- SEAR Event Calendar ---
    print("  Creating: SEAR Event Calendar")
    cal_board = existing.get("SEAR Event Calendar") or \
        create_board(token, "SEAR Event Calendar", ws_id, dry_run)

    for col_name, col_type in [
        ("Event date", "date"),
        ("Host city", "dropdown"),
        ("Event type", "dropdown"),
        ("Host city node board", "text"),
        ("SEAR mode", "dropdown"),
        ("Node certified?", "checkbox"),
    ]:
        add_column(token, cal_board, col_name, col_type, dry_run)

    # FIFA 2026 milestone
    add_item(token, cal_board, "topics", "FIFA World Cup 2026 — Opening Match (LA/MetLife, June 11)", dry_run)
    add_item(token, cal_board, "topics", "FIFA World Cup 2026 — Final (July 19, 2026)", dry_run)
    add_item(token, cal_board, "topics", "LA 2028 — NCICC Doctrine Activation (milestone placeholder)", dry_run)

    # --- PPP Structuring ---
    print("  Creating: PPP Structuring")
    create_board(token, "PPP Structuring", ws_id, dry_run)

    # --- NCICC Partnership Tracker ---
    print("  Creating: NCICC Partnership Tracker")
    create_board(token, "NCICC Partnership Tracker", ws_id, dry_run)

    print("  NOTE: Restrict access to leadership + legal only.")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Sentrais Monday.com Configuration")
    parser.add_argument("--token", required=True, help="Monday.com API token")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")
    args = parser.parse_args()

    print("=" * 60)
    print("Sentrais Monday.com Configuration — GTM Playbook v1.0")
    print("=" * 60)
    if args.dry_run:
        print("DRY RUN MODE — no changes will be made\n")

    # Check existing workspaces
    print("\n[Day 4] Setting up workspaces...")
    if args.dry_run:
        existing_ws = {}
    else:
        existing_ws = get_existing_workspaces(args.token)
        print(f"  Found {len(existing_ws)} existing workspace(s)")

    def get_or_create_ws(name):
        if name in existing_ws:
            print(f"  SKIP workspace (exists): {name} — id={existing_ws[name]}")
            return existing_ws[name]
        print(f"  Creating workspace: {name}")
        return create_workspace(args.token, name, args.dry_run)

    corp_ws = get_or_create_ws("Sentrais Corp — Commercial Delivery")
    sri_ws = get_or_create_ws("SRI — IP & Curriculum")
    nova_ws = get_or_create_ws("Barbara Geter Institute — Research & Program Converge")
    ventures_ws = get_or_create_ws("Sentrais Ventures — Federal PPP & NCICC")
    sios_ws = get_or_create_ws("SENTRAIS_Operations")

    print("\n[Day 4–5] Configuring Sentrais Corp workspace (commercial delivery + 11 city nodes)...")
    setup_corp_workspace(args.token, corp_ws, args.dry_run)

    print("\n[Day 4] Configuring SRI workspace (IP & curriculum)...")
    setup_sri_workspace(args.token, sri_ws, args.dry_run)

    print("\n[Day 4] Configuring Barbara Geter Institute workspace (research)...")
    setup_bgi_workspace(args.token, nova_ws, args.dry_run)

    print("\n[Day 5] Configuring Sentrais Ventures workspace (NCICC & federal PPP)...")
    setup_ventures_workspace(args.token, ventures_ws, args.dry_run)

    print("\n[SIOS Sprint 1] Configuring SENTRAIS Operations workspace...")
    setup_sios_workspace(args.token, sios_ws, args.dry_run)

    print("\n" + "=" * 60)
    print("Monday.com configuration complete.")
    print("\nManual steps required in Monday UI:")
    print("  1. Set access restrictions on Barbara Geter Institute workspace (research team only)")
    print("  2. Set access restrictions on Sentrais Ventures workspace (leadership + legal)")
    print("  3. Configure Automation 10 (SEAR hard-block propagation) via Automations tab")
    print("  4. Configure Automation 11 (NC-G3 SIPE alert) via Automations tab")
    print("  5. Configure Automation 12 (exercise risk warning, 30-day trigger) via Automations tab")
    print("  6. Configure Automation 14 (NovateUS inurement guard) via Automations tab")
    print("  7. Connect HubSpot ↔ Monday via Monday marketplace app (HubSpot CRM)")
    print("  8. Set SEAR 2026 Master Tracker formula: Days to T-0 = DATIF(TODAY(), DATE(2026,6,11), 'D')")
    print("  9. Add 8 core seats to SENTRAIS_Operations workspace")
    print("  10. Enforce underscores-only naming convention in #sios-sprint1 Slack channel")
    print("  11. Configure Google Calendar and Slack integrations for automated reminders")
    print("=" * 60)


if __name__ == "__main__":
    main()
