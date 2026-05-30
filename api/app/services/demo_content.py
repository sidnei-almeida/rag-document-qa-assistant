"""Synthetic demo document bodies — rich text for RAG evaluation (not real financial/medical advice)."""

AI_DOCUMENT_SECTIONS: list[tuple[str, str]] = [
    (
        "AI Document Intelligence Report",
        "Executive Summary. Organizations ingest millions of PDFs annually across contracts, policies, "
        "research, and operations. Manual review does not scale. Document intelligence platforms combine "
        "layout-aware parsing, semantic chunking, vector retrieval, and large language models to answer "
        "questions with citations. This report outlines a reference architecture suitable for portfolio "
        "demonstrations on free-tier cloud infrastructure.",
    ),
    (
        "Problem Statement",
        "Knowledge workers spend hours searching PDFs for clauses, metrics, and definitions. Keyword search "
        "fails on scanned tables and multi-column layouts. Generic chatbots hallucinate when not grounded. "
        "The gap is a system that retrieves evidence first, then generates answers constrained to retrieved "
        "passages. Success metrics include citation accuracy, latency under ten seconds, and clear separation "
        "between document-specific and general conversational queries.",
    ),
    (
        "Reference Architecture",
        "Ingestion accepts PDF uploads per workspace. PyPDF or layout parsers extract text per page. "
        "Recursive character splitters produce overlapping chunks near nine hundred characters with one "
        "hundred twenty overlap. Embeddings use sentence-transformers/all-MiniLM-L6-v2. Vectors persist in "
        "per-document FAISS indexes on disk. The API layer is FastAPI with async lifespan hooks. Groq hosts "
        "llama-3.3-70b-versatile for generation with low temperature to reduce creativity on factual tasks.",
    ),
    (
        "Key Benefits",
        "Grounded answers reduce hallucination risk in demo settings. Per-document indexes prevent cross-talk "
        "between unrelated files. Source previews let users verify page and chunk references. MMR retrieval "
        "balances relevance and diversity. The stack deploys on Hugging Face Spaces with secrets for API keys. "
        "Developers can fork the project and extend parsers, chunk sizes, or retrieval depth without redesign.",
    ),
    (
        "Limitations and Risks",
        "OCR quality depends on source PDFs; scanned images may lose table structure. Chunk boundaries can "
        "split sentences and weaken retrieval for precise legal language. The demo does not provide "
        "professional legal, medical, or investment advice. Long documents may hit page caps. Cold starts on "
        "free tiers add latency for embedding model download. Concurrent uploads on ephemeral disks may not "
        "persist across Space restarts without persistent storage volumes.",
    ),
    (
        "Technologies Used",
        "Backend: Python 3.11, FastAPI, Uvicorn. Orchestration: LangChain community integrations. "
        "Embeddings: Hugging Face sentence-transformers. Vector store: FAISS CPU. LLM: Groq ChatGroq. "
        "Frontend: React with per-document chat state in localStorage. Deployment: Hugging Face Spaces "
        "Docker SDK with app.py entrypoint and requirements.txt at repository root.",
    ),
    (
        "Security and Privacy",
        "Demo deployments should not process regulated health or payment data without enterprise controls. "
        "API keys belong in Space secrets, never in client bundles. CORS restricts browser origins in "
        "production. Uploaded files reside on local disk; operators must understand data residency. Audit "
        "logs should record document_id and question length without storing full prompts if privacy is a concern.",
    ),
    (
        "Evaluation Methodology",
        "Test questions should cover summarization, fact lookup, comparison, and negative cases where the "
        "answer is not in the document. Measure precision of cited pages, answer latency, and refusal behavior "
        "for general greetings. Regression suites can snapshot expected chunk_ids for canonical questions. "
        "Human reviewers score faithfulness on a five-point rubric for portfolio presentations.",
    ),
    (
        "Roadmap",
        "Near-term: multi-document demo library, upload endpoint, delete with guardrails on default samples. "
        "Mid-term: hybrid search with BM25, table extraction, and streaming tokens to the UI. Long-term: "
        "role-based access, enterprise SSO, and batch indexing pipelines from object storage.",
    ),
    (
        "Conclusion",
        "Document intelligence with RAG is a practical portfolio pattern. Isolated indexes per file, explicit "
        "citations, and honest limitation sections build trust with technical interviewers and product stakeholders.",
    ),
]

FINANCIAL_SECTIONS: list[tuple[str, str]] = [
    (
        "Financial Summary 2025",
        "This synthetic annual summary describes Horizon Analytics Group (fictional) for demonstration only. "
        "It is not an SEC filing or investment recommendation. Fiscal year 2025 ended December 31 with "
        "consolidated revenue of $4.82 billion, up 14.3% year over year at constant currency. Gross margin "
        "expanded 120 basis points to 61.8% driven by software mix and hosting efficiencies.",
    ),
    (
        "Revenue by Segment",
        "Enterprise subscriptions contributed $2.91 billion (60.4% of total), growing 18% organically. "
        "Professional services were $780 million, up 6%, reflecting longer implementation cycles on data "
        "governance modules. Maintenance and support were $640 million, flat year over year as customers "
        "migrated to subscription tiers. Other revenue, including training and partner royalties, was $490 million.",
    ),
    (
        "Geographic Performance",
        "North America represented 52% of revenue with 16% growth led by financial services and healthcare "
        "verticals. EMEA was 28% of revenue, up 11%, despite FX headwinds of approximately $42 million. "
        "Asia-Pacific was 15% with 22% growth from Japan and Singapore cloud regions. Latin America was 5% "
        "with improving collections; days sales outstanding fell from 58 to 51 days.",
    ),
    (
        "Profitability",
        "Adjusted EBITDA was $1.24 billion (25.7% margin), compared to $1.02 billion (24.1%) in fiscal 2024. "
        "Stock-based compensation was $310 million. GAAP operating income was $890 million after restructuring "
        "charges of $45 million related to a sales optimization program. Net income attributable to common "
        "shareholders was $720 million, or $3.18 per diluted share.",
    ),
    (
        "Cash Flow and Balance Sheet",
        "Operating cash flow was $1.38 billion. Capital expenditures were $210 million, primarily data center "
        "leases and GPU capacity for internal model fine-tuning. Free cash flow was $1.17 billion. Cash and "
        "equivalents ended the year at $2.05 billion. Total debt was $1.10 billion with weighted average "
        "coupon 4.2%; net leverage was 0.9x adjusted EBITDA.",
    ),
    (
        "Customer Metrics",
        "Net revenue retention was 118%. Customers with annual contract value above $1 million grew to 412 from "
        "356. Logo churn in the mid-market segment improved to 7.2% from 8.5%. Average contract length increased "
        "to 2.4 years. Pipeline coverage entering Q1 2026 was 3.1x quota for the enterprise sales team.",
    ),
    (
        "Product Investments",
        "R&D expense was $890 million (18.5% of revenue). Major releases included Forecast Studio 5.0 with "
        "automated variance narratives, Compliance Hub for SOX workflows, and an embedded copilot for Excel. "
        "Patents filed during the year totaled 37, with emphasis on time-series anomaly detection.",
    ),
    (
        "Risk Factors",
        "Macroeconomic slowdown could lengthen sales cycles. Concentration risk: top ten customers represent "
        "21% of revenue. Cyber incidents could disrupt multi-tenant SaaS. Regulatory changes in EU AI Act may "
        "require additional model documentation. Talent competition in machine learning engineering remains intense.",
    ),
    (
        "2026 Guidance",
        "Management guides fiscal 2026 revenue between $5.35 and $5.55 billion, implying 11–15% growth. "
        "Adjusted EBITDA margin is expected to expand 50–100 basis points. CapEx will rise modestly for a second "
        "availability region in Frankfurt. Share repurchase authorization was increased by $500 million.",
    ),
    (
        "Capital Allocation",
        "The board declared a quarterly dividend of $0.12 per share beginning Q2 2026. $320 million was "
        "repurchased in fiscal 2025 at an average price of $78.40. M&A pipeline focuses on niche ESG reporting "
        "tools under $150 million enterprise value.",
    ),
    (
        "Audit and Controls",
        "Independent auditors issued an unqualified opinion. Material weakness from 2023 revenue recognition "
        "automation was remediated. SOX 404 testing covered 92% of consolidated revenue. Internal audit flagged "
        "third-party plugin review as a medium priority for 2026.",
    ),
    (
        "ESG Highlights",
        "Scope 1 and 2 emissions intensity fell 9% per million dollars revenue. Board diversity targets met "
        "with 42% gender diversity and 25% underrepresented minorities. Supplier code of conduct audits covered "
        "78% of spend.",
    ),
    (
        "Segment Outlook Narrative",
        "CFO commentary: subscription growth should outpace services as partners deliver standardized "
        "implementations. FX sensitivity: a 5% stronger dollar would reduce reported revenue by approximately "
        "$95 million annually. Hedging program covers 60% of forecasted euro exposure for six months forward.",
    ),
    (
        "Liquidity Stress Scenario",
        "Stress test assuming 20% new booking decline still leaves minimum liquidity covenant headroom of "
        "$400 million under existing credit agreement. Revolver remains undrawn; maturity 2028.",
    ),
    (
        "Appendix — Non-GAAP Reconciliation",
        "Adjusted EBITDA excludes restructuring, acquisition-related amortization, and lease impairment. "
        "Reconciliation tables are available in the fictional investor data room for demo purposes only.",
    ),
]

CLINICAL_SECTIONS: list[tuple[str, str]] = [
    (
        "Clinical Trial Summary",
        "Study NX-447 Phase III synopsis (fictional). Sponsor: Northline Therapeutics. Indication: moderate "
        "to severe chronic plaque psoriasis. Design: randomized, double-blind, placebo-controlled, 52-week "
        "treatment with optional open-label extension. Primary endpoint: PASI 75 at week 16. Enrollment "
        "target was 1,240 participants across 98 sites in nine countries.",
    ),
    (
        "Study Population",
        "Inclusion criteria included adults 18–75 years, PASI score 12–40, body surface area involvement "
        "at least 10%, and candidate for systemic therapy. Exclusions: prior biologic within 12 weeks, "
        "active serious infection, pregnancy, or uncontrolled diabetes with HbA1c above 9%. Mean age was 44.2 "
        "years; 41% female; median disease duration 11.3 years.",
    ),
    (
        "Intervention",
        "NX-447 administered subcutaneously 150 mg every two weeks after a 300 mg loading dose at weeks 0 "
        "and 2. Comparator arms: placebo through week 16 with rescue therapy allowed for severe flare, and "
        "active reference adalimumab per label in a secondary stratum (not powered for non-inferiority).",
    ),
    (
        "Primary Efficacy Results",
        "PASI 75 at week 16: NX-447 71.4% (n=412) versus placebo 8.1% (n=408), p<0.0001. Absolute difference "
        "63.3% (95% CI 58.1–68.5). PASI 90 achieved in 48.2% of NX-447 patients. sPGA clear or almost clear "
        "was 62.7% versus 6.4% placebo.",
    ),
    (
        "Secondary Endpoints",
        "Dermatology Life Quality Index improvement ≥4 points: 68.9% NX-447 versus 14.2% placebo. Nail psoriasis "
        "improvement in modified NAPSI: significant at week 24. Itch numeric rating scale reduction ≥4 points at "
        "week 4: 54.3% versus 11.0% placebo, supporting rapid symptomatic relief.",
    ),
    (
        "Safety Overview",
        "Treatment-emergent adverse events were reported in 62.1% NX-447 versus 58.4% placebo. Serious adverse "
        "events: 4.8% versus 5.2%. Discontinuations due to AEs: 3.1% versus 2.7%. No deaths attributed to study drug. "
        "Most common events: nasopharyngitis, headache, upper respiratory tract infection, injection site erythema.",
    ),
    (
        "Infections and Immunogenicity",
        "Serious infections occurred in 1.2% NX-447 patients (four cases) versus 0.7% placebo. Tuberculosis "
        "screening was required at baseline; no active TB cases detected. Anti-drug antibodies developed in "
        "8.4% of NX-447 subjects; neutralizing antibodies in 1.1% with no clear impact on efficacy.",
    ),
    (
        "Laboratory Findings",
        "Mild transient neutropenia (<1500 cells/mm3) in 2.3% without clinical sequelae. Liver enzymes elevated "
        "above 3x ULN in 1.0% versus 0.5% placebo, all resolved on continued therapy or temporary hold. Lipid "
        "shifts were minimal and not clinically significant at week 52.",
    ),
    (
        "Subgroup Analyses",
        "Efficacy consistent across prior biologic-exposed and biologic-naive cohorts. Geographic regions "
        "showed PASI 75 rates: North America 73.1%, EU 70.2%, Asia-Pacific 69.5%. Body weight quartiles did "
        "not materially modify response.",
    ),
    (
        "Open-Label Extension",
        "Week 52 data from extension cohort (n=892): sustained PASI 75 in 78.6%. No new safety signals. "
        "Four malignancies reported (basal cell carcinoma, prostate cancer stage I, cervical CIS, melanoma in situ) "
        "within expected epidemiological background rates per independent adjudication committee.",
    ),
    (
        "Regulatory Status",
        "Rolling submission to FDA accepted Q3 2025. EMA MAA filed with accelerated assessment request. "
        "Pediatric investigational plan agreed for ages 12–17 with separate Phase III initiating 2026.",
    ),
    (
        "Manufacturing and Supply",
        "Drug substance produced at cGMP facility in Ireland. Cold chain 2–8°C. Shelf life 24 months. "
        "Supply agreement covers 36 months post-approval forecast scenarios.",
    ),
    (
        "Investigator Conclusions",
        "NX-447 demonstrated clinically meaningful and statistically significant improvement in psoriasis "
        "severity with an acceptable benefit-risk profile for the studied population. Long-term registry "
        "study NCT-PLACEHOLDER will monitor cardiovascular and malignancy outcomes for ten years.",
    ),
    (
        "Patient-Reported Outcomes",
        "Psoriasis Symptom Diary sleep disturbance domain improved by week 2. Work productivity and activity "
        "impairment questionnaire showed 31% reduction in absenteeism days at week 16 among employed participants.",
    ),
    (
        "Statistical Methods",
        "Primary analysis used Cochran-Mantel-Haenszel test stratified by region and prior biologic use. "
        "Multiple imputation for missing data sensitivity analysis confirmed robustness. Non-responder imputation "
        "at week 16 yielded conservative estimate still above 65% PASI 75.",
    ),
]

MARKET_SECTIONS: list[tuple[str, str]] = [
    (
        "Market Research Brief",
        "Title: Enterprise Document AI Platforms — 2025 TAM and Competitive Landscape (fictional syndicated "
        "research for demo use). Commissioned by DocMind portfolio team. Methodology blended 120 CIO interviews, "
        "vendor briefings, and secondary data from public filings. Currency USD; base year 2025.",
    ),
    (
        "Market Size",
        "Total addressable market for document-centric AI assistants in enterprises above 1,000 employees "
        "is estimated at $18.6 billion in 2025, growing to $42.3 billion by 2030 (17.8% CAGR). Serviceable "
        "obtainable market for mid-market SaaS vendors is $4.2 billion. North America accounts for 46% of spend.",
    ),
    (
        "Growth Drivers",
        "Drivers include generative AI budgets, compliance automation, M&A due diligence acceleration, and "
        "customer support knowledge bases. Barriers: data residency requirements, hallucination risk, integration "
        "cost with legacy ECM systems, and shortage of prompt engineering skills.",
    ),
    (
        "Customer Segments",
        "Financial services (22% share) prioritizes audit trails and citation. Legal (18%) needs clause "
        "extraction and redlining support. Healthcare (14%) demands HIPAA-aligned deployments. Manufacturing "
        "(11%) focuses on SOP search. Public sector (9%) requires FedRAMP or equivalent.",
    ),
    (
        "Competitive Landscape — Leaders",
        "Category leaders (fictional rankings): 1) Veridian Docs AI — breadth of connectors. 2) Cortex "
        "Knowledge Cloud — strongest enterprise SSO. 3) Lumina Retrieval Suite — best benchmark scores on "
        "legal benchmarks. 4) DocMind-class open demos — fastest time-to-try on HF Spaces. 5) Northstar Capture — "
        "OCR accuracy on scanned archives.",
    ),
    (
        "Competitive Landscape — Challengers",
        "Challengers include niche vendors for life sciences regulatory submissions and construction RFIs. "
        "Open-source stacks (LangChain, LlamaIndex, Haystack) reduce switching costs. Hyperscalers bundle "
        "document Q&A into office suites, compressing pricing in SMB segments.",
    ),
    (
        "Pricing Analysis",
        "Median enterprise contract value for document AI platforms was $285,000 ACV in 2025, down 8% from "
        "2024 due to competition. Consumption-based embedding fees average $0.04 per 1,000 tokens indexed. "
        "On-premise premiums of 35–50% persist in regulated industries.",
    ),
    (
        "Buying Process",
        "Average sales cycle 6.4 months; security review adds 2.1 months in healthcare. Proof-of-concept "
        "success criteria: citation accuracy above 85%, p95 latency below 8 seconds, and SSO integration within "
        "two sprints. Procurement often requires exit clauses if model providers change terms.",
    ),
    (
        "Technology Trends",
        "Trends: smaller embedding models with higher recall, hybrid dense-sparse retrieval, layout-aware "
        "chunking, and agentic workflows that call tools beyond single-shot QA. Multimodal PDF understanding "
        "(images, charts) is the top R&D bet for 2026 according to 68% of vendors surveyed.",
    ),
    (
        "Regional Notes",
        "EU buyers emphasize GDPR Article 22 transparency. Middle East demand rising for Arabic OCR. "
        "Japan prefers on-premise or dedicated VPC. Brazil growth in agribusiness contract analysis.",
    ),
    (
        "Forecast Scenarios",
        "Base case 2030 TAM $42.3B. Bull case $51.0B if agent adoption accelerates. Bear case $34.1B if "
        "regulatory friction limits training on customer documents. Probability weights: 55% base, 25% bull, 20% bear.",
    ),
    (
        "Recommendations for Vendors",
        "Differentiate on verifiable citations, per-document isolation, and honest evaluation harnesses. "
        "Avoid overclaiming accuracy on scanned tables. Partner with systems integrators for ServiceNow and "
        "SharePoint connectors. Offer transparent pricing for embedding refresh jobs.",
    ),
    (
        "Appendix — Survey Demographics",
        "CIO interviews: 40% North America, 30% EMEA, 20% APAC, 10% other. Industries balanced across "
        "finance, legal, healthcare, and technology. Median company revenue $3.1B.",
    ),
    (
        "Glossary",
        "TAM: total addressable market. ACV: annual contract value. RAG: retrieval-augmented generation. "
        "MMR: maximal marginal relevance. ECM: enterprise content management.",
    ),
]
