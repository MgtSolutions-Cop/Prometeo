// src/app/dashboard/Header.tsx
"use client";

import styles from "./header.module.css";

export default function Header({ userName = "Usuario" }: { userName?: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.iconWrap}>
          <img src="/logo.png" alt="Prometeo" className={styles.logo} />
        </div>
        <div className={styles.titles}>
          <h2 className={styles.title}>
            Bienvenido, <span className={styles.username}>{userName}</span>
          </h2>
          <p className={styles.subtitle}>Panel de control — administra tus archivos</p>
        </div>
      </div>

      <div className={styles.right}>
        <input type="search" placeholder="Buscar..." className={styles.search} />
        <button className={styles.iconButton} aria-label="Notificaciones">
          🔔
          <span className={styles.badge}>3</span>
        </button>
        <img src="/avatar.png" alt={userName} className={styles.avatar} />
      </div>
    </header>
  );
}
