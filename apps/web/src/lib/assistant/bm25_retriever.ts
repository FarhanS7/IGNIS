export interface CorpusChunk {
  chunk_id: string;
  doc_id: string;
  title: string;
  year: string;
  page: number;
  text: string;
  source_url: string;
}

export interface RetrievedChunk extends CorpusChunk {
  score: number;
  matching_terms: string[];
  highlighted_snippets: string[];
}

export interface StructuredScenarioMatch {
  material?: string;
  oxygen_pct?: number;
  flow_cm_s?: number;
  pressure_kpa?: number;
  gravity_g?: number;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

// Domain-specific synonym mappings
const DOMAIN_SYNONYMS: Record<string, string[]> = {
  o2: ['oxygen', 'concentration', 'oxidizer', 'vol%'],
  oxygen: ['o2', 'concentration', 'oxidizer', 'vol%'],
  flow: ['velocity', 'airflow', 'forced', 'convection', 'air display'],
  velocity: ['flow', 'speed', 'forced', 'convection'],
  pmma: ['acrylic', 'plexiglas', 'rod', 'slab', 'polymethylmethacrylate'],
  acrylic: ['pmma', 'plexiglas'],
  sibal: ['cotton', 'fiberglass', 'fabric'],
  cotton: ['sibal', 'fabric'],
  extinction: ['extinguished', 'quenched', 'quench', 'blowoff', 'limit'],
  extinguish: ['extinction', 'quenched', 'blowoff'],
  quench: ['extinction', 'extinguished', 'blowoff'],
  ignition: ['ignited', 'piloted', 'igniter', 'delay'],
  pressure: ['hypobaric', 'kpa', 'psia', 'decompression'],
  sensor: ['mca', 'calibration', 'drift', 'recalibration', 'offset'],
  drift: ['sensor', 'calibration', 'recalibration', 'offset', 'mca'],
  bass: ['bass-ii', 'glovebox', 'msg'],
  saffire: ['cygnus', 'large-scale'],
  moon: ['lunar', 'gravity', '0.16'],
  lunar: ['moon', 'gravity', '0.16'],
  mars: ['martian', 'gravity', '0.38']
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[^a-z0-9%]+|[^a-z0-9%]+$/g, ''))
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export class BM25Retriever {
  private chunks: CorpusChunk[] = [];
  private docTokens: string[][] = [];
  private docLengths: number[] = [];
  private avgDocLength = 0;
  private df: Map<string, number> = new Map();
  private N = 0;
  private k1 = 1.5;
  private b = 0.75;

  constructor(chunks: CorpusChunk[]) {
    this.chunks = chunks;
    this.N = chunks.length;
    this.indexDocs();
  }

  private indexDocs() {
    let totalLen = 0;
    this.docTokens = [];
    this.docLengths = [];
    this.df.clear();

    for (let i = 0; i < this.chunks.length; i++) {
      const tokens = tokenize(this.chunks[i].text);
      this.docTokens.push(tokens);
      this.docLengths.push(tokens.length);
      totalLen += tokens.length;

      const seen = new Set<string>(tokens);
      for (const t of seen) {
        this.df.set(t, (this.df.get(t) || 0) + 1);
      }
    }

    this.avgDocLength = this.N > 0 ? totalLen / this.N : 1;
  }

  public expandQuery(queryTokens: string[]): string[] {
    const expanded = new Set<string>(queryTokens);
    for (const t of queryTokens) {
      const syns = DOMAIN_SYNONYMS[t];
      if (syns) {
        for (const s of syns) {
          expanded.add(s);
        }
      }
    }
    return Array.from(expanded);
  }

  public search(query: string, topK = 5): RetrievedChunk[] {
    const rawTokens = tokenize(query);
    if (rawTokens.length === 0) return [];

    const queryTokens = this.expandQuery(rawTokens);
    const scores: { index: number; score: number; matchedTerms: string[] }[] = [];

    for (let i = 0; i < this.N; i++) {
      const tokens = this.docTokens[i];
      const docLen = this.docLengths[i];
      if (docLen === 0) continue;

      // Count term frequencies
      const tfMap = new Map<string, number>();
      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      let score = 0;
      const matched: string[] = [];

      for (const q of queryTokens) {
        const tf = tfMap.get(q) || 0;
        if (tf > 0) {
          const df = this.df.get(q) || 1;
          const idf = Math.log(1 + (this.N - df + 0.5) / (df + 0.5));
          const num = tf * (this.k1 + 1);
          const denom = tf + this.k1 * (1 - this.b + (this.b * docLen) / this.avgDocLength);
          score += idf * (num / denom);
          matched.push(q);
        }
      }

      if (score > 0) {
        scores.push({ index: i, score, matchedTerms: Array.from(new Set(matched)) });
      }
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK).map(({ index, score, matchedTerms }) => {
      const chunk = this.chunks[index];
      const snippets = this.extractSnippets(chunk.text, matchedTerms);
      return {
        ...chunk,
        score: Math.round(score * 100) / 100,
        matching_terms: matchedTerms,
        highlighted_snippets: snippets,
      };
    });
  }

  private extractSnippets(text: string, terms: string[]): string[] {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const matches: string[] = [];
    for (const s of sentences) {
      const lower = s.toLowerCase();
      if (terms.some((t) => lower.includes(t))) {
        matches.push(s.trim());
        if (matches.length >= 3) break;
      }
    }
    return matches.length > 0 ? matches : [text.slice(0, 200) + '...'];
  }
}

/**
 * Extracts structured scenario parameters from free-text user questions
 * for the Extractive Mode matcher tool.
 */
export function extractScenarioFromQuestion(text: string): StructuredScenarioMatch | null {
  const lower = text.toLowerCase();
  let material: string | undefined;
  if (lower.includes('pmma') || lower.includes('acrylic') || lower.includes('plexiglas')) {
    material = 'PMMA';
  } else if (lower.includes('nomex')) {
    material = 'Nomex';
  } else if (lower.includes('sibal') || lower.includes('cotton')) {
    material = 'SIBAL';
  } else if (lower.includes('silicone')) {
    material = 'Silicone';
  } else if (lower.includes('wax') || lower.includes('candle')) {
    material = 'Wax';
  }

  // Parse O2: e.g. "21%", "21 %", "34 percent", "15% O2"
  let oxygen_pct: number | undefined;
  const o2Match = lower.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)(?:\s*(?:o2|oxygen))?/);
  if (o2Match) {
    oxygen_pct = parseFloat(o2Match[1]);
  }

  // Parse Flow: e.g. "5 cm/s", "10 cm / s", "20cm/s"
  let flow_cm_s: number | undefined;
  const flowMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:cm\/s|cm\s*\/\s*s|cms)/);
  if (flowMatch) {
    flow_cm_s = parseFloat(flowMatch[1]);
  }

  // Parse Pressure: e.g. "56 kPa", "101.3 kpa", "70 kPa"
  let pressure_kpa: number | undefined;
  const pMatch = lower.match(/(\d+(?:\.\d+)?)\s*kpa/);
  if (pMatch) {
    pressure_kpa = parseFloat(pMatch[1]);
  }

  // Parse Gravity: e.g. "0 g", "0.16 g", "0.38 g", "lunar", "mars", "moon"
  let gravity_g: number | undefined;
  if (lower.includes('lunar') || lower.includes('moon')) {
    gravity_g = 0.16;
  } else if (lower.includes('mars')) {
    gravity_g = 0.38;
  } else if (lower.includes('microgravity') || lower.includes('zero g') || lower.includes('0 g')) {
    gravity_g = 0.0;
  } else {
    const gMatch = lower.match(/(\d+(?:\.\d+)?)\s*g\b/);
    if (gMatch) {
      gravity_g = parseFloat(gMatch[1]);
    }
  }

  if (
    material ||
    oxygen_pct !== undefined ||
    flow_cm_s !== undefined ||
    pressure_kpa !== undefined ||
    gravity_g !== undefined
  ) {
    return {
      material: material || 'PMMA',
      oxygen_pct: oxygen_pct ?? (gravity_g === 0.16 ? 34.0 : gravity_g === 0.38 ? 28.0 : 21.0),
      flow_cm_s: flow_cm_s ?? (gravity_g !== 0.0 ? 10.0 : 5.0),
      pressure_kpa: pressure_kpa ?? (gravity_g === 0.16 ? 56.0 : gravity_g === 0.38 ? 70.3 : 101.3),
      gravity_g: gravity_g ?? 0.0,
    };
  }

  return null;
}
