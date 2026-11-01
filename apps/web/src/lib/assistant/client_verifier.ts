export interface AnswerSentence {
  text: string;
  cites: string[];
}

export interface VerificationFailure {
  sentence: AnswerSentence;
  reason: string;
}

export interface VerificationResult {
  verified_sentences: AnswerSentence[];
  dropped_sentences: VerificationFailure[];
  total_sentences: number;
  verified_count: number;
  dropped_count: number;
  badge: string;
  abstain: boolean;
  message?: string;
}

// Regex to extract numbers (e.g. 21, 5.03, 100, 0.4)
const NUMBER_REGEX = /\b\d+(?:\.\d+)?\b/g;

// Regex to extract quoted spans (e.g. "..." or '...')
const QUOTED_REGEX = /["“]([^"”]{4,})["”]|['‘]([^'’]{4,})['‘]/g;

// Prompt injection / malicious output patterns
const INJECTION_PATTERNS = [
  /ignore (?:all )?previous instructions/i,
  /system prompt/i,
  /dan mode/i,
  /\bpwned\b/i,
  /override flammability rules/i,
  /bypass verification/i,
];

export function verifySentence(
  sentence: AnswerSentence,
  chunksMap: Map<string, string>,
  runsMap: Map<string, any>
): { valid: boolean; reason?: string } {
  const text = sentence.text.trim();
  if (!text) {
    return { valid: false, reason: 'Empty sentence' };
  }

  // 1. Citation check: must have >= 1 cite and all cited IDs must exist
  if (!sentence.cites || sentence.cites.length === 0) {
    return { valid: false, reason: 'Sentence lacks citations' };
  }

  for (const cite of sentence.cites) {
    if (!chunksMap.has(cite) && !runsMap.has(cite)) {
      return { valid: false, reason: `Cited source '${cite}' does not exist in corpus or runs archive` };
    }
  }

  // 2. Prompt injection defense check
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { valid: false, reason: 'Sentence contains untrusted prompt injection token' };
    }
  }

  // Aggregate cited reference content for this sentence
  let aggregateContent = '';
  for (const cite of sentence.cites) {
    if (chunksMap.has(cite)) {
      aggregateContent += ' ' + chunksMap.get(cite);
    }
    if (runsMap.has(cite)) {
      const run = runsMap.get(cite);
      aggregateContent += ' ' + JSON.stringify(run);
    }
  }
  const aggregateContentLower = aggregateContent.toLowerCase();

  // 3. Numbers check: every number in sentence must appear in cited source text
  const numbersInSentence = text.match(NUMBER_REGEX) || [];
  for (const num of numbersInSentence) {
    // Exclude citation brackets if any, e.g. [1] or single-digit sentence numbers
    if (num.length === 1 && (text.includes(`[${num}]`) || text.startsWith(`${num}.`))) {
      continue;
    }
    // Check if the number string exists in the aggregate cited content
    if (!aggregateContent.includes(num)) {
      // Also try floating point equivalents (e.g. 21 vs 21.0)
      const numFloat = parseFloat(num);
      const hasFloat = !isNaN(numFloat) && (
        aggregateContent.includes(numFloat.toFixed(1)) ||
        aggregateContent.includes(numFloat.toFixed(2)) ||
        aggregateContent.includes(String(Math.round(numFloat)))
      );
      if (!hasFloat) {
        return {
          valid: false,
          reason: `Number '${num}' in sentence does not appear in cited sources [${sentence.cites.join(', ')}]`,
        };
      }
    }
  }

  // 4. Quoted span check: every quoted span must be a verbatim substring
  const quotedMatches = Array.from(text.matchAll(QUOTED_REGEX));
  for (const match of quotedMatches) {
    const quote = (match[1] || match[2] || '').trim();
    if (quote.length >= 4 && !aggregateContentLower.includes(quote.toLowerCase())) {
      return {
        valid: false,
        reason: `Quoted span "${quote}" is not a verbatim substring of cited sources`,
      };
    }
  }

  return { valid: true };
}

export function verifyAnswer(
  modelResponse: {
    answer_sentences: AnswerSentence[];
    abstain: boolean;
  },
  chunks: Array<{ chunk_id: string; text: string }>,
  runs: Array<{ run_uid: string; [key: string]: any }> = []
): VerificationResult {
  const chunksMap = new Map<string, string>();
  for (const c of chunks) {
    chunksMap.set(c.chunk_id, c.text);
  }

  const runsMap = new Map<string, any>();
  for (const r of runs) {
    runsMap.set(r.run_uid, r);
  }

  if (modelResponse.abstain || !modelResponse.answer_sentences || modelResponse.answer_sentences.length === 0) {
    return {
      verified_sentences: [],
      dropped_sentences: [],
      total_sentences: 0,
      verified_count: 0,
      dropped_count: 0,
      badge: '0/0 sentences verified',
      abstain: true,
      message: 'Not enough evidence in the corpus to support a verified claim.',
    };
  }

  const verified: AnswerSentence[] = [];
  const dropped: VerificationFailure[] = [];

  for (const sent of modelResponse.answer_sentences) {
    const result = verifySentence(sent, chunksMap, runsMap);
    if (result.valid) {
      verified.push(sent);
    } else {
      dropped.push({ sentence: sent, reason: result.reason || 'Verification check failed' });
    }
  }

  const total = modelResponse.answer_sentences.length;
  const verifiedCount = verified.length;
  const droppedCount = dropped.length;
  const badge = `${verifiedCount}/${total} sentences verified`;

  if (verifiedCount === 0) {
    return {
      verified_sentences: [],
      dropped_sentences: dropped,
      total_sentences: total,
      verified_count: 0,
      dropped_count: droppedCount,
      badge,
      abstain: true,
      message: 'Not enough evidence in the corpus: all candidate claims failed numerical or verbatim provenance checks.',
    };
  }

  return {
    verified_sentences: verified,
    dropped_sentences: dropped,
    total_sentences: total,
    verified_count: verifiedCount,
    dropped_count: droppedCount,
    badge,
    abstain: false,
  };
}
