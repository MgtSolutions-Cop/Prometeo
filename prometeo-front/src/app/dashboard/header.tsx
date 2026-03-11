// src/app/dashboard/header.tsx
"use client";
import styles from "./header.module.css";

interface HeaderProps {
  userName?: string;
  onMenuClick?: () => void;
}

export default function Header({ userName = "Usuario", onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Abrir menú">
          <img src="/logo.png" alt="Prometeo" className={styles.logo} />
          <span className={styles.logoText}>
            PROM<span className={styles.logoAccent}>ETEO</span>
          </span>
        </button>

        <div className={styles.divider} />

        <div className={styles.titles}>
          <h2 className={styles.title}>
            Bienvenido, <span className={styles.username}>{userName}</span>
          </h2>
          <p className={styles.subtitle}>Panel de control — administra tus archivos</p>
        </div>
      </div>

      <div className={styles.right}>
        <input type="search" placeholder="Buscar..." className={styles.search} />

        {/* Campana SVG — sin emoji */}
        <button className={styles.iconButton} aria-label="Notificaciones">
          <svg
            width="17" height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={styles.badge}>3</span>
        </button>

        <img src="/avatar.png" alt={userName} className={styles.avatar} />
      </div>
    </header>
  );
}