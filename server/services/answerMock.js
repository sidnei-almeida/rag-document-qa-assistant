const GENERIC_CITATIONS = ['Page 2', 'Page 6', 'Executive Summary', 'Financial Overview'];

function buildAnswer(answer, citations = GENERIC_CITATIONS) {
  return { answer, sources: citations };
}

export function generateMockAnswer(question) {
  const q = question.toLowerCase();

  if (q.includes('summary') || q.includes('summarize')) {
    return buildAnswer(
      'Certainly! Here is a summary of the active document. The report highlights strong financial performance, driven by revenue growth, operational efficiency, and strategic investments. It also outlines key market trends, business segment results, sustainability initiatives, and outlook for the coming year.',
      ['Executive Summary', 'Page 2', 'Page 4', '+1 more'],
    );
  }

  if (q.includes('risk')) {
    return buildAnswer(
      `Here are the key risks identified in the document:

• Market volatility and competitive pressure in core segments.
• Regulatory changes affecting international operations.
• Supply chain disruptions and input cost inflation.
• Cybersecurity and data privacy exposure.
• Talent retention in high-growth regions.`,
      ['Page 18', 'Page 19', 'Risk Factors', 'Page 21'],
    );
  }

  if (q.includes('recommendation')) {
    return buildAnswer(
      `Based on the document, the main recommendations include:

• Continue investing in R&D and AI-driven product capabilities.
• Expand presence in high-growth international markets.
• Accelerate sustainability initiatives to meet 2030 targets.
• Strengthen operational resilience through supply chain diversification.
• Maintain disciplined capital allocation with focus on shareholder returns.`,
      ['Page 22', 'Page 24', 'Recommendations', 'Page 26'],
    );
  }

  if (q.includes('finding') || q.includes('main')) {
    return buildAnswer(
      `Here are the main findings from the document:

• Revenue increased 18% YoY, driven by core product growth.
• Operating margin improved due to cost optimization initiatives.
• Strong performance in international markets.
• Sustainability goals remain on track.
• Continued growth expected with investments in R&D and AI.`,
      ['Page 6', 'Page 7', 'Page 10', 'Page 14'],
    );
  }

  if (q.includes('attention') || q.includes('executive')) {
    return buildAnswer(
      'The document emphasizes monitoring margin trends, international expansion pace, and sustainability milestones. Executive leadership highlights AI investment as a strategic priority for the next fiscal cycle.',
      ['Page 3', 'Executive Summary', 'Page 8', 'Page 12'],
    );
  }

  return buildAnswer(
    'I found relevant passages in the active document. Based on the retrieved context, the document suggests that the main point relates to sustained growth, operational efficiency, and strategic investments aligned with long-term market opportunities.',
    GENERIC_CITATIONS,
  );
}
