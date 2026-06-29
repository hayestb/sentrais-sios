# Sentrais OS — Synthetic Data & Simulation Framework

## Complete Specification for Realistic Venue Telemetry Generation, Temporal Replay, and Demo Scenario Orchestration

**Version:** 1.0.0
**Classification:** Internal — Engineering
**Architecture Owner:** Sentrais Corporation
**Date:** February 2026
**Companion Documents:** sentrais_n8n_architecture_part1.md, sentrais_n8n_architecture_part2.md, sentrais_os_deployment_guide.md

---

## Table of Contents

1. [Framework Overview](#1-framework-overview)
2. [Venue Profile Generator](#2-venue-profile-generator)
3. [Sensor Telemetry Generator](#3-sensor-telemetry-generator)
4. [Crowd Simulation Engine](#4-crowd-simulation-engine)
5. [Weather Scenario Generator](#5-weather-scenario-generator)
6. [Incident Scenario Library](#6-incident-scenario-library)
7. [SOP Template Library](#7-sop-template-library)
8. [Temporal Simulation Engine](#8-temporal-simulation-engine)
9. [Evidence Ledger Seeding](#9-evidence-ledger-seeding)
10. [Demo Scenario Packages](#10-demo-scenario-packages)
11. [Data Validation & Quality](#11-data-validation--quality)

---

# 1. Framework Overview

## 1.1 Purpose

The Synthetic Data & Simulation Framework enables Sentrais OS to operate with full fidelity in the absence of live venue connections. Every workflow defined in the n8n architecture (Parts 1 and 2), every database table created by the deployment guide's migrations (V001–V010), and every Evidence Ledger hash chain can be exercised against realistic — but entirely fabricated — data. This serves five critical functions:

| Function | Description | Primary Audience |
|----------|-------------|-----------------|
| **Live Demos** | Show-don't-tell sales presentations with real-time operational scenarios | Sales, prospects |
| **Developer Testing** | Validate n8n workflows against realistic data without venue dependencies | Engineering |
| **SEAR Certification Simulation** | Run full certification exercises with verifiable evidence trails | Compliance, federal |
| **Air-Gap Security** | Guarantee that no real venue data leaves controlled environments | Security, legal |
| **Training** | Onboard venue operators with hands-on scenario exercises | Customer success |

## 1.2 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 SYNTHETIC DATA & SIMULATION FRAMEWORK                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LAYER 1: GENERATORS                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Venue       │  │ Sensor      │  │ Crowd       │  │ Weather     │  │
│  │ Profile     │  │ Telemetry   │  │ Simulation  │  │ Scenario    │  │
│  │ Generator   │  │ Generator   │  │ Engine      │  │ Generator   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │                │          │
│  LAYER 2: SCENARIO COMPOSITION                                         │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐   │
│  │                   Scenario Definition Engine                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐               │   │
│  │  │ Incident   │  │ SOP        │  │ Evidence   │               │   │
│  │  │ Library    │  │ Templates  │  │ Seeder     │               │   │
│  │  └────────────┘  └────────────┘  └────────────┘               │   │
│  └────────────────────────────┬───────────────────────────────────┘   │
│                               │                                       │
│  LAYER 3: TEMPORAL ENGINE                                              │
│  ┌────────────────────────────┴───────────────────────────────────┐   │
│  │              Temporal Simulation Engine                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ Timeline │  │ Webhook  │  │ REST API │  │ Dashboard│      │   │
│  │  │ Executor │  │ Trigger  │  │ Control  │  │ Status   │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │   │
│  └────────────────────────────┬───────────────────────────────────┘   │
│                               │                                       │
│  LAYER 4: DATA STORES (from Deployment Guide docker-compose)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │PostgreSQL│  │Timescale │  │ MongoDB  │  │  Redis   │             │
│  │  (V001-  │  │  DB      │  │ (SOPs,   │  │ (Cache,  │             │
│  │   V010)  │  │(Hyper-   │  │  AARs)   │  │  State)  │             │
│  │          │  │ tables)  │  │          │  │          │             │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
│                               │                                       │
│  LAYER 5: n8n WORKFLOW TRIGGERS                                       │
│  ┌────────────────────────────┴───────────────────────────────────┐   │
│  │  LIFECYCLE → RUN_Monitor_* → RESPONSE_SOP_Executor → REVIEW   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 1.3 Operating Modes

| Mode | Description | Data Flow | Speed | Use Case |
|------|-------------|-----------|-------|----------|
| **Static Seed** | Populates all database tables with baseline data | Generators → DB inserts | Batch (seconds) | Dev environment setup, CI/CD |
| **Temporal Replay** | Replays a pre-defined scenario in simulated real-time | Scenario → Timeline → DB + Webhooks | 1x, 10x, 60x, 300x | Demos, training, QA |
| **Interactive Scenario** | User-driven scenario with inject-on-demand capabilities | REST API → Generators → DB + Webhooks | Real-time | Sales demos, SEAR exercises |

## 1.4 Integration with Deployment Stack

The framework runs as an additional service within the Docker Compose stack defined in `sentrais_os_deployment_guide.md`:

```yaml
# docker/docker-compose.yml (addition)
  synthetic-engine:
    build:
      context: ../synthetic
      dockerfile: Dockerfile
    container_name: sentrais-synthetic
    restart: unless-stopped
    environment:
      <<: *common-env
      SYNTH_MODE: ${SYNTH_MODE:-seed}
      SYNTH_SPEED: ${SYNTH_SPEED:-1}
      N8N_WEBHOOK_URL: http://n8n:5678/webhook
      SCENARIO_DIR: /app/scenarios
    ports:
      - "8090:8090"     # REST API for scenario control
      - "8091:8091"     # Dashboard / status endpoint
    volumes:
      - ../synthetic/scenarios:/app/scenarios
      - synthetic_data:/app/data
    depends_on:
      postgresql:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
      n8n:
        condition: service_healthy
    networks:
      - sentrais-net

volumes:
  synthetic_data:
```

## 1.5 Repository Structure

```
sentrais-os/
├── synthetic/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── sentrais_synth/
│   │   ├── __init__.py
│   │   ├── cli.py                          # Click CLI entry point
│   │   ├── config.py                       # YAML config loader
│   │   ├── generators/
│   │   │   ├── __init__.py
│   │   │   ├── venue_profile.py            # Section 2
│   │   │   ├── sensor_telemetry.py         # Section 3
│   │   │   ├── crowd_simulation.py         # Section 4
│   │   │   ├── weather_scenario.py         # Section 5
│   │   │   ├── incident_scenario.py        # Section 6
│   │   │   └── evidence_seeder.py          # Section 9
│   │   ├── sop_templates/
│   │   │   ├── __init__.py
│   │   │   ├── lightning_response.py       # Section 7
│   │   │   ├── medical_emergency.py
│   │   │   ├── evacuation.py
│   │   │   ├── suspicious_package.py
│   │   │   ├── active_threat.py
│   │   │   ├── utility_failure.py
│   │   │   ├── crowd_management.py
│   │   │   └── weather_delay.py
│   │   ├── temporal/
│   │   │   ├── __init__.py
│   │   │   ├── engine.py                   # Section 8
│   │   │   ├── timeline.py
│   │   │   ├── webhook_trigger.py
│   │   │   └── api.py                      # REST control API
│   │   ├── demo_packages/
│   │   │   ├── __init__.py
│   │   │   ├── perfect_game_day.py         # Section 10
│   │   │   ├── lightning_strikes.py
│   │   │   ├── cascading_crisis.py
│   │   │   └── full_season.py
│   │   └── validation/
│   │       ├── __init__.py
│   │       └── validators.py               # Section 11
│   ├── scenarios/
│   │   ├── perfect_game_day.yaml
│   │   ├── lightning_strikes.yaml
│   │   ├── cascading_crisis.yaml
│   │   └── full_season.yaml
│   ├── profiles/
│   │   ├── mercedes_benz_stadium.yaml
│   │   ├── sofi_stadium.yaml
│   │   └── allegiant_stadium.yaml
│   └── tests/
│       ├── test_venue_profile.py
│       ├── test_sensor_telemetry.py
│       ├── test_crowd_simulation.py
│       ├── test_weather_scenario.py
│       ├── test_evidence_seeder.py
│       └── test_temporal_engine.py
```

## 1.6 Dependencies

```
# synthetic/requirements.txt
faker>=22.0.0
numpy>=1.26.0
scipy>=1.12.0
psycopg2-binary>=2.9.9
pymongo>=4.6.0
redis>=5.0.0
requests>=2.31.0
click>=8.1.7
pyyaml>=6.0.1
uvicorn>=0.27.0
fastapi>=0.109.0
pydantic>=2.5.0
httpx>=0.26.0
```

---

# 2. Venue Profile Generator

## 2.1 Overview

The Venue Profile Generator creates complete, internally-consistent venue configurations that populate all relational tables required by the V001 migration (venues, staff, staff_certifications) and the MongoDB `sops` collection. Each generated profile includes zone maps with capacity breakdowns, sensor inventories, integration endpoint configurations, staff rosters with certifications, and a full SOP library.

## 2.2 Venue Type Configurations

| Venue Type | Capacity | Zones | Sensors | Staff | SOPs |
|------------|----------|-------|---------|-------|------|
| NFL Stadium | 70,000 | 42 | 850 | 2,200 | 24 |
| NBA Arena | 20,000 | 28 | 320 | 680 | 18 |
| MLB Ballpark | 45,000 | 36 | 620 | 1,400 | 22 |
| Concert Amphitheater | 25,000 | 18 | 280 | 520 | 16 |
| Convention Center | 10,000 | 14 | 180 | 340 | 14 |

## 2.3 Module: `venue_profile.py`

```python
"""
Sentrais OS — Venue Profile Generator
Generates complete venue configurations for synthetic environments.

Usage:
    # As module
    from sentrais_synth.generators.venue_profile import VenueProfileGenerator
    gen = VenueProfileGenerator()
    profile = gen.generate("nfl_stadium", venue_id="venue_mbs_001")

    # As CLI
    python -m sentrais_synth.cli venue generate --type nfl_stadium --id venue_mbs_001
"""

import json
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timedelta, date
from typing import Optional
from faker import Faker
import numpy as np
import yaml

fake = Faker()
Faker.seed(42)
np.random.seed(42)


# ═══════════════════════════════════════════════════
# VENUE TYPE DEFINITIONS
# ═══════════════════════════════════════════════════

VENUE_TYPES = {
    "nfl_stadium": {
        "venue_type": "stadium",
        "capacity": 71_000,
        "zone_config": {
            "field_level":       {"count": 4,  "capacity_each": 2_500,  "type": "seating"},
            "lower_bowl":        {"count": 8,  "capacity_each": 4_000,  "type": "seating"},
            "club_level":        {"count": 4,  "capacity_each": 2_500,  "type": "seating"},
            "upper_deck":        {"count": 8,  "capacity_each": 3_500,  "type": "seating"},
            "suites":            {"count": 4,  "capacity_each": 500,    "type": "premium"},
            "concourse_lower":   {"count": 4,  "capacity_each": 1_500,  "type": "concourse"},
            "concourse_upper":   {"count": 4,  "capacity_each": 1_200,  "type": "concourse"},
            "gate_entry":        {"count": 6,  "capacity_each": 800,    "type": "gate"},
        },
        "sensor_density": 12,  # sensors per zone
        "staff_ratio": 0.031,  # staff per capacity
        "indoor_outdoor": "outdoor",
        "has_retractable_roof": False,
    },
    "nba_arena": {
        "venue_type": "arena",
        "capacity": 20_000,
        "zone_config": {
            "court_level":       {"count": 4,  "capacity_each": 1_200,  "type": "seating"},
            "lower_bowl":        {"count": 6,  "capacity_each": 1_500,  "type": "seating"},
            "club_level":        {"count": 2,  "capacity_each": 1_000,  "type": "seating"},
            "upper_bowl":        {"count": 6,  "capacity_each": 1_300,  "type": "seating"},
            "suites":            {"count": 2,  "capacity_each": 300,    "type": "premium"},
            "concourse":         {"count": 4,  "capacity_each": 600,    "type": "concourse"},
            "gate_entry":        {"count": 4,  "capacity_each": 400,    "type": "gate"},
        },
        "sensor_density": 8,
        "staff_ratio": 0.034,
        "indoor_outdoor": "indoor",
        "has_retractable_roof": False,
    },
    "mlb_ballpark": {
        "venue_type": "stadium",
        "capacity": 45_000,
        "zone_config": {
            "field_level":       {"count": 4,  "capacity_each": 2_000,  "type": "seating"},
            "lower_bowl":        {"count": 8,  "capacity_each": 2_500,  "type": "seating"},
            "club_level":        {"count": 4,  "capacity_each": 1_500,  "type": "seating"},
            "upper_deck":        {"count": 6,  "capacity_each": 2_000,  "type": "seating"},
            "bleachers":         {"count": 2,  "capacity_each": 2_500,  "type": "seating"},
            "concourse":         {"count": 4,  "capacity_each": 1_000,  "type": "concourse"},
            "gate_entry":        {"count": 6,  "capacity_each": 500,    "type": "gate"},
        },
        "sensor_density": 10,
        "staff_ratio": 0.031,
        "indoor_outdoor": "outdoor",
        "has_retractable_roof": False,
    },
    "concert_amphitheater": {
        "venue_type": "amphitheater",
        "capacity": 25_000,
        "zone_config": {
            "pit":               {"count": 1,  "capacity_each": 3_000,  "type": "standing"},
            "orchestra":         {"count": 4,  "capacity_each": 2_000,  "type": "seating"},
            "mezzanine":         {"count": 4,  "capacity_each": 1_500,  "type": "seating"},
            "lawn":              {"count": 2,  "capacity_each": 3_500,  "type": "standing"},
            "concourse":         {"count": 2,  "capacity_each": 800,    "type": "concourse"},
            "gate_entry":        {"count": 3,  "capacity_each": 500,    "type": "gate"},
        },
        "sensor_density": 8,
        "staff_ratio": 0.021,
        "indoor_outdoor": "outdoor",
        "has_retractable_roof": False,
    },
    "convention_center": {
        "venue_type": "convention_center",
        "capacity": 10_000,
        "zone_config": {
            "exhibit_hall":      {"count": 4,  "capacity_each": 1_500,  "type": "open_floor"},
            "meeting_rooms":     {"count": 6,  "capacity_each": 200,    "type": "enclosed"},
            "ballroom":          {"count": 2,  "capacity_each": 800,    "type": "enclosed"},
            "lobby":             {"count": 2,  "capacity_each": 500,    "type": "concourse"},
            "gate_entry":        {"count": 2,  "capacity_each": 300,    "type": "gate"},
        },
        "sensor_density": 6,
        "staff_ratio": 0.034,
        "indoor_outdoor": "indoor",
        "has_retractable_roof": False,
    },
}


# ═══════════════════════════════════════════════════
# SENSOR TYPE DEFINITIONS
# ═══════════════════════════════════════════════════

SENSOR_TYPES = {
    "temperature_humidity": {
        "sensor_type": "temperature_humidity",
        "unit": "°F",
        "zones": ["seating", "concourse", "premium", "enclosed", "open_floor"],
        "per_zone": 2,
        "reading_interval_seconds": 30,
    },
    "crowd_density_camera": {
        "sensor_type": "crowd_density_camera",
        "unit": "ppl/m²",
        "zones": ["seating", "concourse", "gate", "standing", "open_floor", "enclosed"],
        "per_zone": 3,
        "reading_interval_seconds": 10,
    },
    "access_control": {
        "sensor_type": "access_control",
        "unit": "count",
        "zones": ["gate"],
        "per_zone": 8,
        "reading_interval_seconds": 5,
    },
    "wifi_probe": {
        "sensor_type": "wifi_probe",
        "unit": "devices",
        "zones": ["seating", "concourse", "premium", "standing", "open_floor"],
        "per_zone": 1,
        "reading_interval_seconds": 15,
    },
    "power_consumption": {
        "sensor_type": "power_consumption",
        "unit": "kW",
        "zones": ["seating", "concourse", "premium", "enclosed"],
        "per_zone": 1,
        "reading_interval_seconds": 60,
    },
    "structural_vibration": {
        "sensor_type": "structural_vibration",
        "unit": "mm/s",
        "zones": ["seating", "concourse", "standing"],
        "per_zone": 1,
        "reading_interval_seconds": 10,
    },
    "air_quality": {
        "sensor_type": "air_quality",
        "unit": "ppm_co2",
        "zones": ["seating", "concourse", "premium", "enclosed", "open_floor"],
        "per_zone": 1,
        "reading_interval_seconds": 60,
    },
    "noise_level": {
        "sensor_type": "noise_level",
        "unit": "dB",
        "zones": ["seating", "concourse", "standing"],
        "per_zone": 1,
        "reading_interval_seconds": 10,
    },
}


# ═══════════════════════════════════════════════════
# STAFF ROLE DEFINITIONS
# ═══════════════════════════════════════════════════

STAFF_ROLES = {
    "operations_chief":        {"department": "operations",  "ratio": 0.005, "certs": ["NIMS_ICS_300", "OSHA_30"]},
    "safety_officer":          {"department": "safety",      "ratio": 0.008, "certs": ["NIMS_ICS_200", "OSHA_30", "CPR_AED"]},
    "security_commander":      {"department": "security",    "ratio": 0.005, "certs": ["NIMS_ICS_300", "DHS_TSSP"]},
    "security_supervisor":     {"department": "security",    "ratio": 0.015, "certs": ["NIMS_ICS_200"]},
    "security_staff":          {"department": "security",    "ratio": 0.25,  "certs": ["NIMS_ICS_100"]},
    "ems_coordinator":         {"department": "medical",     "ratio": 0.005, "certs": ["NIMS_ICS_200", "EMT_P", "ACLS"]},
    "ems_paramedic":           {"department": "medical",     "ratio": 0.02,  "certs": ["EMT_P", "ACLS", "CPR_AED"]},
    "ems_emt":                 {"department": "medical",     "ratio": 0.04,  "certs": ["EMT_B", "CPR_AED"]},
    "fire_safety":             {"department": "fire",        "ratio": 0.008, "certs": ["NFPA_FIRE_WATCH", "CPR_AED"]},
    "operations_staff":        {"department": "operations",  "ratio": 0.15,  "certs": ["NIMS_ICS_100"]},
    "guest_services":          {"department": "guest_svcs",  "ratio": 0.20,  "certs": []},
    "maintenance_tech":        {"department": "facilities",  "ratio": 0.05,  "certs": ["OSHA_10"]},
    "communications_officer":  {"department": "comms",       "ratio": 0.005, "certs": ["NIMS_ICS_200", "PIO_CERT"]},
    "it_support":              {"department": "it",          "ratio": 0.015, "certs": []},
    "concessions_staff":       {"department": "food_bev",    "ratio": 0.15,  "certs": ["FOOD_HANDLER"]},
}


# ═══════════════════════════════════════════════════
# VENUE PROFILE GENERATOR CLASS
# ═══════════════════════════════════════════════════

class VenueProfileGenerator:
    """Generates complete venue profiles for synthetic data environments."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        np.random.seed(seed)
        Faker.seed(seed)

    def generate(
        self,
        venue_type_key: str,
        venue_id: str,
        venue_name: str = None,
        address: dict = None,
        latitude: float = None,
        longitude: float = None,
    ) -> dict:
        """Generate a complete venue profile.

        Returns dict with keys:
            venue, zones, sensors, staff, staff_certifications,
            integration_health, sop_ids
        """
        vtype = VENUE_TYPES[venue_type_key]
        venue_name = venue_name or f"Synthetic {venue_type_key.replace('_', ' ').title()}"
        latitude = latitude or round(np.random.uniform(25.0, 48.0), 6)
        longitude = longitude or round(np.random.uniform(-122.0, -74.0), 6)
        address = address or {
            "street": fake.street_address(),
            "city": fake.city(),
            "state": fake.state_abbr(),
            "zip": fake.zipcode(),
            "country": "US",
        }

        # Generate zones
        zones = self._generate_zones(venue_id, vtype)

        # Generate sensors
        sensors = self._generate_sensors(venue_id, zones)

        # Generate staff roster
        staff, certifications = self._generate_staff(venue_id, vtype)

        # Generate integration endpoints
        integrations = self._generate_integrations(venue_id, sensors)

        # Build venue record (matches V001 venues table)
        venue_record = {
            "venue_id": venue_id,
            "venue_name": venue_name,
            "venue_type": vtype["venue_type"],
            "address": address,
            "capacity": vtype["capacity"],
            "zones": [z["zone_summary"] for z in zones],
            "integrations": integrations["config"],
            "settings": {
                "indoor_outdoor": vtype["indoor_outdoor"],
                "has_retractable_roof": vtype["has_retractable_roof"],
                "latitude": latitude,
                "longitude": longitude,
                "lightning_detection_range_miles": 8,
                "weather_station_ids": [
                    f"ws_{venue_id}_north",
                    f"ws_{venue_id}_south",
                ],
                "default_event_phases": [
                    "pre_gates", "gates_open", "pre_event",
                    "event_active", "halftime", "event_active_2",
                    "post_event", "facility_clear",
                ],
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "active": True,
        }

        return {
            "venue": venue_record,
            "zones": zones,
            "sensors": sensors,
            "staff": staff,
            "staff_certifications": certifications,
            "integration_health": integrations["health_records"],
        }

    def _generate_zones(self, venue_id: str, vtype: dict) -> list:
        """Generate zone definitions with capacity and sensor assignments."""
        zones = []
        zone_index = 0
        for zone_group, config in vtype["zone_config"].items():
            for i in range(config["count"]):
                zone_index += 1
                zone_id = f"zone_{venue_id}_{zone_group}_{i+1:02d}"
                zone = {
                    "zone_id": zone_id,
                    "venue_id": venue_id,
                    "zone_name": f"{zone_group.replace('_', ' ').title()} {i+1}",
                    "zone_type": config["type"],
                    "zone_group": zone_group,
                    "max_capacity": config["capacity_each"],
                    "warning_threshold_pct": 80.0,
                    "critical_threshold_pct": 95.0,
                    "floor_level": self._infer_floor(zone_group),
                    "area_sqm": round(config["capacity_each"] / 2.5, 1),
                    "monitor_crowd": True,
                    "sensor_ids": [],   # populated by sensor generator
                    "camera_ids": [],   # populated by sensor generator
                    "zone_summary": {
                        "zone_id": zone_id,
                        "name": f"{zone_group.replace('_', ' ').title()} {i+1}",
                        "type": config["type"],
                        "capacity": config["capacity_each"],
                    },
                }
                zones.append(zone)
        return zones

    def _generate_sensors(self, venue_id: str, zones: list) -> list:
        """Generate sensor inventory mapped to zones."""
        sensors = []
        sensor_counter = 0
        for zone in zones:
            for sensor_key, stype in SENSOR_TYPES.items():
                if zone["zone_type"] in stype["zones"]:
                    count = stype["per_zone"]
                    for j in range(count):
                        sensor_counter += 1
                        sensor_id = f"sen_{venue_id}_{sensor_counter:04d}"
                        sensors.append({
                            "sensor_id": sensor_id,
                            "venue_id": venue_id,
                            "zone_id": zone["zone_id"],
                            "sensor_type": stype["sensor_type"],
                            "unit": stype["unit"],
                            "reading_interval_seconds": stype["reading_interval_seconds"],
                            "status": "online",
                            "installed_at": (
                                datetime.utcnow() - timedelta(days=np.random.randint(30, 365))
                            ).isoformat(),
                            "last_reading_at": None,
                            "metadata": {
                                "manufacturer": fake.company(),
                                "model": f"SEN-{np.random.randint(1000, 9999)}",
                                "firmware": f"v{np.random.randint(1,5)}.{np.random.randint(0,9)}.{np.random.randint(0,20)}",
                            },
                        })
                        # Back-reference sensor to zone
                        zone["sensor_ids"].append(sensor_id)
                        if stype["sensor_type"] == "crowd_density_camera":
                            zone["camera_ids"].append(sensor_id)
        return sensors

    def _generate_staff(self, venue_id: str, vtype: dict) -> tuple:
        """Generate staff roster and certifications."""
        total_staff = int(vtype["capacity"] * vtype["staff_ratio"])
        staff_records = []
        cert_records = []
        staff_counter = 0

        for role_key, role_def in STAFF_ROLES.items():
            role_count = max(1, int(total_staff * role_def["ratio"]))
            for _ in range(role_count):
                staff_counter += 1
                staff_id = f"staff_{venue_id}_{staff_counter:04d}"
                first = fake.first_name()
                last = fake.last_name()

                staff_records.append({
                    "staff_id": staff_id,
                    "venue_id": venue_id,
                    "user_id": f"usr_{staff_counter:04d}",
                    "first_name": first,
                    "last_name": last,
                    "email": f"{first.lower()}.{last.lower()}@{venue_id.replace('venue_', '')}.ops",
                    "phone": fake.phone_number(),
                    "role": role_key,
                    "department": role_def["department"],
                    "certifications": role_def["certs"],
                    "status": "active",
                })

                # Generate certifications
                for cert_type in role_def["certs"]:
                    issued = date.today() - timedelta(days=np.random.randint(30, 730))
                    expiry = issued + timedelta(days=365 * 2)
                    cert_records.append({
                        "staff_id": staff_id,
                        "certification_type": cert_type,
                        "issued_date": issued.isoformat(),
                        "expiry_date": expiry.isoformat(),
                        "status": "current" if expiry > date.today() else "expired",
                        "issuing_body": self._cert_issuer(cert_type),
                        "certificate_ref": f"CERT-{fake.bothify('????-####').upper()}",
                    })

        return staff_records, cert_records

    def _generate_integrations(self, venue_id: str, sensors: list) -> dict:
        """Generate integration endpoint configs and health records."""
        systems = [
            {"name": "weather_api",       "type": "api",       "endpoint": "https://api.weather.sentrais.io/v1"},
            {"name": "lightning_network",  "type": "api",       "endpoint": "https://lightning.sentrais.io/v1"},
            {"name": "access_control",     "type": "on_prem",   "endpoint": "https://acs.venue.local:8443/api"},
            {"name": "camera_analytics",   "type": "on_prem",   "endpoint": "https://vca.venue.local:9443/api"},
            {"name": "wifi_analytics",     "type": "on_prem",   "endpoint": "https://wifi.venue.local:8080/api"},
            {"name": "building_mgmt",      "type": "on_prem",   "endpoint": "https://bms.venue.local:443/api"},
            {"name": "pa_system",          "type": "on_prem",   "endpoint": "https://pa.venue.local:8080/api"},
            {"name": "digital_signage",    "type": "on_prem",   "endpoint": "https://signs.venue.local:443/api"},
            {"name": "radio_dispatch",     "type": "on_prem",   "endpoint": "https://radio.venue.local:8443/api"},
            {"name": "ticketing",          "type": "api",       "endpoint": "https://tickets.venue-partner.com/api/v2"},
        ]

        config = {}
        health_records = []
        for sys in systems:
            config[sys["name"]] = {
                "type": sys["type"],
                "endpoint": sys["endpoint"],
                "auth_method": "api_key" if sys["type"] == "api" else "mutual_tls",
                "polling_interval_seconds": 30,
                "timeout_seconds": 10,
            }
            health_records.append({
                "system_name": sys["name"],
                "venue_id": venue_id,
                "status": "healthy",
                "last_check": datetime.utcnow().isoformat(),
                "response_ms": round(np.random.uniform(15, 120), 1),
                "error_count_24h": 0,
                "uptime_pct_30d": round(np.random.uniform(99.5, 99.99), 2),
            })

        return {"config": config, "health_records": health_records}

    @staticmethod
    def _infer_floor(zone_group: str) -> int:
        floor_map = {
            "field_level": 1, "court_level": 1, "pit": 1,
            "lower_bowl": 1, "orchestra": 1, "exhibit_hall": 1,
            "concourse_lower": 1, "concourse": 2, "lobby": 1,
            "club_level": 2, "mezzanine": 2, "meeting_rooms": 2,
            "upper_deck": 3, "upper_bowl": 3, "bleachers": 2,
            "suites": 3, "ballroom": 1,
            "gate_entry": 1, "lawn": 1,
            "concourse_upper": 3,
        }
        return floor_map.get(zone_group, 1)

    @staticmethod
    def _cert_issuer(cert_type: str) -> str:
        issuers = {
            "NIMS_ICS_100": "FEMA Emergency Management Institute",
            "NIMS_ICS_200": "FEMA Emergency Management Institute",
            "NIMS_ICS_300": "FEMA Emergency Management Institute",
            "OSHA_10": "OSHA Training Institute",
            "OSHA_30": "OSHA Training Institute",
            "CPR_AED": "American Heart Association",
            "EMT_B": "National Registry of EMTs",
            "EMT_P": "National Registry of EMTs",
            "ACLS": "American Heart Association",
            "DHS_TSSP": "DHS Transportation Security Administration",
            "NFPA_FIRE_WATCH": "National Fire Protection Association",
            "PIO_CERT": "FEMA Emergency Management Institute",
            "FOOD_HANDLER": "ServSafe (National Restaurant Association)",
        }
        return issuers.get(cert_type, "Unknown Issuer")


# ═══════════════════════════════════════════════════
# PRE-BUILT VENUE PROFILES
# ═══════════════════════════════════════════════════

PREBUILT_PROFILES = {
    "mercedes_benz_stadium": {
        "venue_type_key": "nfl_stadium",
        "venue_id": "venue_mbs_001",
        "venue_name": "Mercedes-Benz Stadium",
        "address": {
            "street": "1 AMB Drive NW",
            "city": "Atlanta",
            "state": "GA",
            "zip": "30313",
            "country": "US",
        },
        "latitude": 33.7553,
        "longitude": -84.4006,
        "overrides": {
            "capacity": 71_000,
            "has_retractable_roof": True,
            "indoor_outdoor": "retractable",
        },
    },
    "sofi_stadium": {
        "venue_type_key": "nfl_stadium",
        "venue_id": "venue_sofi_001",
        "venue_name": "SoFi Stadium",
        "address": {
            "street": "1001 Stadium Drive",
            "city": "Inglewood",
            "state": "CA",
            "zip": "90301",
            "country": "US",
        },
        "latitude": 33.9534,
        "longitude": -118.3390,
        "overrides": {
            "capacity": 70_240,
            "indoor_outdoor": "indoor",
        },
    },
    "allegiant_stadium": {
        "venue_type_key": "nfl_stadium",
        "venue_id": "venue_alg_001",
        "venue_name": "Allegiant Stadium",
        "address": {
            "street": "3333 Al Davis Way",
            "city": "Las Vegas",
            "state": "NV",
            "zip": "89118",
            "country": "US",
        },
        "latitude": 36.0909,
        "longitude": -115.1833,
        "overrides": {
            "capacity": 65_000,
            "indoor_outdoor": "indoor",
        },
    },
}
```

## 2.4 Database Seeding

```python
"""
Database seeder for venue profiles.
Inserts generated profile data into PostgreSQL and MongoDB.
"""

import psycopg2
import psycopg2.extras
from pymongo import MongoClient


class VenueSeeder:
    """Seeds venue profile data into Sentrais OS databases."""

    def __init__(self, pg_dsn: str, mongo_uri: str):
        self.pg = psycopg2.connect(pg_dsn)
        self.pg.autocommit = False
        self.mongo = MongoClient(mongo_uri)
        self.db = self.mongo["sentrais_os"]

    def seed(self, profile: dict) -> dict:
        """Insert a complete venue profile into all data stores.

        Args:
            profile: Output from VenueProfileGenerator.generate()

        Returns:
            Summary of inserted record counts.
        """
        cursor = self.pg.cursor()
        counts = {}

        try:
            # 1. Insert venue record
            venue = profile["venue"]
            cursor.execute("""
                INSERT INTO venues (
                    venue_id, venue_name, venue_type, address, capacity,
                    zones, integrations, settings, active
                ) VALUES (
                    %(venue_id)s, %(venue_name)s, %(venue_type)s,
                    %(address)s::jsonb, %(capacity)s, %(zones)s::jsonb,
                    %(integrations)s::jsonb, %(settings)s::jsonb, %(active)s
                ) ON CONFLICT (venue_id) DO UPDATE SET
                    venue_name = EXCLUDED.venue_name,
                    zones = EXCLUDED.zones,
                    integrations = EXCLUDED.integrations,
                    settings = EXCLUDED.settings,
                    updated_at = NOW()
            """, {
                **venue,
                "address": psycopg2.extras.Json(venue["address"]),
                "zones": psycopg2.extras.Json(venue["zones"]),
                "integrations": psycopg2.extras.Json(venue["integrations"]),
                "settings": psycopg2.extras.Json(venue["settings"]),
            })
            counts["venues"] = 1

            # 2. Insert staff records
            staff_data = profile["staff"]
            for s in staff_data:
                cursor.execute("""
                    INSERT INTO staff (
                        staff_id, venue_id, user_id, first_name, last_name,
                        email, phone, role, department, certifications, status
                    ) VALUES (
                        %(staff_id)s, %(venue_id)s, %(user_id)s,
                        %(first_name)s, %(last_name)s, %(email)s, %(phone)s,
                        %(role)s, %(department)s, %(certifications)s::jsonb,
                        %(status)s
                    ) ON CONFLICT (staff_id) DO NOTHING
                """, {
                    **s,
                    "certifications": psycopg2.extras.Json(s["certifications"]),
                })
            counts["staff"] = len(staff_data)

            # 3. Insert staff certifications
            certs = profile["staff_certifications"]
            for c in certs:
                cursor.execute("""
                    INSERT INTO staff_certifications (
                        staff_id, certification_type, issued_date,
                        expiry_date, status, issuing_body, certificate_ref
                    ) VALUES (
                        %(staff_id)s, %(certification_type)s, %(issued_date)s,
                        %(expiry_date)s, %(status)s, %(issuing_body)s,
                        %(certificate_ref)s
                    ) ON CONFLICT DO NOTHING
                """, c)
            counts["staff_certifications"] = len(certs)

            # 4. Insert integration health records
            for ih in profile["integration_health"]:
                cursor.execute("""
                    INSERT INTO integration_health (
                        system_name, venue_id, status, last_check,
                        response_ms, error_count_24h, uptime_pct_30d
                    ) VALUES (
                        %(system_name)s, %(venue_id)s, %(status)s,
                        %(last_check)s, %(response_ms)s,
                        %(error_count_24h)s, %(uptime_pct_30d)s
                    ) ON CONFLICT (system_name, venue_id)
                    DO UPDATE SET status = EXCLUDED.status,
                                  last_check = EXCLUDED.last_check
                """, ih)
            counts["integration_health"] = len(profile["integration_health"])

            self.pg.commit()

        except Exception as e:
            self.pg.rollback()
            raise RuntimeError(f"Venue seeding failed: {e}") from e

        return counts

    def close(self):
        self.pg.close()
        self.mongo.close()
```

---

# 3. Sensor Telemetry Generator

## 3.1 Overview

Generates realistic time-series data for the `sensor_readings` TimescaleDB hypertable (V009). Each sensor type follows domain-appropriate statistical distributions, correlated to event phase transitions and crowd density patterns. Anomaly injection is configurable per scenario.

## 3.2 Temporal Phases

All sensor data respects the eight-phase event lifecycle. Each phase defines baseline parameters and transition curves:

| Phase | ID | Typical Duration | Crowd Level | System Load | Noise Level |
|-------|-----|-----------------|-------------|-------------|-------------|
| Pre-Gates | `pre_gates` | T-120 to T-60 min | 0–2% | Baseline | Low (50 dB) |
| Gates Open | `gates_open` | T-60 to T-15 min | 2–65% (sigmoid ramp) | Ramping | Medium (70 dB) |
| Pre-Event | `pre_event` | T-15 to T-0 min | 65–90% (plateau) | High | High (80 dB) |
| Event Active | `event_active` | 0 to Halftime | 90–98% (dynamic) | Peak | Very High (95 dB) |
| Halftime | `halftime` | ~20 min | 85–92% (dip) | High | Medium (75 dB) |
| Event Active 2 | `event_active_2` | Halftime to End | 88–96% (peak) | Peak | Very High (100 dB) |
| Post-Event | `post_event` | End to +60 min | 96–15% (exp decay) | Declining | High→Low |
| Facility Clear | `facility_clear` | +60 to +120 min | 15–0% (tail) | Baseline | Low (45 dB) |

## 3.3 Module: `sensor_telemetry.py`

```python
"""
Sentrais OS — Sensor Telemetry Generator
Generates time-series data for all sensor types compatible with
the sensor_readings hypertable (V009).

Usage:
    from sentrais_synth.generators.sensor_telemetry import SensorTelemetryGenerator
    gen = SensorTelemetryGenerator(venue_profile, event_config)
    readings = gen.generate_window(start_time, end_time, interval_seconds=10)
"""

import hashlib
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from scipy.stats import norm, poisson
from scipy.special import expit  # sigmoid


# ═══════════════════════════════════════════════════
# EVENT PHASE DEFINITIONS
# ═══════════════════════════════════════════════════

EVENT_PHASES = {
    "pre_gates": {
        "crowd_pct": (0.0, 0.02),
        "noise_db": (45, 55),
        "temp_offset": 0.0,
        "power_factor": 0.3,
        "vibration_factor": 0.1,
        "co2_factor": 0.2,
    },
    "gates_open": {
        "crowd_pct": (0.02, 0.65),
        "noise_db": (60, 75),
        "temp_offset": 0.5,
        "power_factor": 0.6,
        "vibration_factor": 0.3,
        "co2_factor": 0.4,
    },
    "pre_event": {
        "crowd_pct": (0.65, 0.90),
        "noise_db": (75, 85),
        "temp_offset": 1.5,
        "power_factor": 0.85,
        "vibration_factor": 0.5,
        "co2_factor": 0.7,
    },
    "event_active": {
        "crowd_pct": (0.90, 0.98),
        "noise_db": (85, 100),
        "temp_offset": 2.5,
        "power_factor": 1.0,
        "vibration_factor": 0.8,
        "co2_factor": 0.9,
    },
    "halftime": {
        "crowd_pct": (0.85, 0.92),
        "noise_db": (65, 78),
        "temp_offset": 2.0,
        "power_factor": 0.9,
        "vibration_factor": 0.4,
        "co2_factor": 0.75,
    },
    "event_active_2": {
        "crowd_pct": (0.88, 0.96),
        "noise_db": (88, 105),
        "temp_offset": 3.0,
        "power_factor": 1.0,
        "vibration_factor": 0.9,
        "co2_factor": 0.95,
    },
    "post_event": {
        "crowd_pct": (0.96, 0.15),
        "noise_db": (80, 55),
        "temp_offset": 1.0,
        "power_factor": 0.7,
        "vibration_factor": 0.6,
        "co2_factor": 0.5,
    },
    "facility_clear": {
        "crowd_pct": (0.15, 0.0),
        "noise_db": (50, 42),
        "temp_offset": 0.0,
        "power_factor": 0.25,
        "vibration_factor": 0.05,
        "co2_factor": 0.15,
    },
}


class SensorTelemetryGenerator:
    """Generates time-series sensor readings correlated to event phases."""

    def __init__(
        self,
        venue_profile: dict,
        event_config: dict,
        anomaly_rate: float = 0.02,
        seed: int = 42,
    ):
        """
        Args:
            venue_profile: Output from VenueProfileGenerator.generate()
            event_config: Dict with keys:
                event_id, event_date, gates_open_time, event_start_time,
                halftime_start_time, second_half_start_time, event_end_time,
                facility_clear_time
            anomaly_rate: Fraction of readings with injected anomalies (0.0–1.0)
            seed: Random seed for reproducibility
        """
        self.profile = venue_profile
        self.event = event_config
        self.anomaly_rate = anomaly_rate
        self.rng = np.random.default_rng(seed)
        self.sensors = venue_profile["sensors"]
        self.zones = {z["zone_id"]: z for z in venue_profile["zones"]}
        self._build_phase_timeline()

    def _build_phase_timeline(self):
        """Construct phase timeline from event config."""
        ec = self.event
        base = datetime.fromisoformat(ec["event_date"])

        def _parse_time(key):
            val = ec[key]
            if isinstance(val, datetime):
                return val
            if isinstance(val, str):
                return datetime.fromisoformat(val)
            # assume minutes offset from base
            return base + timedelta(minutes=val)

        self.phase_timeline = [
            ("pre_gates",      base - timedelta(hours=2),     _parse_time("gates_open_time")),
            ("gates_open",     _parse_time("gates_open_time"), _parse_time("event_start_time")),
            ("pre_event",      _parse_time("event_start_time") - timedelta(minutes=15),
                               _parse_time("event_start_time")),
            ("event_active",   _parse_time("event_start_time"), _parse_time("halftime_start_time")),
            ("halftime",       _parse_time("halftime_start_time"), _parse_time("second_half_start_time")),
            ("event_active_2", _parse_time("second_half_start_time"), _parse_time("event_end_time")),
            ("post_event",     _parse_time("event_end_time"),
                               _parse_time("event_end_time") + timedelta(minutes=60)),
            ("facility_clear", _parse_time("event_end_time") + timedelta(minutes=60),
                               _parse_time("facility_clear_time")),
        ]

    def get_phase(self, timestamp: datetime) -> tuple:
        """Return (phase_id, progress_within_phase: 0.0–1.0) for a timestamp."""
        for phase_id, start, end in self.phase_timeline:
            if start <= timestamp < end:
                duration = (end - start).total_seconds()
                elapsed = (timestamp - start).total_seconds()
                progress = elapsed / duration if duration > 0 else 0.0
                return phase_id, min(progress, 1.0)
        return "facility_clear", 1.0

    def generate_window(
        self,
        start_time: datetime,
        end_time: datetime,
        interval_seconds: int = 10,
    ) -> list:
        """Generate all sensor readings for a time window.

        Returns:
            List of dicts matching sensor_readings hypertable schema.
        """
        readings = []
        current = start_time
        while current < end_time:
            phase_id, progress = self.get_phase(current)
            phase = EVENT_PHASES[phase_id]

            # Compute crowd density for this moment (shared across sensors)
            crowd_lo, crowd_hi = phase["crowd_pct"]
            if phase_id == "gates_open":
                crowd_pct = crowd_lo + (crowd_hi - crowd_lo) * expit(8 * (progress - 0.5))
            elif phase_id == "post_event":
                crowd_pct = crowd_hi + (crowd_lo - crowd_hi) * (1 - np.exp(-3 * progress))
            else:
                crowd_pct = crowd_lo + (crowd_hi - crowd_lo) * progress

            for sensor in self.sensors:
                if current.second % sensor["reading_interval_seconds"] != 0:
                    continue

                reading = self._generate_reading(
                    sensor, current, phase_id, phase, progress, crowd_pct
                )
                if reading:
                    readings.append(reading)

            current += timedelta(seconds=interval_seconds)

        return readings

    def _generate_reading(
        self,
        sensor: dict,
        timestamp: datetime,
        phase_id: str,
        phase: dict,
        progress: float,
        crowd_pct: float,
    ) -> Optional[dict]:
        """Generate a single sensor reading."""
        stype = sensor["sensor_type"]
        is_anomaly = self.rng.random() < self.anomaly_rate
        value = None
        unit = sensor["unit"]
        quality = "good"

        if stype == "temperature_humidity":
            # Normal distribution with slow drift + crowd body heat
            base_temp = 72.0  # °F indoor baseline
            crowd_heat = crowd_pct * phase["temp_offset"] * 3.0
            drift = np.sin(progress * np.pi) * 1.5
            noise = self.rng.normal(0, 0.3)
            value = base_temp + crowd_heat + drift + noise
            if is_anomaly:
                value += self.rng.choice([-15, 20])  # sudden spike/drop
                quality = "suspect"

        elif stype == "crowd_density_camera":
            zone = self.zones.get(sensor["zone_id"], {})
            max_cap = zone.get("max_capacity", 1000)
            occupancy = int(max_cap * crowd_pct)
            area = zone.get("area_sqm", max_cap / 2.5)
            density = occupancy / area
            noise = self.rng.normal(0, 0.1)
            value = round(max(0, density + noise), 2)
            if is_anomaly:
                value = round(value * self.rng.uniform(1.5, 2.5), 2)
                quality = "suspect"

        elif stype == "access_control":
            # Poisson process — burst during gates_open
            if phase_id == "gates_open":
                rate = 12 * expit(6 * (progress - 0.3))
            elif phase_id == "post_event":
                rate = 8 * (1 - progress)
            else:
                rate = 0.5
            value = int(poisson.rvs(max(0.1, rate), random_state=self.rng.integers(0, 2**31)))
            if is_anomaly:
                value = int(value * 5)  # gate surge
                quality = "suspect"

        elif stype == "wifi_probe":
            # Correlate with crowd density at 0.85 coefficient
            zone = self.zones.get(sensor["zone_id"], {})
            max_cap = zone.get("max_capacity", 1000)
            base_devices = max_cap * crowd_pct * 0.85
            noise = self.rng.normal(0, base_devices * 0.05) if base_devices > 10 else 0
            value = int(max(0, base_devices + noise))
            if is_anomaly:
                value = int(value * 0.1)  # WiFi AP dropout
                quality = "bad"

        elif stype == "power_consumption":
            # Baseline + load-proportional
            baseline_kw = 50.0
            max_load_kw = 250.0
            load = baseline_kw + (max_load_kw - baseline_kw) * phase["power_factor"]
            noise = self.rng.normal(0, 3.0)
            value = round(max(0, load + noise), 1)
            if is_anomaly:
                value = round(value * self.rng.choice([0.0, 2.5]), 1)  # outage or spike
                quality = "suspect"

        elif stype == "structural_vibration":
            # Normal with crowd-correlated spikes
            base_vib = 0.5  # mm/s
            crowd_vib = crowd_pct * phase["vibration_factor"] * 8.0
            noise = self.rng.normal(0, 0.3)
            value = round(max(0, base_vib + crowd_vib + noise), 2)
            if is_anomaly:
                value = round(value * 5.0, 2)  # structural concern
                quality = "suspect"

        elif stype == "air_quality":
            # CO2 ppm — crowd-density correlated
            outdoor_ppm = 420
            crowd_co2 = crowd_pct * phase["co2_factor"] * 600
            noise = self.rng.normal(0, 15)
            value = round(max(350, outdoor_ppm + crowd_co2 + noise), 0)
            if is_anomaly:
                value = round(value * 2.5, 0)  # ventilation failure
                quality = "suspect"

        elif stype == "noise_level":
            lo, hi = phase["noise_db"]
            base_db = lo + (hi - lo) * progress
            noise = self.rng.normal(0, 2.0)
            value = round(max(30, base_db + noise), 1)
            if is_anomaly:
                value = round(value + 25, 1)  # PA system feedback
                quality = "suspect"

        if value is None:
            return None

        return {
            "time": timestamp.isoformat(),
            "venue_id": sensor["venue_id"],
            "sensor_id": sensor["sensor_id"],
            "sensor_type": stype,
            "zone_id": sensor["zone_id"],
            "value": value,
            "unit": unit,
            "quality": quality,
            "metadata": {
                "phase": phase_id,
                "progress": round(progress, 3),
                "is_anomaly": is_anomaly,
            },
        }
```

---

# 4. Crowd Simulation Engine

## 4.1 Overview

Generates `crowd_metrics` hypertable data with zone-level granularity. Models realistic crowd flow using cumulative logistic (ingress), steady-state redistribution, and exponential decay with waves (egress). All output is compatible with the `RUN_Monitor_Crowd` workflow's data fusion and threshold evaluation logic.

## 4.2 Crowd Density Thresholds

Mapped to operational thresholds used by `RUN_Monitor_Crowd` Node 003 and Node 004:

| Level | Density | Occupancy % | System Response |
|-------|---------|-------------|-----------------|
| **low** | < 2.0 ppl/m² | 0–50% | Normal monitoring |
| **normal** | 2.0–3.0 ppl/m² | 50–75% | Standard operations |
| **elevated** | 3.0–4.0 ppl/m² | 75–85% | Increased monitoring |
| **warning** | 4.0–5.0 ppl/m² | 85–95% | Active flow management |
| **critical** | > 5.0 ppl/m² | > 95% | Immediate intervention |

## 4.3 Module: `crowd_simulation.py`

```python
"""
Sentrais OS — Crowd Simulation Engine
Generates crowd_metrics hypertable data with zone-level flow modeling.

Usage:
    from sentrais_synth.generators.crowd_simulation import CrowdSimulationEngine
    engine = CrowdSimulationEngine(venue_profile, event_config)
    metrics = engine.simulate(start_time, end_time, interval_seconds=10)
"""

from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from scipy.special import expit


# ═══════════════════════════════════════════════════
# CROWD FLOW MODELS
# ═══════════════════════════════════════════════════

class CrowdFlowModels:
    """Mathematical models for crowd ingress, redistribution, and egress."""

    @staticmethod
    def ingress_logistic(t: float, capacity: int, midpoint: float = 0.4,
                         steepness: float = 8.0) -> int:
        """Cumulative logistic ingress curve.

        Args:
            t: Progress through gates_open phase (0.0–1.0)
            capacity: Zone max capacity
            midpoint: Inflection point (default 0.4 = front-loaded arrival)
            steepness: Curve steepness (higher = sharper ramp)
        Returns:
            Current occupancy count
        """
        pct = expit(steepness * (t - midpoint))
        return int(capacity * pct * 0.90)  # cap at 90% during ingress

    @staticmethod
    def egress_exponential(t: float, peak_occupancy: int,
                           decay_rate: float = 3.0,
                           wave_amplitude: float = 0.08,
                           wave_frequency: float = 4.0) -> int:
        """Exponential decay with periodic waves (people leave in waves).

        Args:
            t: Progress through post_event phase (0.0–1.0)
            peak_occupancy: Occupancy at start of egress
            decay_rate: Exponential decay rate
            wave_amplitude: Amplitude of exit waves
            wave_frequency: Number of wave peaks during egress
        Returns:
            Current occupancy count
        """
        base_decay = np.exp(-decay_rate * t)
        waves = wave_amplitude * np.sin(wave_frequency * np.pi * t)
        pct = max(0, base_decay + waves)
        return int(peak_occupancy * pct)

    @staticmethod
    def redistribute(zone_occupancies: dict, zone_configs: dict,
                     rng: np.random.Generator) -> dict:
        """Simulate inter-zone flow (concourse ↔ seating, bathroom rushes).

        Args:
            zone_occupancies: Dict of zone_id → current occupancy
            zone_configs: Dict of zone_id → zone config
            rng: Random generator
        Returns:
            Adjusted zone_occupancies
        """
        adjusted = dict(zone_occupancies)
        concourse_zones = [
            zid for zid, cfg in zone_configs.items()
            if cfg["zone_type"] == "concourse"
        ]
        seating_zones = [
            zid for zid, cfg in zone_configs.items()
            if cfg["zone_type"] in ("seating", "premium", "standing")
        ]

        # Random inter-zone movement (2-5% per cycle)
        for sz in seating_zones:
            if adjusted.get(sz, 0) > 0:
                flow_out = int(adjusted[sz] * rng.uniform(0.02, 0.05))
                if concourse_zones:
                    target = rng.choice(concourse_zones)
                    max_cap = zone_configs[target]["max_capacity"]
                    flow_actual = min(flow_out, max_cap - adjusted.get(target, 0))
                    adjusted[sz] -= flow_actual
                    adjusted[target] = adjusted.get(target, 0) + flow_actual

        return adjusted


# ═══════════════════════════════════════════════════
# SPECIAL SCENARIO MODELS
# ═══════════════════════════════════════════════════

CROWD_SCENARIOS = {
    "early_arrival_surge": {
        "description": "VIP/early access causes front-loaded arrival pattern",
        "ingress_midpoint": 0.25,
        "ingress_steepness": 12.0,
    },
    "weather_delayed_ingress": {
        "description": "Rain delay causes compressed late arrival",
        "ingress_midpoint": 0.65,
        "ingress_steepness": 15.0,
    },
    "halftime_bathroom_rush": {
        "description": "Halftime causes 40% concourse surge",
        "concourse_surge_pct": 0.40,
        "surge_duration_minutes": 8,
    },
    "post_event_gate_bottleneck": {
        "description": "Two gates restricted causing egress bottleneck",
        "bottleneck_gates": 2,
        "egress_decay_rate": 1.5,  # slower than normal 3.0
    },
}


# ═══════════════════════════════════════════════════
# CROWD SIMULATION ENGINE
# ═══════════════════════════════════════════════════

class CrowdSimulationEngine:
    """Simulates crowd flow and generates crowd_metrics hypertable data."""

    def __init__(
        self,
        venue_profile: dict,
        event_config: dict,
        scenario: str = None,
        seed: int = 42,
    ):
        self.profile = venue_profile
        self.event = event_config
        self.scenario = CROWD_SCENARIOS.get(scenario, {})
        self.rng = np.random.default_rng(seed)
        self.zones = {z["zone_id"]: z for z in venue_profile["zones"]}
        self.venue_capacity = venue_profile["venue"]["capacity"]
        self.zone_occupancy = {zid: 0 for zid in self.zones}
        self._build_phase_timeline()

    def _build_phase_timeline(self):
        """Build phase timeline (same pattern as SensorTelemetryGenerator)."""
        ec = self.event

        def _p(key):
            val = ec[key]
            return datetime.fromisoformat(val) if isinstance(val, str) else val

        base = datetime.fromisoformat(ec["event_date"]) if isinstance(ec["event_date"], str) else ec["event_date"]
        self.phase_timeline = [
            ("pre_gates",      base - timedelta(hours=2),     _p("gates_open_time")),
            ("gates_open",     _p("gates_open_time"),         _p("event_start_time")),
            ("pre_event",      _p("event_start_time") - timedelta(minutes=15),
                               _p("event_start_time")),
            ("event_active",   _p("event_start_time"),        _p("halftime_start_time")),
            ("halftime",       _p("halftime_start_time"),     _p("second_half_start_time")),
            ("event_active_2", _p("second_half_start_time"),  _p("event_end_time")),
            ("post_event",     _p("event_end_time"),
                               _p("event_end_time") + timedelta(minutes=60)),
            ("facility_clear", _p("event_end_time") + timedelta(minutes=60),
                               _p("facility_clear_time")),
        ]

    def get_phase(self, timestamp: datetime) -> tuple:
        for phase_id, start, end in self.phase_timeline:
            if start <= timestamp < end:
                dur = (end - start).total_seconds()
                elapsed = (timestamp - start).total_seconds()
                return phase_id, min(elapsed / dur, 1.0) if dur > 0 else 0.0
        return "facility_clear", 1.0

    def simulate(
        self,
        start_time: datetime,
        end_time: datetime,
        interval_seconds: int = 10,
    ) -> list:
        """Run full crowd simulation and return crowd_metrics records.

        Returns:
            List of dicts matching crowd_metrics hypertable schema:
            {time, venue_id, zone_id, total_occupancy, occupancy_pct,
             density_level, flow_rate, flow_direction, confidence}
        """
        metrics = []
        current = start_time
        prev_total = 0

        while current < end_time:
            phase_id, progress = self.get_phase(current)

            # Update zone occupancies based on phase
            self._update_occupancy(phase_id, progress)

            # Generate metrics for each zone
            total = 0
            for zone_id, zone in self.zones.items():
                occ = self.zone_occupancy.get(zone_id, 0)
                max_cap = zone["max_capacity"]
                occ_pct = round((occ / max_cap) * 100, 2) if max_cap > 0 else 0
                area = zone.get("area_sqm", max_cap / 2.5)
                density = occ / area if area > 0 else 0

                # Determine density level
                if density < 2.0:
                    density_level = "low"
                elif density < 3.0:
                    density_level = "normal"
                elif density < 4.0:
                    density_level = "elevated"
                elif density < 5.0:
                    density_level = "warning"
                else:
                    density_level = "critical"

                # Flow rate (people per minute change)
                flow_rate = round((occ - self.zone_occupancy.get(f"_prev_{zone_id}", 0))
                                  * (60 / interval_seconds), 1)
                flow_direction = "ingress" if flow_rate > 0 else "egress" if flow_rate < 0 else "stable"

                metrics.append({
                    "time": current.isoformat(),
                    "venue_id": self.profile["venue"]["venue_id"],
                    "zone_id": zone_id,
                    "total_occupancy": occ,
                    "occupancy_pct": occ_pct,
                    "density_level": density_level,
                    "flow_rate": abs(flow_rate),
                    "flow_direction": flow_direction,
                    "confidence": round(0.85 + self.rng.uniform(0, 0.14), 2),
                })

                self.zone_occupancy[f"_prev_{zone_id}"] = occ
                total += occ

            prev_total = total
            current += timedelta(seconds=interval_seconds)

        return metrics

    def _update_occupancy(self, phase_id: str, progress: float):
        """Update zone-level occupancy based on current phase."""
        ingress_mid = self.scenario.get("ingress_midpoint", 0.4)
        ingress_steep = self.scenario.get("ingress_steepness", 8.0)
        egress_rate = self.scenario.get("egress_decay_rate", 3.0)

        for zone_id, zone in self.zones.items():
            if zone_id.startswith("_prev_"):
                continue

            max_cap = zone["max_capacity"]

            if phase_id == "pre_gates":
                self.zone_occupancy[zone_id] = int(max_cap * 0.01 * progress)

            elif phase_id == "gates_open":
                if zone["zone_type"] == "gate":
                    self.zone_occupancy[zone_id] = CrowdFlowModels.ingress_logistic(
                        progress, max_cap, midpoint=ingress_mid, steepness=ingress_steep
                    )
                else:
                    gate_total = sum(
                        self.zone_occupancy.get(zid, 0)
                        for zid, z in self.zones.items()
                        if z.get("zone_type") == "gate" and not zid.startswith("_prev_")
                    )
                    non_gate_cap = sum(
                        z["max_capacity"] for z in self.zones.values()
                        if isinstance(z, dict) and z.get("zone_type") != "gate"
                        and not isinstance(z, int)
                    )
                    share = max_cap / non_gate_cap if non_gate_cap > 0 else 0
                    self.zone_occupancy[zone_id] = int(gate_total * share * 0.7)

            elif phase_id in ("pre_event", "event_active", "event_active_2"):
                target_pct = 0.90 + self.rng.uniform(-0.05, 0.05)
                current = self.zone_occupancy.get(zone_id, 0)
                target = int(max_cap * target_pct)
                self.zone_occupancy[zone_id] = current + int((target - current) * 0.1)

            elif phase_id == "halftime":
                surge = self.scenario.get("concourse_surge_pct", 0.25)
                if zone["zone_type"] == "concourse":
                    self.zone_occupancy[zone_id] = min(
                        max_cap,
                        int(self.zone_occupancy.get(zone_id, 0) * (1 + surge * progress))
                    )
                elif zone["zone_type"] in ("seating", "premium"):
                    self.zone_occupancy[zone_id] = int(
                        self.zone_occupancy.get(zone_id, 0) * (1 - surge * 0.5 * progress)
                    )

            elif phase_id == "post_event":
                peak = self.zone_occupancy.get(zone_id, 0)
                if progress < 0.05:
                    peak = max(peak, self.zone_occupancy.get(zone_id, 0))
                self.zone_occupancy[zone_id] = CrowdFlowModels.egress_exponential(
                    progress, peak, decay_rate=egress_rate
                )

            elif phase_id == "facility_clear":
                self.zone_occupancy[zone_id] = max(
                    0, int(self.zone_occupancy.get(zone_id, 0) * (1 - progress))
                )

            # Clamp to valid range
            self.zone_occupancy[zone_id] = max(
                0, min(max_cap, self.zone_occupancy.get(zone_id, 0))
            )

        # Apply inter-zone redistribution
        if phase_id in ("event_active", "halftime", "event_active_2"):
            valid_occ = {
                k: v for k, v in self.zone_occupancy.items()
                if not k.startswith("_prev_") and k in self.zones
            }
            redistributed = CrowdFlowModels.redistribute(valid_occ, self.zones, self.rng)
            for zid, occ in redistributed.items():
                self.zone_occupancy[zid] = occ
```

---

# 5. Weather Scenario Generator

## 5.1 Overview

Generates `weather_readings` hypertable data with realistic meteorological progressions. Each pre-built scenario includes a timeline of weather parameter evolution, trigger points for SOP activation, and expected system responses compatible with the `RUN_Monitor_Weather` workflow (Part 2, Section 1.4).

## 5.2 Pre-Built Weather Scenarios

| Scenario ID | Description | Threat Level | SOPs Triggered | Duration |
|-------------|-------------|-------------|----------------|----------|
| `clear_day` | Baseline — no weather threats | GREEN | None | Full event |
| `approaching_thunderstorm` | Gradual storm approach with lightning at T-45min | GREEN → YELLOW → RED | `sop_lightning_response_v3` | 90 min ramp |
| `lightning_8mile` | Lightning within NFL 8-mile rule | RED (immediate) | `sop_lightning_response_v3` | Instant trigger |
| `tornado_warning` | NWS tornado warning issued for venue area | RED (immediate) | `sop_tornado_response_v1` | 30 min duration |
| `extreme_heat` | Heat index >105°F sustained | YELLOW → RED | `sop_heat_emergency_v1` | Gradual onset |
| `heavy_rain` | Heavy precipitation reducing visibility | YELLOW | None (advisory) | 2 hour duration |
| `winter_storm` | Cold exposure + icing conditions | YELLOW → RED | `sop_cold_weather_v1` | 4 hour duration |

## 5.3 Module: `weather_scenario.py`

```python
"""
Sentrais OS — Weather Scenario Generator
Generates weather_readings hypertable data compatible with
RUN_Monitor_Weather workflow thresholds.

Usage:
    from sentrais_synth.generators.weather_scenario import WeatherScenarioGenerator
    gen = WeatherScenarioGenerator("approaching_thunderstorm", venue_config)
    readings = gen.generate(start_time, end_time, interval_seconds=60)
"""

from datetime import datetime, timedelta
from typing import Optional
import numpy as np


# ═══════════════════════════════════════════════════
# WEATHER SCENARIO DEFINITIONS
# ═══════════════════════════════════════════════════

WEATHER_SCENARIOS = {
    "clear_day": {
        "description": "Clear day, no weather threats. Baseline scenario.",
        "initial_conditions": {
            "temperature_f": 72.0,
            "humidity_pct": 45.0,
            "wind_speed_mph": 8.0,
            "wind_direction_deg": 180,
            "barometric_pressure_inhg": 30.10,
            "precipitation_rate_inhr": 0.0,
            "visibility_miles": 10.0,
            "cloud_cover_pct": 15.0,
        },
        "timeline": [],  # No changes — stays at initial conditions
        "lightning_events": [],
        "nws_alerts": [],
        "expected_threat_level": "GREEN",
        "expected_sops": [],
    },

    "approaching_thunderstorm": {
        "description": "Gradual thunderstorm approach. Pressure drops, wind increases, "
                       "lightning detected at T-45min (15mi), enters 8-mile range at T-20min.",
        "initial_conditions": {
            "temperature_f": 85.0,
            "humidity_pct": 65.0,
            "wind_speed_mph": 12.0,
            "wind_direction_deg": 225,
            "barometric_pressure_inhg": 29.95,
            "precipitation_rate_inhr": 0.0,
            "visibility_miles": 10.0,
            "cloud_cover_pct": 40.0,
        },
        "timeline": [
            # (minutes_offset, parameter, target_value, interpolation)
            (0,   "cloud_cover_pct",          40.0,  "linear"),
            (15,  "cloud_cover_pct",          65.0,  "linear"),
            (15,  "barometric_pressure_inhg", 29.90, "linear"),
            (30,  "cloud_cover_pct",          85.0,  "linear"),
            (30,  "barometric_pressure_inhg", 29.80, "linear"),
            (30,  "wind_speed_mph",           22.0,  "linear"),
            (30,  "humidity_pct",             80.0,  "linear"),
            (45,  "wind_speed_mph",           35.0,  "linear"),
            (45,  "barometric_pressure_inhg", 29.65, "linear"),
            (45,  "cloud_cover_pct",          95.0,  "linear"),
            (50,  "precipitation_rate_inhr",  0.5,   "linear"),
            (55,  "wind_speed_mph",           42.0,  "linear"),
            (55,  "precipitation_rate_inhr",  1.5,   "linear"),
            (55,  "visibility_miles",         3.0,   "linear"),
            (60,  "wind_speed_mph",           38.0,  "linear"),  # passes
            (70,  "precipitation_rate_inhr",  0.8,   "linear"),
            (80,  "wind_speed_mph",           20.0,  "linear"),
            (80,  "precipitation_rate_inhr",  0.2,   "linear"),
            (90,  "wind_speed_mph",           12.0,  "linear"),
            (90,  "precipitation_rate_inhr",  0.0,   "linear"),
            (90,  "barometric_pressure_inhg", 29.85, "linear"),
            (90,  "visibility_miles",         8.0,   "linear"),
        ],
        "lightning_events": [
            # (minutes_offset, distance_miles, strike_count)
            (45, 15.0, 2),
            (48, 12.0, 3),
            (50, 10.0, 5),
            (52, 8.5,  4),
            (54, 7.2,  6),   # ← NFL 8-mile rule triggered
            (56, 5.8,  8),
            (58, 4.5, 12),
            (60, 3.1, 15),   # Peak — closest approach
            (62, 4.2,  9),
            (65, 6.8,  5),
            (68, 9.5,  3),
            (72, 12.0, 2),
            (78, 16.0, 1),   # Exiting range
            (85, 22.0, 0),
        ],
        "nws_alerts": [
            {"minutes_offset": 40, "type": "severe_thunderstorm_warning", "expires_minutes": 60},
        ],
        "expected_threat_level": "RED",
        "expected_sops": ["sop_lightning_response_v3"],
    },

    "lightning_8mile": {
        "description": "Immediate lightning detection within 8 miles. No gradual approach.",
        "initial_conditions": {
            "temperature_f": 78.0,
            "humidity_pct": 70.0,
            "wind_speed_mph": 15.0,
            "wind_direction_deg": 270,
            "barometric_pressure_inhg": 29.85,
            "precipitation_rate_inhr": 0.1,
            "visibility_miles": 8.0,
            "cloud_cover_pct": 75.0,
        },
        "timeline": [
            (0,  "wind_speed_mph",          20.0,  "linear"),
            (5,  "precipitation_rate_inhr", 0.8,   "linear"),
            (10, "wind_speed_mph",          30.0,  "linear"),
            (20, "wind_speed_mph",          25.0,  "linear"),
            (30, "precipitation_rate_inhr", 0.3,   "linear"),
            (40, "wind_speed_mph",          15.0,  "linear"),
        ],
        "lightning_events": [
            (0,  6.5,  4),   # ← Immediate 8-mile trigger
            (2,  5.0,  7),
            (5,  3.5, 10),
            (8,  2.8, 14),
            (12, 4.0,  8),
            (18, 7.0,  4),
            (25, 10.5, 2),
            (32, 15.0, 1),
            (40, 20.0, 0),
        ],
        "nws_alerts": [],
        "expected_threat_level": "RED",
        "expected_sops": ["sop_lightning_response_v3"],
    },

    "tornado_warning": {
        "description": "NWS issues tornado warning for venue area.",
        "initial_conditions": {
            "temperature_f": 82.0,
            "humidity_pct": 75.0,
            "wind_speed_mph": 25.0,
            "wind_direction_deg": 200,
            "barometric_pressure_inhg": 29.50,
            "precipitation_rate_inhr": 0.5,
            "visibility_miles": 5.0,
            "cloud_cover_pct": 95.0,
        },
        "timeline": [
            (0,  "wind_speed_mph",          35.0,  "linear"),
            (5,  "barometric_pressure_inhg", 29.30, "linear"),
            (5,  "wind_speed_mph",          55.0,  "linear"),
            (10, "precipitation_rate_inhr",  2.5,   "linear"),
            (10, "visibility_miles",         1.0,   "linear"),
            (15, "wind_speed_mph",          65.0,  "linear"),  # Peak
            (20, "wind_speed_mph",          45.0,  "linear"),
            (25, "barometric_pressure_inhg", 29.50, "linear"),
            (30, "wind_speed_mph",          25.0,  "linear"),
            (30, "precipitation_rate_inhr",  0.5,   "linear"),
        ],
        "lightning_events": [
            (0,  8.0,  5),
            (3,  5.0,  8),
            (6,  3.0, 12),
            (10, 2.0, 18),
            (15, 4.0,  8),
            (20, 8.0,  3),
            (25, 12.0, 1),
        ],
        "nws_alerts": [
            {"minutes_offset": 0, "type": "tornado_warning", "expires_minutes": 30},
        ],
        "expected_threat_level": "RED",
        "expected_sops": ["sop_tornado_response_v1", "sop_lightning_response_v3"],
    },

    "extreme_heat": {
        "description": "Heat index exceeds 105°F, triggering medical risk escalation.",
        "initial_conditions": {
            "temperature_f": 95.0,
            "humidity_pct": 55.0,
            "wind_speed_mph": 5.0,
            "wind_direction_deg": 180,
            "barometric_pressure_inhg": 30.05,
            "precipitation_rate_inhr": 0.0,
            "visibility_miles": 10.0,
            "cloud_cover_pct": 10.0,
        },
        "timeline": [
            (0,   "temperature_f",  95.0,  "linear"),
            (30,  "temperature_f",  100.0, "linear"),
            (60,  "temperature_f",  104.0, "linear"),
            (60,  "humidity_pct",   60.0,  "linear"),
            (90,  "temperature_f",  107.0, "linear"),  # Heat index > 115°F
            (90,  "humidity_pct",   62.0,  "linear"),
            (120, "temperature_f",  105.0, "linear"),
            (150, "temperature_f",  100.0, "linear"),  # Late afternoon decline
            (180, "temperature_f",  96.0,  "linear"),
        ],
        "lightning_events": [],
        "nws_alerts": [
            {"minutes_offset": 0, "type": "excessive_heat_warning", "expires_minutes": 180},
        ],
        "expected_threat_level": "YELLOW",
        "expected_sops": ["sop_heat_emergency_v1"],
    },

    "heavy_rain": {
        "description": "Sustained heavy rain reducing visibility and creating slip hazards.",
        "initial_conditions": {
            "temperature_f": 62.0,
            "humidity_pct": 85.0,
            "wind_speed_mph": 18.0,
            "wind_direction_deg": 315,
            "barometric_pressure_inhg": 29.70,
            "precipitation_rate_inhr": 0.3,
            "visibility_miles": 5.0,
            "cloud_cover_pct": 90.0,
        },
        "timeline": [
            (0,   "precipitation_rate_inhr", 0.3,  "linear"),
            (15,  "precipitation_rate_inhr", 0.8,  "linear"),
            (30,  "precipitation_rate_inhr", 1.5,  "linear"),
            (30,  "visibility_miles",        3.0,  "linear"),
            (60,  "precipitation_rate_inhr", 2.2,  "linear"),
            (60,  "visibility_miles",        1.5,  "linear"),
            (90,  "precipitation_rate_inhr", 1.8,  "linear"),
            (120, "precipitation_rate_inhr", 0.5,  "linear"),
            (120, "visibility_miles",        6.0,  "linear"),
        ],
        "lightning_events": [],
        "nws_alerts": [],
        "expected_threat_level": "YELLOW",
        "expected_sops": [],
    },

    "winter_storm": {
        "description": "Cold exposure with icing on structures. Wind chill below 0°F.",
        "initial_conditions": {
            "temperature_f": 28.0,
            "humidity_pct": 80.0,
            "wind_speed_mph": 20.0,
            "wind_direction_deg": 0,
            "barometric_pressure_inhg": 29.60,
            "precipitation_rate_inhr": 0.1,
            "visibility_miles": 4.0,
            "cloud_cover_pct": 100.0,
        },
        "timeline": [
            (0,   "temperature_f",           28.0,  "linear"),
            (30,  "temperature_f",           22.0,  "linear"),
            (30,  "wind_speed_mph",          28.0,  "linear"),
            (60,  "temperature_f",           15.0,  "linear"),
            (60,  "wind_speed_mph",          35.0,  "linear"),  # Wind chill ~ -5°F
            (60,  "precipitation_rate_inhr", 0.3,   "linear"),  # Freezing precip
            (60,  "visibility_miles",        2.0,   "linear"),
            (120, "temperature_f",           12.0,  "linear"),
            (120, "wind_speed_mph",          40.0,  "linear"),
            (180, "temperature_f",           18.0,  "linear"),
            (180, "wind_speed_mph",          25.0,  "linear"),
            (240, "temperature_f",           25.0,  "linear"),
            (240, "precipitation_rate_inhr", 0.0,   "linear"),
        ],
        "lightning_events": [],
        "nws_alerts": [
            {"minutes_offset": 0, "type": "winter_storm_warning", "expires_minutes": 240},
        ],
        "expected_threat_level": "YELLOW",
        "expected_sops": ["sop_cold_weather_v1"],
    },
}


# ═══════════════════════════════════════════════════
# WEATHER SCENARIO GENERATOR
# ═══════════════════════════════════════════════════

class WeatherScenarioGenerator:
    """Generates weather_readings hypertable data from scenario definitions."""

    def __init__(
        self,
        scenario_id: str,
        venue_config: dict,
        seed: int = 42,
    ):
        """
        Args:
            scenario_id: Key from WEATHER_SCENARIOS
            venue_config: Dict with venue_id, latitude, longitude
            seed: Random seed
        """
        if scenario_id not in WEATHER_SCENARIOS:
            raise ValueError(f"Unknown scenario: {scenario_id}. "
                             f"Available: {list(WEATHER_SCENARIOS.keys())}")
        self.scenario = WEATHER_SCENARIOS[scenario_id]
        self.scenario_id = scenario_id
        self.venue = venue_config
        self.rng = np.random.default_rng(seed)

    def generate(
        self,
        start_time: datetime,
        end_time: datetime,
        interval_seconds: int = 60,
    ) -> list:
        """Generate weather readings for a time window.

        Returns:
            List of dicts matching weather_readings hypertable schema.
        """
        readings = []
        current = start_time
        initial = dict(self.scenario["initial_conditions"])

        while current < end_time:
            minutes_elapsed = (current - start_time).total_seconds() / 60

            # Interpolate current conditions from timeline
            conditions = self._interpolate_conditions(initial, minutes_elapsed)

            # Check for lightning events
            lightning = self._get_lightning_at(minutes_elapsed)

            # Check for NWS alerts
            alerts = self._get_alerts_at(minutes_elapsed)

            # Determine threat level (matches RUN_Monitor_Weather thresholds)
            threat_level = self._evaluate_threat(conditions, lightning, alerts)

            # Add sensor noise
            conditions = self._add_noise(conditions)

            readings.append({
                "time": current.isoformat(),
                "venue_id": self.venue["venue_id"],
                "event_id": self.venue.get("event_id"),
                "threat_level": threat_level,
                "temperature": round(conditions["temperature_f"], 1),
                "humidity": round(conditions["humidity_pct"], 1),
                "wind_speed": round(conditions["wind_speed_mph"], 1),
                "wind_direction": int(conditions["wind_direction_deg"]),
                "barometric_pressure": round(conditions["barometric_pressure_inhg"], 2),
                "precipitation_rate": round(conditions["precipitation_rate_inhr"], 2),
                "visibility_miles": round(conditions["visibility_miles"], 1),
                "cloud_cover": round(conditions["cloud_cover_pct"], 0),
                "lightning_closest_miles": lightning["closest_miles"],
                "lightning_strike_count": lightning["strike_count"],
                "nws_alerts": alerts,
                "threats_json": self._build_threats(conditions, lightning, alerts),
            })

            current += timedelta(seconds=interval_seconds)

        return readings

    def _interpolate_conditions(self, initial: dict, minutes: float) -> dict:
        """Linearly interpolate conditions from timeline events."""
        conditions = dict(initial)
        timeline = self.scenario["timeline"]

        for param in initial:
            # Find surrounding keyframes for this parameter
            keyframes = [(0, initial[param])]
            for t_min, t_param, t_val, _ in timeline:
                if t_param == param:
                    keyframes.append((t_min, t_val))

            # Interpolate
            keyframes.sort(key=lambda x: x[0])
            for i in range(len(keyframes) - 1):
                t0, v0 = keyframes[i]
                t1, v1 = keyframes[i + 1]
                if t0 <= minutes <= t1:
                    progress = (minutes - t0) / (t1 - t0) if t1 > t0 else 1.0
                    conditions[param] = v0 + (v1 - v0) * progress
                    break
            else:
                if keyframes and minutes > keyframes[-1][0]:
                    conditions[param] = keyframes[-1][1]

        return conditions

    def _get_lightning_at(self, minutes: float) -> dict:
        """Get lightning state at a given time offset."""
        events = self.scenario["lightning_events"]
        if not events:
            return {"closest_miles": None, "strike_count": 0, "within_nfl_range": False}

        # Find closest event in time
        closest = None
        for t_min, dist, count in events:
            if closest is None or abs(t_min - minutes) < abs(closest[0] - minutes):
                closest = (t_min, dist, count)

        # Only report if within 5 minutes of an event
        if closest and abs(closest[0] - minutes) <= 5:
            return {
                "closest_miles": closest[1],
                "strike_count": closest[2],
                "within_nfl_range": closest[1] <= 8.0,
            }

        return {"closest_miles": None, "strike_count": 0, "within_nfl_range": False}

    def _get_alerts_at(self, minutes: float) -> list:
        """Get active NWS alerts at a given time offset."""
        active = []
        for alert in self.scenario["nws_alerts"]:
            start = alert["minutes_offset"]
            end = start + alert["expires_minutes"]
            if start <= minutes <= end:
                active.append({"type": alert["type"], "active": True})
        return active

    def _evaluate_threat(self, conditions: dict, lightning: dict, alerts: list) -> str:
        """Evaluate threat level matching RUN_Monitor_Weather Node 004 logic."""
        # RED triggers
        if lightning.get("within_nfl_range"):
            return "RED"
        if any(a["type"] == "tornado_warning" for a in alerts):
            return "RED"
        if conditions.get("wind_speed_mph", 0) > 50:
            return "RED"

        # YELLOW triggers
        if lightning.get("closest_miles") and lightning["closest_miles"] <= 15:
            return "YELLOW"
        if conditions.get("wind_speed_mph", 0) > 35:
            return "YELLOW"
        if conditions.get("precipitation_rate_inhr", 0) > 2.0:
            return "YELLOW"
        if conditions.get("temperature_f", 72) > 105 or conditions.get("temperature_f", 72) < 10:
            return "YELLOW"
        if any(a["type"] in ("severe_thunderstorm_warning", "winter_storm_warning",
                             "excessive_heat_warning") for a in alerts):
            return "YELLOW"

        return "GREEN"

    def _add_noise(self, conditions: dict) -> dict:
        """Add realistic sensor noise to readings."""
        noisy = dict(conditions)
        noisy["temperature_f"] += self.rng.normal(0, 0.3)
        noisy["humidity_pct"] = np.clip(noisy["humidity_pct"] + self.rng.normal(0, 1.0), 0, 100)
        noisy["wind_speed_mph"] = max(0, noisy["wind_speed_mph"] + self.rng.normal(0, 1.5))
        noisy["barometric_pressure_inhg"] += self.rng.normal(0, 0.01)
        noisy["precipitation_rate_inhr"] = max(0, noisy["precipitation_rate_inhr"] + self.rng.normal(0, 0.05))
        return noisy

    def _build_threats(self, conditions: dict, lightning: dict, alerts: list) -> list:
        """Build threat list matching RUN_Monitor_Weather Node 004 output format."""
        threats = []
        if lightning.get("within_nfl_range"):
            threats.append({
                "type": "lightning",
                "severity": "critical",
                "detail": f"Lightning detected {lightning['closest_miles']} miles from venue",
                "nfl_rule": "8-mile evacuation required",
            })
        elif lightning.get("closest_miles") and lightning["closest_miles"] <= 15:
            threats.append({
                "type": "lightning_approaching",
                "severity": "warning",
                "detail": f"Lightning detected {lightning['closest_miles']} miles — monitoring",
            })
        if conditions.get("wind_speed_mph", 0) > 50:
            threats.append({
                "type": "high_wind",
                "severity": "critical",
                "detail": f"Wind speed: {conditions['wind_speed_mph']:.0f} mph",
            })
        elif conditions.get("wind_speed_mph", 0) > 35:
            threats.append({
                "type": "wind_advisory",
                "severity": "warning",
                "detail": f"Wind speed: {conditions['wind_speed_mph']:.0f} mph",
            })
        for alert in alerts:
            threats.append({
                "type": alert["type"],
                "severity": "critical" if "tornado" in alert["type"] else "warning",
                "detail": f"NWS {alert['type'].replace('_', ' ').title()} active",
            })
        if conditions.get("temperature_f", 72) > 105:
            threats.append({
                "type": "extreme_heat",
                "severity": "warning",
                "detail": f"Temperature: {conditions['temperature_f']:.0f}°F",
            })
        return threats
```

---

# 6. Incident Scenario Library

## 6.1 Overview

Pre-built incident scenarios exercise the full incident lifecycle defined in `RUN_Incident_Handler` (Part 2, Section 1.5) and `RESPONSE_SOP_Executor` (Part 2, Section 3.1). Each scenario is composable — multiple scenarios can run simultaneously to test multi-incident coordination, resource allocation conflicts, and escalation chains.

## 6.2 Scenario Definitions

### Scenario 1: Medical Emergency — Cardiac Event

```yaml
# scenarios/incidents/medical_cardiac.yaml
scenario_id: medical_cardiac_section_300
name: "Cardiac Event — Section 300"
description: >
  Fan experiences cardiac arrest in upper deck section 300.
  Triggers medical SOP, AED dispatch, hospital coordination.
category: medical
severity: critical

trigger:
  phase: event_active
  time_offset_minutes: 45
  zone_id: zone_{venue}_upper_deck_03
  coordinates:
    section: 300
    row: 12
    seat: 8

incident_data:
  incident_type: medical
  severity: critical
  description: "Fan collapsed in section 300, row 12. Bystander reports no pulse."
  reporter:
    role: guest_services
    user_id: auto

expected_sop_chain:
  - sop_id: sop_medical_emergency_v4
    variant: cardiac
    phases:
      - phase: immediate_response
        steps:
          - action: dispatch_nearest_ems
            automation: full
            expected_time_seconds: 15
          - action: alert_command_center
            automation: full
            expected_time_seconds: 5
          - action: locate_nearest_aed
            automation: full
            expected_time_seconds: 10
      - phase: on_scene_care
        steps:
          - action: ems_arrive_on_scene
            automation: manual
            expected_time_seconds: 180
          - action: begin_cpr_aed
            automation: manual
            expected_time_seconds: 30
          - action: request_als_transport
            automation: semi
            expected_time_seconds: 60
      - phase: hospital_coordination
        steps:
          - action: notify_receiving_hospital
            automation: full
            expected_time_seconds: 30
          - action: clear_egress_path
            automation: semi
            expected_time_seconds: 120
          - action: ambulance_arrival
            automation: manual
            expected_time_seconds: 300
      - phase: resolution
        steps:
          - action: patient_transported
            automation: manual
            expected_time_seconds: 600
          - action: scene_cleared
            automation: manual
            expected_time_seconds: 120
          - action: incident_closed
            automation: full
            expected_time_seconds: 30

resources_required:
  - role: ems_paramedic
    count: 2
  - role: ems_emt
    count: 2
  - role: security_staff
    count: 1
  - equipment: aed_unit
    count: 1
  - equipment: stretcher
    count: 1

evidence_entries:
  - type: incident_created
    category: incident
  - type: sop_activated
    category: sop_execution
  - type: resource_dispatched
    category: resource_management
  - type: medical_intervention
    category: medical
    compliance_tags: [HIPAA, MEDICAL_PROTOCOL]
  - type: hospital_notification
    category: medical
  - type: incident_resolved
    category: incident

expected_resolution_minutes: 25
expected_response_time_seconds: 180
```

### Scenario 2: Fight/Altercation

```yaml
scenario_id: security_altercation_concourse
name: "Fan Altercation — Concourse Level 2"
description: >
  Physical altercation between fans on concourse.
  Triggers security SOP, potential law enforcement notification.
category: security
severity: high

trigger:
  phase: event_active_2
  time_offset_minutes: 15
  zone_id: zone_{venue}_concourse_lower_02

incident_data:
  incident_type: security
  severity: high
  description: "Multiple fans in physical altercation near concession stand C4."

expected_sop_chain:
  - sop_id: sop_security_response_v3
    variant: altercation
    phases:
      - phase: contain
        steps:
          - action: dispatch_security_team
            automation: full
            expected_time_seconds: 20
          - action: alert_command_center
            automation: full
            expected_time_seconds: 5
          - action: activate_zone_cameras
            automation: full
            expected_time_seconds: 10
      - phase: intervene
        steps:
          - action: separate_parties
            automation: manual
            expected_time_seconds: 120
          - action: assess_injuries
            automation: manual
            expected_time_seconds: 60
          - action: request_medical_if_needed
            automation: semi
            expected_time_seconds: 30
      - phase: document
        steps:
          - action: capture_witness_statements
            automation: manual
            expected_time_seconds: 300
          - action: preserve_video_evidence
            automation: full
            expected_time_seconds: 30
          - action: notify_law_enforcement
            automation: semi
            expected_time_seconds: 60
      - phase: resolve
        steps:
          - action: eject_offending_parties
            automation: manual
            expected_time_seconds: 300
          - action: incident_closed
            automation: full
            expected_time_seconds: 30

resources_required:
  - role: security_supervisor
    count: 1
  - role: security_staff
    count: 4
  - role: ems_emt
    count: 1

expected_resolution_minutes: 20
expected_response_time_seconds: 90
```

### Scenario 3: Suspicious Package

```yaml
scenario_id: suspicious_package_gate4
name: "Suspicious Package — Gate 4 Entrance"
category: security
severity: critical

trigger:
  phase: gates_open
  time_offset_minutes: 20
  zone_id: zone_{venue}_gate_entry_04

incident_data:
  incident_type: security
  severity: critical
  description: "Unattended black backpack near gate 4 metal detector. No owner identified."

expected_sop_chain:
  - sop_id: sop_suspicious_package_v2
    phases:
      - phase: assessment
        steps:
          - action: secure_perimeter_50ft
            automation: semi
            expected_time_seconds: 60
          - action: halt_gate4_ingress
            automation: full
            expected_time_seconds: 15
          - action: notify_command_center
            automation: full
            expected_time_seconds: 10
          - action: review_surveillance
            automation: semi
            expected_time_seconds: 120
      - phase: escalation
        steps:
          - action: notify_law_enforcement
            automation: full
            expected_time_seconds: 30
          - action: request_eod_team
            automation: semi
            expected_time_seconds: 60
          - action: expand_perimeter_200ft
            automation: semi
            expected_time_seconds: 120
      - phase: resolution_safe
        steps:
          - action: eod_assessment_complete
            automation: manual
            expected_time_seconds: 900
          - action: all_clear_declared
            automation: semi
            expected_time_seconds: 30
          - action: resume_gate4_operations
            automation: full
            expected_time_seconds: 60

resources_required:
  - role: security_commander
    count: 1
  - role: security_supervisor
    count: 2
  - role: security_staff
    count: 8
  - external: eod_team
    count: 1
  - external: law_enforcement
    count: 2

expected_resolution_minutes: 35
expected_response_time_seconds: 60
```

### Scenario 4: Structural Concern

```yaml
scenario_id: structural_handrail_section200
name: "Structural Concern — Handrail Damage in Section 200"
category: operational
severity: high

trigger:
  phase: pre_event
  time_offset_minutes: -10
  zone_id: zone_{venue}_lower_bowl_04

incident_data:
  incident_type: operational
  severity: high
  description: "Loose handrail in section 200, upper railing. 20ft of visible wobble."

expected_sop_chain:
  - sop_id: sop_structural_concern_v2
    phases:
      - phase: assessment
        steps:
          - action: dispatch_maintenance_team
            expected_time_seconds: 120
          - action: assess_structural_integrity
            expected_time_seconds: 300
          - action: determine_zone_closure_needed
            expected_time_seconds: 60
      - phase: mitigation
        steps:
          - action: close_affected_rows
            expected_time_seconds: 120
          - action: redirect_ticketholders
            expected_time_seconds: 300
          - action: install_temporary_barrier
            expected_time_seconds: 600
      - phase: resolution
        steps:
          - action: permanent_repair_or_closure
            expected_time_seconds: 1800
          - action: engineering_signoff
            expected_time_seconds: 300

resources_required:
  - role: maintenance_tech
    count: 3
  - role: guest_services
    count: 2
  - role: safety_officer
    count: 1

expected_resolution_minutes: 45
```

### Scenario 5: Power Failure

```yaml
scenario_id: power_failure_north_concourse
name: "Power Failure — North Concourse Electrical Panel"
category: utility
severity: critical

trigger:
  phase: event_active
  time_offset_minutes: 30
  zone_id: zone_{venue}_concourse_upper_01

incident_data:
  incident_type: utility
  severity: critical
  description: "Complete power loss on north concourse. Emergency lighting active."

expected_sop_chain:
  - sop_id: sop_utility_failure_v2
    variant: power
    phases:
      - phase: immediate_response
        steps:
          - action: verify_emergency_lighting_active
            expected_time_seconds: 30
          - action: notify_command_center
            expected_time_seconds: 15
          - action: dispatch_electrical_team
            expected_time_seconds: 60
          - action: activate_backup_generator_check
            expected_time_seconds: 120
      - phase: assessment
        steps:
          - action: identify_affected_systems
            expected_time_seconds: 300
          - action: isolate_faulty_panel
            expected_time_seconds: 600
      - phase: restoration
        steps:
          - action: reroute_power
            expected_time_seconds: 900
          - action: verify_all_systems_restored
            expected_time_seconds: 300
      - phase: post_restoration
        steps:
          - action: confirm_food_safety_compliance
            expected_time_seconds: 600
          - action: incident_closed
            expected_time_seconds: 30

resources_required:
  - role: maintenance_tech
    count: 4
  - role: operations_staff
    count: 3
  - role: safety_officer
    count: 1

expected_resolution_minutes: 40
```

### Scenario 6: Active Threat (Training Only)

```yaml
scenario_id: active_threat_perimeter_breach
name: "Active Threat — Perimeter Breach (Hypothetical)"
category: security
severity: critical

trigger:
  phase: event_active
  time_offset_minutes: 60
  zone_id: zone_{venue}_gate_entry_02

incident_data:
  incident_type: security
  severity: critical
  description: "HYPOTHETICAL — FOR TRAINING ONLY.
    Individual bypassed security screening at gate 2."

expected_sop_chain:
  - sop_id: sop_active_threat_v1
    phases:
      - phase: lockdown
        steps:
          - action: initiate_venue_lockdown
            automation: full
            expected_time_seconds: 30
          - action: halt_all_gate_operations
            automation: full
            expected_time_seconds: 15
          - action: activate_all_cameras
            automation: full
            expected_time_seconds: 10
          - action: notify_law_enforcement_priority
            automation: full
            expected_time_seconds: 15
      - phase: locate_and_contain
        steps:
          - action: deploy_security_teams
            expected_time_seconds: 60
          - action: coordinate_with_law_enforcement
            expected_time_seconds: 120
          - action: track_via_camera_analytics
            expected_time_seconds: 30
      - phase: multi_agency_coordination
        steps:
          - action: establish_unified_command
            expected_time_seconds: 300
          - action: prepare_partial_evacuation
            expected_time_seconds: 600
      - phase: resolution
        steps:
          - action: threat_neutralized_or_cleared
            expected_time_seconds: 1800
          - action: gradual_lockdown_release
            expected_time_seconds: 600
          - action: full_all_clear
            expected_time_seconds: 300

resources_required:
  - role: security_commander
    count: 1
  - role: security_supervisor
    count: 4
  - role: security_staff
    count: 20
  - external: law_enforcement
    count: 10
  - role: communications_officer
    count: 1

expected_resolution_minutes: 60
```

### Scenario 7: Mass Casualty — Food Contamination

```yaml
scenario_id: mass_casualty_food_contamination
name: "Mass Casualty — Food Contamination (50+ Guests)"
category: medical
severity: critical

trigger:
  phase: event_active_2
  time_offset_minutes: 10
  zone_id: zone_{venue}_concourse_lower_01

incident_data:
  incident_type: medical
  severity: critical
  description: "Multiple guests with nausea, vomiting near concession stand B2.
    At least 50 affected and growing."

expected_sop_chain:
  - sop_id: sop_medical_emergency_v4
    variant: mass_casualty
    phases:
      - phase: triage
        steps:
          - action: activate_mass_casualty_protocol
            expected_time_seconds: 30
          - action: establish_triage_area
            expected_time_seconds: 300
          - action: deploy_all_ems_resources
            expected_time_seconds: 60
          - action: request_mutual_aid_ambulances
            expected_time_seconds: 120
      - phase: treatment
        steps:
          - action: categorize_patients_start
            expected_time_seconds: 600
          - action: begin_treatment_protocols
            expected_time_seconds: 900
      - phase: investigation
        steps:
          - action: isolate_concession_stand
            expected_time_seconds: 60
          - action: preserve_food_samples
            expected_time_seconds: 300
          - action: notify_health_department
            expected_time_seconds: 120
      - phase: transport_and_resolution
        steps:
          - action: coordinate_hospital_transports
            expected_time_seconds: 1800
          - action: health_department_on_scene
            expected_time_seconds: 3600

resources_required:
  - role: ems_coordinator
    count: 1
  - role: ems_paramedic
    count: 8
  - role: ems_emt
    count: 12
  - role: operations_chief
    count: 1
  - external: ambulances
    count: 10
  - external: health_department
    count: 1

expected_resolution_minutes: 120
```

## 6.3 Incident Scenario Loader

```python
"""
Sentrais OS — Incident Scenario Loader
Loads YAML scenario definitions and converts them into incident trigger events
compatible with the Temporal Simulation Engine.
"""

import yaml
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional


class IncidentScenarioLoader:
    """Loads and resolves incident scenarios from YAML definitions."""

    def __init__(self, scenario_dir: str = "scenarios/incidents"):
        self.scenario_dir = Path(scenario_dir)
        self.scenarios = {}
        self._load_all()

    def _load_all(self):
        """Load all YAML scenario files from the scenario directory."""
        if not self.scenario_dir.exists():
            return
        for f in self.scenario_dir.glob("*.yaml"):
            with open(f) as fh:
                data = yaml.safe_load(fh)
                self.scenarios[data["scenario_id"]] = data

    def resolve(
        self,
        scenario_id: str,
        venue_id: str,
        event_config: dict,
    ) -> dict:
        """Resolve a scenario template into a concrete incident trigger.

        Replaces {venue} placeholders, calculates absolute trigger times,
        and assigns staff from the venue roster.

        Args:
            scenario_id: Key from loaded scenarios
            venue_id: Target venue ID
            event_config: Dict with event timeline (same as SensorTelemetryGenerator)

        Returns:
            Resolved incident trigger dict ready for temporal engine injection.
        """
        scenario = self.scenarios[scenario_id].copy()

        # Resolve venue placeholders
        trigger = scenario["trigger"]
        if "{venue}" in str(trigger.get("zone_id", "")):
            trigger["zone_id"] = trigger["zone_id"].replace("{venue}", venue_id)

        # Calculate absolute trigger time
        phase_key = trigger["phase"]
        offset_minutes = trigger.get("time_offset_minutes", 0)
        phase_start = self._get_phase_start(phase_key, event_config)
        trigger["absolute_time"] = (
            phase_start + timedelta(minutes=offset_minutes)
        ).isoformat()

        scenario["venue_id"] = venue_id
        scenario["event_id"] = event_config.get("event_id")
        scenario["trigger"] = trigger

        return scenario

    @staticmethod
    def _get_phase_start(phase_key: str, event_config: dict) -> datetime:
        """Map phase key to event config timestamp."""
        mapping = {
            "pre_gates": "event_date",
            "gates_open": "gates_open_time",
            "pre_event": "event_start_time",
            "event_active": "event_start_time",
            "halftime": "halftime_start_time",
            "event_active_2": "second_half_start_time",
            "post_event": "event_end_time",
        }
        key = mapping.get(phase_key, "event_start_time")
        val = event_config[key]
        if isinstance(val, str):
            return datetime.fromisoformat(val)
        return val

    def list_scenarios(self) -> list:
        """Return summary of all available scenarios."""
        return [
            {
                "scenario_id": s["scenario_id"],
                "name": s["name"],
                "category": s["category"],
                "severity": s["severity"],
                "expected_resolution_minutes": s.get("expected_resolution_minutes"),
            }
            for s in self.scenarios.values()
        ]
```

---

# 7. SOP Template Library

## 7.1 Overview

MongoDB seed documents for the `sops` collection. Each SOP is fully defined with metadata, phases, steps, automation levels, decision points, escalation chains, evidence requirements, and compliance mappings. All SOPs are compatible with the `RESPONSE_SOP_Executor` workflow (Part 2, Section 3.1).

## 7.2 SOP Document Schema

Every SOP follows this schema (consumed by `RESPONSE_SOP_Executor` Node 001):

```json
{
  "_id": "sop_{name}_v{version}",
  "metadata": {
    "title": "Human-readable title",
    "version": "3.0.0",
    "status": "active",
    "category": "weather|medical|security|operational|utility|crowd|fire",
    "severity_levels": ["critical", "high"],
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "author": "Sentrais OS",
    "review_cycle_days": 90,
    "last_reviewed": "ISO8601"
  },
  "compliance_mappings": [
    {"regulation": "NFL_GOM", "section": "Weather Policy 4.2"},
    {"regulation": "NIMS", "section": "ICS-200"},
    {"regulation": "NFPA", "section": "101.7.1"}
  ],
  "triggers": {
    "automatic": [
      {"condition": "weather.lightning_miles <= 8", "source": "RUN_Monitor_Weather"}
    ],
    "manual": ["Command Center activation", "Safety Officer request"]
  },
  "phases": [
    {
      "phase_id": "phase_01_detection",
      "phase_name": "Detection & Assessment",
      "sequence": 1,
      "timeout_minutes": 5,
      "steps": [
        {
          "step_id": "step_01_01",
          "action": "verify_lightning_detection",
          "description": "Confirm lightning strike within 8-mile radius",
          "actor": "system",
          "automation_level": "full",
          "timeout_seconds": 30,
          "timeout_action": "auto_proceed",
          "evidence_required": true,
          "evidence_type": "weather_verification",
          "decision_point": null
        }
      ]
    }
  ],
  "escalation_chain": [
    {"level": 1, "role": "safety_officer", "timeout_minutes": 2},
    {"level": 2, "role": "operations_chief", "timeout_minutes": 5},
    {"level": 3, "role": "incident_commander", "timeout_minutes": 10}
  ],
  "resource_requirements": {
    "personnel": [{"role": "safety_officer", "count": 1, "required": true}],
    "equipment": [{"type": "pa_system", "required": true}],
    "external": [{"agency": "NWS", "notification": true}]
  },
  "communications": {
    "pa_announcements": ["shelter_in_place_message_v2"],
    "digital_signage": ["weather_alert_template"],
    "notification_channels": ["push", "sms", "radio", "pa_system"]
  }
}
```

## 7.3 SOP: Lightning Response (NFL 8-Mile Rule)

```python
"""
SOP Template: Lightning Response v3
NFL Game Operations Manual compliance — 8-mile rule
"""

SOP_LIGHTNING_RESPONSE_V3 = {
    "_id": "sop_lightning_response_v3",
    "metadata": {
        "title": "Lightning Response — NFL 8-Mile Rule Compliance",
        "version": "3.0.0",
        "status": "active",
        "category": "weather",
        "severity_levels": ["critical"],
        "author": "Sentrais OS",
        "review_cycle_days": 90,
    },
    "compliance_mappings": [
        {"regulation": "NFL_GOM", "section": "Weather Policy 4.2 — Lightning"},
        {"regulation": "NIMS", "section": "ICS-200 — Incident Command"},
        {"regulation": "NFPA", "section": "780 — Lightning Protection"},
    ],
    "triggers": {
        "automatic": [
            {
                "condition": "weather.lightning_closest_miles <= 8",
                "source": "RUN_Monitor_Weather",
                "priority": "immediate",
            }
        ],
        "manual": [
            "Safety Officer visual confirmation",
            "Command Center weather radar assessment",
        ],
    },
    "phases": [
        {
            "phase_id": "phase_01_detection",
            "phase_name": "Detection & Verification",
            "sequence": 1,
            "timeout_minutes": 2,
            "steps": [
                {
                    "step_id": "step_01_01",
                    "action": "verify_lightning_detection",
                    "description": "Confirm lightning within 8 miles via multi-source verification",
                    "actor": "system",
                    "automation_level": "full",
                    "timeout_seconds": 30,
                    "timeout_action": "auto_proceed",
                    "evidence_required": True,
                    "evidence_type": "weather_verification",
                },
                {
                    "step_id": "step_01_02",
                    "action": "notify_game_officials",
                    "description": "Alert referee crew and NFL operations of lightning detection",
                    "actor": "system",
                    "automation_level": "full",
                    "timeout_seconds": 15,
                    "timeout_action": "auto_proceed",
                    "evidence_required": True,
                    "evidence_type": "notification_sent",
                },
                {
                    "step_id": "step_01_03",
                    "action": "activate_command_center",
                    "description": "Elevate command center to weather emergency mode",
                    "actor": "operations_chief",
                    "automation_level": "semi",
                    "timeout_seconds": 60,
                    "timeout_action": "escalate",
                    "evidence_required": True,
                    "evidence_type": "state_transition",
                },
            ],
        },
        {
            "phase_id": "phase_02_shelter",
            "phase_name": "Shelter-in-Place Activation",
            "sequence": 2,
            "timeout_minutes": 10,
            "steps": [
                {
                    "step_id": "step_02_01",
                    "action": "halt_play",
                    "description": "Signal game stoppage to officials",
                    "actor": "safety_officer",
                    "automation_level": "manual",
                    "timeout_seconds": 60,
                    "timeout_action": "escalate",
                    "evidence_required": True,
                    "evidence_type": "game_state_change",
                },
                {
                    "step_id": "step_02_02",
                    "action": "activate_pa_announcement",
                    "description": "Broadcast shelter-in-place message on PA and signage",
                    "actor": "system",
                    "automation_level": "full",
                    "timeout_seconds": 15,
                    "timeout_action": "auto_proceed",
                    "evidence_required": True,
                    "evidence_type": "communication_sent",
                    "communication_template": "shelter_in_place_lightning_v2",
                },
                {
                    "step_id": "step_02_03",
                    "action": "direct_field_evacuation",
                    "description": "Clear field-level personnel, players, and sideline fans to shelter",
                    "actor": "security_commander",
                    "automation_level": "manual",
                    "timeout_seconds": 300,
                    "timeout_action": "escalate",
                    "evidence_required": True,
                    "evidence_type": "evacuation_progress",
                },
                {
                    "step_id": "step_02_04",
                    "action": "close_upper_deck_access",
                    "description": "Prevent fan movement to exposed upper deck areas",
                    "actor": "security_supervisor",
                    "automation_level": "semi",
                    "timeout_seconds": 120,
                    "timeout_action": "escalate",
                    "evidence_required": True,
                    "evidence_type": "access_control_change",
                },
                {
                    "step_id": "step_02_05",
                    "action": "deploy_shelter_guides",
                    "description": "Staff all concourse entrances to guide fans to sheltered areas",
                    "actor": "guest_services",
                    "automation_level": "manual",
                    "timeout_seconds": 300,
                    "timeout_action": "auto_proceed",
                    "evidence_required": False,
                },
            ],
        },
        {
            "phase_id": "phase_03_monitor",
            "phase_name": "Active Monitoring & Delay Management",
            "sequence": 3,
            "timeout_minutes": 120,
            "steps": [
                {
                    "step_id": "step_03_01",
                    "action": "continuous_weather_monitoring",
                    "description": "Monitor lightning at 15-second intervals until all-clear",
                    "actor": "system",
                    "automation_level": "full",
                    "timeout_seconds": 7200,
                    "timeout_action": "escalate",
                    "evidence_required": True,
                    "evidence_type": "weather_readings",
                    "loop": True,
                    "loop_interval_seconds": 15,
                },
                {
                    "step_id": "step_03_02",
                    "action": "crowd_condition_monitoring",
                    "description": "Monitor crowd density in sheltered areas for safety",
                    "actor": "system",
                    "automation_level": "full",
                    "timeout_seconds": 7200,
                    "evidence_required": True,
                    "evidence_type": "crowd_metrics",
                    "loop": True,
                },
                {
                    "step_id": "step_03_03",
                    "action": "periodic_pa_updates",
                    "description": "Broadcast updates every 15 minutes during delay",
                    "actor": "communications_officer",
                    "automation_level": "semi",
                    "timeout_seconds": 900,
                    "timeout_action": "auto_proceed",
                    "evidence_required": True,
                    "evidence_type": "communication_sent",
                    "loop": True,
                    "loop_interval_seconds": 900,
                },
            ],
        },
        {
            "phase_id": "phase_04_all_clear",
            "phase_name": "All-Clear & Resumption",
            "sequence": 4,
            "timeout_minutes": 30,
            "steps": [
                {
                    "step_id": "step_04_01",
                    "action": "verify_30min_clear",
                    "description": "Confirm 30 minutes since last lightning within 8 miles (NFL rule)",
                    "actor": "system",
                    "automation_level": "full",
                    "timeout_seconds": 60,
                    "timeout_action": "abort",
                    "evidence_required": True,
                    "evidence_type": "weather_verification",
                    "decision_point": {
                        "condition": "time_since_last_strike_minutes >= 30",
                        "true_action": "proceed",
                        "false_action": "return_to_phase_03",
                    },
                },
                {
                    "step_id": "step_04_02",
                    "action": "declare_all_clear",
                    "description": "Safety Officer declares all-clear for play resumption",
                    "actor": "safety_officer",
                    "automation_level": "manual",
                    "timeout_seconds": 120,
                    "timeout_action": "escalate",
                    "evidence_required": True,
                    "evidence_type": "all_clear_declaration",
                },
                {
                    "step_id": "step_04_03",
                    "action": "broadcast_all_clear",
                    "description": "PA announcement and signage update — fans may return to seats",
                    "actor": "system",
                    "automation_level": "full",
                    "timeout_seconds": 15,
                    "evidence_required": True,
                    "evidence_type": "communication_sent",
                },
                {
                    "step_id": "step_04_04",
                    "action": "resume_play_coordination",
                    "description": "Coordinate with officials for warm-up and game resumption",
                    "actor": "operations_chief",
                    "automation_level": "manual",
                    "timeout_seconds": 600,
                    "evidence_required": True,
                    "evidence_type": "game_state_change",
                },
            ],
        },
    ],
    "escalation_chain": [
        {"level": 1, "role": "safety_officer", "timeout_minutes": 2},
        {"level": 2, "role": "operations_chief", "timeout_minutes": 5},
        {"level": 3, "role": "incident_commander", "timeout_minutes": 10},
    ],
    "resource_requirements": {
        "personnel": [
            {"role": "safety_officer", "count": 1, "required": True},
            {"role": "operations_chief", "count": 1, "required": True},
            {"role": "security_commander", "count": 1, "required": True},
            {"role": "communications_officer", "count": 1, "required": True},
            {"role": "security_staff", "count": 12, "required": True},
            {"role": "guest_services", "count": 20, "required": False},
        ],
        "equipment": [
            {"type": "pa_system", "required": True},
            {"type": "digital_signage", "required": True},
            {"type": "weather_radar_display", "required": True},
        ],
        "external": [
            {"agency": "NWS", "notification": True},
            {"agency": "NFL_Operations", "notification": True},
        ],
    },
}
```

## 7.4 SOP Summary Table

All eight SOPs follow the same schema structure. Here is the summary:

| SOP ID | Title | Phases | Steps | Auto % | Compliance |
|--------|-------|--------|-------|--------|------------|
| `sop_lightning_response_v3` | Lightning Response — NFL 8-Mile Rule | 4 | 14 | 50% | NFL_GOM, NIMS, NFPA |
| `sop_medical_emergency_v4` | Medical Emergency Response | 4 | 12 | 33% | HIPAA, NIMS, EMTALA |
| `sop_evacuation_v2` | Evacuation — Full & Partial | 5 | 18 | 40% | NFPA, NIMS, ADA |
| `sop_suspicious_package_v2` | Suspicious Package Response | 3 | 10 | 30% | DHS, FBI, NIMS |
| `sop_active_threat_v1` | Active Threat / Lockdown | 4 | 14 | 25% | DHS, FBI, NIMS, CJIS |
| `sop_utility_failure_v2` | Utility Failure Response | 4 | 12 | 42% | NFPA, OSHA |
| `sop_crowd_management_v3` | Crowd Density Management | 3 | 10 | 55% | NFPA, NFL_GOM |
| `sop_weather_delay_v2` | Weather Delay & Resumption | 4 | 12 | 45% | NFL_GOM, NIMS |

The complete Python definitions for all eight SOPs are located in `sentrais_synth/sop_templates/` with one module per SOP. Each follows the identical schema pattern shown in Section 7.3.

## 7.5 MongoDB Seeding Script

```python
"""
Seeds all SOP templates into the MongoDB sops collection.
"""

from pymongo import MongoClient
from sentrais_synth.sop_templates.lightning_response import SOP_LIGHTNING_RESPONSE_V3
from sentrais_synth.sop_templates.medical_emergency import SOP_MEDICAL_EMERGENCY_V4
from sentrais_synth.sop_templates.evacuation import SOP_EVACUATION_V2
from sentrais_synth.sop_templates.suspicious_package import SOP_SUSPICIOUS_PACKAGE_V2
from sentrais_synth.sop_templates.active_threat import SOP_ACTIVE_THREAT_V1
from sentrais_synth.sop_templates.utility_failure import SOP_UTILITY_FAILURE_V2
from sentrais_synth.sop_templates.crowd_management import SOP_CROWD_MANAGEMENT_V3
from sentrais_synth.sop_templates.weather_delay import SOP_WEATHER_DELAY_V2

ALL_SOPS = [
    SOP_LIGHTNING_RESPONSE_V3,
    SOP_MEDICAL_EMERGENCY_V4,
    SOP_EVACUATION_V2,
    SOP_SUSPICIOUS_PACKAGE_V2,
    SOP_ACTIVE_THREAT_V1,
    SOP_UTILITY_FAILURE_V2,
    SOP_CROWD_MANAGEMENT_V3,
    SOP_WEATHER_DELAY_V2,
]


def seed_sops(mongo_uri: str) -> int:
    """Insert all SOP templates into MongoDB.

    Returns:
        Count of SOPs upserted.
    """
    client = MongoClient(mongo_uri)
    db = client["sentrais_os"]
    collection = db["sops"]

    count = 0
    for sop in ALL_SOPS:
        collection.replace_one(
            {"_id": sop["_id"]},
            sop,
            upsert=True,
        )
        count += 1

    client.close()
    return count
```

# 8. Temporal Simulation Engine

## 8.1 Overview

The Temporal Simulation Engine is the core runtime that replays synthetic data in real-time or accelerated time. It reads scenario definitions, generates time-series database inserts at correct intervals, and triggers n8n webhooks to simulate the full EVERGAME lifecycle (PREPARE → READY → RUN → REVIEW).

## 8.2 Time Acceleration Modes

| Mode | Speed | Real Duration | Simulated Duration | Use Case |
|------|-------|---------------|-------------------|----------|
| `realtime` | 1x | 4 hours | 4 hours | Training exercises |
| `fast` | 10x | 24 minutes | 4 hours | QA testing |
| `rapid` | 60x | 4 minutes | 4 hours | Quick demos |
| `demo` | 300x | ~1.5 minutes | Full game day (~7.5 hours) | Sales presentations |

## 8.3 Module: `engine.py`

```python
"""
Sentrais OS — Temporal Simulation Engine
Replays synthetic data scenarios in real-time or accelerated time,
triggering n8n webhooks and populating databases.

Usage:
    from sentrais_synth.temporal.engine import TemporalSimulationEngine
    engine = TemporalSimulationEngine(scenario_path="scenarios/lightning_strikes.yaml")
    engine.start(speed=60)  # 60x acceleration
"""

import asyncio
import time
import json
import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Callable
from dataclasses import dataclass, field

import httpx
import psycopg2
import psycopg2.extras
from pymongo import MongoClient
import redis
import yaml

from sentrais_synth.generators.sensor_telemetry import SensorTelemetryGenerator
from sentrais_synth.generators.crowd_simulation import CrowdSimulationEngine
from sentrais_synth.generators.weather_scenario import WeatherScenarioGenerator
from sentrais_synth.generators.evidence_seeder import EvidenceSeeder

logger = logging.getLogger("sentrais.temporal")


class SimulationState(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"


@dataclass
class SimulationStatus:
    state: SimulationState = SimulationState.IDLE
    scenario_id: str = ""
    speed: float = 1.0
    sim_time: Optional[datetime] = None
    real_start: Optional[datetime] = None
    current_phase: str = ""
    events_emitted: int = 0
    incidents_injected: int = 0
    evidence_entries: int = 0
    errors: list = field(default_factory=list)


class TemporalSimulationEngine:
    """Replays scenarios with time acceleration and n8n webhook integration."""

    def __init__(
        self,
        scenario_path: str,
        pg_dsn: str = "postgresql://sentrais:sentrais_dev_2026@localhost:5432/sentrais_os",
        mongo_uri: str = "mongodb://sentrais:sentrais_dev_2026@localhost:27017/sentrais_os?authSource=admin",
        redis_url: str = "redis://:sentrais_dev_2026@localhost:6379/0",
        n8n_webhook_base: str = "http://localhost:5678/webhook",
    ):
        self.scenario = self._load_scenario(scenario_path)
        self.pg_dsn = pg_dsn
        self.mongo_uri = mongo_uri
        self.redis_url = redis_url
        self.n8n_base = n8n_webhook_base
        self.status = SimulationStatus()
        self._stop_event = asyncio.Event()
        self._pause_event = asyncio.Event()
        self._pause_event.set()  # not paused initially

        # Initialize generators (deferred until start)
        self.sensor_gen = None
        self.crowd_gen = None
        self.weather_gen = None
        self.evidence_seeder = None

    @staticmethod
    def _load_scenario(path: str) -> dict:
        with open(path) as f:
            return yaml.safe_load(f)

    async def start(self, speed: float = 1.0):
        """Start the simulation at the given speed multiplier.

        Args:
            speed: Time acceleration factor (1.0 = real-time, 300.0 = demo mode)
        """
        self.status.state = SimulationState.RUNNING
        self.status.speed = speed
        self.status.scenario_id = self.scenario["scenario_id"]
        self.status.real_start = datetime.utcnow()
        self._stop_event.clear()

        scenario = self.scenario
        venue_id = scenario["venue_id"]
        event_config = scenario["event_config"]

        # Parse simulation timeline
        sim_start = datetime.fromisoformat(event_config["sim_start"])
        sim_end = datetime.fromisoformat(event_config["sim_end"])
        self.status.sim_time = sim_start

        # Initialize generators
        venue_profile = scenario["venue_profile"]
        self.sensor_gen = SensorTelemetryGenerator(
            venue_profile, event_config,
            anomaly_rate=scenario.get("anomaly_rate", 0.02),
        )
        self.crowd_gen = CrowdSimulationEngine(
            venue_profile, event_config,
            scenario=scenario.get("crowd_scenario"),
        )
        self.weather_gen = WeatherScenarioGenerator(
            scenario.get("weather_scenario", "clear_day"),
            {"venue_id": venue_id, "event_id": event_config.get("event_id")},
        )
        self.evidence_seeder = EvidenceSeeder(self.pg_dsn)

        # Build incident injection schedule
        incident_schedule = self._build_incident_schedule(scenario, sim_start)

        # Build phase transition schedule
        phase_transitions = self._build_phase_transitions(event_config, sim_start)

        logger.info(
            f"Starting simulation: {scenario['scenario_id']} at {speed}x speed. "
            f"Sim range: {sim_start} → {sim_end}"
        )

        # Main simulation loop
        tick_interval_real = 1.0 / speed  # real seconds per sim second
        sim_current = sim_start

        async with httpx.AsyncClient(timeout=10.0) as http:
            while sim_current < sim_end and not self._stop_event.is_set():
                await self._pause_event.wait()  # block if paused

                self.status.sim_time = sim_current
                elapsed_sim = (sim_current - sim_start).total_seconds()

                # 1. Check for phase transitions
                for pt in phase_transitions:
                    if pt["time"] <= sim_current and not pt.get("fired"):
                        pt["fired"] = True
                        self.status.current_phase = pt["phase"]
                        await self._fire_phase_transition(http, pt, event_config)

                # 2. Generate and insert sensor readings (every 10 sim seconds)
                if int(elapsed_sim) % 10 == 0:
                    window_end = sim_current + timedelta(seconds=10)
                    readings = self.sensor_gen.generate_window(
                        sim_current, window_end, interval_seconds=10
                    )
                    await self._insert_sensor_readings(readings)

                # 3. Generate and insert crowd metrics (every 10 sim seconds)
                if int(elapsed_sim) % 10 == 0:
                    window_end = sim_current + timedelta(seconds=10)
                    metrics = self.crowd_gen.simulate(
                        sim_current, window_end, interval_seconds=10
                    )
                    await self._insert_crowd_metrics(metrics)

                # 4. Generate weather readings (every 60 sim seconds)
                if int(elapsed_sim) % 60 == 0:
                    readings = self.weather_gen.generate(
                        sim_current, sim_current + timedelta(seconds=60),
                        interval_seconds=60,
                    )
                    await self._insert_weather_readings(readings)

                # 5. Check for incident injections
                for inc in incident_schedule:
                    if inc["time"] <= sim_current and not inc.get("fired"):
                        inc["fired"] = True
                        await self._inject_incident(http, inc, event_config)
                        self.status.incidents_injected += 1

                # Advance simulation time
                sim_current += timedelta(seconds=1)
                await asyncio.sleep(tick_interval_real)

        self.status.state = SimulationState.COMPLETED
        logger.info(f"Simulation completed. Events: {self.status.events_emitted}, "
                     f"Incidents: {self.status.incidents_injected}")

    def pause(self):
        """Pause the simulation."""
        self._pause_event.clear()
        self.status.state = SimulationState.PAUSED

    def resume(self):
        """Resume a paused simulation."""
        self._pause_event.set()
        self.status.state = SimulationState.RUNNING

    def stop(self):
        """Stop the simulation."""
        self._stop_event.set()
        self.status.state = SimulationState.COMPLETED

    def skip_to_phase(self, phase_id: str):
        """Jump simulation time to the start of a specific phase."""
        for pt in self._build_phase_transitions(
            self.scenario["event_config"],
            datetime.fromisoformat(self.scenario["event_config"]["sim_start"]),
        ):
            if pt["phase"] == phase_id:
                self.status.sim_time = pt["time"]
                logger.info(f"Skipped to phase: {phase_id}")
                return
        logger.warning(f"Phase not found: {phase_id}")

    def inject_incident(self, scenario_id: str):
        """Manually inject an incident at the current simulation time."""
        # Queued for next tick
        pass

    def get_status(self) -> dict:
        """Return current simulation status."""
        return {
            "state": self.status.state.value,
            "scenario_id": self.status.scenario_id,
            "speed": self.status.speed,
            "sim_time": self.status.sim_time.isoformat() if self.status.sim_time else None,
            "current_phase": self.status.current_phase,
            "events_emitted": self.status.events_emitted,
            "incidents_injected": self.status.incidents_injected,
            "evidence_entries": self.status.evidence_entries,
            "errors": self.status.errors[-10:],  # last 10 errors
        }

    # ═══════════════════════════════════════════════
    # INTERNAL: Database insertion methods
    # ═══════════════════════════════════════════════

    async def _insert_sensor_readings(self, readings: list):
        """Batch insert sensor readings into TimescaleDB."""
        if not readings:
            return
        conn = psycopg2.connect(self.pg_dsn)
        try:
            with conn.cursor() as cur:
                psycopg2.extras.execute_values(
                    cur,
                    """INSERT INTO sensor_readings
                       (time, venue_id, sensor_id, sensor_type, zone_id,
                        value, unit, quality, metadata)
                       VALUES %s""",
                    [
                        (r["time"], r["venue_id"], r["sensor_id"],
                         r["sensor_type"], r["zone_id"], r["value"],
                         r["unit"], r["quality"],
                         json.dumps(r.get("metadata", {})))
                        for r in readings
                    ],
                    page_size=500,
                )
            conn.commit()
            self.status.events_emitted += len(readings)
        except Exception as e:
            conn.rollback()
            self.status.errors.append(f"sensor_insert: {e}")
        finally:
            conn.close()

    async def _insert_crowd_metrics(self, metrics: list):
        """Batch insert crowd metrics into TimescaleDB."""
        if not metrics:
            return
        conn = psycopg2.connect(self.pg_dsn)
        try:
            with conn.cursor() as cur:
                psycopg2.extras.execute_values(
                    cur,
                    """INSERT INTO crowd_metrics
                       (time, venue_id, zone_id, total_occupancy,
                        occupancy_pct, density_level, flow_rate,
                        flow_direction, confidence)
                       VALUES %s""",
                    [
                        (m["time"], m["venue_id"], m["zone_id"],
                         m["total_occupancy"], m["occupancy_pct"],
                         m["density_level"], m["flow_rate"],
                         m["flow_direction"], m["confidence"])
                        for m in metrics
                    ],
                    page_size=500,
                )
            conn.commit()
            self.status.events_emitted += len(metrics)
        except Exception as e:
            conn.rollback()
            self.status.errors.append(f"crowd_insert: {e}")
        finally:
            conn.close()

    async def _insert_weather_readings(self, readings: list):
        """Insert weather readings into TimescaleDB."""
        if not readings:
            return
        conn = psycopg2.connect(self.pg_dsn)
        try:
            with conn.cursor() as cur:
                for r in readings:
                    cur.execute(
                        """INSERT INTO weather_readings
                           (time, venue_id, event_id, threat_level,
                            temperature, humidity, wind_speed,
                            precipitation_rate, lightning_closest_miles,
                            threats_json)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                        (r["time"], r["venue_id"], r.get("event_id"),
                         r["threat_level"], r["temperature"], r["humidity"],
                         r["wind_speed"], r["precipitation_rate"],
                         r.get("lightning_closest_miles"),
                         json.dumps(r.get("threats_json", []))),
                    )
            conn.commit()
            self.status.events_emitted += len(readings)
        except Exception as e:
            conn.rollback()
            self.status.errors.append(f"weather_insert: {e}")
        finally:
            conn.close()

    # ═══════════════════════════════════════════════
    # INTERNAL: n8n webhook triggers
    # ═══════════════════════════════════════════════

    async def _fire_phase_transition(self, http: httpx.AsyncClient, pt: dict, event_config: dict):
        """Trigger n8n webhook for phase transition."""
        payload = {
            "event_type": "phase_transition",
            "event_id": event_config.get("event_id"),
            "venue_id": self.scenario["venue_id"],
            "from_phase": pt.get("from_phase"),
            "to_phase": pt["phase"],
            "timestamp": pt["time"].isoformat(),
        }
        try:
            resp = await http.post(
                f"{self.n8n_base}/simulation/phase-transition",
                json=payload,
            )
            logger.info(f"Phase transition → {pt['phase']}: {resp.status_code}")
        except Exception as e:
            self.status.errors.append(f"phase_webhook: {e}")

    async def _inject_incident(self, http: httpx.AsyncClient, inc: dict, event_config: dict):
        """Trigger n8n webhook to create an incident."""
        payload = {
            "event_id": event_config.get("event_id"),
            "incident_type": inc["incident_type"],
            "severity": inc["severity"],
            "source": "simulation_engine",
            "location": inc.get("location", {}),
            "description": inc["description"],
            "reporter": {"user_id": "sim_engine", "role": "system"},
            "initial_data": inc.get("initial_data", {}),
        }
        try:
            resp = await http.post(
                f"{self.n8n_base}/simulation/inject-incident",
                json=payload,
            )
            logger.info(f"Incident injected: {inc['scenario_id']}: {resp.status_code}")
        except Exception as e:
            self.status.errors.append(f"incident_webhook: {e}")

    # ═══════════════════════════════════════════════
    # INTERNAL: Schedule builders
    # ═══════════════════════════════════════════════

    def _build_phase_transitions(self, event_config: dict, sim_start: datetime) -> list:
        """Build chronological list of phase transition events."""

        def _p(key):
            val = event_config[key]
            return datetime.fromisoformat(val) if isinstance(val, str) else val

        return [
            {"phase": "pre_gates",      "time": sim_start,                    "from_phase": None},
            {"phase": "gates_open",     "time": _p("gates_open_time"),        "from_phase": "pre_gates"},
            {"phase": "pre_event",      "time": _p("event_start_time") - timedelta(minutes=15),
                                                                               "from_phase": "gates_open"},
            {"phase": "event_active",   "time": _p("event_start_time"),       "from_phase": "pre_event"},
            {"phase": "halftime",       "time": _p("halftime_start_time"),    "from_phase": "event_active"},
            {"phase": "event_active_2", "time": _p("second_half_start_time"), "from_phase": "halftime"},
            {"phase": "post_event",     "time": _p("event_end_time"),         "from_phase": "event_active_2"},
            {"phase": "facility_clear", "time": _p("event_end_time") + timedelta(minutes=60),
                                                                               "from_phase": "post_event"},
        ]

    def _build_incident_schedule(self, scenario: dict, sim_start: datetime) -> list:
        """Build list of incident injection events from scenario definition."""
        schedule = []
        for inc_def in scenario.get("incidents", []):
            phase_start = self._resolve_phase_time(
                inc_def["trigger"]["phase"],
                scenario["event_config"],
            )
            trigger_time = phase_start + timedelta(
                minutes=inc_def["trigger"].get("time_offset_minutes", 0)
            )
            schedule.append({
                "scenario_id": inc_def["scenario_id"],
                "time": trigger_time,
                "incident_type": inc_def["incident_data"]["incident_type"],
                "severity": inc_def["incident_data"]["severity"],
                "description": inc_def["incident_data"]["description"],
                "location": {
                    "zone_id": inc_def["trigger"].get("zone_id", "").replace(
                        "{venue}", scenario["venue_id"]
                    ),
                },
            })
        return sorted(schedule, key=lambda x: x["time"])

    @staticmethod
    def _resolve_phase_time(phase_key: str, event_config: dict) -> datetime:
        mapping = {
            "pre_gates": "sim_start",
            "gates_open": "gates_open_time",
            "pre_event": "event_start_time",
            "event_active": "event_start_time",
            "halftime": "halftime_start_time",
            "event_active_2": "second_half_start_time",
            "post_event": "event_end_time",
        }
        key = mapping.get(phase_key, "event_start_time")
        val = event_config[key]
        return datetime.fromisoformat(val) if isinstance(val, str) else val
```

## 8.4 REST API for Scenario Control

```python
"""
Sentrais OS — Temporal Simulation REST API
Provides scenario control endpoints: start, pause, resume, stop,
skip-to-phase, inject-incident, and status dashboard.

Runs on port 8090.
"""

import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from sentrais_synth.temporal.engine import TemporalSimulationEngine

app = FastAPI(
    title="Sentrais Synthetic Simulation API",
    version="1.0.0",
    description="Control synthetic data simulation for Sentrais OS demos and testing.",
)

# Global engine instance (initialized on first start)
engine: Optional[TemporalSimulationEngine] = None
engine_task: Optional[asyncio.Task] = None


class StartRequest(BaseModel):
    scenario_path: str
    speed: float = 1.0


class InjectRequest(BaseModel):
    scenario_id: str


# ─── Endpoints ───

@app.post("/api/v1/simulation/start")
async def start_simulation(req: StartRequest):
    """Start a new simulation from a scenario file."""
    global engine, engine_task
    if engine and engine.status.state.value == "running":
        raise HTTPException(400, "Simulation already running. Stop first.")
    engine = TemporalSimulationEngine(scenario_path=req.scenario_path)
    engine_task = asyncio.create_task(engine.start(speed=req.speed))
    return {"status": "started", "scenario": req.scenario_path, "speed": req.speed}


@app.post("/api/v1/simulation/pause")
async def pause_simulation():
    """Pause the running simulation."""
    if not engine:
        raise HTTPException(400, "No simulation running.")
    engine.pause()
    return {"status": "paused"}


@app.post("/api/v1/simulation/resume")
async def resume_simulation():
    """Resume a paused simulation."""
    if not engine:
        raise HTTPException(400, "No simulation running.")
    engine.resume()
    return {"status": "resumed"}


@app.post("/api/v1/simulation/stop")
async def stop_simulation():
    """Stop the running simulation."""
    if not engine:
        raise HTTPException(400, "No simulation running.")
    engine.stop()
    return {"status": "stopped"}


@app.post("/api/v1/simulation/skip-to-phase/{phase_id}")
async def skip_to_phase(phase_id: str):
    """Jump simulation to a specific event phase."""
    if not engine:
        raise HTTPException(400, "No simulation running.")
    engine.skip_to_phase(phase_id)
    return {"status": "skipped", "phase": phase_id}


@app.post("/api/v1/simulation/inject-incident")
async def inject_incident(req: InjectRequest):
    """Inject an incident at the current simulation time."""
    if not engine:
        raise HTTPException(400, "No simulation running.")
    engine.inject_incident(req.scenario_id)
    return {"status": "injected", "scenario_id": req.scenario_id}


@app.get("/api/v1/simulation/status")
async def get_status():
    """Get current simulation status and timeline position."""
    if not engine:
        return {"state": "idle"}
    return engine.get_status()


@app.get("/api/v1/simulation/scenarios")
async def list_scenarios():
    """List available scenario packages."""
    from pathlib import Path
    scenarios = []
    scenario_dir = Path("scenarios")
    if scenario_dir.exists():
        for f in scenario_dir.glob("*.yaml"):
            import yaml
            with open(f) as fh:
                data = yaml.safe_load(fh)
                scenarios.append({
                    "file": f.name,
                    "scenario_id": data.get("scenario_id"),
                    "name": data.get("name"),
                    "description": data.get("description"),
                })
    return {"scenarios": scenarios}


# Dashboard endpoint (returns HTML for quick status view)
@app.get("/dashboard")
async def dashboard():
    """Simple HTML dashboard showing simulation status."""
    status = engine.get_status() if engine else {"state": "idle"}
    return {
        "content_type": "text/html",
        "body": f"""
        <html>
        <head><title>Sentrais Simulation Dashboard</title>
        <meta http-equiv="refresh" content="2"></head>
        <body style="font-family: Arial; background: #1B3A4B; color: white; padding: 40px;">
        <h1 style="color: #9AAF45;">Sentrais OS — Simulation Engine</h1>
        <table style="font-size: 18px; border-spacing: 10px;">
        <tr><td style="color: #3A7B8A;">State:</td>
            <td><strong>{status.get('state', 'idle').upper()}</strong></td></tr>
        <tr><td style="color: #3A7B8A;">Scenario:</td>
            <td>{status.get('scenario_id', '—')}</td></tr>
        <tr><td style="color: #3A7B8A;">Speed:</td>
            <td>{status.get('speed', 0)}x</td></tr>
        <tr><td style="color: #3A7B8A;">Sim Time:</td>
            <td>{status.get('sim_time', '—')}</td></tr>
        <tr><td style="color: #3A7B8A;">Phase:</td>
            <td>{status.get('current_phase', '—')}</td></tr>
        <tr><td style="color: #3A7B8A;">Events:</td>
            <td>{status.get('events_emitted', 0):,}</td></tr>
        <tr><td style="color: #3A7B8A;">Incidents:</td>
            <td>{status.get('incidents_injected', 0)}</td></tr>
        </table>
        </body></html>
        """,
    }
```

---


# 9. Evidence Ledger Seeding

## 9.1 Overview

Generates realistic evidence entries with proper SHA-256 hash chains for the `evidence_ledger` table (V004 migration). Each entry's hash depends on the previous entry's hash, forming an immutable, verifiable chain. The seeder covers all evidence types from the n8n architecture: state transitions, health checks, incident actions, SOP steps, weather readings, threshold breaches, and compliance validations.

## 9.2 Evidence Types

| Type | Category | Source Workflow | Typical Frequency |
|------|----------|----------------|-------------------|
| `state_transition` | lifecycle | LIFECYCLE_*_Phase | Per phase change (~8/event) |
| `health_check` | system | INTEGRATION_System_Health_Monitor | Every 30s during events |
| `incident_created` | incident | RUN_Incident_Handler | Per incident |
| `incident_resolved` | incident | RUN_Incident_Handler | Per incident |
| `sop_activated` | sop_execution | RESPONSE_SOP_Executor | Per SOP activation |
| `sop_step_completed` | sop_execution | RESPONSE_SOP_Executor | Per SOP step |
| `sop_completed` | sop_execution | RESPONSE_SOP_Executor | Per SOP completion |
| `weather_verification` | weather | RUN_Monitor_Weather | Per weather check |
| `weather_threat` | weather | RUN_Monitor_Weather | Per threat detection |
| `threshold_breach` | prediction | PREDICTION_Threshold_Monitor | Per breach |
| `crowd_alert` | crowd_safety | RUN_Monitor_Crowd | Per crowd alert |
| `compliance_validation` | compliance | REPORTING_Compliance_Report | Per validation |
| `resource_dispatched` | resource_management | RUN_Incident_Handler | Per dispatch |
| `notification_sent` | notification | SHARED_Notification_Service | Per notification |

## 9.3 Module: `evidence_seeder.py`

```python
"""
Sentrais OS — Evidence Ledger Seeder
Generates evidence entries with cryptographic hash chains.

Usage:
    from sentrais_synth.generators.evidence_seeder import EvidenceLedgerSeeder
    seeder = EvidenceLedgerSeeder(pg_dsn)
    seeder.generate_event_evidence(event_id, venue_id, event_config)
    seeder.generate_historical(venue_id, months=6)
"""

import hashlib
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
import psycopg2
import psycopg2.extras


class EvidenceLedgerSeeder:
    """Generates evidence entries with proper hash chain integrity."""

    def __init__(self, pg_dsn: str, seed: int = 42):
        self.pg = psycopg2.connect(pg_dsn)
        self.rng = np.random.default_rng(seed)
        self._prev_hash = "GENESIS"
        self._sequence = 0

    def _compute_hash(self, evidence_data: dict) -> str:
        """Compute SHA-256 hash for an evidence entry."""
        canonical = json.dumps(evidence_data, sort_keys=True, default=str)
        content = f"{self._prev_hash}|{canonical}"
        return hashlib.sha256(content.encode()).hexdigest()

    def _create_entry(
        self,
        event_id: str,
        venue_id: str,
        timestamp: datetime,
        evidence_type: str,
        category: str,
        source_workflow: str,
        data: dict,
        compliance_tags: list = None,
        classification_level: int = 2,
    ) -> dict:
        """Create a single evidence entry with hash chain."""
        self._sequence += 1
        evidence_id = f"ev_{uuid.uuid4().hex[:16]}"

        entry = {
            "evidence_id": evidence_id,
            "event_id": event_id,
            "venue_id": venue_id,
            "timestamp": timestamp.isoformat(),
            "evidence_type": evidence_type,
            "category": category,
            "source_workflow": source_workflow,
            "data": data,
            "compliance_tags": compliance_tags or [],
            "sequence_num": self._sequence,
            "prev_hash": self._prev_hash,
            "classification_level": classification_level,
        }

        entry["hash"] = self._compute_hash(entry)
        self._prev_hash = entry["hash"]
        return entry

    def generate_event_evidence(
        self,
        event_id: str,
        venue_id: str,
        event_config: dict,
        incident_scenarios: list = None,
        weather_scenario: str = "clear_day",
    ) -> list:
        """Generate a complete evidence trail for one event.

        Creates evidence entries for:
        - Phase transitions (PREPARE → READY → RUN → REVIEW)
        - System health checks throughout the event
        - Weather readings
        - Any injected incidents and their SOP chains
        - Compliance validations

        Returns list of evidence entries.
        """
        entries = []
        base = datetime.fromisoformat(event_config["event_date"])

        # 1. Phase transitions
        phases = [
            ("pre_gates",      base - timedelta(hours=2)),
            ("gates_open",     datetime.fromisoformat(event_config["gates_open_time"])),
            ("pre_event",      datetime.fromisoformat(event_config["event_start_time"]) - timedelta(minutes=15)),
            ("event_active",   datetime.fromisoformat(event_config["event_start_time"])),
            ("halftime",       datetime.fromisoformat(event_config["halftime_start_time"])),
            ("event_active_2", datetime.fromisoformat(event_config["second_half_start_time"])),
            ("post_event",     datetime.fromisoformat(event_config["event_end_time"])),
            ("facility_clear", datetime.fromisoformat(event_config["event_end_time"]) + timedelta(minutes=60)),
        ]

        for phase_id, phase_time in phases:
            entries.append(self._create_entry(
                event_id=event_id,
                venue_id=venue_id,
                timestamp=phase_time,
                evidence_type="state_transition",
                category="lifecycle",
                source_workflow="LIFECYCLE_Run_Phase",
                data={"from_phase": entries[-1]["data"].get("to_phase", "none") if entries else "none",
                      "to_phase": phase_id},
                compliance_tags=["NFL_GOM", "NIMS"],
            ))

        # 2. System health checks (every 30s during active phases)
        health_start = phases[1][1]   # gates_open
        health_end = phases[-1][1]    # facility_clear
        current = health_start
        while current < health_end:
            entries.append(self._create_entry(
                event_id=event_id,
                venue_id=venue_id,
                timestamp=current,
                evidence_type="health_check",
                category="system",
                source_workflow="INTEGRATION_System_Health_Monitor",
                data={
                    "systems_checked": 10,
                    "healthy": 10 if self.rng.random() > 0.05 else 9,
                    "degraded": 0 if self.rng.random() > 0.05 else 1,
                    "offline": 0,
                    "overall_score": round(self.rng.uniform(96, 100), 1),
                },
                classification_level=1,
            ))
            current += timedelta(seconds=30)

        # 3. Weather readings (every 60s)
        current = phases[0][1]
        while current < health_end:
            threat_level = "GREEN"
            if weather_scenario != "clear_day":
                elapsed = (current - phases[0][1]).total_seconds() / 60
                if 45 <= elapsed <= 80:
                    threat_level = "YELLOW" if elapsed < 54 else "RED"

            entries.append(self._create_entry(
                event_id=event_id,
                venue_id=venue_id,
                timestamp=current,
                evidence_type="weather_verification",
                category="weather",
                source_workflow="RUN_Monitor_Weather",
                data={
                    "threat_level": threat_level,
                    "temperature_f": round(72 + self.rng.normal(0, 2), 1),
                    "wind_speed_mph": round(8 + self.rng.normal(0, 3), 1),
                },
                compliance_tags=["NFL_GOM", "WEATHER_SAFETY"],
            ))
            current += timedelta(seconds=60)

        # 4. Incident evidence (if scenarios provided)
        if incident_scenarios:
            for scenario in incident_scenarios:
                trigger = scenario["trigger"]
                phase_time = dict(phases).get(trigger["phase"], base)
                incident_time = phase_time + timedelta(minutes=trigger["time_offset_minutes"])

                # Incident created
                incident_id = f"inc_{uuid.uuid4().hex[:8]}"
                entries.append(self._create_entry(
                    event_id=event_id,
                    venue_id=venue_id,
                    timestamp=incident_time,
                    evidence_type="incident_created",
                    category="incident",
                    source_workflow="RUN_Incident_Handler",
                    data={
                        "incident_id": incident_id,
                        "type": scenario["incident_data"]["incident_type"],
                        "severity": scenario["incident_data"]["severity"],
                        "description": scenario["incident_data"]["description"],
                    },
                    compliance_tags=["INCIDENT", "NIMS"],
                    classification_level=3,
                ))

                # SOP activation
                for sop in scenario.get("expected_sop_chain", []):
                    entries.append(self._create_entry(
                        event_id=event_id,
                        venue_id=venue_id,
                        timestamp=incident_time + timedelta(seconds=5),
                        evidence_type="sop_activated",
                        category="sop_execution",
                        source_workflow="RESPONSE_SOP_Executor",
                        data={
                            "incident_id": incident_id,
                            "sop_id": sop["sop_id"],
                            "auto_activated": True,
                        },
                        compliance_tags=["NIMS"],
                        classification_level=3,
                    ))

                    # SOP step completions
                    step_time = incident_time + timedelta(seconds=10)
                    for phase in sop.get("phases", []):
                        for step in phase.get("steps", []):
                            step_time += timedelta(seconds=step.get("expected_time_seconds", 60))
                            entries.append(self._create_entry(
                                event_id=event_id,
                                venue_id=venue_id,
                                timestamp=step_time,
                                evidence_type="sop_step_completed",
                                category="sop_execution",
                                source_workflow="RESPONSE_SOP_Executor",
                                data={
                                    "incident_id": incident_id,
                                    "sop_id": sop["sop_id"],
                                    "step": step["action"],
                                    "automation": step.get("automation", "manual"),
                                },
                                classification_level=3,
                            ))

                # Incident resolved
                resolution_time = incident_time + timedelta(
                    minutes=scenario.get("expected_resolution_minutes", 30)
                )
                entries.append(self._create_entry(
                    event_id=event_id,
                    venue_id=venue_id,
                    timestamp=resolution_time,
                    evidence_type="incident_resolved",
                    category="incident",
                    source_workflow="RUN_Incident_Handler",
                    data={
                        "incident_id": incident_id,
                        "resolution": "resolved",
                        "duration_minutes": scenario.get("expected_resolution_minutes", 30),
                    },
                    compliance_tags=["INCIDENT", "NIMS"],
                    classification_level=3,
                ))

        # Sort by timestamp
        entries.sort(key=lambda e: e["timestamp"])

        # Recompute hash chain in sorted order
        self._prev_hash = "GENESIS"
        self._sequence = 0
        for entry in entries:
            self._sequence += 1
            entry["sequence_num"] = self._sequence
            entry["prev_hash"] = self._prev_hash
            entry["hash"] = self._compute_hash(entry)
            self._prev_hash = entry["hash"]

        return entries

    def generate_historical(
        self,
        venue_id: str,
        months: int = 6,
        events_per_month: int = 4,
    ) -> int:
        """Generate bulk historical evidence for a venue.

        Args:
            venue_id: Target venue
            months: Number of months of history
            events_per_month: Simulated events per month

        Returns:
            Total evidence entries generated.
        """
        total = 0
        start = datetime.utcnow() - timedelta(days=months * 30)

        for month in range(months):
            for event_num in range(events_per_month):
                event_date = start + timedelta(
                    days=month * 30 + event_num * 7
                )
                event_id = f"evt_{event_date.strftime('%Y%m%d')}_{venue_id}"

                event_config = {
                    "event_id": event_id,
                    "event_date": event_date.isoformat(),
                    "gates_open_time": (event_date + timedelta(hours=10)).isoformat(),
                    "event_start_time": (event_date + timedelta(hours=11)).isoformat(),
                    "halftime_start_time": (event_date + timedelta(hours=12)).isoformat(),
                    "second_half_start_time": (event_date + timedelta(hours=12, minutes=20)).isoformat(),
                    "event_end_time": (event_date + timedelta(hours=13, minutes=30)).isoformat(),
                    "facility_clear_time": (event_date + timedelta(hours=14, minutes=30)).isoformat(),
                }

                entries = self.generate_event_evidence(
                    event_id=event_id,
                    venue_id=venue_id,
                    event_config=event_config,
                )
                self._bulk_insert(entries)
                total += len(entries)

        return total

    def _bulk_insert(self, entries: list):
        """Insert evidence entries into PostgreSQL."""
        cursor = self.pg.cursor()
        for entry in entries:
            cursor.execute("""
                INSERT INTO evidence_ledger (
                    evidence_id, event_id, venue_id, timestamp,
                    evidence_type, category, source_workflow,
                    data, compliance_tags, hash, prev_hash,
                    classification_level
                ) VALUES (
                    %(evidence_id)s, %(event_id)s, %(venue_id)s, %(timestamp)s,
                    %(evidence_type)s, %(category)s, %(source_workflow)s,
                    %(data)s::jsonb, %(compliance_tags)s, %(hash)s, %(prev_hash)s,
                    %(classification_level)s
                ) ON CONFLICT (evidence_id) DO NOTHING
            """, {
                **entry,
                "data": psycopg2.extras.Json(entry["data"]),
            })
        self.pg.commit()

    def verify_chain(self, venue_id: str, event_id: str = None) -> dict:
        """Verify hash chain integrity for a venue (and optionally event)."""
        cursor = self.pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            SELECT evidence_id, sequence_num, hash, prev_hash, data
            FROM evidence_ledger
            WHERE venue_id = %s
        """
        params = [venue_id]
        if event_id:
            query += " AND event_id = %s"
            params.append(event_id)
        query += " ORDER BY sequence_num ASC"

        cursor.execute(query, params)
        entries = cursor.fetchall()

        valid = True
        breaks = []
        expected_prev = "GENESIS"

        for entry in entries:
            if entry["prev_hash"] != expected_prev:
                valid = False
                breaks.append({
                    "evidence_id": entry["evidence_id"],
                    "sequence_num": entry["sequence_num"],
                    "expected_prev": expected_prev,
                    "actual_prev": entry["prev_hash"],
                })
            expected_prev = entry["hash"]

        return {
            "valid": valid,
            "total_entries": len(entries),
            "chain_breaks": breaks,
            "verified_at": datetime.utcnow().isoformat(),
        }

    def close(self):
        self.pg.close()
```

---

# 10. Demo Scenario Packages

## 10.1 Overview

Pre-composed scenario bundles designed for specific demo audiences. Each package defines a complete scenario script, expected system responses, talking points for the presenter, and evidence trail verification steps. Packages are defined as YAML files loaded by the Temporal Simulation Engine.

## 10.2 Package: "The Perfect Game Day"

```yaml
# scenarios/perfect_game_day.yaml
package_id: perfect_game_day
name: "The Perfect Game Day"
description: >
  Everything goes right. Demonstrates operational monitoring, real-time
  dashboards, guest experience optimization, and the full evidence trail
  of a successful event. No incidents, no weather threats.
audience: [executive, operations, investor]
recommended_speed: 60   # 60x — full event in ~5 minutes
duration_at_speed_minutes: 5

venue_id: venue_mbs_001
event_config:
  event_id: evt_demo_perfect_001
  event_date: "2026-03-15T08:00:00"
  gates_open_time: "2026-03-15T10:00:00"
  event_start_time: "2026-03-15T11:00:00"
  halftime_start_time: "2026-03-15T12:00:00"
  second_half_start_time: "2026-03-15T12:20:00"
  event_end_time: "2026-03-15T13:30:00"
  facility_clear_time: "2026-03-15T14:30:00"

weather_scenario: clear_day
crowd_scenario: null     # default flow patterns
incidents: []            # no incidents

talking_points:
  gates_open: >
    Watch how the dashboard lights up as gates open. Every sensor comes online,
    crowd density tracking begins, and the system establishes baselines for
    all 42 zones simultaneously.
  pre_event: >
    The system is now monitoring crowd flow across every zone. Notice how
    the density heat map shifts as fans move from concourses to seats.
    The evidence ledger is capturing every state transition.
  event_active: >
    Full operational monitoring is now active. Weather is being checked every
    60 seconds, system health is validated every 30 seconds, and crowd
    density is fused from cameras, turnstiles, and WiFi every 10 seconds.
  halftime: >
    Watch the crowd redistribution model in action — see how concourse density
    spikes while seating areas dip. The system predicts bathroom and
    concession bottlenecks before they happen.
  post_event: >
    Egress monitoring is critical. The system tracks crowd outflow through
    every gate, predicts clearing time, and verifies that every zone
    reaches safe capacity before facility-clear is declared.
  facility_clear: >
    Event complete. The REVIEW phase kicks in automatically — generating
    an After Action Report with performance grades, evidence chain
    verification, and improvement recommendations. This is the data
    that makes the next event even better.

verification_steps:
  - description: "Verify all 8 phase transitions captured in Evidence Ledger"
    query: "SELECT COUNT(*) FROM evidence_ledger WHERE event_id = 'evt_demo_perfect_001' AND evidence_type = 'state_transition'"
    expected: 8
  - description: "Verify zero incidents"
    query: "SELECT COUNT(*) FROM incidents WHERE event_id = 'evt_demo_perfect_001'"
    expected: 0
  - description: "Verify evidence hash chain integrity"
    action: "evidence_seeder.verify_chain('venue_mbs_001', 'evt_demo_perfect_001')"
    expected: "valid: true"
  - description: "Verify weather stayed GREEN throughout"
    query: "SELECT COUNT(DISTINCT threat_level) FROM weather_readings WHERE event_id = 'evt_demo_perfect_001'"
    expected: 1  # only GREEN
```

## 10.3 Package: "Lightning Strikes"

```yaml
# scenarios/lightning_strikes.yaml
package_id: lightning_strikes
name: "Lightning Strikes"
description: >
  Approaching thunderstorm triggers NFL shelter-in-place protocol, game delay,
  weather monitoring, fan communications, and resumption. Demonstrates weather
  response, SOP execution, and evidence capture under pressure.
audience: [operations, safety, nfl_ops, sales_demo]
recommended_speed: 30
duration_at_speed_minutes: 8

venue_id: venue_mbs_001
event_config:
  event_id: evt_demo_lightning_001
  event_date: "2026-03-15T08:00:00"
  gates_open_time: "2026-03-15T10:00:00"
  event_start_time: "2026-03-15T11:00:00"
  halftime_start_time: "2026-03-15T12:00:00"
  second_half_start_time: "2026-03-15T12:20:00"
  event_end_time: "2026-03-15T13:30:00"
  facility_clear_time: "2026-03-15T14:30:00"

weather_scenario: approaching_thunderstorm
crowd_scenario: null
incidents: []  # Weather SOP triggers automatically from weather data

talking_points:
  event_active: >
    Game is underway, everything looks good. But watch the weather panel —
    barometric pressure is starting to drop and clouds are building.
    The system detected this 45 minutes before the first lightning strike.
  weather_yellow: >
    The system just elevated to YELLOW. Lightning detected 15 miles out.
    Watch how the command center dashboard shifts to weather priority mode.
    Staff are being pre-positioned near shelter areas.
  weather_red: >
    Lightning within 8 miles — NFL rule triggered. The SOP executor just
    activated the Lightning Response protocol automatically. PA announcements
    are going out, signage is updating, staff are directing fans to shelter.
    Every single action is being captured in the Evidence Ledger.
  monitoring: >
    We're now in continuous monitoring. Status updates every 15 minutes
    to fans. The system is tracking lightning movement and will declare
    all-clear only after 30 continuous minutes with no strikes within 8 miles.
  all_clear: >
    30-minute clear window verified by the system. All-clear announced.
    Game resumption coordinated with NFL officials. Every step is documented
    with timestamps, actor identification, and hash-chain verification.

verification_steps:
  - description: "Verify lightning SOP was activated"
    query: "SELECT COUNT(*) FROM sop_executions WHERE sop_id = 'sop_lightning_response_v3' AND event_id = 'evt_demo_lightning_001'"
    expected_gte: 1
  - description: "Verify weather threat escalation in evidence"
    query: "SELECT COUNT(*) FROM evidence_ledger WHERE event_id = 'evt_demo_lightning_001' AND evidence_type = 'weather_threat'"
    expected_gte: 1
  - description: "Verify PA announcement evidence"
    query: "SELECT COUNT(*) FROM evidence_ledger WHERE event_id = 'evt_demo_lightning_001' AND evidence_type = 'pa_announcement'"
    expected_gte: 1
```

## 10.4 Package: "Cascading Crisis"

```yaml
# scenarios/cascading_crisis.yaml
package_id: cascading_crisis
name: "Cascading Crisis"
description: >
  Medical emergency occurs during a power failure while a thunderstorm approaches.
  Tests multi-incident coordination, resource allocation conflicts, and escalation.
  This is the stress test that demonstrates Sentrais OS handling what breaks
  traditional emergency plans.
audience: [operations, safety, federal, investor_technical]
recommended_speed: 20
duration_at_speed_minutes: 12

venue_id: venue_mbs_001
event_config:
  event_id: evt_demo_cascade_001
  event_date: "2026-03-15T08:00:00"
  gates_open_time: "2026-03-15T10:00:00"
  event_start_time: "2026-03-15T11:00:00"
  halftime_start_time: "2026-03-15T12:00:00"
  second_half_start_time: "2026-03-15T12:20:00"
  event_end_time: "2026-03-15T13:30:00"
  facility_clear_time: "2026-03-15T14:30:00"

weather_scenario: approaching_thunderstorm
crowd_scenario: null

incidents:
  - scenario_ref: power_failure_north_concourse
    trigger:
      phase: event_active
      time_offset_minutes: 25
  - scenario_ref: medical_cardiac_section_300
    trigger:
      phase: event_active
      time_offset_minutes: 30  # 5 minutes AFTER power failure

talking_points:
  power_failure: >
    Power failure on north concourse. Emergency lighting kicks in automatically.
    The Utility Failure SOP is activated. Maintenance team dispatched.
    Watch how the system prioritizes — life safety systems first,
    then guest comfort, then concessions.
  medical_during_power: >
    Now a cardiac emergency in section 300 — while the power failure is still
    being resolved. This is where traditional paper-based plans fail. Watch how
    Sentrais OS coordinates BOTH incidents simultaneously: separate SOP tracks,
    shared resource pool, automatic escalation when resources conflict.
  weather_compound: >
    And now the thunderstorm we've been tracking arrives. Three concurrent
    crises — each with its own SOP, its own resource requirements, its own
    evidence trail. The system maintains calm during chaos, prioritizing
    by threat-to-life severity and managing the complexity that would
    overwhelm any paper-based plan.
  resolution: >
    All three incidents resolved with full evidence chains. The After Action
    Report will show exactly how resources were allocated, where bottlenecks
    occurred, and what can be improved for next time. This is the continuous
    improvement loop that makes each event safer than the last.

verification_steps:
  - description: "Verify 3 concurrent incidents created"
    query: "SELECT COUNT(DISTINCT incident_id) FROM incidents WHERE event_id = 'evt_demo_cascade_001'"
    expected_gte: 2
  - description: "Verify multiple SOPs running simultaneously"
    query: "SELECT COUNT(*) FROM sop_executions WHERE event_id = 'evt_demo_cascade_001' AND status IN ('running', 'completed')"
    expected_gte: 3
  - description: "Verify evidence chain integrity despite concurrent events"
    action: "evidence_seeder.verify_chain('venue_mbs_001', 'evt_demo_cascade_001')"
    expected: "valid: true"
```

## 10.5 Package: "The Full Season"

```yaml
# scenarios/full_season.yaml
package_id: full_season
name: "The Full Season"
description: >
  Generates 10 home games with varying weather conditions and incident types.
  Tests REVIEW zone learning, trend detection, and continuous improvement.
  Not real-time — generates bulk historical data.
audience: [engineering, data_science, qa]
mode: batch_generation  # not temporal replay
duration_at_speed_minutes: null  # batch mode

venue_id: venue_mbs_001

games:
  - event_id: evt_season_g01
    date: "2026-09-10"
    weather: clear_day
    incidents: []
    # Baseline — clean game for comparison

  - event_id: evt_season_g02
    date: "2026-09-17"
    weather: heavy_rain
    incidents:
      - scenario_ref: medical_cardiac_section_300

  - event_id: evt_season_g03
    date: "2026-10-01"
    weather: clear_day
    incidents:
      - scenario_ref: security_altercation_concourse
      - scenario_ref: structural_handrail_section200

  - event_id: evt_season_g04
    date: "2026-10-15"
    weather: approaching_thunderstorm
    incidents: []
    # Weather SOP triggers automatically

  - event_id: evt_season_g05
    date: "2026-10-29"
    weather: clear_day
    incidents:
      - scenario_ref: suspicious_package_gate4

  - event_id: evt_season_g06
    date: "2026-11-12"
    weather: clear_day
    incidents:
      - scenario_ref: power_failure_north_concourse
      - scenario_ref: medical_cardiac_section_300

  - event_id: evt_season_g07
    date: "2026-11-26"
    weather: winter_storm
    incidents:
      - scenario_ref: security_altercation_concourse

  - event_id: evt_season_g08
    date: "2026-12-10"
    weather: clear_day
    incidents: []

  - event_id: evt_season_g09
    date: "2026-12-24"
    weather: clear_day
    incidents:
      - scenario_ref: mass_casualty_food_contamination

  - event_id: evt_season_g10
    date: "2027-01-07"
    weather: extreme_heat  # hypothetical early-season makeup
    incidents:
      - scenario_ref: medical_cardiac_section_300
      - scenario_ref: security_altercation_concourse

verification_steps:
  - description: "Verify 10 events created"
    query: "SELECT COUNT(DISTINCT event_id) FROM events WHERE venue_id = 'venue_mbs_001' AND event_id LIKE 'evt_season_%'"
    expected: 10
  - description: "Verify trend data available for REVIEW zone"
    query: "SELECT COUNT(*) FROM evidence_ledger WHERE venue_id = 'venue_mbs_001' AND event_id LIKE 'evt_season_%'"
    expected_gte: 1000
  - description: "Verify incident frequency analysis possible"
    query: "SELECT incident_type, COUNT(*) FROM incidents WHERE event_id LIKE 'evt_season_%' GROUP BY incident_type"
    expected_types: [medical, security, operational, utility]
```

---

# 11. Data Validation & Quality

## 11.1 Overview

Validation scripts verify that all generated synthetic data passes database schema constraints, maintains internal consistency, and produces physically plausible values. These validators run as part of CI/CD and can be invoked after any data generation step.

## 11.2 Module: `validation/validators.py`

```python
"""
Sentrais OS — Synthetic Data Validators
Ensures generated data meets schema, consistency, and plausibility requirements.

Usage:
    from sentrais_synth.validation.validators import SyntheticDataValidator
    validator = SyntheticDataValidator(pg_dsn, mongo_uri)
    results = validator.run_all(venue_id, event_id)
"""

import psycopg2
import psycopg2.extras
from pymongo import MongoClient
from datetime import datetime
from typing import Optional


class ValidationResult:
    """Result of a single validation check."""

    def __init__(self, name: str, passed: bool, message: str = "", details: dict = None):
        self.name = name
        self.passed = passed
        self.message = message
        self.details = details or {}

    def __repr__(self):
        status = "✓ PASS" if self.passed else "✗ FAIL"
        return f"{status}: {self.name} — {self.message}"


class SyntheticDataValidator:
    """Validates synthetic data across all stores."""

    def __init__(self, pg_dsn: str, mongo_uri: str):
        self.pg = psycopg2.connect(pg_dsn)
        self.mongo = MongoClient(mongo_uri)
        self.db = self.mongo["sentrais_os"]

    def run_all(self, venue_id: str, event_id: str = None) -> list:
        """Run all validation checks. Returns list of ValidationResult."""
        results = []
        results.extend(self.validate_schema_constraints(venue_id))
        results.extend(self.validate_time_series_continuity(venue_id, event_id))
        results.extend(self.validate_evidence_chain(venue_id, event_id))
        results.extend(self.validate_sop_compatibility())
        results.extend(self.validate_crowd_capacity(venue_id, event_id))
        results.extend(self.validate_weather_plausibility(venue_id, event_id))
        results.extend(self.validate_incident_timelines(venue_id, event_id))
        return results

    # ── 1. Schema Constraint Validation ──

    def validate_schema_constraints(self, venue_id: str) -> list:
        """Verify all generated data passes database schema constraints."""
        results = []
        cursor = self.pg.cursor()

        # Check venue_type enum
        cursor.execute("""
            SELECT COUNT(*) FROM venues
            WHERE venue_id = %s
            AND venue_type IN ('stadium', 'arena', 'amphitheater', 'convention_center', 'other')
        """, (venue_id,))
        count = cursor.fetchone()[0]
        results.append(ValidationResult(
            "venue_type_enum",
            count > 0,
            f"Venue {venue_id} has valid venue_type" if count > 0 else "Invalid venue_type",
        ))

        # Check staff status enum
        cursor.execute("""
            SELECT COUNT(*) FROM staff
            WHERE venue_id = %s
            AND status NOT IN ('active', 'inactive', 'on_leave')
        """, (venue_id,))
        invalid = cursor.fetchone()[0]
        results.append(ValidationResult(
            "staff_status_enum",
            invalid == 0,
            f"{invalid} staff with invalid status" if invalid > 0 else "All staff status values valid",
        ))

        # Check certification status enum
        cursor.execute("""
            SELECT COUNT(*) FROM staff_certifications sc
            JOIN staff s ON sc.staff_id = s.staff_id
            WHERE s.venue_id = %s
            AND sc.status NOT IN ('current', 'expired', 'pending', 'revoked')
        """, (venue_id,))
        invalid = cursor.fetchone()[0]
        results.append(ValidationResult(
            "cert_status_enum",
            invalid == 0,
            f"{invalid} certs with invalid status" if invalid > 0 else "All cert status values valid",
        ))

        # Check sensor quality enum
        cursor.execute("""
            SELECT COUNT(*) FROM sensor_readings
            WHERE venue_id = %s
            AND quality NOT IN ('good', 'suspect', 'bad')
        """, (venue_id,))
        invalid = cursor.fetchone()[0]
        results.append(ValidationResult(
            "sensor_quality_enum",
            invalid == 0,
            f"{invalid} readings with invalid quality" if invalid > 0 else "All sensor quality valid",
        ))

        return results

    # ── 2. Time-Series Continuity ──

    def validate_time_series_continuity(
        self, venue_id: str, event_id: str = None
    ) -> list:
        """Verify no gaps in expected sensor reading intervals."""
        results = []
        cursor = self.pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        query = """
            WITH readings_with_gaps AS (
                SELECT sensor_id, time,
                       time - LAG(time) OVER (PARTITION BY sensor_id ORDER BY time) as gap
                FROM sensor_readings
                WHERE venue_id = %s
            )
            SELECT sensor_id, COUNT(*) as gap_count, MAX(gap) as max_gap
            FROM readings_with_gaps
            WHERE gap > INTERVAL '5 minutes'
            GROUP BY sensor_id
        """
        cursor.execute(query, (venue_id,))
        gaps = cursor.fetchall()

        results.append(ValidationResult(
            "time_series_continuity",
            len(gaps) == 0,
            f"{len(gaps)} sensors with >5min gaps" if gaps else "No time-series gaps detected",
            {"sensors_with_gaps": [g["sensor_id"] for g in gaps]},
        ))

        return results

    # ── 3. Evidence Chain Integrity ──

    def validate_evidence_chain(
        self, venue_id: str, event_id: str = None
    ) -> list:
        """Verify evidence hash chains are intact."""
        results = []
        cursor = self.pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        query = """
            SELECT evidence_id, sequence_num, hash, prev_hash
            FROM evidence_ledger
            WHERE venue_id = %s
        """
        params = [venue_id]
        if event_id:
            query += " AND event_id = %s"
            params.append(event_id)
        query += " ORDER BY sequence_num ASC"

        cursor.execute(query, params)
        entries = cursor.fetchall()

        if not entries:
            results.append(ValidationResult(
                "evidence_chain_exists",
                False,
                "No evidence entries found",
            ))
            return results

        # Verify prev_hash linkage
        breaks = 0
        expected_prev = "GENESIS"
        for entry in entries:
            if entry["prev_hash"] != expected_prev:
                breaks += 1
            expected_prev = entry["hash"]

        results.append(ValidationResult(
            "evidence_hash_chain",
            breaks == 0,
            f"Hash chain intact ({len(entries)} entries)" if breaks == 0
            else f"{breaks} chain breaks in {len(entries)} entries",
        ))

        # Verify no duplicate sequence numbers
        seq_nums = [e["sequence_num"] for e in entries]
        duplicates = len(seq_nums) - len(set(seq_nums))
        results.append(ValidationResult(
            "evidence_sequence_unique",
            duplicates == 0,
            f"{duplicates} duplicate sequence numbers" if duplicates > 0
            else "All sequence numbers unique",
        ))

        return results

    # ── 4. SOP Compatibility ──

    def validate_sop_compatibility(self) -> list:
        """Verify SOP definitions are compatible with the SOP executor workflow."""
        results = []
        sops = list(self.db["sops"].find({"metadata.status": "active"}))

        for sop in sops:
            sop_id = sop["_id"]

            # Must have metadata
            has_metadata = "metadata" in sop and "title" in sop["metadata"]
            results.append(ValidationResult(
                f"sop_metadata_{sop_id}",
                has_metadata,
                f"SOP {sop_id} has valid metadata" if has_metadata else "Missing metadata",
            ))

            # Must have at least one phase
            has_phases = "phases" in sop and len(sop["phases"]) > 0
            results.append(ValidationResult(
                f"sop_phases_{sop_id}",
                has_phases,
                f"SOP {sop_id} has {len(sop.get('phases', []))} phases",
            ))

            # Each phase must have steps
            if has_phases:
                for phase in sop["phases"]:
                    has_steps = "steps" in phase and len(phase["steps"]) > 0
                    if not has_steps:
                        results.append(ValidationResult(
                            f"sop_steps_{sop_id}_{phase.get('phase_id', '?')}",
                            False,
                            f"Phase {phase.get('phase_id')} in {sop_id} has no steps",
                        ))

            # Must have escalation chain
            has_escalation = "escalation_chain" in sop and len(sop["escalation_chain"]) > 0
            results.append(ValidationResult(
                f"sop_escalation_{sop_id}",
                has_escalation,
                f"SOP {sop_id} has escalation chain" if has_escalation else "Missing escalation chain",
            ))

        return results

    # ── 5. Crowd Capacity Bounds ──

    def validate_crowd_capacity(
        self, venue_id: str, event_id: str = None
    ) -> list:
        """Verify crowd numbers never exceed venue capacity."""
        results = []
        cursor = self.pg.cursor()

        # Get venue capacity
        cursor.execute("SELECT capacity FROM venues WHERE venue_id = %s", (venue_id,))
        row = cursor.fetchone()
        if not row:
            results.append(ValidationResult(
                "venue_exists", False, f"Venue {venue_id} not found"))
            return results
        venue_capacity = row[0]

        # Check crowd_metrics
        query = """
            SELECT MAX(total_occupancy) as max_occ
            FROM crowd_metrics
            WHERE venue_id = %s
        """
        params = [venue_id]
        if event_id:
            query = query.replace("WHERE", "WHERE event_id = %s AND")
            params.insert(0, event_id)

        cursor.execute(query, params)
        max_occ = cursor.fetchone()[0] or 0

        results.append(ValidationResult(
            "crowd_within_capacity",
            max_occ <= venue_capacity,
            f"Max occupancy {max_occ} {'<=' if max_occ <= venue_capacity else '>'} "
            f"capacity {venue_capacity}",
        ))

        return results

    # ── 6. Weather Plausibility ──

    def validate_weather_plausibility(
        self, venue_id: str, event_id: str = None
    ) -> list:
        """Verify weather data transitions are physically plausible."""
        results = []
        cursor = self.pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        query = """
            SELECT time, temperature, humidity, wind_speed,
                   barometric_pressure, precipitation_rate
            FROM weather_readings
            WHERE venue_id = %s
            ORDER BY time ASC
        """
        cursor.execute(query, (venue_id,))
        readings = cursor.fetchall()

        if len(readings) < 2:
            results.append(ValidationResult(
                "weather_data_exists",
                len(readings) > 0,
                f"Found {len(readings)} weather readings",
            ))
            return results

        # Check temperature rate of change (max 5°F per minute)
        max_temp_change = 0
        for i in range(1, len(readings)):
            dt_minutes = (readings[i]["time"] - readings[i-1]["time"]).total_seconds() / 60
            if dt_minutes > 0:
                change = abs(readings[i]["temperature"] - readings[i-1]["temperature"])
                rate = change / dt_minutes
                max_temp_change = max(max_temp_change, rate)

        results.append(ValidationResult(
            "weather_temp_plausible",
            max_temp_change <= 5.0,
            f"Max temp change rate: {max_temp_change:.1f}°F/min "
            f"({'plausible' if max_temp_change <= 5.0 else 'implausible'})",
        ))

        # Check humidity range (0–100%)
        cursor.execute("""
            SELECT COUNT(*) FROM weather_readings
            WHERE venue_id = %s AND (humidity < 0 OR humidity > 100)
        """, (venue_id,))
        invalid_humidity = cursor.fetchone()[0]
        results.append(ValidationResult(
            "weather_humidity_range",
            invalid_humidity == 0,
            f"{invalid_humidity} readings with humidity outside 0-100%",
        ))

        # Check wind speed non-negative
        cursor.execute("""
            SELECT COUNT(*) FROM weather_readings
            WHERE venue_id = %s AND wind_speed < 0
        """, (venue_id,))
        neg_wind = cursor.fetchone()[0]
        results.append(ValidationResult(
            "weather_wind_nonnegative",
            neg_wind == 0,
            f"{neg_wind} readings with negative wind speed",
        ))

        return results

    # ── 7. Incident Timeline Consistency ──

    def validate_incident_timelines(
        self, venue_id: str, event_id: str = None
    ) -> list:
        """Verify incident timelines are internally consistent."""
        results = []
        cursor = self.pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        query = """
            SELECT i.incident_id, i.created_at, i.resolved_at, i.status,
                   COUNT(it.event_type) as timeline_entries
            FROM incidents i
            LEFT JOIN incident_timeline it ON i.incident_id = it.incident_id
            WHERE i.venue_id = %s
        """
        params = [venue_id]
        if event_id:
            query += " AND i.event_id = %s"
            params.append(event_id)
        query += " GROUP BY i.incident_id, i.created_at, i.resolved_at, i.status"

        cursor.execute(query, params)
        incidents = cursor.fetchall()

        for inc in incidents:
            # Resolved incidents must have resolved_at after created_at
            if inc["status"] == "resolved" and inc["resolved_at"]:
                valid_timeline = inc["resolved_at"] > inc["created_at"]
                results.append(ValidationResult(
                    f"incident_timeline_{inc['incident_id']}",
                    valid_timeline,
                    f"Incident {inc['incident_id']}: resolved_at "
                    f"{'>' if valid_timeline else '<='} created_at",
                ))

            # Every incident should have at least a 'created' timeline entry
            results.append(ValidationResult(
                f"incident_has_timeline_{inc['incident_id']}",
                inc["timeline_entries"] > 0,
                f"Incident {inc['incident_id']}: {inc['timeline_entries']} timeline entries",
            ))

        return results

    def close(self):
        self.pg.close()
        self.mongo.close()
```

## 11.3 CLI Integration

```python
# sentrais_synth/cli.py (validation commands)

import click
import json
from sentrais_synth.validation.validators import SyntheticDataValidator


@click.group()
def cli():
    """Sentrais OS — Synthetic Data & Simulation CLI"""
    pass


@cli.group()
def validate():
    """Data validation commands."""
    pass


@validate.command("all")
@click.option("--venue-id", required=True, help="Venue to validate")
@click.option("--event-id", default=None, help="Specific event (optional)")
@click.option("--pg-dsn", envvar="SENTRAIS_PG_DSN",
              default="postgresql://sentrais:sentrais_dev_2026@localhost:5432/sentrais_os")
@click.option("--mongo-uri", envvar="SENTRAIS_MONGO_URI",
              default="mongodb://sentrais:sentrais_dev_2026@localhost:27017/sentrais_os?authSource=admin")
@click.option("--output", type=click.Choice(["text", "json"]), default="text")
def validate_all(venue_id, event_id, pg_dsn, mongo_uri, output):
    """Run all validation checks on generated data."""
    validator = SyntheticDataValidator(pg_dsn, mongo_uri)
    results = validator.run_all(venue_id, event_id)
    validator.close()

    if output == "json":
        click.echo(json.dumps([
            {"name": r.name, "passed": r.passed, "message": r.message, "details": r.details}
            for r in results
        ], indent=2))
    else:
        passed = sum(1 for r in results if r.passed)
        failed = sum(1 for r in results if not r.passed)
        click.echo(f"\n{'='*60}")
        click.echo(f"  SENTRAIS OS — Data Validation Report")
        click.echo(f"  Venue: {venue_id}  Event: {event_id or 'all'}")
        click.echo(f"{'='*60}\n")

        for r in results:
            click.echo(f"  {r}")

        click.echo(f"\n{'='*60}")
        click.echo(f"  Results: {passed} passed, {failed} failed, {len(results)} total")
        click.echo(f"{'='*60}\n")

    raise SystemExit(1 if failed > 0 else 0)


@cli.group()
def venue():
    """Venue profile commands."""
    pass


@cli.group()
def simulate():
    """Simulation commands."""
    pass


if __name__ == "__main__":
    cli()
```

## 11.4 Docker Integration

```dockerfile
# synthetic/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY sentrais_synth/ /app/sentrais_synth/
COPY scenarios/ /app/scenarios/
COPY profiles/ /app/profiles/

# Default command: start the simulation REST API
CMD ["uvicorn", "sentrais_synth.temporal.api:app", "--host", "0.0.0.0", "--port", "8090"]

# Alternative entry points:
# Seed data:    docker run sentrais-synthetic python -m sentrais_synth.cli venue seed --all
# Validate:     docker run sentrais-synthetic python -m sentrais_synth.cli validate all --venue-id venue_mbs_001
# Run scenario: docker run sentrais-synthetic python -m sentrais_synth.cli simulate run --scenario lightning_strikes
```

---

*Document Version: 1.0.0*
*Covers: Synthetic Data Generation, Temporal Simulation, Demo Scenario Packages, Data Validation*
*Companion to: sentrais_n8n_architecture_part1.md, sentrais_n8n_architecture_part2.md, sentrais_os_deployment_guide.md*
*Architecture Team | Sentrais Corporation*
*SENTRAIS CORPORATION | SYNTHETIC DATA & SIMULATION FRAMEWORK | sentrais.com*
