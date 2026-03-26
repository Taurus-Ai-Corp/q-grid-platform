# Q-Grid Comply: EU AI Act Compliance Platform - Deep Tech Research Findings

> Research Date: 2026-03-26
> Scope: HuggingFace models/datasets, GitHub libraries, arxiv papers, compliance tools
> Purpose: Identify actionable resources for Q-Grid Comply EU AI Act compliance platform

---

## Table of Contents

1. [Tier 1 - High Impact, Easy Integration](#tier-1---high-impact-easy-integration)
2. [Tier 2 - High Impact, Moderate Integration](#tier-2---high-impact-moderate-integration)
3. [Tier 3 - Supplementary / Reference](#tier-3---supplementary--reference)
4. [HuggingFace Models](#huggingface-models)
5. [HuggingFace Datasets](#huggingface-datasets)
6. [Open Source Libraries & Tools](#open-source-libraries--tools)
7. [MCP Servers (Claude/Cursor Integration)](#mcp-servers)
8. [Academic Papers](#academic-papers)
9. [Report Generation Patterns](#report-generation-patterns)
10. [PQC/Quantum Readiness Scoring](#pqcquantum-readiness-scoring)
11. [Integration Recommendations](#integration-recommendations)

---

## Tier 1 - High Impact, Easy Integration

These resources can be integrated within days and provide immediate value.

### 1. suhas-km/eu-ai-act-policy-model (HuggingFace Model)
- **URL**: https://huggingface.co/suhas-km/eu-ai-act-policy-model
- **Type**: Fine-tuned DistilBERT for multi-label text classification
- **What it does**: Detects EU AI Act policy violations, categorizes them into compliance domains, assesses severity, and maps to specific EU AI Act articles
- **Format**: ONNX + SafeTensors (fast inference, edge-deployable)
- **License**: Based on distilbert-base-uncased (Apache 2.0 compatible)
- **Integration**: Load via `transformers` or ONNX Runtime in the assessment engine. Feed questionnaire responses and AI system descriptions to get violation detection + article mapping.
- **Q-Grid Comply use**: Core classifier for risk level detection in the assessment questionnaire flow

### 2. TechOps Documentation Templates (GitHub + Paper)
- **GitHub**: https://github.com/aloosley/techops
- **Paper**: https://arxiv.org/abs/2508.08804 (AAAI/ACM AIES 2025)
- **What it does**: Open-source templates for EU AI Act technical documentation (data, models, applications). First templates to completely map sections to EU AI Act Annex IV requirements.
- **License**: Open source
- **Integration**: Use as the skeleton for auto-generated compliance reports. Each template section maps to a specific AI Act article. Feed assessment responses into template slots.
- **Q-Grid Comply use**: Foundation for the report generation engine. Combine with LLM paraphrasing (DoXpert pattern) to auto-fill sections.

### 3. COMPL-AI Framework (GitHub + Leaderboard)
- **GitHub**: https://github.com/compl-ai/compl-ai
- **Leaderboard**: https://huggingface.co/spaces/latticeflow/compl-ai-board
- **Paper**: https://arxiv.org/abs/2410.07959
- **What it does**: 27-benchmark suite evaluating LLMs against 18 EU AI Act technical requirements across 6 principles. Scores 0-1 per requirement.
- **Developed by**: ETH Zurich, INSAIT, LatticeFlow AI
- **License**: Apache 2.0
- **Integration**: Adopt the 18 technical requirements as the scoring taxonomy for Q-Grid Comply. Use the benchmark methodology for the assessment engine scoring logic.
- **Q-Grid Comply use**: The scoring methodology (0-1 per requirement, 6 principle categories) is the exact framework needed for the compliance dashboard.

### 4. ark-forge/mcp-eu-ai-act (MCP Server)
- **GitHub**: https://github.com/ark-forge/mcp-eu-ai-act
- **What it does**: MCP server that scans codebases for AI framework usage, classifies risk level, checks compliance against EU AI Act articles, and generates documentation templates. Also includes GDPR scanning.
- **Language**: Python 3.8+, single dependency (mcp)
- **Features**: Framework detection (.py/.js/.ts/.java/.go/.rs), risk categorization (Art. 5, Annex III, Art. 52), compliance document generation
- **Integration**: Direct MCP integration into Claude Code workflow. Can be the backend scanner for code-level compliance checking.
- **Q-Grid Comply use**: Add as an MCP tool for the platform's AI-powered compliance scanner feature

### 5. airblackbox/eu-ai-act-compliance-benchmark (HuggingFace Dataset)
- **URL**: https://huggingface.co/datasets/airblackbox/eu-ai-act-compliance-benchmark
- **What it does**: 55 Python AI agent files with ground-truth compliance labels across 6 EU AI Act articles. First public benchmark for evaluating compliance scanners.
- **License**: Apache 2.0
- **Integration**: Use as test suite for validating Q-Grid Comply's scanning accuracy. Also useful for fine-tuning classification models.
- **Q-Grid Comply use**: Validation benchmark - run the platform's scanner against this dataset to measure and advertise accuracy

---

## Tier 2 - High Impact, Moderate Integration

These require more engineering effort but provide significant competitive advantages.

### 6. DoXpert (Report Generation Pattern)
- **Paper**: https://pmc.ncbi.nlm.nih.gov/articles/PMC11965209/ (Empirical Software Engineering, Springer)
- **Also**: https://link.springer.com/article/10.1007/s10664-025-10645-x
- **What it does**: LLM-powered compliance documentation tool. Uses prompt engineering + answer retrieval (RAG-like) to summarize docs. Generates DoX score + explanatory relevance score per question. Achieves 81-83% accuracy, F1 83-84%.
- **Key innovation**: Uses LLM only for paraphrasing (not generation) to eliminate hallucination risk in compliance context.
- **Integration**: Implement the DoXpert scoring pattern (boolean answered + DoX score + relevance score) in Q-Grid Comply's report generator. Use the paraphrase-only LLM strategy for compliance-critical text.
- **Q-Grid Comply use**: Core pattern for the "Generate Compliance Report" feature. Feed questionnaire responses through DoXpert-style pipeline to produce Article 11 technical documentation.

### 7. CORTEX Risk Scoring Framework (Paper)
- **Paper**: https://arxiv.org/abs/2508.19281
- **What it does**: Multi-layered risk scoring framework with 5-tier architecture: Likelihood x Impact, governance overlays (EU AI Act, NIST RMF, OECD), technical surface scores, environmental modifiers, and Bayesian risk aggregation.
- **Based on**: Empirical analysis of 1,200+ incidents from AI Incident Database (AIID). 7 domains, 29 vulnerability groups, 120+ failure types.
- **Integration**: Adopt the scoring taxonomy and weighting methodology. The 5-tier architecture maps perfectly to a compliance scoring dashboard.
- **Q-Grid Comply use**: Use as the scoring engine architecture. The 29 vulnerability groups become assessment categories, the composite score becomes the compliance readiness percentage.

### 8. AgentGuard - EU AI Act Middleware (GitHub)
- **GitHub**: https://github.com/Sagar-Gogineni/agentguard
- **npm**: `@the-bot-club/agentguard`
- **pip**: `pip install agentguard`
- **What it does**: Runtime compliance middleware. 3 lines of code to add EU AI Act compliance to any LLM agent. Provides audit logging (Art. 12), transparency metadata (Art. 50), identity config (Art. 16), C2PA content labels.
- **License**: Apache 2.0
- **Integration**: Can be offered as an SDK for Q-Grid Comply customers to embed compliance into their own AI systems. Also integrates into Q-Grid's own agent infrastructure.
- **Q-Grid Comply use**: Recommend to customers as implementation tooling after they receive their compliance assessment

### 9. suhas-km/EU-AI-Act-Flagged (HuggingFace Dataset)
- **URL**: https://huggingface.co/datasets/suhas-km/EU-AI-Act-Flagged
- **What it does**: 100K-1M annotated text samples for EU AI Act compliance detection. Labels include violation/non-violation, compliance domain, severity, and relevant article references.
- **License**: MIT
- **Integration**: Training data for fine-tuning the compliance classifier. Can enhance the suhas-km model or train a custom model for Q-Grid Comply.
- **Q-Grid Comply use**: Training data for the risk classification engine

### 10. Inkog - AI Agent Pre-Flight Scanner (MCP + CLI)
- **Website**: https://inkog.io
- **GitHub**: https://github.com/inkog-io/inkog-mcp
- **What it does**: Static analysis for AI agents. Finds logic flaws (infinite loops, prompt injection, missing guardrails) in LangChain, CrewAI, 15+ frameworks. Maps to Art. 14 (human oversight) and Art. 15 (robustness). Generates compliance reports mapped to NIST AI RMF, OWASP LLM Top 10.
- **Integration**: Available as MCP server for Claude/Cursor. Complementary to ark-forge scanner (Inkog = agent analysis, ark-forge = codebase scanning).
- **Q-Grid Comply use**: Agent-specific compliance scanning capability

---

## Tier 3 - Supplementary / Reference

### 11. Microsoft Agent Governance Toolkit
- **GitHub**: https://github.com/microsoft/agent-governance-toolkit
- **What it does**: Policy enforcement, zero-trust identity (Ed25519), execution sandboxing, reliability engineering. Covers 10/10 OWASP Agentic Top 10. 12+ framework integrations.
- **Q-Grid Comply use**: Reference architecture for governance features. Policy enforcement patterns.

### 12. Orcawise/eu_ai_act_using_finetuned_gemma (HuggingFace Model)
- **URL**: https://huggingface.co/Orcawise/eu_ai_act_using_finetuned_gemma
- **What it does**: Gemma-2B fine-tuned on 1,023 EU AI Act Q&A pairs. Expert-level Q&A about the Act.
- **Q-Grid Comply use**: Power an "Ask about the Act" chatbot feature within the platform

### 13. i-LUDUS/EU_AI_ACT_model (HuggingFace Model)
- **URL**: https://huggingface.co/i-LUDUS/EU_AI_ACT_model
- **What it does**: Llama-3.2-1B fine-tuned on EU AI Act content. GGUF format (edge-deployable).
- **Q-Grid Comply use**: Lightweight on-device compliance Q&A

### 14. nlpaueb/legal-bert-base-uncased (HuggingFace Model)
- **URL**: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- **What it does**: BERT pre-trained on 12GB legal text (legislation, cases, contracts). 110M params, 4x faster than standard BERT.
- **Q-Grid Comply use**: Base model for fine-tuning custom compliance classifiers. Better legal text understanding than generic BERT.

### 15. dam9/eu-ai-act-red-teaming-v1 (HuggingFace Dataset)
- **URL**: https://huggingface.co/datasets/dam9/eu-ai-act-red-teaming-v1
- **What it does**: 100 adversarial prompts with success criteria, regulatory context mapping to EU AI Act articles, and human validation data.
- **License**: Gated (manual approval)
- **Q-Grid Comply use**: Adversarial testing module for high-risk AI system assessments

### 16. ai-compliance-labs/eu-ai-act-hr-audit-whitepaper (HuggingFace Dataset)
- **URL**: https://huggingface.co/datasets/ai-compliance-labs/eu-ai-act-hr-audit-whitepaper
- **What it does**: Reproducible methodology for generating bias/robustness audit evidence for high-risk employment AI systems (Articles 10 & 15).
- **License**: CC-BY-4.0
- **Q-Grid Comply use**: Template for HR-specific compliance module. Ready-made audit methodology.

### 17. kenobijr/eu-ai-act-chromadb (HuggingFace Dataset)
- **URL**: https://huggingface.co/datasets/kenobijr/eu-ai-act-chromadb
- **What it does**: Pre-vectorized EU AI Act content in ChromaDB format. Ready for RAG.
- **Q-Grid Comply use**: Drop-in vector store for RAG-powered compliance Q&A

### 18. danielnoumon/eu-ai-act-nl-queries (HuggingFace Dataset)
- **URL**: https://huggingface.co/datasets/danielnoumon/eu-ai-act-nl-queries
- **What it does**: 2,284 Dutch query-chunk pairs from the EU AI Act. Designed for fine-tuning embedding models for semantic search.
- **Q-Grid Comply use**: Multilingual support (Dutch) for EU market. Template for creating similar datasets in other EU languages.

### 19. AdrianGonzalezSanchez/ModelTransparencySpec_EUAIAct (HuggingFace Dataset)
- **URL**: https://huggingface.co/datasets/AdrianGonzalezSanchez/ModelTransparencySpec_EUAIAct
- **What it does**: Model transparency specification aligned with EU AI Act requirements.
- **Q-Grid Comply use**: Reference for transparency reporting features

---

## HuggingFace Spaces (Interactive Tools)

| Space | URL | Use Case |
|-------|-----|----------|
| EU AI Act Compliance Checker | https://huggingface.co/spaces/Agents-MCP-Hackathon/EU-AI-Act-Compliance-Checker | Reference implementation for interactive risk assessment UI |
| EU AI Act Compliance Agent (legitima.ai) | https://huggingface.co/spaces/MCP-1st-Birthday/eu-ai-act-compliance-agent | MCP-powered compliance agent pattern |
| COMPL-AI Leaderboard | https://huggingface.co/spaces/latticeflow/compl-ai-board | Scoring methodology reference |
| Orcawise EU AI Act T5 | https://huggingface.co/spaces/Orcawise/eu_ai_act_t5 | Q&A demo pattern |

---

## MCP Servers

| Server | GitHub | Key Capabilities |
|--------|--------|-----------------|
| ark-forge/mcp-eu-ai-act | https://github.com/ark-forge/mcp-eu-ai-act | Codebase scanning, risk classification, doc generation, GDPR |
| desiorac/mcp-eu-ai-act | https://github.com/desiorac/mcp-eu-ai-act | Scan, categorize, verify AI systems. Actionable recommendations with effort estimates |
| SonnyLabs/EU_AI_ACT_MCP | https://github.com/SonnyLabs/EU_AI_ACT_MCP | Agent-connected EU AI Act compliance |
| ansvar-systems/eu_compliance_mcp | https://www.npmjs.com/package/@ansvar/eu-regulations-mcp | EU regulations MCP server (npm package) |
| inkog-io/inkog-mcp | https://github.com/inkog-io/inkog-mcp | Agent security scanner, OWASP/NIST mapping |
| air-blackbox-mcp | https://glama.ai/mcp/servers/airblackbox/air-blackbox-mcp | Python agent compliance scanner |

---

## Academic Papers

### EU AI Act Compliance

| Paper | ArXiv | Key Contribution |
|-------|-------|-----------------|
| COMPL-AI Framework | [2410.07959](https://arxiv.org/abs/2410.07959) | 18 technical requirements, 27 benchmarks, 0-1 scoring methodology |
| TechOps: Documentation Templates | [2508.08804](https://arxiv.org/abs/2508.08804) | First complete section-to-article mapping templates for AI Act |
| Assuring EU AI Act Compliance & Adversarial Robustness | [2410.05306](https://arxiv.org/abs/2410.05306) | Ontologies + assurance cases + factsheets framework |
| CORTEX: Risk Tiering & Exposure | [2508.19281](https://arxiv.org/abs/2508.19281) | 5-layer risk scoring from 1,200+ real incidents. Bayesian aggregation |
| DoXpert (Simplifying Compliance Docs) | [Springer](https://link.springer.com/article/10.1007/s10664-025-10645-x) | LLM paraphrase-only approach, 81-83% accuracy, DoX scoring |
| Taxonomy to Regulation | [2404.11476](https://arxiv.org/abs/2404.11476) | 12 AI risks across 4 categories, policy assessment of EU AI Act |
| High-Risk System Assessment Mapping | [2512.13907](https://arxiv.org/abs/2512.13907) | Legal requirements to concrete verification activities |

### Post-Quantum Cryptography / Compliance

| Paper | ArXiv | Key Contribution |
|-------|-------|-----------------|
| QUASAR Framework | [2505.17034](https://arxiv.org/abs/2505.17034) | Readiness matrices, implementation phases, performance metrics for PQC migration |
| QERS: Quantum Encryption Resilience Score | [2601.13399](https://arxiv.org/abs/2601.13399) | Multi-criteria scoring (Basic/Tuned/Fusion). Tested on Kyber, Dilithium, Falcon, SPHINCS+, NTRU |
| PQC Library Survey | [2508.16078](https://arxiv.org/abs/2508.16078) | Evaluates OpenSSL, libsodium, wolfSSL, BoringSSL, Bouncy Castle for PQC readiness |
| Enterprise Quantum Readiness | [2509.01731](https://arxiv.org/abs/2509.01731) | 68% of orgs struggle with PQC skills. Migration timeline 2025-2035 |
| PQC Comprehensive Survey | [2510.10436](https://arxiv.org/abs/2510.10436) | CRYSTALS-Kyber, Dilithium, SPHINCS+ standardization. HQC draft FIPS 2026 |
| Cloud Security vs Quantum | [2509.15653](https://arxiv.org/abs/2509.15653) | Risk, transition, mitigation strategies for cloud PQC |
| Securing Crypto in Quantum+AI Age | [2603.06969](https://arxiv.org/abs/2603.06969) | Strategic response framework combining quantum and AI threats |
| Hybrid PQC Strategies (IACR) | [ePrint 2025/2052](https://eprint.iacr.org/2025/2052.pdf) | Regulatory deadlines, sector-specific migration, hybrid approaches |

---

## Report Generation Patterns

### Pattern 1: DoXpert (Paraphrase-Only LLM)
- Feed source documentation + questionnaire responses to LLM
- LLM only paraphrases existing information (never generates new claims)
- Score each section: answered (bool) + DoX score + relevance score
- Result: Compliance report with quantified completeness

### Pattern 2: TechOps Templates + RAG
- Use TechOps templates as the report skeleton
- Each template section maps to a specific AI Act article
- RAG retrieves relevant context from EU AI Act text + assessment data
- LLM fills in template sections with retrieved context
- Track lifecycle status per section (drafted/reviewed/approved)

### Pattern 3: COMPL-AI Scoring + Dashboard
- 18 technical requirements across 6 principles
- Score each requirement 0.0 to 1.0
- Aggregate per principle and overall
- Generate radar chart showing compliance posture
- Highlight gaps with specific article references

### Recommended Approach for Q-Grid Comply:
Combine all three: Use COMPL-AI's taxonomy for scoring structure, TechOps templates for report skeleton, and DoXpert's paraphrase-only pattern for filling sections safely. This gives you quantified scores + structured reports + hallucination-resistant generation.

---

## PQC/Quantum Readiness Scoring

### QERS Integration (Recommended)
The QERS (Quantum Encryption Resilience Score) framework from [2601.13399] provides exactly the scoring methodology needed for the `pqc-engine` package:

**Three scoring modes:**
1. **Basic Score** - Quick comparisons: normalized weighted sum of performance metrics
2. **Tuned Score** - Environment-specific: adjustable weights for latency, CPU, energy, key size
3. **Fusion Score** - Composite: combines performance sub-score + security sub-score

**Metrics to integrate:**
- Key size evaluation (ML-KEM-768 vs classical)
- Signature verification speed (ML-DSA-65)
- CPU overhead percentage
- Memory footprint delta
- Hybrid mode compatibility score

### QUASAR Integration
The QUASAR framework provides organizational readiness assessment:
- Component-based readiness matrices (per-system scoring)
- Implementation phase tracking (assessment -> planning -> migration -> verification)
- Gap identification with quantified risk impact
- Alignment with NIST PQC migration guidance

### Recommended Q-Grid Comply PQC Scoring:
Use QERS for technical crypto scoring (algorithm-level) and QUASAR for organizational readiness scoring (process-level). The `packages/pqc-engine` should implement both.

---

## Integration Recommendations

### Phase 1: Quick Wins (Week 1-2)
1. **Load `suhas-km/eu-ai-act-policy-model`** into `packages/pqc-engine` or a new `packages/compliance-ai` package. Use ONNX Runtime for fast inference.
2. **Adopt TechOps templates** as the report skeleton in `apps/comply`. Map assessment questions to template sections.
3. **Add ark-forge MCP server** to the project's MCP config for codebase scanning.
4. **Import COMPL-AI scoring taxonomy** (18 requirements, 6 principles) into the assessment engine.

### Phase 2: Core Features (Week 3-4)
5. **Implement DoXpert pattern** in the report generator: paraphrase-only LLM, DoX scoring, relevance scoring.
6. **Train/fine-tune classifier** using `suhas-km/EU-AI-Act-Flagged` dataset (100K+ samples).
7. **Integrate QERS scoring** into `packages/pqc-engine` for quantum readiness assessment.
8. **Add eu-ai-act-chromadb** dataset as RAG vector store for compliance Q&A feature.

### Phase 3: Differentiation (Week 5-8)
9. **Implement CORTEX risk scoring** architecture (5-layer, Bayesian aggregation) for the compliance dashboard.
10. **Add AgentGuard SDK** integration for customers who need runtime compliance.
11. **Build red-teaming module** using `dam9/eu-ai-act-red-teaming-v1` adversarial prompts.
12. **Implement QUASAR organizational readiness** assessment for enterprise PQC migration.

### Phase 4: Market Leadership (Month 3+)
13. **Submit to COMPL-AI leaderboard** to benchmark Q-Grid Comply's own AI against the framework.
14. **Publish Q-Grid compliance dataset** on HuggingFace (following the pattern of airblackbox/eu-ai-act-compliance-benchmark).
15. **Multi-language support** using the Dutch dataset pattern for all EU languages.
16. **CI/CD integration** following ArkForge's GitHub Actions pattern.

---

## Competitive Landscape

| Competitor | Focus | Gap Q-Grid Can Fill |
|-----------|-------|-------------------|
| AIR Blackbox | Python agent scanning | No PQC scoring, no multi-jurisdictional |
| Inkog | Agent pre-flight | No report generation, no organizational assessment |
| AgentGuard | Runtime middleware | No assessment/audit, no documentation generation |
| LatticeFlow COMPL-AI | LLM benchmarking | No customer-facing assessment tool |
| DoXpert | Documentation | No scanning, no PQC, academic only |

**Q-Grid Comply's unique positioning**: Full-stack compliance (scanning + assessment + scoring + reporting + PQC readiness) with Hedera audit trail. No competitor combines all five.

---

## Key Deadlines

- **Feb 2, 2025**: Prohibited AI practices + AI literacy obligations (PASSED)
- **Aug 2, 2025**: GPAI model obligations (PASSED)
- **Aug 2, 2026**: HIGH-RISK AI system requirements (5 months away)
- **2035**: US federal PQC complete transition

The August 2, 2026 deadline is the critical commercial window. Fines: up to EUR 35M or 7% of global annual turnover.
