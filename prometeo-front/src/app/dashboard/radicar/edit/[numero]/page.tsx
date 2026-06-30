"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../radicar.module.css";
import { getAllRadications, updateRadication } from "../../../../services/api";

export default function EditRadicadoPage() {
  const params   = useParams();
  const router   = useRouter();
  const numero   = decodeURIComponent(params.numero as string);

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Solo lectura
  const [radicadoInfo, setRadicadoInfo] = useState({
    radication_number: "",
    created_at:        "",
    radication_type:   "",
  });

  const [formData, setFormData] = useState({
    // Fechas
    fecha_radicacion:      "",   // readonly
    fecha_documento:       "",   // readonly

    // Origen
    medio_correspondencia: "Correo Electrónico",
    clase_correspondencia: "OFICIAL",
    cedula_nit:            "",
    correo:                "",
    entidad_origen:        "",
    direccion:             "",
    telefono:              "",
    remitente:             "",
    tipo_documento:        "Oficio",
    no_origen:             "",
    no_guia:               "",
    referenciados:         "",

    // Destinatarios
    dependencia_destino:   "",
    destinatario:          "",
    jefe_dependencia:      "",
    encargado:             "",
    copia:                 "NO",

    // Info adicional
    subject:               "",
    observaciones:         "",
    folios:                "1",
    anexos:                "0",
    status:                "pending",

    // Flags
    aplica_confidencial:   false,
    llevado_a_la_mano:     false,
  });

  useEffect(() => {
    getAllRadications()
      .then((lista) => {
        const r = lista.find((x: any) => x.radication_number === numero);
        if (!r) { setNotFound(true); return; }

        setRadicadoInfo({
          radication_number: r.radication_number,
          created_at:        r.created_at,
          radication_type:   r.radication_number.endsWith("-IN")  ? "Entrada"
                           : r.radication_number.endsWith("-OUT") ? "Salida"
                           : "Interno",
        });

        setFormData({
          fecha_radicacion:      r.created_at ? r.created_at.slice(0, 10) : "",
          fecha_documento:       r.fecha_documento       || "",
          medio_correspondencia: r.medio_correspondencia || "Correo Electrónico",
          clase_correspondencia: r.clase_correspondencia || "OFICIAL",
          cedula_nit:            r.cedula_nit            || "",
          correo:                r.correo                || "",
          entidad_origen:        r.entidad_origen        || "",
          direccion:             r.direccion             || "",
          telefono:              r.telefono              || "",
          remitente:             r.remitente             || "",
          tipo_documento:        r.tipo_documento        || "Oficio",
          no_origen:             r.no_origen             || "",
          no_guia:               r.no_guia               || "",
          referenciados:         r.referenciados         || "",
          dependencia_destino:   r.dependencia_destino   || "",
          destinatario:          r.destinatario          || "",
          jefe_dependencia:      r.jefe_dependencia      || "",
          encargado:             r.encargado             || "",
          copia:                 r.copia                 || "NO",
          subject:               r.subject               || "",
          observaciones:         r.observaciones         || "",
          folios:                r.folios                || "1",
          anexos:                r.anexos                || "0",
          status:                r.status                || "pending",
          aplica_confidencial:   r.aplica_confidencial === true || r.aplica_confidencial === "true",
          llevado_a_la_mano:     r.llevado_a_la_mano    === true || r.llevado_a_la_mano === "true",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [numero]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateRadication(numero, formData);
      router.push("/dashboard/radicar");
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.wrap}><p className={styles.stateMsg}>Cargando radicado...</p></div>;
  if (notFound) return (
    <div className={styles.wrap}>
      <p className={`${styles.stateMsg} ${styles.stateMsgError}`}>Radicado {numero} no encontrado.</p>
      <Link href="/dashboard/radicar" className={styles.actionBtn} style={{ marginTop: 16 }}>Volver</Link>
    </div>
  );

  return (
    <div className={styles.wrap}>

      {/* ── Heading ── */}
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>
            <Link href="/dashboard/radicar" style={{ color: "inherit", textDecoration: "none" }}>Radicados</Link>
            {" / Editar"}
          </p>
          <h1 className={styles.h1}>Editar Radicado</h1>
          <p className={styles.sub}>Modifica los datos del radicado</p>
        </div>
        <Link href="/dashboard/radicar" className={styles.actionBtn}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)" }}>
          Cancelar
        </Link>
      </div>

      {/* ── Info readonly ── */}
      <div className={styles.card} style={{ marginBottom: 16, padding: "16px 24px", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>N° Radicado</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "4px 0 0" }}>{radicadoInfo.radication_number}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Tipo</p>
          <p style={{ fontSize: 14, color: "#fff", margin: "4px 0 0" }}>{radicadoInfo.radication_type}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Fecha de radicación</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "4px 0 0" }}>
            {new Date(radicadoInfo.created_at).toLocaleString("es-CO", {
              day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Estado</p>
          <select name="status" value={formData.status} onChange={handleChange} className={styles.select} style={{ marginTop: 4 }}>
            <option value="pending">Recibido</option>
            <option value="in_review">En revisión</option>
            <option value="approved">Aprobado</option>
          </select>
        </div>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>

        {/* ════ SECCIÓN 1 — DATOS DE RADICACIÓN ════ */}
        <div className={styles.sectionTitle}>Datos de Radicación</div>
        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha de Radicación</label>
            <input type="date" name="fecha_radicacion" value={formData.fecha_radicacion}
              readOnly className={styles.input}
              style={{ opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha del Documento</label>
            <input type="date" name="fecha_documento" value={formData.fecha_documento}
              readOnly className={styles.input}
              style={{ opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>No. Origen</label>
            <input type="text" name="no_origen" value={formData.no_origen} onChange={handleChange} className={styles.input} placeholder="Ej: 2024EE2345" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>No. Guía</label>
            <input type="text" name="no_guia" value={formData.no_guia} onChange={handleChange} className={styles.input} placeholder="Ej: RE2024FT34TR" />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Referenciados</label>
            <input type="text" name="referenciados" value={formData.referenciados} onChange={handleChange} className={styles.input} placeholder="Números de radicados anteriores relacionados" />
          </div>

        </div>

        {/* ════ SECCIÓN 2 — ORIGEN ════ */}
        <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Origen</div>
        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.label}>Medio de Correspondencia</label>
            <select name="medio_correspondencia" value={formData.medio_correspondencia} onChange={handleChange} className={styles.select}>
              <option value="Correo Electrónico">Correo Electrónico</option>
              <option value="Físico / Mensajería">Físico / Mensajería</option>
              <option value="Ventanilla Única">Ventanilla Única</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Clase de Correspondencia</label>
            <select name="clase_correspondencia" value={formData.clase_correspondencia} onChange={handleChange} className={styles.select}>
              <option value="OFICIAL">OFICIAL</option>
              <option value="CONFIDENCIAL">CONFIDENCIAL</option>
              <option value="RESERVADO">RESERVADO</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cédula / NIT Origen</label>
            <input type="text" name="cedula_nit" value={formData.cedula_nit} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} className={styles.input} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Entidad / Empresa Origen</label>
            <input type="text" name="entidad_origen" value={formData.entidad_origen} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Dirección</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre del Remitente</label>
            <input type="text" name="remitente" value={formData.remitente} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo de Documento</label>
            <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className={styles.select}>
              <option value="Oficio">Oficio</option>
              <option value="Derecho de Petición">Derecho de Petición</option>
              <option value="Factura">Factura</option>
              <option value="Notificación Judicial">Notificación Judicial</option>
              <option value="Comunicación Oficial">Comunicación Oficial</option>
              <option value="Circular">Circular</option>
              <option value="Memorando">Memorando</option>
            </select>
          </div>

          <div className={styles.formGroup} style={{ display: "flex", alignItems: "center", gap: 32, paddingTop: 28 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              <input type="checkbox" name="aplica_confidencial" checked={formData.aplica_confidencial}
                onChange={handleChange} style={{ width: 16, height: 16, accentColor: "#E53935" }} />
              Aplica Confidencial
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              <input type="checkbox" name="llevado_a_la_mano" checked={formData.llevado_a_la_mano}
                onChange={handleChange} style={{ width: 16, height: 16, accentColor: "#E53935" }} />
              Llevado a la Mano
            </label>
          </div>

        </div>

        {/* ════ SECCIÓN 3 — DESTINATARIOS ════ */}
        <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Destinatarios</div>
        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.label}>Dependencia Destino</label>
            <select name="dependencia_destino" value={formData.dependencia_destino} onChange={handleChange} className={styles.select}>
              <option value="">Seleccione una dependencia</option>
              <option value="1">Secretaría General</option>
              <option value="2">Departamento Jurídico</option>
              <option value="3">Archivo Central</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Destinatario Específico</label>
            <input type="text" name="destinatario" value={formData.destinatario} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Jefe de Dependencia</label>
            <input type="text" name="jefe_dependencia" value={formData.jefe_dependencia} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Encargado</label>
            <input type="text" name="encargado" value={formData.encargado} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>¿Aplica Copia?</label>
            <select name="copia" value={formData.copia} onChange={handleChange} className={styles.select}>
              <option value="NO">NO</option>
              <option value="SÍ">SÍ</option>
            </select>
          </div>

        </div>

        {/* ════ SECCIÓN 4 — INFO ADICIONAL ════ */}
        <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Información Adicional del Documento</div>
        <div className={styles.formGrid}>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Asunto *</label>
            <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className={styles.input} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Observaciones</label>
            <input type="text" name="observaciones" value={formData.observaciones} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Número de Folios</label>
            <input type="number" name="folios" min="1" value={formData.folios} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Número de Anexos</label>
            <input type="number" name="anexos" min="0" value={formData.anexos} onChange={handleChange} className={styles.input} />
          </div>

        </div>

        {error && <p style={{ color: "#E53935", fontSize: 13, margin: "12px 0 0" }}>{error}</p>}

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link href="/dashboard/radicar" className={styles.actionBtn}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none" }}>
            Cancelar
          </Link>
          <button type="submit" className={styles.submitButton} disabled={saving} style={{ margin: 0, flex: 1 }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

      </form>
    </div>
  );
}