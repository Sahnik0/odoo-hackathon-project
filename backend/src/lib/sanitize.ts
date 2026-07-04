// Escape HTML-significant characters in stored free-text (leave reason/remarks,
// address, etc.) to defuse stored-XSS (Section 6). Applied on write, in addition
// to Zod validation.

const MAP: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (s: string): string => s.replace(/[<>&"']/g, (c) => MAP[c]);

export const sanitizeText = (s: string): string => escapeHtml(s.trim());
