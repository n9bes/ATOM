import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Tone = 'neutral' | 'accent' | 'danger' | 'warning';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
