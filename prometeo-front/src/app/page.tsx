// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <Image src="/logo.png" alt="Prometeo" width={34} height={34} />
          </div>

          <nav className={styles.nav}>
            <a className={styles.navLink} href="#about">ABOUT</a>
            <a className={styles.navLink} href="#features">GALLERY</a>
            <a className={styles.navLink} href="#contact">CONTACTS</a>
          </nav>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {/* Left */}
          <div className={styles.left}>
            <p className={styles.kicker}>NUESTRA VISIÓN</p>

            <h1 className={styles.title}>
              PROMETEO <span className={styles.titleAccent}>FILES</span>
            </h1>

            <p className={styles.subtitle}>
              Simplifica · Organiza · Optimiza. Gestiona tus archivos en un solo lugar
              con una experiencia moderna, rápida y segura.
            </p>

            <div className={styles.ctaRow}>
              {/* Reutilizamos .button pero con look más pro */}
              <Link href="/login" className={`${styles.button} ${styles.buttonPrimary}`}>
                Iniciar sesión
              </Link>

              <a href="#about" className={styles.buttonGhost}>
                Ver más
              </a>
            </div>

            <div className={styles.progress}>
              <span className={styles.progressNum}>01</span>
              <span className={styles.progressLine} />
              <span className={styles.progressNumMuted}>03</span>
            </div>

            <footer className={styles.footer}>
              © 2025 Prometeo. Todos los derechos reservados pa Miguel y Jaider.
            </footer>
          </div>

          {/* Right */}
          <div className={styles.right}>
            <div className={styles.heroCircle} />
            <div className={styles.heroCircleSmall} />

            {/* logo prometeo inicio*/}
            <div className={styles.heroImageWrap}>
              <Image
                src="/logo.png"
                alt="Prometeo Hero"
                width={520}
                height={520}
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
