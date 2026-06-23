"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import styles from "./landing.module.css";

const features = [
  {
    id: 1,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    label: "Gestión Documental",
    title: "Todos tus documentos, un solo lugar",
    desc: "Sube, organiza y accede a cualquier archivo desde cualquier dispositivo. Prometeo centraliza tu gestión documental con búsqueda instantánea y estructura por dependencias.",
    detail: ["Carga masiva de archivos", "Búsqueda instantánea full-text", "Organización por dependencias", "Historial de versiones"],
    accent: "#E53935",
    bg: "linear-gradient(135deg, rgba(139,0,0,0.75) 0%, rgba(60,0,0,0.97) 100%)",
  },
  {
    id: 2,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    label: "Métricas en Tiempo Real",
    title: "Visibilidad total del sistema",
    desc: "Monitorea documentos procesados, usuarios activos y actividades pendientes con dashboards en tiempo real. Toma decisiones con datos actualizados al instante.",
    detail: ["Dashboard interactivo", "KPIs en tiempo real", "Reportes exportables", "Alertas automáticas"],
    accent: "#c62828",
    bg: "linear-gradient(135deg, rgba(100,0,0,0.75) 0%, rgba(40,10,10,0.97) 100%)",
  },
  {
    id: 3,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: "Control de Usuarios",
    title: "Roles y permisos precisos",
    desc: "Asigna roles de Administrador, Gestor o Lector. Cada usuario accede únicamente a lo que necesita. Auditoría completa de acciones dentro del sistema.",
    detail: ["Roles personalizables", "Auditoría completa", "Acceso por dependencia", "Gestión de sesiones"],
    accent: "#b71c1c",
    bg: "linear-gradient(135deg, rgba(120,10,10,0.75) 0%, rgba(30,0,0,0.97) 100%)",
  },
  {
    id: 4,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    label: "Radicación Rápida",
    title: "Radica en segundos, no en horas",
    desc: "Formulario inteligente de radicación con asignación automática a dependencias. Notificaciones en tiempo real y seguimiento completo del estado de cada documento.",
    detail: ["Formulario inteligente", "Asignación automática", "Seguimiento en vivo", "Notificaciones push"],
    accent: "#e53935",
    bg: "linear-gradient(135deg, rgba(90,0,0,0.8) 0%, rgba(20,5,5,0.97) 100%)",
  },
];

type Particle = { id: number; x: number; y: number; size: number; dur: number; delay: number };

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive]       = useState(1);
  const [typed, setTyped]         = useState("");
  const [panelKey, setPanelKey]   = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Partículas solo en cliente (fix hydration)
  useEffect(() => {
    setParticles(
      Array.from({ length: 14 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 100,
        size: Math.random() * 3 + 1, dur: Math.random() * 8 + 6, delay: Math.random() * 5,
      }))
    );
  }, []);

  const activeFeature = features.find((f) => f.id === active)!;

  // Typing effect al cambiar card
  useEffect(() => {
    setTyped("");
    setPanelKey((k) => k + 1);
    const text = activeFeature.title;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 38);
    return () => clearInterval(iv);
  }, [active]);

  // Cerrar con Escape
  const closeModal = useCallback(() => setModalOpen(false), []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeModal]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const selectCard = (id: number) => setActive(id);
  const prev = () => {
    const idx = features.findIndex((f) => f.id === active);
    if (idx > 0) selectCard(features[idx - 1].id);
  };
  const next = () => {
    const idx = features.findIndex((f) => f.id === active);
    if (idx < features.length - 1) selectCard(features[idx + 1].id);
  };

  return (
    <main className={styles.wrapper}>

      {/* ══ HERO ══ */}
      <section className={styles.card}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <Image src="/logo.png" alt="Prometeo" width={34} height={34} />
          </div>
          <nav className={styles.nav}>
            <a className={styles.navLink} href="https://www.mgdbitforge.cloud/">ABOUT</a>
            <a className={styles.navLink} href="#features">INFO</a>
            <a className={styles.navLink} href="https://www.linkedin.com/in/mgd-bitforge-927a5a3a4/">CONTÁCTANOS</a>
          </nav>
        </header>

        <div className={styles.content}>
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
              <Link href="/login" className={`${styles.button} ${styles.buttonPrimary}`}>
                Iniciar sesión
              </Link>
              <button className={styles.buttonGhost} onClick={() => setModalOpen(true)}>
                Ver más
              </button>
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
          <div className={styles.right}>
            <div className={styles.heroCircle} />
            <div className={styles.heroCircleSmall} />
            <div className={styles.heroImageWrap}>
              <Image src="/logo.png" alt="Prometeo Hero" width={520} height={520} className={styles.heroImage} priority />
            </div>
          </div>
        </div>
      </section>

      {/* ══ MODAL ══ */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div className={styles.backdrop} onClick={closeModal} />

          {/* Modal container */}
          <div className={styles.modal} role="dialog" aria-modal="true">

            {/* Partículas decorativas */}
            <div className={styles.particlesWrap} aria-hidden>
              {particles.map((p) => (
                <span key={p.id} className={styles.particle} style={{
                  left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
                  animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`,
                }} />
              ))}
            </div>

            {/* Header del modal */}
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>¿QUÉ ES PROMETEO?</p>
                <h2 className={styles.modalTitle}>
                  Una plataforma para{" "}
                  <span className={styles.modalTitleAccent}>simplificar</span>{" "}
                  tu flujo documental
                </h2>
              </div>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Cuerpo: slider + panel */}
            <div className={styles.modalBody}>

              {/* ── Slider ── */}
              <div className={styles.sliderCol}>
                <div className={styles.sliderCards}>
                  {features.map((f) => {
                    const isActive = f.id === active;
                    return (
                      <div
                        key={f.id}
                        className={`${styles.sliderCard} ${isActive ? styles.sliderCardActive : ""}`}
                        style={{ background: f.bg }}
                        onClick={() => !isActive && selectCard(f.id)}
                      >
                        <div className={styles.cardIcon} style={{ color: f.accent }}>{f.icon}</div>
                        <p className={styles.cardLabel}>{f.label}</p>
                        {isActive && (
                          <div className={styles.cardActiveDot} style={{ background: f.accent }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Controles */}
                <div className={styles.sliderControls}>
                  <button className={styles.sliderBtn} onClick={prev} disabled={active === features[0].id}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Prev
                  </button>
                  <div className={styles.sliderDots}>
                    {features.map((f) => (
                      <button
                        key={f.id}
                        className={`${styles.dot} ${f.id === active ? styles.dotActive : ""}`}
                        onClick={() => selectCard(f.id)}
                      />
                    ))}
                  </div>
                  <button className={styles.sliderBtn} onClick={next} disabled={active === features[features.length - 1].id}>
                    Next
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>

              {/* ── Panel de detalle ── */}
              <div className={styles.detailPanel} key={panelKey}>
                <div className={styles.panelAccentBar} style={{ background: activeFeature.accent }} />
                <div className={styles.panelIconWrap} style={{ background: `${activeFeature.accent}15`, borderColor: `${activeFeature.accent}30` }}>
                  <span style={{ color: activeFeature.accent }}>{activeFeature.icon}</span>
                </div>
                <p className={styles.panelEyebrow} style={{ color: activeFeature.accent }}>
                  {activeFeature.label}
                </p>
                <h3 className={styles.panelTitle}>
                  {typed}<span className={styles.cursor}>|</span>
                </h3>
                <p className={styles.panelDesc}>{activeFeature.desc}</p>
                <ul className={styles.panelList}>
                  {activeFeature.detail.map((d) => (
                    <li key={d} className={styles.panelListItem}>
                      <span className={styles.panelCheck} style={{ background: `${activeFeature.accent}20`, color: activeFeature.accent }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className={styles.panelFooter}>
                  <Link href="/login" className={styles.panelCta} style={{ background: activeFeature.accent }}>
                    Comenzar ahora →
                  </Link>
                </div>
              </div>

            </div>{/* /modalBody */}
          </div>{/* /modal */}
        </>
      )}

    </main>
  );
}