import styles from "./auth-layout.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
