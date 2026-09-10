import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Cpu, Hash, Fingerprint, Terminal, Binary } from 'lucide-react';

const SECURITY_TAGS = [
  'AES-256-GCM',
  'SHA-256',
  '2FA VERIFIED',
  'ZERO KNOWLEDGE',
  'E2EE ENCRYPTED',
  'RSA-4096',
  'SSL/TLS 1.3',
  'ARGON2ID',
  'VAULT SECURE'
];

const ICONS = [Shield, Lock, Key, Cpu, Hash, Fingerprint, Terminal, Binary];

const SecurityBackground = () => {
  // Generate a deterministic or static-random set of floating security particles
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 18; i++) {
      const IconComponent = ICONS[i % ICONS.length];
      items.push({
        id: i,
        Icon: IconComponent,
        x: Math.floor((i * 17 + 5) % 95),
        size: Math.floor(14 + (i % 4) * 6),
        duration: Math.floor(18 + (i % 5) * 6),
        delay: Math.floor((i % 7) * 2.5),
        opacity: 0.12 + (i % 3) * 0.08
      });
    }
    return items;
  }, []);

  const floatingTags = useMemo(() => {
    return SECURITY_TAGS.map((tag, idx) => ({
      id: idx,
      text: tag,
      left: Math.floor((idx * 23 + 8) % 90),
      duration: 22 + (idx % 4) * 5,
      delay: idx * 3.2,
      opacity: 0.14 + (idx % 2) * 0.06
    }));
  }, []);

  return (
    <div className="security-bg-wrapper" aria-hidden="true">
      {/* Moving Ambient Glowing Security Orbs */}
      <div className="security-orb orb-1" />
      <div className="security-orb orb-2" />
      <div className="security-orb orb-3" />

      {/* Cyber Grid & Circuit Lines Overlay */}
      <div className="cyber-grid-overlay" />

      {/* Security Nodes & Connecting Circuit Lines */}
      <svg className="cyber-circuit-svg" width="100%" height="100%">
        <defs>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9a227" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Diagonal Cyber Security Mesh Lines */}
        <line x1="10%" y1="0%" x2="40%" y2="100%" stroke="url(#circuitGrad)" strokeWidth="1" strokeDasharray="6 8" />
        <line x1="60%" y1="0%" x2="90%" y2="100%" stroke="url(#circuitGrad)" strokeWidth="1" strokeDasharray="8 10" />
        <line x1="0%" y1="30%" x2="100%" y2="70%" stroke="url(#circuitGrad)" strokeWidth="1" strokeDasharray="5 12" />

        {/* Pulsing Nodes */}
        <circle cx="25%" cy="35%" r="3" fill="#c9a227" className="node-pulse" />
        <circle cx="75%" cy="65%" r="3.5" fill="#10b981" className="node-pulse delay-1" />
        <circle cx="50%" cy="80%" r="3" fill="#3b82f6" className="node-pulse delay-2" />
        <circle cx="85%" cy="20%" r="2.5" fill="#c9a227" className="node-pulse delay-3" />
      </svg>

      {/* Floating Security Icon Particles */}
      {particles.map(({ id, Icon, x, size, duration, delay, opacity }) => (
        <motion.div
          key={`particle-${id}`}
          className="floating-security-icon"
          style={{
            left: `${x}%`,
            opacity
          }}
          initial={{ y: '105vh', rotate: 0 }}
          animate={{
            y: '-10vh',
            rotate: 360,
            x: [0, (id % 2 === 0 ? 25 : -25), 0]
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay,
            ease: 'linear'
          }}
        >
          <Icon size={size} color="#c9a227" />
        </motion.div>
      ))}

      {/* Floating Encrypted Security Code Tags */}
      {floatingTags.map(({ id, text, left, duration, delay, opacity }) => (
        <motion.div
          key={`tag-${id}`}
          className="floating-security-tag"
          style={{
            left: `${left}%`,
            opacity
          }}
          initial={{ y: '105vh' }}
          animate={{
            y: '-10vh',
            opacity: [0, opacity, opacity, 0]
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay,
            ease: 'easeInOut'
          }}
        >
          {text}
        </motion.div>
      ))}
    </div>
  );
};

export default SecurityBackground;
