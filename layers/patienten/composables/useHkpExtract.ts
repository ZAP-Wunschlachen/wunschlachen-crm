/**
 * useHkpExtract — Patient-Number aus Email-Subject + Filename extrahieren.
 *
 * Regex-Reihenfolge:
 *   1. "P-XXXXX" oder "P XXXXX"
 *   2. "Patient XXXXX" (mit/ohne Doppelpunkt)
 *   3. erste Ziffernfolge >= 4 Stellen im Subject
 *   4. erste Ziffernfolge >= 4 Stellen im Filename
 */

// Patterns for recognising patient numbers.
// Note: \b does not fire around underscores (word chars), so we use
// a separator-aware variant for filenames: (?:^|[-_\s])(\d{4,})(?:[-_\s.]|$)
const SUBJECT_PATTERNS = [
  /\bP[-_\s]?(\d{4,})\b/i,
  /\bPatient[-_\s:]+(\d{3,})\b/i,
  /\b(\d{4,})\b/,
]

const FILENAME_PATTERNS = [
  /\bP[-_\s]?(\d{4,})(?:[-_\s.]|$)/i,
  /\bPatient[-_\s:]+(\d{3,})(?:[-_\s.]|$)/i,
  /(?:^|[-_\s.])(\d{4,})(?:[-_\s.]|$)/,
]

const tryPatterns = (source: string, patterns: RegExp[]): string | null => {
  for (const re of patterns) {
    const m = source.match(re)
    if (m && m[1]) return m[1]
  }
  return null
}

export const useHkpExtract = () => {
  const extractPatientNumber = (subject: string, filename: string): string | null => {
    return tryPatterns(subject || '', SUBJECT_PATTERNS) || tryPatterns(filename || '', FILENAME_PATTERNS) || null
  }

  const extractEmailFromSender = (sender: string): string | null => {
    if (!sender) return null
    const angle = sender.match(/<([^>]+)>/)
    if (angle && angle[1].includes('@')) return angle[1].trim().toLowerCase()
    if (sender.includes('@')) return sender.trim().toLowerCase()
    return null
  }

  return { extractPatientNumber, extractEmailFromSender }
}
