# IGNIS — সম্পূর্ণ এ-টু-জেড (A to Z) বাংলা মাস্টার গাইড ও টেকনিক্যাল এক্সপ্লেনেশন

> **প্রজেক্টের নাম:** IGNIS — Intelligent Guidance from NASA Ignition Studies  
> **টার্গেট প্রতিযোগিতা:** NASA International Space Apps Challenge  
> **অফিসিয়াল চ্যালেঞ্জ:** *Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data*  
> **কারেন্ট সিস্টেম ভার্সন:** `v2-real-data` (100% নাসার বাস্তব ফ্লাইট ডাটা ও ভ্যালিডেশন ভিত্তিক)  
> **উদ্দেশ্য:** এই ডকুমেন্টে IGNIS প্রজেক্টের শুরু থেকে শেষ পর্যন্ত সবকিছু সহজ ও প্রাঞ্জল বাংলায় বিশদভাবে ব্যাখ্যা করা হয়েছে—ডাটা কোথা থেকে এসেছে, কীভাবে প্রসেস করা হয়েছে, কেন নির্দিষ্ট অ্যালগরিদম বেছে নেওয়া হয়েছে, ফিজিক্সের পেছনের সত্যতা কী, এবং বিচারকদের সামনে কীভাবে চ্যাম্পিয়নের মতো পুরো প্রজেক্ট উপস্থাপন করতে হবে।

---

## সূচিপত্র (Table of Contents)

1. [অধ্যায় ১: প্রজেক্ট ওভারভিউ ও মূল দর্শন (Vision & Core Philosophy)](#অধ্যায়-১-প্রজেক্ট-ওভারভিউ-ও-মূল-দর্শন)
2. [অধ্যায় ২: নাসার কম্বাশন ফিজিক্স ও বিজ্ঞান (Combustion Physics in Freefall)](#অধ্যায়-২-নাসার-কম্বাশন-ফিজিক্স-ও-বিজ্ঞান)
3. [অধ্যায় ৩: ডাটা কোথা থেকে এসেছে এবং কীভাবে প্রসেস হয়েছে (Data Provenance & Ingestion)](#অধ্যায়-৩-ডাটা-কোথা-থেকে-এসেছে-এবং-কীভাবে-প্রসেস-হয়েছে)
4. [অধ্যায় ৪: ডাটার সত্যতা, লিমিটেশন ও ক্লিনিং (Data Quality & Limitations)](#অধ্যায়-৪-ডাটার-সত্যতা-লিমিটেশন-ও-ক্লিনিং)
5. [অধ্যায় ৫: আউটকাম ক্লাসিফিকেশন ও সার্কুলারিটি অডিট (Outcome Validity & Circularity Audit)](#অধ্যায়-৫-আউটকাম-ক্লাসিফিকেশন-ও-সার্কুলারিটি-অডিট)
6. [অধ্যায় ৬: সিমুলেটর ও রিয়েল ম্যাচিং ইঞ্জিন (Simulator & Real Solid Matcher)](#অধ্যায়-৬-সিমুলেটর-ও-রিয়েল-ম্যাচিং-ইঞ্জিন)
7. [অধ্যায় ৭: রিসার্চ গ্যাপ র‍্যাঙ্কিং ইঞ্জিন (Research Gap Ranking Engine)](#অধ্যায়-৭-রিসার্চ-গ্যাপ-র‍্যাঙ্কিং-ইঞ্জিন)
8. [অধ্যায় ৮: এভিডেন্স ব্রিফ এক্সপোর্ট (Evidence Brief Generator)](#অধ্যায়-৮-এভিডেন্স-ব্রিফ-এক্সপোর্ট)
9. [অধ্যায় ৯: সাইটেড অ্যাসিস্ট্যান্ট ও জিরো-হ্যালুসিনেশন RAG (Cited Assistant Engine)](#অধ্যায়-৯-সাইটেড-অ্যাসিস্ট্যান্ট-ও-জিরো-হ্যালুসিনেশন-rag)
10. [অধ্যায় ১০: ৩০-প্রশ্নের ইভালুয়েশন বেঞ্চমার্ক (30-Question Evaluation Benchmark)](#অধ্যায়-১০-৩০-প্রশ্নের-ইভালুয়েশন-বেঞ্চমার্ক)
11. [অধ্যায় ১১: বিচারকদের জন্য বুলেটপ্রুফ প্রশ্নোত্তর (Judges Q&A Defense Strategy)](#অধ্যায়-১১-বিচারকদের-জন্য-বুলেটপ্রুফ-প্রশ্নোত্তর)
12. [অধ্যায় ১২: ৩ মিনিটের ফাইনাল পিচ স্ক্রিপ্ট (The 3-Minute Champion Pitch Script)](#অধ্যায়-১২-৩-মিনিটের-ফাইনাল-পিচ-স্ক্রিপ্ট)

---

# অধ্যায় ১: প্রজেক্ট ওভারভিউ ও মূল দর্শন

### ১.১ সমস্যা কী? (The Real-World Problem)
মহাকাশযানে আগুন লাগা হলো মহাকাশচারীদের জন্য সবচেয়ে ভয়াবহ জীবন-সংশয়ী বিপর্যয় (Life-threatening disaster)। কিন্তু মাইক্রোগ্র্যাভিটিতে (Microgravity / 0g) আগুন পৃথিবীর মতো জ্বলে না:
- পৃথিবীতে মাধ্যাকর্ষণ গরম বাতাসকে ওপরে ঠেলে দেয়, ফলে আগুনের শিখা খাড়া টিয়ারড্রপ (Teardrop) হয় এবং নিজে থেকেই চারপাশ থেকে বাতাস টেনে নেয়।
- কিন্তু মহাকাশে কোনো প্লবতা (Buoyancy) নেই। সেখানে আগুন শান্ত, গোলাকার এবং প্রায় অদৃশ্য নীল শিখায় রূপান্তরিত হয়। মহাকাশচারীরা সাধারণ চোখে শিখা দেখতেও নাও পেতে পারেন।
- সবচেয়ে ভয়ঙ্কর বিষয় হলো—মহাকাশযানের ভেন্টিলেশন ফ্যান যদি অসাবধানতাবশত চালু থাকে, তবে সেই মৃদু বাতাস আগুনকে হঠাৎ বিস্ফোরকভাবে বাড়িয়ে তুলতে পারে!

নাসার কাছে গত ২৫ বছরের মহাকাশ কম্বাশন গবেষণার বিশাল আর্কাইভ রয়েছে (যেমন BASS, Saffire, FLEX, ACME, SOFIE)। কিন্তু এই অমূল্য বৈজ্ঞানিক ডাটাগুলো গভীর পিএইচডি পেপার, নাসার টেকনিক্যাল মেমোরেন্ডাম (NASA/TM), এবং কাঁচা এক্সপেরিমেন্টাল টেবিলে বন্দি ছিল। সাধারণ মহাকাশ শিক্ষার্থী, প্রকৌশলী বা ভবিষ্যৎ আর্টেমিস বেস ক্যাম্প আর্কিটেক্টদের পক্ষে চট করে জানার উপায় ছিল না যে তাদের পছন্দের উপাদান ও কেবিন পরিবেশে আগুন কেমন আচরণ করবে।

### ১.২ আমাদের সবচেয়ে বড় মূলনীতি (The Core Invariant)
হ্যাকথনে ৯৯% টিম যে মারাত্মক ভুলটি করে, তা হলো: তারা চ্যাটজিপিটি বা কোনো জেনেরিক এআই মডেলকে প্রম্পট দিয়ে বলে— *"বলো তো মহাকাশে আগুন ছড়াবে কি না?"* আর এআই নিজের মতো কাল্পনিক সংখ্যা বা হ্যালুসিনেটেড ফিজিক্স তৈরি করে বলে— *"এখানে ৭২% ফায়ার রিস্ক আছে!"*

IGNIS-এর মূল নীতি হলো:
> **"The AI is NOT the source of truth — NASA experiments are."**  
> *(এআই কোনো বৈজ্ঞানিক সত্যের উৎস নয়; নাসার বাস্তব মহাকাশ ফ্লাইট এক্সপেরিমেন্টই হলো একমাত্র সত্য।)*

IGNIS-এ ফিজিক্সের কোনো সিদ্ধান্ত বা ফলাফল এআই মনগড়াভাবে তৈরি করে না। প্রতিটি বিহেভিয়ার রেটিং, প্রতিটি শিখার নিভে যাওয়ার সীমা (Extinction Limit), এবং প্রতিটি টেস্টের ফলাফল সরাসরি নাসার বাস্তব মহাকাশ ফ্লাইট ডাটা এবং পিয়ার-রিভিউড রিপোর্ট থেকে ট্রেস করা হয়।

---

# অধ্যায় ২: নাসার কম্বাশন ফিজিক্স ও বিজ্ঞান

মহাকাশ অগ্নিকাণ্ডের পদার্থবিজ্ঞান সাধারণ মানুষের ধারণার সম্পূর্ণ বিপরীত। বিচারকদের সামনে বিজ্ঞান ব্যাখ্যা করার সময় এই চারটি মূল ফিজিক্যাল প্রিন্সিপাল ব্যবহার করবেন:

```
[পৃথিবীতে আগুন: 1.0g]                          [মহাকাশে আগুন: 0.0g (ISS)]
        ▲                                              ┌───────────┐
       / \  (তীক্ষ্ণ টিয়ারড্রপ)                           │     ●     │ (নিখুঁত নীল গোলক)
      /   \                                            └───────────┘
     / Soot\  (উজ্জ্বল হলুদ শিখা ~1600K)              - কোনো পরিচলন নেই (No Buoyancy)
    /  Gas  \                                         - আণবিক ব্যাপন (Pure Diffusion)
   /─────────\                                        - কম তাপমাত্রা (~1200K)
  [   ম্যাচ কাঠি   ]                                    - সুট নেই (Soot-free chemiluminescence)
- গ্র্যাভিটি ভারী ঠান্ডা বাতাস নিচে টানে।                  - অক্সিজেন চারপাশ থেকে ৩৬০ ডিগ্রিতে আসে।
- হালকা গরম বাতাস ১-২ মি/সে বেগে উপরে ছোটে।
```

### ২.১ পৃথিবীতে আগুন কেন খাড়া টিয়ারড্রপ হয়?
1. **আদর্শ গ্যাস সূত্র ও তাপমাত্রার পার্থক্য:** শিখার তাপমাত্রা থাকে ১৪০০–১৮০০ K, আর চারপাশের সাধারণ বাতাস থাকে ৩০০ K। ফলে গরম গ্যাসের ঘনত্ব ($\rho$) অনেক কমে যায়।
2. **আর্কিমিডিসের প্লবতা বল (Archimedes' Buoyancy):**  
   $$F_{\text{buoyant}} = (\rho_{\text{cold}} - \rho_{\text{hot}}) \times g \times V$$  
   যেহেতু পৃথিবীতে $g = 9.8\text{ m/s}^2$, পৃথিবীর অভিকর্ষ ভারী ঠান্ডা বাতাসকে নিচের দিকে টানে। এই ভারী বাতাস হালকা গরম বাতাসকে লিফটের মতো তীব্র বেগে (১–২ মিটার/সেকেন্ড) ওপরের দিকে ঠেলে দেয়।
3. **সুট ইনক্যান্ডেসেন্স (Soot Incandescence):** তীব্র তাপে কার্বন কণা (সুট) উত্তপ্ত হয়ে উজ্জ্বল হলুদ ও কমলা রঙের আলো বিকিরণ করে।

### ২.২ মহাকাশে (0g মাইক্রোগ্র্যাভিটি) আগুন কেন গোলাকার ও শান্ত নীল হয়?
1. **প্লবতার অবলুপ্তি ($g = 0$):** মহাকাশযানে ফ্রি-ফল অবস্থায় কার্যকর অভিকর্ষ শূন্য। তাই গরম বাতাস ওপরে ওঠার কোনো বল খুঁজে পায় না, কারণ মহাকাশে কোনো "ওপর" বা "নিচ" নেই।
2. **আণবিক ব্যাপন (Pure Molecular Diffusion):** পরিচলন বন্ধ হয়ে যাওয়ায় অক্সিজেন শুধুমাত্র আণবিক ব্যাপনের মাধ্যমে ধীরে ধীরে আগুনের দিকে ধাবিত হয়। ব্যাপন সব দিকে সমানভাবে ছড়ায় বলে আগুন চারপাশ থেকে সমানভাবে অক্সিজেন টেনে একটি নিখুঁত **শান্ত গোলাকার গম্বুজ (Spherical Dome)** তৈরি করে।
3. **শান্ত ও শীতল শিখা (~১২০০ K):** দ্রুত বাতাসের সরবরাহ না থাকায় বিক্রিয়ার হার ধীর হয়, শিখার তাপমাত্রা প্রায় ১২০০ K-এ নেমে আসে।
4. **সুটহীন কেমিলুমিনেসেন্স:** তাপমাত্রা কম থাকায় সুট তৈরি হয় না। হলুদ শিখা উধাও হয়ে যায়, শুধু মিথেন বা হাইড্রোকার্বনের কেমিলুমিনেসেন্স ($\text{CH}^*$ এবং $\text{C}_2^*$ র্যাডিক্যাল) দেখা যায়, যা শান্ত ভৌতিক নীল আলো ছড়ায়।

---

# অধ্যায় ৩: ডাটা কোথা থেকে এসেছে এবং কীভাবে প্রসেস হয়েছে

### ৩.১ ডাটার উৎস (Primary Data Sources)
IGNIS-এর সমস্ত ডাটা সম্পূর্ণ ওপেন-সায়েন্স পাবলিক ডোমেইন (CC0) সোর্স থেকে সংগৃহীত:
1. **NASA Physical Sciences Informatics (PSI):**  
   নাসার অফিসিয়াল সায়েন্স রিপোজিটরি (`https://psi.nasa.gov/`), যেখান থেকে আন্তর্জাতিক মহাকাশ স্টেশন (ISS) ও আনক্রুড সাইগনাস (Cygnus) কার্গো যানের এক্সপেরিমেন্টাল টেবিল ও রিড-মি ফাইল ডাউনলোড করা হয়েছে।
2. **NASA Technical Reports Server (NTRS):**  
   নাসা গ্লেন রিসার্চ সেন্টারের অফিসিয়াল সায়েন্টিফিক রিপোর্টস (NASA/TM সিরিজ) এবং আইসিইএস (ICES) কনফারেন্স পেপারস।
3. **NASA Earthdata FIRMS:**  
   স্যাটেলাইট ভিত্তিক অ্যাক্টিভ ফায়ার থার্মাল অ্যানোমালি ডাটাবেস।

### ৩.২ যে ১০টি বাস্তব নাসা মিশন আমরা অন্তর্ভুক্ত করেছি:
1. **PSI-25: BASS-II (Burning and Suppression of Solids — II):**  
   - প্ল্যাটফর্ম: ISS Microgravity Science Glovebox (MSG)।
   - গবেষক: ড. স্যান্ড্রা ওলসন (NASA Glenn Research Center) ও পিআই টিম।
   - উপাদান: PMMA রড, PMMA ফ্ল্যাট শিট, SIBAL ফেব্রিক, কটন, নোমেক্স, সিলিকন।
   - DOI: `10.60555/4qc4-de67`।
2. **PSI-98: SAFFIRE-I (Spacecraft Fire Experiment I):**  
   - প্ল্যাটফর্ম: Cygnus OA-5 মহাকাশযান (ISS ছাড়ার পর ধ্বংসাত্মক রি-এন্ট্রির আগে)।
   - গবেষক: ড. ডেভিড এল. আরবান ও সায়েন্স টিম।
   - উপাদান: বৃহৎ স্কেলের SIBAL ফেব্রিক (৪০ সেমি × ১০০ সেমি)।
   - DOI: `10.60555/0t15-1z43`।
3. **Saffire-IV, Saffire-V, Saffire-VI (NTRS-20240002981 ও NTRS-20240007488):**  
   - এক্সপ্লোরেশন অ্যাটমোস্ফিয়ার (Reduced Pressure 56 kPa, Elevated O2 34%) এবং বাস্তব স্কেলের ফায়ার হিট রিলিজ (1.5 kW – 3.2 kW)।
4. **PSI-69: FLEX & FLEX-2 (Flame Extinction Experiment):**  
   - প্ল্যাটফর্ম: ISS Multi-user Droplet Combustion Apparatus (MDCA)।
   - উপাদান: মিথানল ও হেপ্টেন তরল ড্রপলেট কম্বাশন এবং কুল ফ্লেম (Cool Flames)।
   - DOI: `10.60555/mbq8-0451`।
5. **PSI-10: ACME (Advanced Combustion via Microgravity Experiments):**  
   - প্ল্যাটফর্ম: ISS Combustion Integrated Rack (CIR)।
   - গ্যাসীয় ফ্লেম ডিজাইন ও সুট রিডাকশন।
6. **PSI-100: SOFIE (Solid Fuel Ignition and Extinction):**  
   - সাম্প্রতিক মহাকাশ সলিড ফুয়েল টেস্ট ম্যাট্রিক্স।

### ৩.৩ ইনজেশন পাইপলাইন আর্কিটেকচার (`scripts/ingest/`)
- সমস্ত ডাউনলোড স্ক্রিপ্ট লোকাল রিপোজিটরির [`scripts/ingest/`](file:///e:/IGNIS/scripts/ingest/) ফোল্ডারে সংরক্ষিত।
- **TLS ভেরিফিকেশন:** কোনো সেলফ-সাইন্ড বাইপাস নেই; স্ট্যান্ডার্ড `certifi` CA বান্ডল দিয়ে নাসার হোস্টের এসএসএল সার্টিফিকেট ভেরিফাই করা হয়।
- **প্রোভিন্যান্স ট্র্যাকিং:** প্রতিটি কাঁচা ফাইলের SHA-256 চেকসাম গণনা করে [`data/provenance/manifest.json`](file:///e:/IGNIS/data/provenance/manifest.json)-এ সংরক্ষণ করা হয়েছে।
- **ডাটাসেট সাইজ:** কাঁচা ডাটা পার্স করে মোট **১৩২টি ইউজেবল সলিড ফুয়েল ফ্লাইট রান** এবং **৩৪১টি ফান্ডামেন্টাল ড্রপলেট রান** তৈরি করা হয়েছে।

---

# অধ্যায় ৪: ডাটার সত্যতা, লিমিটেশন ও ক্লিনিং

বিজ্ঞান ও গবেষণায় সততা (Integrity) সবচেয়ে গুরুত্বপূর্ণ। আমরা নাসার ডাটার প্রতিটি ফাঁক ও অসঙ্গতি খুঁজে বের করে তা [`docs/DATA_QUALITY.md`](file:///e:/IGNIS/docs/DATA_QUALITY.md)-এ লিপিবদ্ধ করেছি:

### ৪.১ প্রেশার সেন্সিংয়ের সত্যতা (The Pressure Truth)
- **বাস্তব ঘটনা:** BASS-II এবং Saffire-এর সলিড ফুয়েল পরীক্ষার সময় চেম্বারের ভিতরে কোনো অ্যাক্টিভ প্রেশার সেন্সর ছিল না। নাসা ধরে নিয়েছিল যে টেস্টগুলো নমিনাল কেবিন প্রেশারে (101.3 kPa) হচ্ছে।
- **আমাদের সততা:** আমরা এক্সপ্লোরার বা ট্রাস্ট লেজারে প্রেশারকে "মাপা হয়েছে" বলে মিথ্যা দাবি করিনি। আমরা এটিকে স্পষ্টভাবে **Assumed Fact** হিসেবে চিহ্নিত করেছি।

### ৪.২ সেন্সর ড্রিফ্ট ও এমসিএ ক্যালিব্রেশন (Sensor Drift & MCA Recalibration)
- BASS-II-এর CSA-CP অক্সিজেন সেন্সরে ড্রিফ্ট (Drift) ছিল।
- নাসার বিজ্ঞানীরা প্রতিদিনের টেস্টের জন্য ISS-এর মূল ল্যাব অ্যানালাইজার—**Major Constituent Analyzer (MCA)**-এর রিডিং দেখে অফসেট যোগ করে ক্যালিব্রেটেড O2 রিডিং নির্ধারণ করেছিলেন (উদ্ধৃত: BASS-II ReadMe §23 ও NASA/TM-20210011385 পৃ. ১২৪)।

### ৪.৩ টেস্ট B2 এবং ইমপসিবল ডেল্টা O2
- BASS-II-এর টেস্ট B2-তে ইনিশিয়াল O2 ছিল 16.5% কিন্তু ফাইনাল O2 দেখানো হয়েছিল 21.0% (যা ফিজিক্যালি অসম্ভব, কারণ আগুন অক্সিজেন গ্রহণ করে, বাড়ায় না)।
- আমরা এই টেস্টকে এভিডেন্স টেক্সট থেকে বাদ দিয়েছি এবং ডাটা কোয়ালিটি নোটে ফ্ল্যাগ করেছি।

---

# অধ্যায় ৫: আউটকাম ক্লাসিফিকেশন ও সার্কুলারিটি অডিট

### ৫.১ আউটকাম লেবেলের পরিবর্তন (Outcome Reclassification)
আগে মক ফিক্সচারে `sustained` শব্দটি ব্যবহার করা হতো, যা মহাকাশ সলিড ফায়ারের ক্ষেত্রে বিভ্রান্তিকর (কারণ অনেক সময় আগুন স্থির হয়ে থাকে কিন্তু ছড়ায় না)। নাসার অফিসিয়াল BASS-II ReadMe ডকুমেট থেকে সরাসরি উদ্ধৃতি দিয়ে আমরা লেবেলগুলো রি-ডিফাইন করেছি:
- **`frames_recorded`** ("Photographed burn: frames recorded"): নিকন ক্যামেরা ফ্রেম সংখ্যা > 0।
- **`extinguished`** ("PI-noted extinction"): প্রধান গবেষক (PI) কর্তৃক স্বচক্ষে পর্যবেক্ষণকৃত নির্বাপণ।
- **`no_ignition`** ("PI-noted no ignition"): ইগনিশন কয়েল চালু করার পরও শিখা সৃষ্টি হয়নি।
- **টুলটিপ সতর্কবার্তা:** *"Frame count includes post-burn images (BASS-II ReadMe)"*।

### ৫.২ সার্কুলারিটি চেক (Circularity Audit)
নাসার কাঁচা এক্সপেরিমেন্টাল টেবিলে ২৫টি রো (Tests 33–57; যেমন B30–B40) পাওয়া গেছে যেখানে Air display বা Fan display সেলে নোট লেখা ছিল—যেমন `"ext at fan 1.2"` বা `"ext @ fan 0.8"`। এখান থেকেই ফ্লো এবং আউটকাম দুটোই পার্স করা হয়েছিল।
আমরা মেশিন লার্নিং গ্রুপড ক্রস-ভ্যালিডেশন চালিয়ে ৩টি কন্ডিশনে পরীক্ষা করেছি:
1. **(a) Baseline (as is):** Accuracy 92.4% (Balanced Acc: 77.5%, Extinction Recall: 84.4%)।
2. **(b) Excluding circular rows (২৫টি রো বাদ দিয়ে):** Accuracy 92.5% (Balanced Acc: 75.3%, Extinction Recall: 81.0%)।
3. **(c) Flow masked (ফ্লো ভ্যালু মাস্ক করে):** Accuracy 87.9% (Balanced Acc: 68.2%, Extinction Recall: 71.4%)।

### ৫.৩ কেন ৮৩% থেকে ৯২.৪% অ্যাকুরেসি পরিবর্তন হলো?
- **৮৩% অ্যাকুরেসি:** এটি ছিল হার্ডওয়্যার-গ্রুপ লিভ-ওয়ান-গ্রুপ-আউট ক্রস ভ্যালিডেশন (LOOCV across 7 sample mount groups)। যখন সম্পূর্ণ নতুন একটি স্যাম্পল জ্যামিতিতে মডেল পরীক্ষা করা হয়, তখন অ্যাকুরেসি কম ছিল।
- **৯২.৪% অ্যাকুরেসি:** এটি ছিল নতুন আউটকাম ক্লাসিফিকেশন সহ আনগ্রুপড ক্রস ভ্যালিডেশন।

---

# অধ্যায় ৬: সিমুলেটর ও রিয়েল ম্যাচিং ইঞ্জিন

### ৬.১ ৫-স্টেপ সায়েন্টিফিক এলিজিবিলিটি গেট (5-Step Eligibility Filter)
ইউজার যখন সিমুলেটরে কোনো সিনারিও সেট করেন, সিস্টেম সরাসরি ম্যাচ খোঁজার আগে ৫টি ফিজিক্যাল গেট চেক করে:
1. **Phase Gate:** সলিড ফুয়েলকে কখনো তরল ড্রপলেটের সাথে তুলনা করা যাবে না।
2. **Gravity Transition Gate:** ০g-এর ডাটাকে সরাসরি লুনার (০.১৬g) বা মার্স (০.৩৮g)-এর সমতুল্য বলা যাবে না; বাউন্ডারি সতর্কবার্তা দিতে হবে।
3. **Minimum Telemetry Gate:** যে রানে O2 বা এয়ারফ্লো রেকর্ড নেই, তা বাদ।
4. **Boundary Sanity Gate:** ভৌতিকভাবে অসম্ভব মান (যেমন নেগেটিভ প্রেসার বা ৫০% এর বেশি O2) ফিল্টার।
5. **Material Compatibility Gate:** একই উপাদানের রানকে সর্বোচ্চ অগ্রাধিকার দেওয়া।

### ৬.২ ডাইনামিক রি-নরমালাইজড ওয়েটেড সিমিলারিটি ইঞ্জিন
পদার্থবিজ্ঞানে ইউক্লিডিয়ান দূরত্ব অন্ধভাবে কাজ করে না। তাই আমরা ডোমেন-ওয়েটেড সিমিলারিটি ব্যবহার করেছি:
- **উপাদান (Material):** ৩০%
- **অক্সিজেন ঘনত্ব (O2):** ২০%
- **বায়ুপ্রবাহ গতি (Airflow):** ২০%
- **চাপ (Pressure):** ১৫%
- **গবেষণার উদ্দেশ্য (Objective):** ১০%
- **জ্যামিতি ও বেধ (Geometry):** ৫%

**ডাইনামিক রি-নরমালাইজেশন:** নাসার কোনো পুরনো টেস্টে যদি প্রেশার সেন্সরের ডাটা না থাকে, সিস্টেম বাকি ফ্যাক্টরগুলোর ওয়েট এমনভাবে রি-ক্যালকুলেট করে যাতে মোট সিমিলারিটি স্কোর সবসময় কঠোরভাবে ১০০%-এ নরমালাইজড থাকে।

### ৬.৩ মেটেরিয়াল মিসম্যাচ ব্যাজ ও আউটসাইড-এনভেলপ গার্ডরেল
- ইউজার যদি PMMA সিলেক্ট করে কিন্তু কাছের রানটি Cotton হয়, তবে কার্ডে স্পষ্টভাবে **`different material`** ব্যাজ দেখাবে।
- "What the record says" কাউন্ট থেকে ভিন্ন উপাদান ডিফল্টভাবে বাদ রাখা হয়। রেঞ্জের মধ্যে ৩টির কম একই উপাদানের রান থাকলে তা স্পষ্টভাবে লেখা থাকে।
- যদি সিনারিওটি পরীক্ষিত রেঞ্জের বাইরে হয় (যেমন Moon 0.16g বা Mars 0.38g), তবে হেডলাইন কাউন্ট মুছে গিয়ে সতর্কবার্তা আসে:
  > *"No flight run in the tested record is near this scenario (Distance: ΔO2=..., ΔFlow=... cm/s; gravity 0g only; pressure unmeasured)"*

---

# অধ্যায় ৭: রিসার্চ গ্যাপ র‍্যাঙ্কিং ইঞ্জিন (`/gaps`)

ভবিষ্যৎ আর্টেমিস ও মঙ্গল অভিযানের জন্য নাসার ডাটাবেসে কোথায় কোথায় ফাঁক (Research Gaps) রয়েছে, তা বৈজ্ঞানিকভাবে র‍্যাঙ্ক করার জন্য আমরা [`/gaps`](file:///e:/IGNIS/apps/web/src/pages/ResearchGapsPage.tsx) পেজ তৈরি করেছি:

### ৭.১ ৫টি এক্সপ্লোরেশন মিশন সিনারিও (`data/missions.json`)
1. **ISS Cabin (Baseline):** 21.0% O2, 101.3 kPa, 0 g, 5.0 cm/s flow (Cites NTRS-20210011385 p.14)।
2. **Gateway-like Habitat:** 21.0% O2, 101.3 kPa, 0 g, 8.0 cm/s flow (Editable user assumption)।
3. **Exploration Atmosphere (EVA Prebreathe):** 34.0% O2, 56.0 kPa, 0 g, 10.0 cm/s flow (Cites NTRS-20080013149 p.2 & NTRS-20240002981 p.3)।
4. **Lunar Surface Habitat (Artemis Base):** 21.0% O2, 70.3 kPa, 0.16 g, 15.0 cm/s flow (Editable user assumption)।
5. **Mars Surface Habitat:** 21.0% O2, 70.3 kPa, 0.38 g, 15.0 cm/s flow (Editable user assumption)।

### ৭.২ গ্যাপ কভারেজ ম্যাথমেটিক্যাল ফর্মুলা
প্রতিটি মিশনের জন্য টেস্টেড রেকর্ডের নিকটতম রানের নরমালাইজড দূরত্ব ($d_{\min}$):
$$d_{\min} = \sqrt{\left(\frac{\Delta \text{O}_2}{28\%}\right)^2 + \left(\frac{\Delta \text{Flow}}{40\,\text{cm/s}}\right)^2}$$

কভারেজ স্কোর $S \in [0, 100]$:
$$S = 100 \times \left[ 0.55 \times \max\left(0, 1 - \frac{d_{\min}}{R}\right) + 0.30 \times \min\left(1, \frac{N_{\text{local}}}{5}\right) + 0.10 \times \mathbb{I}(\text{gravity match}) + 0.05 \times \mathbb{I}(\text{pressure measured}) \right]$$

যেখানে $R$ হলো রেডিয়াস (UI স্লাইডার দিয়ে 0.05 থেকে 0.50 পর্যন্ত পরিবর্তনযোগ্য)।

### ৭.৩ টেমপ্লেটেড গ্যাপ-ক্লোজিং রেকমেন্ডেশন
কোনো মনগড়া বা কাল্পনিক পরামর্শ নয়। মিসিং অ্যাক্সিসের উপর ভিত্তি করে সরাসরি অ্যালগরিদমিক টেমপ্লেট থেকে রেকমেন্ডেশন তৈরি হয়:
> *"Conduct flight tests at 0.16 g (Lunar) with PMMA under 70.3 kPa pressure."*

---

# অধ্যায় ৮: এভিডেন্স ব্রিফ এক্সপোর্ট

সিমুলেটর পেজে **"Export Brief"** বাটনে ক্লিক করলে একটি প্রফেশনাল, সিঙ্গেল-পেজ প্রিন্টেবল বৈজ্ঞানিক রিপোর্ট তৈরি হয়:
- `@media print` অপ্টিমাইজড সিএসএস স্টাইল (কোনো ব্যাকগ্রাউন্ড গ্রাফিক্স বা অপ্রয়োজনীয় বাটন প্রিন্ট হবে না)।
- প্রতিটি মান `<Fact>` কম্পোনেন্টের মাধ্যমে প্রোভিন্যান্স লেভেল সহ রেন্ডার হয়।
- ২D মিনি-এনভেলপ প্লট এবং নিকটতম ৫টি ফ্লাইট রানের রেন্ডারিং (ফাইল পাথ, রো নম্বর সহ)।
- বৈজ্ঞানিক লিমিটেশনস, সতর্কবার্তা এবং হার্ডওয়্যার-গ্রুপ LOOCV ভ্যালিডেশন মেট্রিক্স।
- সম্পূর্ণ সোর্স লিস্ট উইথ পারসিস্টেন্ট DOI এবং NTRS পেপার নম্বর।
- **জিরো ভারডিক্ট ল্যাঙ্গুয়েজ:** রিপোর্টে কখনো "Safe" বা "Dangerous"-এর মতো অননুমোদিত সার্টিফিকেশন শব্দ থাকবে না।

---

# অধ্যায় ৯: সাইটেড অ্যাসিস্ট্যান্ট ও জিরো-হ্যালুসিনেশন RAG

### ৯.১ ব্রাউজারে ইন-মেমোরি BM25 রিট্রিভার (`bm25_retriever.ts`)
- ৯৩০টি নাসা কর্পাস চাঙ্ক (`chunks.json`) ব্রাউজারে লাইটওয়েট ইনডেক্স আকারে লোড হয়।
- কম্বাশন ডোমেন সিনোনিমস (যেমন: `flame` $\leftrightarrow$ `combustion`, `extinction` $\leftrightarrow$ `quenching`, `mca` $\leftrightarrow$ `calibration`) সাপোর্ট করে।
- ব্রাউজারের ভেতর সম্পূর্ণ অফলাইনে ১৫ মিলি-সেকেন্ডের কম সময়ে সার্চ সম্পন্ন হয়।

### ৯.২ এক্সট্র্যাক্টিভ মোড (ডিফল্ট অফলাইন ফলব্যাক)
- কোনো এলএলএম বা ক্লাউড এপিআই ছাড়াই কাজ করে।
- সরাসরি নাসার মূল পেপারের অনুচ্ছেদ, পেজ নম্বর এবং হাইলাইটেড কিওয়ার্ড প্রদর্শন করে।
- **স্ট্রাকচার্ড টুলস:** প্রশ্নটিতে যদি কোনো সিনারিও (যেমন *"PMMA at 18% O2 and 10 cm/s flow"*) উল্লেখ থাকে, অ্যাসিস্ট্যান্ট স্বয়ংক্রিয়ভাবে ফ্লাইট ম্যাচিং কার্ড ইনজেক্ট করে দেয়।

### ৯.৩ ক্লাউড এলএলএম মোড (`/api/ask`)
- Vercel Serverless Function-এ হোস্ট করা।
- প্রতি আইপিতে মিনিটে সর্বোচ্চ ১০টি রিকোয়েস্টের রেট লিমিট এবং ৫০০ টোকেনের ক্যাপ।
- এপিআই কি সার্ভারলেস ভ্যারিয়েবলে সুরক্ষিত; ব্রাউজারে কখনোই পৌঁছায় না।

### ৯.৪ ক্লায়েন্ট-সাইড ভেরিফায়ার (Client-Side Verifier)
মডেল যাই উত্তর দিক না কেন, ব্রাউজারের ভেরিফায়ার প্রতিটি বাক্য স্ক্রুটিনি করে:
1. প্রতিটি বাক্যে কমপক্ষে ১টি ভ্যালিড সাইটেশন থাকতে হবে।
2. বাক্যের ভেতরের প্রতিটি সংখ্যা এবং ইউনিট (%, kPa, cm/s, mm, s, W, kW, ppm) অবশ্যই সাইটেড চাঙ্ক বা ফ্লাইট রানের ডাটাতে উপস্থিত থাকতে হবে।
3. কোনো উদ্ধৃতি থাকলে তা অবশ্যই সাইটেড সোর্সের হুবহু সাবস্ট্রিং (Verbatim substring) হতে হবে।
4. যে বাক্য শর্ত ভঙ্গ করবে, তা সাথে সাথে ড্রপ (Drop) করা হবে।
5. সমস্ত বাক্য ড্রপ হলে ডিসপ্লে হবে: *"Not enough evidence in the corpus"*।
6. ব্যবহারকারীর সামনে ব্যাজ দেখাবে: **`"N/N sentences verified"`**।

### ৯.৫ প্রম্পট ইনজেকশন হার্ডেনিং
কর্পাস টেক্সটকে প্যাসিভ ডাটা পেলোড হিসেবে ট্রিট করা হয়। ৫টি ভিন্ন অ্যাডভারসারিয়াল অ্যাটাক ভেক্টর দিয়ে এটি টেস্ট করা হয়েছে যাতে কোনো ক্ষতিকর টেক্সট সিস্টেমকে হাইজ্যাক করতে না পারে।

---

# অধ্যায় ১০: ৩০-প্রশ্নের ইভালুয়েশন বেঞ্চমার্ক

আমরা [`data/eval/qa_set.json`](file:///e:/IGNIS/data/eval/qa_set.json)-এ ৩০টি গোল্ড-স্ট্যান্ডার্ড টেস্ট প্রশ্ন তৈরি করেছি এবং [`scripts/validate/eval_qa.py`](file:///e:/IGNIS/scripts/validate/eval_qa.py) দিয়ে মূল্যায়ন করেছি:

### ১০.১ ক্যাটাগরি ও ফলাফল ([`docs/EVALUATION.md`](file:///e:/IGNIS/docs/EVALUATION.md))

| মেট্রিক | পরীক্ষিত প্রশ্নাবলি | অর্জিত স্কোর | টার্গেট বার |
| :--- | :--- | :---: | :---: |
| **Recall@1** | ২০টি অ্যান্সারেবল প্রশ্ন | **৮৫.০%** (১৭/২০) | $\ge ৭০\%$ |
| **Recall@3** | ২০টি অ্যান্সারেবল প্রশ্ন | **৯০.০%** (১৮/২০) | $\ge ৮৫\%$ |
| **Recall@5** | ২০টি অ্যান্সারেবল প্রশ্ন | **৯৫.০%** (১৯/২০) | $\ge ৯০\%$ |
| **Mean Reciprocal Rank (MRR)** | ২০টি অ্যান্সারেবল প্রশ্ন | **০.৮৭৯** | $\ge ০.৭৫০$ |
| **আউট-অফ-স্কোপ রিজেকশন রেট** | ৫টি আউট-অফ-স্কোপ প্রশ্ন | **১০০.০%** (৫/৫) | ১০০% |
| **আনটেস্টেড কন্ডিশন ডিটেকশন** | ৫টি আনটেস্টেড সিনারিও | **১০০.০%** (৫/৫) | ১০০% |

- **২০টি অ্যান্সারেবল প্রশ্ন:** নাসা পেপারের সুনির্দিষ্ট পৃষ্ঠা ও অনুচ্ছেদ থেকে গোল্ড চাঙ্ক আইডি সংগৃহীত।
- **৫টি আউট-অফ-স্কোপ প্রশ্ন:** অ্যাপোলো রোভার ব্যাটারি, ওয়েব টেলিস্কোপ মিরর, স্পেসস্যুট কুলিং ফ্লো ইত্যাদি—সবগুলোতে সিস্টেম সঠিকভাবে লো-এভিডেন্স ফ্ল্যাগ করে রিজেক্ট করেছে।
- **৫টি আনটেস্টেড কন্ডিশন:** লুনার ০.১৬g, মার্স ০.৩৮g, হাই প্রেশার ৩০০ kPa—সবগুলোতে সিস্টেম স্পষ্টভাবে নির্দিষ্ট আনটেস্টেড অ্যাক্সিস ফ্ল্যাগ করেছে।

---

# অধ্যায় ১১: বিচারকদের জন্য বুলেটপ্রুফ প্রশ্নোত্তর

বিচারকরা টেকনিক্যাল গভীরতা যাচাই করতে যে কঠিন প্রশ্নগুলো করতে পারেন, তার চ্যাম্পিয়ন উত্তর নিচে দেওয়া হলো:

### প্রশ্ন ১: "Why didn't you train an AI model to directly predict fire spread in microgravity?"
> **উত্তর:**  
> *"That was our very first architectural consideration, and we deliberately rejected it based on scientific integrity. In aerospace life-safety, especially spaceflight, a generative neural network predicting physical values is dangerous because neural networks hallucinate and lack physical causality guarantees. NASA doesn't certify life-safety systems based on ungrounded black-box weights.*  
>  
> *Instead, our core invariant is: **'The AI is not the source of truth — NASA experiments are.'** We use AI where it belongs: for semantic search, intelligent multi-factor matching, and natural language communication. All physical behavior ratings come directly from empirical, peer-reviewed NASA flight data (FLEX, BASS, Saffire). This guarantees zero hallucinations for life-critical physics."*

### প্রশ্ন ২: "Where does your flight data come from, and how did you verify it isn't placeholder data?"
> **উত্তর:**  
> *"Every single flight run in IGNIS comes directly from official NASA Physical Sciences Informatics (PSI) experimental tables and NASA Technical Reports Server (NTRS) documents.  
> We wrote an end-to-end ingestion pipeline in `scripts/ingest/` that downloads primary CSVs, ReadMes, and NTRS papers using valid TLS certificates and tracks their SHA-256 checksums in `data/provenance/manifest.json`.  
> We have 132 usable solid flight runs and 341 droplet runs across BASS-II, Saffire-I/VI, and FLEX. Every number displayed in our UI is wrapped in a `<Fact>` component with direct provenance links to the exact raw file and row number."*

### প্রশ্ন ৩: "How do you handle parameters that NASA never measured in flight, like chamber pressure on solid burns?"
> **উত্তর:**  
> *"We practice what we call Trust Ledger Honesty. In BASS-II and Saffire solid combustion runs, NASA did not have active chamber pressure sensors during burns; nominal cabin pressure of 101.3 kPa was assumed.  
> Unlike conventional tools that quietly display 101.3 kPa as measured fact, our Trust Ledger explicitly audits and flags pressure as an 'Assumed Value' (N assumed facts), not a measured sensor reading. We never invent precision."*

### প্রশ্ন ৪: "What happens if a user tests Lunar (0.16g) or Mars (0.38g) conditions?"
> **উত্তর:**  
> *"This is one of our primary safety guardrails. NASA has only conducted long-duration flight combustion tests in microgravity (~0g) and normal gravity (1g).  
> When a user selects Lunar or Mars:  
> 1. Our Outside-Envelope Guardrail suppresses match counts and displays: 'No flight run in the tested record is near this scenario'.  
> 2. The nearest points are labeled strictly as 'closest tested conditions', never direct evidence.  
> 3. Our Research Gaps engine on `/gaps` mathematically quantifies this coverage gap and outputs a concrete experiment proposal to close it."*

---

# অধ্যায় ১২: ৩ মিনিটের ফাইনাল পিচ স্ক্রিপ্ট

বিচারকদের সামনে ৩ মিনিটের উপস্থাপনার জন্য এই স্ক্রিপ্টটি অনুসরণ করবেন:

### [0:00 - 0:45] হুক ও সমস্যা (The Problem & Hook)
> "Good morning, respected judges. Imagine you are an astronaut aboard a deep-space habitat on your way to Mars. You smell something burning. You look up at the ceiling—there is no smoke. You look around—there are no flickering yellow flames.
>  
> In microgravity, fire doesn't rise. Without buoyancy, it burns as a quiet, spherical, near-invisible blue dome. If you turn on an exhaust fan, you might feed it into an inferno. 
>  
> NASA has over two decades of groundbreaking microgravity combustion data from missions like FLEX, BASS, and Saffire. But until today, this critical life-safety intelligence was locked inside complex scientific papers and dense databases.
>  
> Introducing **IGNIS** — Intelligent Guidance from NASA Ignition Studies."

### [0:45 - 1:45] সমাধান ও লাইভ ডেমো (The Solution & Core Innovation)
> "IGNIS is an evidence-grounded fire safety intelligence platform built on one fundamental invariant: **The AI is NOT the source of truth — NASA experiments are.**
>  
> In our **Habitat Simulator**, you configure your mission environment—ISS, Gateway, Exploration Atmosphere, or Lunar/Mars habitats—and adjust oxygen, pressure, and airflow. Our **5-step Scientific Eligibility Filter** and **Dynamic Re-normalizing Matching Engine** instantly match your scenario against 132 real NASA spaceflight runs with verified provenance.
>  
> Simultaneously, our custom **WebGL 3D Engine** uses GLSL shaders to mathematically morph the flame in real-time from an elongated 1g convective teardrop into a pure 0g molecular diffusion sphere."

### [1:45 - 2:30] রিসার্চ গ্যাপ ও সাইটেড অ্যাসিস্ট্যান্ট (Deep Tech & Gap Engine)
> "On our **Research Gaps page (`/gaps`)**, we mathematically rank humanity's exploration blind spots using a 2D normalized Euclidean coverage metric, showing exactly what experiments must be run before we land humans on the Moon or Mars.
>  
> And our **Ask IGNIS assistant** features an in-browser BM25 retriever over 930 NASA corpus chunks and a **client-side verifier** that drops any answer sentence containing ungrounded numbers or non-verbatim quotes, guaranteeing zero AI hallucinations."

### [2:30 - 3:00] সমাপ্তি (The Visionary Close)
> "As humanity prepares for the Artemis lunar base and crewed journeys to Mars, fire safety cannot rely on guesswork or black-box generative AI. 
>  
> IGNIS turns 25 years of NASA space science into an interactive, trustworthy, and living evidence network. 
>  
> **Build a habitat. Start a fire. Discover the science.** 
> Thank you, and we are now ready for your questions!"

---
*(এই মাস্টার গাইডটি আপনার প্রজেক্টের প্রতিটি বৈজ্ঞানিক ও টেকনিক্যাল প্রশ্নের নিখুঁত রেফারেন্স হিসেবে সংরক্ষিত।)*
