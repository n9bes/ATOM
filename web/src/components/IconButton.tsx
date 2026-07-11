import type { ButtonHTMLAttributes } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function IconButton({ active, className, ...rest }: IconButtonProps) {
  const classes = [styles.iconButton, active ? styles.active : '', className].filter(Boolean).join(' ');
  return <button type="button" className={classes} {...rest} />;
}
