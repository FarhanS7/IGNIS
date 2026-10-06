**IGNIS  |  NASA Space Apps Challenge 2026** 

# **IGNIS** 

#### **Intelligent Guidance from NASA Ignition Studies** Project Concept and Technical Direction 

###### **One-line product definition** 

An evidence-grounded AI experience where people can build a space habitat, change fire-relevant conditions, and discover what comparable NASA combustion experiments actually show - with every important claim traceable to evidence. 

### **Build a habitat. Start a fire. Discover the science.** 

Prepared for: NASA International Space Apps Challenge 2026 Challenge: Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data Version: 1.1 - 26 September 2026 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **1. Executive Summary** 

IGNIS is a web-based evidence and science-communication experience for NASA microgravity combustion research. Version 1.1 keeps the evidence-first technical backbone of the original concept and adds a more engaging publicfacing experience: Build a Habitat and Explore Fire. 

The product follows one principle: the AI is not the source of truth; NASA experiments are. Users can configure a space habitat, see the closest scientifically comparable experiments, inspect real observations and media, and ask questions whose answers remain traceable to source material. 

###### **Product thesis** 

NASA has decades of fire and combustion research. IGNIS makes that evidence searchable, comparable, visual, and understandable - without asking an AI model to invent the physics. 

## **2. Why the Product Changed** 

The first concept was technically strong but risked feeling like a specialist research dashboard. The revised direction adds a playful entry point without weakening scientific integrity. 

|**Original strength**|**New experience layer**|**Combined result**|
|---|---|---|
|Evidence matching, RAG, provenance, CV<br>analysis|Habitat building, visual feedback, stories,<br>animation|A serious evidence engine that outsiders<br>can understand immediately|
|Mission-condition form|Destination + habitat interaction|A more intuitive scenario builder|
|Experiment explorer|Guided Explore Fire stories|Research depth plus science<br>communication|
|AI research assistant|Embedded explanation throughout|AI becomes aguide,not theproduct itself|



## **3. What IGNIS Is - and Is Not** 

|**IGNIS IS**|**IGNIS IS NOT**|
|---|---|
|An evidence discoveryand comparison system|A certified spacecraft fire-safetysystem<br>i|
|A Build-a-Habitat learningexperience|A fireprobabilitycalculator|
|A traceable AI research assistant|Ageneric chatbot that answers from memory|
|A visual explorer for experiments and stories|A replacement for combustion scientists<br>i|
|Aplatform for real media and derived measurements<br>**i**|A fullphysical fire simulator|
|**Scientific communication rule**||



Whenever IGNIS moves beyond a directly observed fact, the UI labels the output as normalized source data, derived analysis, similarity-based interpretation, or AI synthesis. Habitat fire visuals are illustrative evidence-guided visualizations, not validated simulations. 

## **4. Product Vision** 

The long-term vision is to make NASA combustion research navigable as a living evidence network. A mission analyst, researcher, educator, student, or curious visitor should be able to move from a question to experiments, from experiments to observations, and from observations to related findings without losing provenance. 

For the hackathon, the vision is intentionally narrow: one compelling Build-a-Habitat journey, one complete Explore Fire story, one real experiment media analysis, and one source-grounded Ask IGNIS interaction. 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **5. Two Ways Into IGNIS** 

|**Mode**|**What the user does**|**What IGNIS does**|
|---|---|---|
|Build a Habitat|Choose a destination, adjust cabin<br>conditions, and inspect the resulting<br>evidenceprofile.<br>i|Filters for comparable evidence, ranks<br>experiments, explains why, and visualizes<br>evidence categories.|
|Explore Fire|Open guided stories about fire in<br>microgravity and NASA research.|Combines explanations, NASA media,<br>source cards, Earth-observation context,<br>and Ask IGNIS.|
|IGNIS<br>|<br>+--> BUILD A HABITA<br>|<br>|                                                 i<br>|<br>|<br>|<br>+--> EXPLORE FIRE --|T --> Scenario --> Comparable Evidence --> Ranked NASA E<br>|<br>+--> Fire Behavior Profile<br>+--> Experiment Explorer<br>+--> Ask IGNIS<br>> Story --> NASA media / Earthdata context --> Evidence -->|xperiments<br>Ask IGNIS|



Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **6. Build a Habitat** 

Build a Habitat is the playful version of the original Mission Condition Builder. The experience separates the destination from the interior habitat design so the UI does not incorrectly imply that a planetary atmosphere directly sets cabin oxygen or pressure. 

|**Layer**|**Example fields**|**Rule**|
|---|---|---|
|Destination context|Orbital / Moon / Mars; gravity class;<br>external environment|Mostly fixed by the selected scenario and<br>used for context/comparability.|
|Habitat interior|Oxygen, pressure, airflow, material,<br>objective|Editable when supported by the curated<br>evidence schema.|



##### **6.1 Destination presets** 

- Orbital / deep-space habitat - recommended canonical demo because it aligns most directly with microgravity evidence. 

Moon habitat - allowed as an educational preset, but microgravity evidence must carry a gravity-transfer warning. 

Mars habitat - allowed with the same limitation rule. 

###### **Preset rule** 

Default values are reference scenario presets for interaction design. They must not be presented as universal or official values for every mission. 

##### **6.2 Fire Behavior Profile** 

The teammate concept originally proposed a single risk level and comments such as “your house is safe” or “be careful.” IGNIS replaces that with evidence-oriented behavior dimensions so the product stays scientifically honest. 

FIRE BEHAVIOR PROFILE 

Flame-spread evidence       Elevated / Mixed / Limited Sustained-burning evidence  Elevated / Mixed / Limited Extinction evidence         Strong / Moderate / Limited Comparable experiments      8 Evidence coverage           High / Medium / Low 

Every displayed behavior category must be traceable to the experiments and rules used. Unsupported categories remain hidden or explicitly show insufficient evidence. 

##### **6.3 Evidence-guided visualization** 

The habitat may glow, show a flame, or visually appear more damaged as evidence categories change. This creates a memorable interaction, but the visual state is driven by transparent rules, not a free-form model response. 

###### **Persistent label** 

Illustrative evidence-guided visualization - not a validated physical simulation. 

## **7. The Evidence Engine** 

The evidence engine remains the project backbone. The revised version adds an eligibility filter before numerical similarity so experiments are compared only when the scientific relationship is defensible or clearly caveated. 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

HABITAT SCENARIO | v COMPARABLE-EVIDENCE FILTER | +--> ineligible -> excluded +--> warning-eligible -> ranked with visible caveat +--> eligible -> ranked normally | v EVIDENCE SIMILARITY | v FIRE BEHAVIOR PROFILE + TOP EXPERIMENTS 

##### **7.1 Eligibility before similarity** 

Fuel/material family compatibility. 

Target phenomenon or objective compatibility. 

Gravity-environment compatibility or explicit mismatch warning. 

Minimum comparable metadata and provenance quality. 

Geometry/regime compatibility where the source data supports it. 

###### **Important** 

A Moon or Mars scenario matched to microgravity evidence must not look fully equivalent. IGNIS should surface the gravity mismatch and reduce confidence rather than pretending the gravity condition matches. 

##### **7.2 Similarity model** 

|**Signal**|**Illustrative weight**|**Why it matters**|
|---|---|---|
|Material / fuel similarity|30%|Major relevance signal for combustion<br>behavior<br>f|
|Oxygen similarity<br>l|20%|Atmospheric composition affects<br>combustion conditions<br>i|
|Airflow similarity|20%|Flow strongly matters in low-gravity fire<br>behavior|
|Pressure similarity|15%|Changes atmospheric context<br>i|
|Objective overlap|10%|Matches the scientificquestion<br>i|
|Geometry/ metadata|5%|Refines relevance when available|



###### **Similarity is not risk** 

Evidence Similarity measures relevance between a scenario and source conditions. It is never displayed as fire probability, safety probability, or mission risk. 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **8. Evidence Levels and Trust Model** 

|**Level**|**UI label**|**Meaning**|
|---|---|---|
|A|Observed / NASA Source|Directly reported or measured in a NASA<br>source.|
|B|Normalized Source Data|Structured or unit-converted source data<br>withprovenance.|
|C|Derived by IGNIS|Computed analytics such as computer-<br>vision flame area.|
|D|Similarity-Based Interpretation|Inference based on explicit experiment-<br>comparison logic.|
|E|AI Synthesis|LLM explanation constrained by retrieved<br>evidence.|



The interface should visually give the highest authority to Levels A and B, while Levels D and E remain clearly secondary. This distinction is one of the strongest trust features of the project. 

## **9. Experiment Explorer** 

The Experiment Explorer is where playful interaction turns back into inspectable evidence. It should make one experiment understandable at a glance while preserving source traceability. 

Experiment identity, purpose, mission/platform, and context. 

Normalized conditions with units and provenance. 

Observed findings separated from AI interpretation. 

Source documents, identifiers, and URLs. 

Real video or imagery where available. 

Derived metrics labeled as IGNIS analysis. 

Related experiments and comparison reasons. 

## **10. AI Flame Vision** 

One real NASA combustion video becomes the ML showcase. The goal is not to solve vision for every experiment; it is to show that IGNIS can turn unstructured scientific media into a transparent quantitative time series. 

experiment video | v frame extraction -> ROI -> flame segmentation -> cleanup | +--> flame area ratio vs time +--> height / extent +--> centroid movement +--> growth / decay trend +--> approximate extinction timestamp 

The MVP should start with robust classical image processing such as color-space thresholding, connected components, contour analysis, and smoothing. A learned segmentation model is a fallback only if simpler methods fail. 

###### **High-impact demo interaction** 

Scrubbing the video moves the chart cursor. Scrubbing the chart moves the video. The viewer can see the evidence and the derived measurement together. 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **11. Ask IGNIS** 

Ask IGNIS is a retrieval-augmented research assistant embedded throughout the product. It is not the product itself. 

|Question<br>||
|---|
|<br>v<br>resolve scope (scenario / experiment / story)<br>||
|<br>v<br>retrieve approved source records + passages<br>||
|<br>v<br>rerank + evidence threshold<br>||
|<br>v<br>LLM synthesis<br>+--> concise answer<br>+--> evidence used<br>+--> limitations<br>+--> confidence<br>+--> source links|



If evidence is weak, mixed, or not directly comparable, IGNIS should say so rather than forcing a confident conclusion. 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **12. Explore Fire** 

Explorer turns microgravity fire science into short guided stories for students, public visitors, and judges. Stories are not disconnected marketing content: each story connects back to real source evidence. 

|**Story**|**Purpose**|**MVP priority**|
|---|---|---|
|Why does fire behave differently in<br>microgravity?|Teach the central physical intuition and<br>connect to real experiments.|P0|
|Fire from Space vs Fire in Space|Use Earthdata to contrast Earth remote<br>sensing with microgravity experiment<br>research.|P0|
|What happens when airflow changes?<br>f|Connect a controllable habitat variable to<br>experiment evidence.|P1|
|What did Saffire investigate?|Mission/experiment storywith media.|P1|
|What did FLEX investigate?|Experiment storywith media.|P1|



Optional narration/audio is useful for engagement but remains a stretch feature until the evidence pipeline is stable. 

## **13. NASA Data Strategy** 

The project team requires IGNIS to use NASA Earthdata remote sensor resources, NASA Open Data, and NASA APIs. Version 1.1 formalizes those sources as different layers with different scientific roles. 

|**Required NASA channel**|**Role in IGNIS**|**Matching?**|
|---|---|---|
|NASA Open Data - https://data.nasa.gov|Dataset discovery, identifiers, metadata,<br>links to authoritative NASA-hosted<br>scientific sources.|Yes, when the underlying linked data is<br>scientific evidence|
|NASA APIs - https://api.nasa.gov|Visible media/context enrichment or other<br>supported developer-service data.|No by default|
|NASA Earthdata sensors -<br>https://earthdata.nasa.gov/user-<br>resources/remote-sensors|Earth-observation context for Explorer,<br>especially the Fire from Space vs Fire in<br>Space story.|No|
|**Source-role boundary**|||



Earth-observation fire data can be educationally valuable, but it must not be mixed into the microgravity evidence score. Different NASA datasets can live in one product without pretending they answer the same scientific question. 

##### **13.1 Required hackathon proof** 

At least one source/dataset registered through NASA Open Data. 

At least one visible product enrichment from a NASA API. 

At least one Earthdata remote-sensing visual or data element in Explorer. 

All source families visible in a Source / Provenance view. 

## **14. Source and Data Model** 

Every ingested object should know where it came from and what role it plays. The core hierarchy is: source registry -> experiment -> experiment run -> source document/media -> normalized observation/derived measurement. 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

DATA SOURCE | 

+--> EXPERIMENT 

- +--> EXPERIMENT RUN 

|      | 

- |      +--> conditions / observations 

- +--> SOURCE DOCUMENTS / CHUNKS 

- +--> MEDIA ASSETS 

| 

+--> CV MEASUREMENTS 

Habitat presets and Explorer stories are product-layer records that reference the source registry and experiment records rather than becoming new scientific evidence by themselves. 

## **15. Technical Architecture** 

###### NEXT.JS WEB APP 

- |-- Build a Habitat 

- |-- Fire Behavior Profile 

- |-- Experiment Explorer 

- |-- Explore Fire 

- |-- Ask IGNIS 

###### FASTAPI 

- |-- eligibility service 

- |-- matching service 

- |-- behavior profile rules 

- |-- RAG service 

- |-- media / CV service 

- |-- story / source service 

   - +--> PostgreSQL + pgvector 

   - +--> Curated NASA experiment data 

   - +--> NASA API enrichment 

   - +--> Earthdata context 

   - +--> LLM + embeddings 

|**Layer**|**Suggested technology**|**Why**|
|---|---|---|
|Frontend|Next.js + TypeScript + Tailwind|Fast product iteration and strong UI<br>ecosystem|
|Animation|CSS / Framer Motion / SVG|Enough visual impact without a game<br>engine|
|Visualization|Recharts / D3 / optional React Flow|Charts and evidence relationships<br>i|
|Backend|FastAPI + Python|Natural fit for data,ML,typed APIs|
|Database|PostgreSQL +pgvector|Structured dataplus semantic retrieval<br>f    i|
|ML / CV|OpenCV + scikit-learn|Sufficient for similarity and first video<br>analysis|
|AI|Embeddings + RAG + LLM|Grounded natural-language synthesis|



Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **16. Scientific Integrity and UX Guardrails** 

|**Risk**|**Guardrail**|
|---|---|
|AI hallucinates a finding|Evidence-first RAG,source display,low-evidence response<br>i|
|Similarityis mistaken for risk|Label Evidence Similarity;never show fireprobability<br>ii|
|Habitat marked safe/unsafe|Use Fire Behavior Profile,not certification language<br>i|
|Moon/Mars scenario overclaims evidence|Gravitymismatch warningand confidence cap|
|Visual animation appears to be a simulator|Persistent illustrative/non-simulation label<br>i|
|Incomparable experiments rank highly<br>f|Eligibilityfilter before similarity|
|Derived CV metrics appear official|Derived byIGNIS label + source video|
|Earthdata mixed into microgravityevidence|Source-role isolation;score exclusion|
|Missingvalues become assumptions|Unknown stays unknown|



## **17. MVP Scope** 

###### **Definition of done** 

A user can build one habitat scenario, receive scientifically comparable NASA evidence, understand the resulting Fire Behavior Profile, open a real experiment and media example, ask one evidence-backed question, and explore one guided story that visibly uses the required NASA data channels. 

|**MUST HAVE**|**SHOULD / STRETCH**|
|---|---|
|Two-mode landing: Build / Explore|Audio narration|
|Habitat Builder with one canonicalpreset<br>i|Richer 3D animations|
|Comparable-evidence filter<br>i|Knowledgegraph|
|Evidence Similarity+ Fire Behavior Profile|Advanced semantic matching|
|Experiment Explorer|Multiple CVpipelines|
|Ask IGNIS with evidence|Experiment comparison matrix|
|One workingvideo analysis|Shareable reports|
|One complete Explorer story|More stories|
|NASA Open Data + NASA API + Earthdataproof|Natural-language habitat creation|



## **18. 48-Hour Hackathon Plan** 

|**Window**|**Focus**|**Exit condition**|
|---|---|---|
|0-6h|NASA source registry + curated records +<br>proof of required source channels<br>i|Real data/source references exist with<br>provenance|
|6-14h|Eligibility filter + match engine + API<br>i|Habitat scenario returns explainable<br>eligible evidence|
|14-24h|Build-a-Habitat + behavior profile +<br>experimentpage|Core journey works end-to-end|
|24-30h|Explore Fire story+ Earthdata context|One storycomplete|
|30-36h|RAG / Ask IGNIS|Questions return evidence-backed answers|
|36-40h|One CV analysispipeline|Derived metric works on real video|
|40-44h|Integration +guardrails + deployment|Demo is stable|
|44-48h|Polish +pitch rehearsal|Two-minute demo runs reliably|



Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

## **19. Team Split** 

|**Role**|**Primary ownership**|
|---|---|
|Frontend / web|Next.js, Build-a-Habitat flow, visualization states,<br>experiment/storyUI|
|AI / ML|Eligibility,matching,behavior aggregation,RAG,CV|
|Data / backend|NASA integrations, normalization, provenance, FastAPI, database,<br>caching|
|UI / UX|Mode selection, habitat interaction, evidence hierarchy, stories,<br>demo narrative|



## **20. Demo Narrative** 

The strongest demo is a story, not a feature tour. 

**1.** Open with: “What if you could build a habitat in space and ask NASA’s real fire experiments what would matter there?” 

**2.** Choose Build a Habitat and select the canonical orbital/deep-space preset. 

**3.** Change one habitat variable live, such as oxygen or airflow. 

**4.** Analyze with NASA Evidence and show the Fire Behavior Profile. 

**5.** Explain that the output is evidence-based behavior, not an absolute risk score. 

**6.** Open Why? and reveal the factor-level explanation and closest experiments. 

**7.** Open the strongest experiment; play real media while IGNIS-derived chart follows the flame. 

**8.** Ask one prepared scientific question and reveal the evidence-backed answer. 

**9.** Open Explore Fire briefly and show Fire from Space vs Fire in Space to demonstrate Earthdata context. 

**10.** Close: “IGNIS does not ask AI to invent fire behavior. It lets NASA’s experiments teach us what the evidence actually shows.” 

## **21. Success Criteria** 

|**Dimension**|**Hackathon success signal**|
|---|---|
|Clarity|A first-time user understands what IGNIS does within 30 seconds.|
|Engagement|The Build interaction creates an immediate, memorable<br>cause/effect experience.<br>i|
|Evidence<br>i|Everykeyscientific conclusion links to a source record orpassage.|
|Scientific discipline|No risk-probability,safe/unsafe,or false simulation claims.|
|Technical depth|Eligibility+ matching+ one real CV-derived metric work.|
|NASA data integration|Open Data, NASA API, and Earthdata are used with distinct source<br>roles.|
|UX coherence|Build -> evidence -> experiment -> question feels like one<br>investigation.|
|Demo reliability|Core two-minutepath works without fragile manual steps.|



## **22. First Development Milestone** 

Before building the visual experience, prove the evidence loop with a minimal script or endpoint. 

Project Concept  |  v1.1  |  26 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

INPUT Destination: orbital / microgravity O2: 20% Pressure: 75 kPa Airflow: 10 cm/s Fuel: solid Objective: flame spread OUTPUT Eligibility: comparable Experiment A  0.91  coverage 0.85 Experiment B  0.87  coverage 0.78 Experiment C  0.74  coverage 0.71 For each result: - why it matched - what did not match - source identifier - evidence level / source role 

Once this works reliably, the team has the backbone. Habitat visuals, stories, RAG, and CV attach to this evidence layer rather than replacing it. 

## **23. Closing Statement** 

###### **IGNIS in one sentence** 

A playful mission-to-evidence experience that helps people understand space-fire research by building a habitat, finding the closest comparable NASA experiments, visualizing real evidence, and explaining it with grounded AI. 

The project wins by combining two things that are often separated in hackathons: a credible scientific evidence pipeline underneath, and a compelling human experience on top. The objective is not to simulate every fire in space. It is to make NASA’s existing evidence dramatically easier to discover, understand, and remember. 

##### **Source Context** 

Challenge: NASA International Space Apps Challenge 2026 - Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data. 

Required NASA data channels from the project team: https://data.nasa.gov, https://api.nasa.gov, and https://earthdata.nasa.gov/user-resources/remote-sensors. 

Specific experiment fields, dataset endpoints, and sensor/API selections must be verified during ingestion. Missing scientific values must not be inferred simply to satisfy the proposed schema. 

Project Concept  |  v1.1  |  26 September 2026 

