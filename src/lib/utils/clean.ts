export const clean = (text: string | null | undefined): string =>
  (text ?? '').replace(/\[cite:\s*[\d,\s]+\]/g, '').replace(/\s+/g, ' ').trim()
