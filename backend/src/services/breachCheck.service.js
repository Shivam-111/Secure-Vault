const crypto = require('crypto');

/**
 * Check if a single password has appeared in data breaches via HaveIBeenPwned (k-Anonymity SHA-1 API)
 * Zero-Knowledge: Only the first 5 hex characters of the SHA-1 hash are sent out.
 * @param {string} password
 * @returns {Promise<{ isBreached: boolean, breachCount: number }>}
 */
const checkPasswordBreach = async (password) => {
  if (!password) return { isBreached: false, breachCount: 0 };

  try {
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // Dynamic import of node-fetch or native fetch (Node 18+)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'SecureVault-Breach-Check' }
    });

    if (!response.ok) {
      return { isBreached: false, breachCount: 0 };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix === suffix) {
        const count = parseInt(countStr, 10) || 0;
        return { isBreached: true, breachCount: count };
      }
    }

    return { isBreached: false, breachCount: 0 };
  } catch (err) {
    console.warn('[HIBP API Warning]', err.message);
    return { isBreached: false, breachCount: 0 };
  }
};

/**
 * Calculate password strength score (0 to 100) and identify weak properties
 */
const evaluatePasswordStrength = (password) => {
  if (!password) return { score: 0, isWeak: true, reasons: ['Empty password'] };

  let score = 0;
  const reasons = [];

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 12;
  if (/[^a-zA-Z0-9]/.test(password)) score += 13;

  if (password.length < 10) reasons.push('Length less than 10 characters');
  if (!/[A-Z]/.test(password)) reasons.push('Missing uppercase letters');
  if (!/[0-9]/.test(password)) reasons.push('Missing numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) reasons.push('Missing special symbols');

  return {
    score: Math.min(100, score),
    isWeak: score < 60,
    reasons
  };
};

/**
 * Perform comprehensive Vault Radar analysis across user entries
 */
const analyzeVaultSecurity = async (decryptedItems = []) => {
  if (!decryptedItems.length) {
    return {
      overallScore: 100,
      totalCount: 0,
      weakCount: 0,
      reusedCount: 0,
      breachedCount: 0,
      breachedItems: [],
      reusedGroups: [],
      weakItems: []
    };
  }

  const passwordMap = new Map(); // password -> array of item IDs
  const weakItems = [];
  const breachedItems = [];

  // 1. Identify duplicates and strength
  for (const item of decryptedItems) {
    const pwd = item.password || '';
    if (!passwordMap.has(pwd)) {
      passwordMap.set(pwd, []);
    }
    passwordMap.get(pwd).push({ id: item._id || item.id, title: item.title, siteUrl: item.siteUrl });

    const strength = evaluatePasswordStrength(pwd);
    if (strength.isWeak) {
      weakItems.push({
        id: item._id || item.id,
        title: item.title,
        reasons: strength.reasons
      });
    }
  }

  // 2. Identify reused groups
  const reusedGroups = [];
  let totalReusedEntriesCount = 0;
  for (const [pwd, items] of passwordMap.entries()) {
    if (items.length > 1 && pwd) {
      reusedGroups.push({
        count: items.length,
        items
      });
      totalReusedEntriesCount += items.length;
    }
  }

  // 3. Batch check unique passwords for breaches via HIBP API (limit to unique ones for speed)
  const uniquePasswords = Array.from(passwordMap.keys()).filter(Boolean);
  const breachCheckPromises = uniquePasswords.map(async (pwd) => {
    const result = await checkPasswordBreach(pwd);
    return { pwd, ...result };
  });

  const breachResults = await Promise.all(breachCheckPromises);
  const breachedPasswordSet = new Set(
    breachResults.filter((r) => r.isBreached).map((r) => r.pwd)
  );

  for (const item of decryptedItems) {
    if (breachedPasswordSet.has(item.password)) {
      const match = breachResults.find((r) => r.pwd === item.password);
      breachedItems.push({
        id: item._id || item.id,
        title: item.title,
        siteUrl: item.siteUrl,
        breachCount: match ? match.breachCount : 1
      });
    }
  }

  // 4. Calculate weighted overall score (0 to 100)
  const total = decryptedItems.length;
  const weakPenalty = (weakItems.length / total) * 35;
  const reusedPenalty = (totalReusedEntriesCount / total) * 35;
  const breachPenalty = (breachedItems.length / total) * 40;

  const rawScore = 100 - (weakPenalty + reusedPenalty + breachPenalty);
  const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    overallScore,
    totalCount: total,
    weakCount: weakItems.length,
    reusedCount: totalReusedEntriesCount,
    breachedCount: breachedItems.length,
    breachedItems,
    reusedGroups,
    weakItems
  };
};

module.exports = {
  checkPasswordBreach,
  evaluatePasswordStrength,
  analyzeVaultSecurity
};
