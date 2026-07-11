import styles from './TokensTable.module.css';
import type { Token } from '../domain/types';

interface TokensTableProps {
  tokens: Token[] | null;
  emptyMessage: string;
}

export function TokensTable({ tokens, emptyMessage }: TokensTableProps) {
  const rows = tokens?.filter((t) => t.type !== 'EOF') ?? [];

  if (rows.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Tipo</th>
            <th className={styles.th}>Valor</th>
            <th className={styles.th}>Línea</th>
            <th className={styles.th}>Col</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => (
            <tr key={i} className={styles.row}>
              <td className={styles.tdType}>{t.type}</td>
              <td className={styles.tdValue}>{t.value}</td>
              <td className={styles.tdMuted}>{t.line}</td>
              <td className={styles.tdMuted}>{t.column}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
