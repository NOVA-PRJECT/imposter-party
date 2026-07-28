function sanitizeString(input, maxLength = 50) {
  if (typeof input !== 'string') return '';
  
  // Strip HTML tags and dangerous characters
  let sanitized = input
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[&<>"']/g, (match) => {
      const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return entities[match] || match;
    })
    .trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

module.exports = { sanitizeString };
