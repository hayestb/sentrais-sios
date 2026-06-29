# NFLIT360 v7.0 Deployment Package

## Change Control

| Field | Value |
|-------|-------|
| **Change ID** | CHG-2025-PLAYBOOK-REMODEL-001 |
| **Version** | 6.1 → 7.0 |
| **Status** | ✅ APPROVED |
| **Approved By** | Sentrais Architect |
| **Effective Date** | 2025-12-16 |

---

## Package Contents

```
nflit360_v7_deployment/
├── README.md                    # This file
├── playbooks/                   # 16 v7.0 GDA playbooks
│   ├── IVRS_HomeBooth_GDA_v7_0.json
│   ├── IVRS_VisitorBooth_GDA_v7_0.json
│   ├── IVRS_HomeField_GDA_v7_0.json
│   ├── IVRS_VisitorField_GDA_v7_0.json
│   ├── FTR_Stadium_GDA_v7_0.json
│   ├── IR_TECH_Booth_GDA_v7_0.json
│   ├── O2O_Field_GDA_v7_0.json
│   ├── HAWKEYE_Stadium_GDA_v7_0.json
│   ├── WIFI_Stadium_GDA_v7_0.json
│   ├── C2P_HomeSideline_GDA_v7_0.json
│   ├── C2P_VisitorSideline_GDA_v7_0.json
│   ├── SVS_HomeBooth_GDA_v7_0.json
│   ├── SVS_VisitorBooth_GDA_v7_0.json
│   ├── SVS_HomeSideline_GDA_v7_0.json
│   ├── SVS_VisitorSideline_GDA_v7_0.json
│   └── EFC_Stadium_GDA_v7_0.json
├── orchestration/               # Orchestration files
│   ├── EVERGAME360_Master_Orchestration_v7_0.json
│   └── EVERGAME360_Dependency_Graph_v7_0.json
├── scripts/                     # Deployment automation
│   ├── deploy_v7.sh            # Main deployment script
│   └── rollback_v6.sh          # Rollback script
└── docs/                        # Documentation
    └── MIGRATION_GUIDE.md       # Detailed migration guide
```

---

## Quick Start

### 1. Extract Package
```bash
unzip nflit360_v7_deployment.zip
cd nflit360_v7_deployment
```

### 2. Set Repository Path
```bash
export REPO_ROOT=/path/to/your/NFLIT360
```

### 3. Run Deployment
```bash
./scripts/deploy_v7.sh
```

### 4. Commit & Push
```bash
cd $REPO_ROOT
git add .
git commit -m "Deploy NFLIT360 v7.0 - CHG-2025-PLAYBOOK-REMODEL-001"
git push origin main
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Playbooks | 16 |
| Total Tasks | 775 |
| Systems | 9 |
| Timing Tiers | 11 (GD-1, T1-T11) |

---

## System Summary

| System | Playbooks | Tasks | Hat Color |
|--------|-----------|-------|-----------|
| IVRS | 4 | 66 | BLUE |
| FTR | 1 | 58 | GRAY |
| IR_TECH | 1 | 34 | GRAY |
| O2O | 1 | 14 | GRAY |
| HAWKEYE | 1 | 150 | VENDOR |
| WIFI | 1 | 31 | GRAY |
| C2P | 2 | 122 | ORANGE |
| SVS | 4 | 274 | PURPLE |
| EFC | 1 | 26 | ORANGE-EFC |

---

## Rollback

If issues occur post-deployment:

```bash
./scripts/rollback_v6.sh /path/to/backup/directory
```

---

## Support

For issues or questions, refer to:
- `docs/MIGRATION_GUIDE.md` - Detailed migration instructions
- Change Control Record - CHG-2025-PLAYBOOK-REMODEL-001

