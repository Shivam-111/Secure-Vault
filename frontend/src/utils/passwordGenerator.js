/**
 * Generate a cryptographically secure random password using window.crypto.getRandomValues()
 * @param {Object} options
 * @param {number} options.length - Length of password (default 16, range 8-32)
 * @param {boolean} options.includeUppercase - Include uppercase letters (A-Z)
 * @param {boolean} options.includeLowercase - Include lowercase letters (a-z)
 * @param {boolean} options.includeNumbers - Include numeric digits (0-9)
 * @param {boolean} options.includeSymbols - Include special symbols (!@#$%^&*...)
 * @returns {string} Generated password
 */
export const generateSecurePassword = ({
  length = 16,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true
} = {}) => {
  const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBER_CHARS = '0123456789';
  const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let availableChars = '';
  const requiredChars = [];

  if (includeUppercase) {
    availableChars += UPPERCASE_CHARS;
    requiredChars.push(UPPERCASE_CHARS[getRandomInt(UPPERCASE_CHARS.length)]);
  }
  if (includeLowercase) {
    availableChars += LOWERCASE_CHARS;
    requiredChars.push(LOWERCASE_CHARS[getRandomInt(LOWERCASE_CHARS.length)]);
  }
  if (includeNumbers) {
    availableChars += NUMBER_CHARS;
    requiredChars.push(NUMBER_CHARS[getRandomInt(NUMBER_CHARS.length)]);
  }
  if (includeSymbols) {
    availableChars += SYMBOL_CHARS;
    requiredChars.push(SYMBOL_CHARS[getRandomInt(SYMBOL_CHARS.length)]);
  }

  // Fallback if no sets selected
  if (!availableChars) {
    availableChars = LOWERCASE_CHARS + NUMBER_CHARS;
  }

  const passwordChars = [...requiredChars];
  const targetLength = Math.max(8, Math.min(32, length));

  while (passwordChars.length < targetLength) {
    passwordChars.push(availableChars[getRandomInt(availableChars.length)]);
  }

  // Shuffle array using Fisher-Yates shuffle with cryptographic random values
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
};

/**
 * Cryptographically secure random integer generator in range [0, max)
 * @param {number} max
 * @returns {number}
 */
const getRandomInt = (max) => {
  if (max <= 0) return 0;
  const randomArray = new Uint32Array(1);
  window.crypto.getRandomValues(randomArray);
  return randomArray[0] % max;
};
