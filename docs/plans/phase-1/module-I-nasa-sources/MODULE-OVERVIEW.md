# Module I — NASA Source Registry & Integrations (NEW v1.1)

> **Purpose:** Implement the data_sources registry, integrate with all three required NASA data channels, and build the Source/Provenance UI.
>
> **Reference:** PRD v1.1 §12 (NASA Data Source Policy), §16.11 (FRs), §18.1 (Schema) | DECISIONS.md D-016
>
> **This module is entirely new in v1.1.** The hackathon requires proof of use for NASA Open Data, NASA API, and NASA Earthdata.

---

## Required NASA Channels

| Channel | URL | Role in IGNIS | Matching? |
|:---|:---|:---|:---|
| NASA Open Data | `https://data.nasa.gov` | Dataset discovery, identifiers, metadata | Yes (when underlying data is scientific) |
| NASA APIs | `https://api.nasa.gov` | Media/context enrichment | No by default |
| NASA Earthdata | `https://earthdata.nasa.gov/user-resources/remote-sensors` | Earth-observation context for stories | No |

---

## Tasks (6)

| Task | File | Summary |
|:---|:---|:---|
| I.1 | `task-I1-sources-api.md` | Sources CRUD API endpoints |
| I.2 | `task-I2-nasa-open-data.md` | Register NASA Open Data source |
| I.3 | `task-I3-nasa-api.md` | Integrate NASA API enrichment |
| I.4 | `task-I4-earthdata.md` | Integrate Earthdata context |
| I.5 | `task-I5-provenance-ui.md` | Source/Provenance UI view |
| I.6 | `task-I6-source-isolation.md` | Validate source-role isolation |

## Exit Condition
- [ ] At least one NASA Open Data source registered
- [ ] At least one NASA API enrichment visible in product
- [ ] At least one Earthdata element in Explorer story
- [ ] All three source families visible in Source/Provenance view
- [ ] Earthdata content excluded from microgravity matching
