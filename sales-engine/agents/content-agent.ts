/**
 * Content Agent — Arcee Trinity Large
 * 
 * Specializes in:
 * - Personalized cold outreach emails
 * - LinkedIn thought leadership posts
 * - Product Hunt launch copy
 * - Blog content generation
 * 
 * Trained specifically for agent harnesses (OpenCode, Cline, Kilo)
 */

import type { Lead } from './orchestrator';

export interface OutreachEmail {
  subject: string;
  body: string;
  cta: string;
  personalizationScore: number;
}

export interface LinkedInPost {
  content: string;
  hashtags: string[];
  engagementPrediction: number;
}

export class ContentAgent {
  /**
   * Generate a personalized cold outreach email
   */
  async generateOutreachEmail(lead: Lead): Promise<OutreachEmail> {
    const templates = this.getTemplates();
    
    // Select template based on urgency
    const template = lead.urgency === 'critical' 
      ? templates.urgent 
      : lead.urgency === 'high' 
        ? templates.high 
        : templates.standard;
    
    // Personalize
    const subject = template.subject
      .replace('[COMPANY]', lead.company)
      .replace('[URGENCY]', this.getUrgencyPhrase(lead.urgency));
    
    const body = template.body
      .replace(/\[COMPANY\]/g, lead.company)
      .replace('[QRS_SCORE]', lead.qrsScore.toString())
      .replace('[VULNERABILITY]', lead.topVulnerability)
      .replace('[GEO]', this.getGeoName(lead.geo))
      .replace('[INDUSTRY]', lead.industry)
      .replace('[DEAL_VALUE]', `$${lead.estimatedDealValue.toLocaleString()}`);
    
    return {
      subject,
      body,
      cta: template.cta,
      personalizationScore: this.calculatePersonalizationScore(body),
    };
  }

  /**
   * Generate LinkedIn thought leadership post
   */
  async generateLinkedInPost(topic: 'eu-ai-act' | 'pqc' | 'deadline' | 'compliance'): Promise<LinkedInPost> {
    const posts = {
      'eu-ai-act': {
        content: "August 2026 is closer than you think.\n\nI've been talking to CISOs across Europe this week. The consensus?\n\nWe know about the EU AI Act. We just haven't started yet.\n\nHere's the problem: You can't comply with what you can't see.\n\nMost companies I speak with don't even have a complete inventory of their AI systems. Let alone a cryptographic bill of materials.\n\nThe companies that will win aren't the ones with the biggest compliance budgets.\n\nThey're the ones that started scanning NOW.\n\nThree things you can do this week:\n1. Audit your AI systems (even the shadow IT ones)\n2. Check your cryptographic posture (hint: RSA-2048 won't survive quantum)\n3. Build your migration timeline (hint: it's longer than you think)\n\nThe quantum threat isn't theoretical anymore. NIST has the standards. NSA has the deadlines. And August 2026 will come whether you're ready or not.\n\nWhat's your team doing about it?",
        hashtags: ['EUAIAct', 'PostQuantum', 'CyberSecurity', 'Compliance', 'AI'],
      },
      'pqc': {
        content: "The biggest lie in enterprise security right now:\n\nWe'll migrate to post-quantum crypto when the standards are finalized.\n\nThey're finalized. NIST FIPS 203 and 204 are done. ML-KEM and ML-DSA are here.\n\nBut here's what most CISOs don't realize: Migration takes 18-24 months minimum.\n\nIf you start in 2027, you'll finish in 2029.\n\nCNSA 2.0 says 2027. SWIFT says 2027. The EU AI Act says August 2026 for AI governance.\n\nDo the math.\n\nThe companies scanning their cryptography TODAY will be the ones still standing in 2028.\n\nThe ones waiting? They'll be the next breach headline.\n\nTime to stop waiting.",
        hashtags: ['PQC', 'Cryptography', 'CyberSecurity', 'NIST', 'QuantumComputing'],
      },
      'deadline': {
        content: "Countdown:\n\nAugust 2026 — EU AI Act enforcement\nJanuary 2027 — CNSA 2.0 deadline  \nJanuary 2027 — SWIFT PQC mandate\n\nWhat you need before any of these hit:\n\n1. Complete AI system inventory (Article 11)\n2. Cryptographic Bill of Materials (CBOM)\n3. Risk assessment for each system\n4. Migration plan with timeline\n5. Audit trail (blockchain-backed if you want credibility)\n\nMost companies are at step 0.\n\nWhere are you?",
        hashtags: ['EUAIAct', 'Compliance', 'Deadline', 'AI', 'Cryptography'],
      },
      'compliance': {
        content: "Hot take: Most compliance programs are theater.\n\nThey check boxes. They file reports. They pass audits.\n\nBut they don't actually reduce risk.\n\nReal compliance means:\n- Knowing exactly where your AI systems are\n- Understanding what cryptographic algorithms they use\n- Having a verifiable audit trail (not just PDFs)\n- Testing your migration plan BEFORE the deadline\n- Being able to prove it to regulators on demand\n\nThe difference between theater and real compliance?\n\nOne produces a PDF. The other produces evidence.\n\nWhich one would you trust if you were the regulator?",
        hashtags: ['Compliance', 'RiskManagement', 'AI', 'CyberSecurity', 'Governance'],
      },
    };
    
    const post = posts[topic];
    return {
      content: post.content,
      hashtags: post.hashtags,
      engagementPrediction: this.predictEngagement(post.content),
    };
  }

  /**
   * Generate Product Hunt launch copy
   */
  async generateProductHuntCopy(): Promise<{
    tagline: string;
    description: string;
    firstComment: string;
  }> {
    return {
      tagline: 'The first quantum-safe compliance platform. Built on Hedera. Powered by AI.',
      description: `Q-GRID Comply helps enterprises prepare for the post-quantum future.

🔍 FREE Quantum Readiness Scanner — Get your QRS score in 30 seconds
📊 AI-Powered Assessment — Map your AI systems against EU AI Act, CNSA 2.0, GDPR, HIPAA
🔐 Post-Quantum Cryptography — ML-DSA-65 signed reports, ML-KEM-768 key exchange
⛓️ Blockchain Audit Trail — Every assessment anchored to Hedera Consensus Service
🌍 Multi-Jurisdiction — EU, North America, India, UAE with geo-specific regulations
📋 CBOM Generator — Cryptographic Bill of Materials for your entire stack

Why Q-GRID?

Every other compliance tool audits your policies.
Q-GRID audits your cryptography.

We're the only platform that combines:
• AI system inventory
• Post-quantum cryptography assessment
• Blockchain-anchored audit trails
• Multi-framework compliance (EU AI Act + CNSA 2.0 + GDPR + HIPAA)

Built for the August 2026 EU AI Act deadline.

Try the free scanner → q-grid.net/scan`,
      firstComment: `Hey Product Hunt! 👋

We built Q-GRID Comply because we saw enterprise security teams struggling with two converging threats:

1. The EU AI Act deadline (August 2026)
2. The quantum computing threat to current cryptography

Neither is theoretical anymore. Both have hard deadlines.

What makes us different: We don't just audit your policies. We audit your actual cryptography — and sign every report with post-quantum algorithms so you can prove it to regulators.

The free scanner gives you a Quantum Readiness Score in 30 seconds. Try it and let me know what you think!

Happy to answer any questions about the tech stack (Hedera, ML-DSA-65, Next.js 16). 🚀`,
    };
  }

  // Private helpers

  private getTemplates() {
    return {
      urgent: {
        subject: "[COMPANY]: Your cryptography will not survive quantum - deadline is [URGENCY]",
        body: "Hi,\n\nI ran a quantum readiness scan on [COMPANY] infrastructure and the results are concerning.\n\nYour QRS score: [QRS_SCORE]/100\n\nTop finding: [VULNERABILITY]\n\nHere is why this matters: [GEO] companies in [INDUSTRY] are facing three converging deadlines:\n- EU AI Act enforcement (August 2026)\n- CNSA 2.0 migration (January 2027)\n- SWIFT PQC mandate (January 2027)\n\nAt [COMPANY] current cryptographic posture, a full migration will take 18-24 months.\n\nThe clock is ticking.\n\nI have prepared a detailed assessment that covers:\n1. Your complete cryptographic inventory\n2. Migration timeline and budget estimate\n3. Prioritized remediation steps\n\nWorth a 15-minute call this week?",
        cta: "Book a 15-minute call",
      },
      high: {
        subject: "[COMPANY] - [URGENCY] action needed for quantum migration",
        body: "Hi,\n\nQuick note about [COMPANY] quantum readiness.\n\nWe scanned your infrastructure and found: [VULNERABILITY]\n\nYour Quantum Readiness Score: [QRS_SCORE]/100\n\nFor context, most companies we scan score between 25-45. The deadline for action is [URGENCY].\n\nI put together a brief assessment with specific recommendations. Interested in seeing it?\n\n15 minutes is all I need to walk you through it.",
        cta: "See the assessment",
      },
      standard: {
        subject: "[COMPANY] quantum readiness - brief findings",
        body: "Hi,\n\nI ran a quick quantum readiness scan on [COMPANY] and wanted to share the findings.\n\nScore: [QRS_SCORE]/100\nKey finding: [VULNERABILITY]\n\nNothing critical yet, but the August 2026 deadline is approaching fast.\n\nWould you be open to a brief call to discuss your migration timeline?",
        cta: "Schedule a brief call",
      },
    };
  }

  private getUrgencyPhrase(urgency: string): string {
    const phrases: Record<string, string> = {
      critical: 'now',
      high: 'urgent',
      medium: 'important',
      low: 'approaching',
    };
    return phrases[urgency] || 'important';
  }

  private getGeoName(geo: string): string {
    const names: Record<string, string> = {
      'DE': 'Germany', 'FR': 'France', 'NL': 'Netherlands', 'SE': 'Sweden',
      'ES': 'Spain', 'IT': 'Italy', 'UK': 'United Kingdom', 'US': 'United States',
      'CA': 'Canada', 'DK': 'Denmark', 'BE': 'Belgium', 'AT': 'Austria',
    };
    return names[geo] || geo;
  }

  private calculatePersonalizationScore(text: string): number {
    let score = 50;
    if (text.includes('[COMPANY]')) score -= 10;
    if (text.includes('QRS')) score += 15;
    if (text.includes('VULNERABILITY')) score += 15;
    if (text.length > 500) score += 10;
    return Math.min(100, score);
  }

  private predictEngagement(content: string): number {
    let score = 50;
    if (content.includes('🔥') || content.includes('🚨')) score += 10;
    if (content.includes('Hot take') || content.includes('lie')) score += 15;
    if (content.includes('✅') || content.includes('1️⃣')) score += 10;
    if (content.length > 800) score += 5;
    return Math.min(100, score);
  }
}
