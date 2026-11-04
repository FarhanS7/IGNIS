# IGNIS Demo Video Script (90-Second Walkthrough)

**Target Duration**: 90 seconds (Maximum allowed: 180 seconds)  
**Core Thesis**: *"AI is not the source of truth. NASA flight data is."*

---

### [0:00 – 0:10] The Problem
- **Visual**: Landing page hero (`/`), showing 3D flame physics and headline: *Turn NASA Microgravity Combustion Data into Astronaut Safety Intelligence*.
- **Voiceover**: 
  > *"When fires ignite aboard spacecraft, buoyancy disappears. NASA has flown microgravity combustion experiments for decades—from the ISS to Saffire cargo missions—but mission teams lack interactive tools that bridge raw flight telemetry directly into life-critical emergency fire response."*

---

### [0:10 – 0:30] Core Simulator & Flight Provenance
- **Visual**: Navigate to `/simulator`. Select **Cotton / SIBAL**, set $O_2$ to 21%, flow to 5 cm/s. The similarity drawer opens to show the 5 closest NASA BASS-II flight runs. Click on Run UID `BASS2_133` to reveal the raw flight CSV rows, test parameters, and primary NASA publication link.
- **Voiceover**: 
  > *"IGNIS lets engineers configure habitat atmospheres and retrieve the nearest actual NASA flight experiments. We don't synthesize speculative flame behavior: every similarity match links directly to primary NASA PSI flight runs, measured sensor rows, and peer-reviewed NTRS citations."*

---

### [0:30 – 0:45] Honest Scientific Boundaries
- **Visual**: Switch the gravity slider to **Lunar Surface (0.166 g)**. Point out the amber caution banner: *"Outside NASA Tested Range. Buoyancy stratification is unvalidated."*
- **Voiceover**: 
  > *"Crucially, IGNIS knows what it doesn't know. In fractional lunar gravity, where partial buoyancy competes with duct airflow, the system explicitly warns that flight validation does not exist, rather than hallucinating false confidence."*

---

### [0:45 – 1:05] The Fire Response Console (`/response`)
- **Visual**: Navigate to `/response`. Click **Play**. As the timeline advances to $t = 12.0\,\text{s}$, smoke obscuration crosses threshold in Zone 1. Zone 1 turns pulsing rose (`FIRE_ALARM`), ventilation dampers animate closing, and the Emergency Sequencer automatically activates: `ALARM` → `REMOVE_POWER` → `ISOLATE_VENTILATION`.
- **Voiceover**: 
  > *"Our new Fire Response Console simulates multi-compartment smoke transport and emergency isolation. In uncrewed mode, the sequencer automatically sheds power and seals dampers. In crewed mode, life-support safeguards require explicit astronaut confirmation before releasing extinguishing agents."*

---

### [1:05 – 1:15] Droplet Extinction Insight & Model Cavet
- **Visual**: Click on Step 5 (`SUPPRESSION`) in the sequencer panel. Highlight the **Droplet Extinction Insight** card showing `EXTINCTION_REGION` powered by NASA FLEX data, with the mandatory caveat: *"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."*
- **Voiceover**: 
  > *"In Step 5, suppression recommendations are informed by our M4 model trained on 262 NASA FLEX droplet burns on the ISS. But notice the clear guardrail: droplet physics cannot be extrapolated to cabin solid fuels, so the model informs operators of physical boundaries without ever auto-triggering suppression."*

---

### [1:15 – 1:25] Three Detector Arms & Monte Carlo Consistency
- **Visual**: Switch detector dropdown to **Trained fusion (Earth-gravity data)**. The persistent honest badge appears: *"Trained on Earth-gravity data. Not validated in microgravity."* Click **Open Monte Carlo Sweep**, click **Execute Monte Carlo (100 Runs)**. Results table shows all 3 arms completing across randomized sweeps.
- **Voiceover**: 
  > *"Operators can compare heuristic fusion against our trained ML detector. We explicitly disclose that M2 was trained on Earth-gravity data, not microgravity. Our built-in Monte Carlo sweep tests design-consistency across hundreds of scenarios without making unwarranted superiority claims."*

---

### [1:25 – 1:30] Closing Statement
- **Visual**: Switch back to `/response` habitat view, showing crew safety guidance and immutable audit log.
- **Voiceover**: 
  > *"In space exploration, false confidence is catastrophic. IGNIS proves that machine learning is at its best when anchored in transparent scientific boundaries: AI is not the source of truth—NASA flight data is."*
