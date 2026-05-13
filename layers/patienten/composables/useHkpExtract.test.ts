import { describe, it, expect } from 'vitest'
import { useHkpExtract } from './useHkpExtract'

describe('extractPatientNumber', () => {
  const { extractPatientNumber } = useHkpExtract()

  it('aus Subject "P-12345"', () => {
    expect(extractPatientNumber('HKP unterschrieben P-12345', '')).toBe('12345')
  })
  it('aus Subject "Patient 4567"', () => {
    expect(extractPatientNumber('HKP für Patient 4567 zurück', '')).toBe('4567')
  })
  it('aus Filename "HKP_27525_Mueller.pdf"', () => {
    expect(extractPatientNumber('', 'HKP_27525_Mueller.pdf')).toBe('27525')
  })
  it('aus Filename "27525-hkp-signed.pdf"', () => {
    expect(extractPatientNumber('', '27525-hkp-signed.pdf')).toBe('27525')
  })
  it('returns null wenn nichts matched', () => {
    expect(extractPatientNumber('Anhang', 'document.pdf')).toBeNull()
  })
  it('Subject hat Vorrang vor Filename bei Konflikt', () => {
    expect(extractPatientNumber('Patient 111', 'HKP_222.pdf')).toBe('111')
  })
  it('mindestens 4 Ziffern (verhindert false-positives)', () => {
    expect(extractPatientNumber('HKP 12', '')).toBeNull()
    expect(extractPatientNumber('', 'doc_99.pdf')).toBeNull()
  })
})

describe('extractEmailFromSender', () => {
  const { extractEmailFromSender } = useHkpExtract()
  it('"Name <mail>" → mail', () => {
    expect(extractEmailFromSender('Praxis Dr. Müller <praxis@example.de>')).toBe('praxis@example.de')
  })
  it('Plain Email', () => {
    expect(extractEmailFromSender('praxis@example.de')).toBe('praxis@example.de')
  })
  it('null für invalid', () => {
    expect(extractEmailFromSender('')).toBeNull()
    expect(extractEmailFromSender('kein-email')).toBeNull()
  })
})
