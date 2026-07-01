"use client";
import { useState } from "react";
import { toast } from "sonner";
import styles from "../radicar.module.css";
import { createEntryRadication } from "../../../services/api";

const EMPTY_FORM = {
  fecha_radicacion:      new Date().toISOString().split("T")[0],
  fecha_documento:       "",
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
  dependencia_destino:   "",
  destinatario:          "",
  jefe_dependencia:      "",
  encargado:             "",
  copia:                 "NO",
  subject:               "",
  observaciones:         "",
  folios:                "1",
  anexos:                "0",
  aplica_confidencial:   false,
  llevado_a_la_mano:     false,
};

export default function RadicarEntradaPage() {
  const [loading,     setLoading]     = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [formData,    setFormData]    = useState({ ...EMPTY_FORM });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value  = target.type === "checkbox" ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Radicando documento...");
    try {
      setLoading(true);
      setSuccessData(null);
      const response = await createEntryRadication(formData);
      setSuccessData(response);
      setFormData({ ...EMPTY_FORM, fecha_radicacion: new Date().toISOString().split("T")[0] });
      toast.success(
        `Radicado ${response.radication.radication_number} creado exitosamente`,
        { id: toastId }
      );
    } catch (error: any) {
      toast.error("Error al radicar: " + error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Radicación de Entrada</h1>
          <p className={styles.sub}>Registra y radica documentos externos recibidos</p>
        </div>
        <span className={styles.badge}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Nuevo radicado
        </span>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>

        <div className={styles.sectionTitle}>Datos de Radicación</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha de Radicación</label>
            <input type="date" name="fecha_radicacion" value={formData.fecha_radicacion}
              readOnly className={styles.input}
              style={{ opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha del Documento *</label>
            <input required type="date" name="fecha_documento" value={formData.fecha_documento}
              onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>No. Origen</label>
            <input type="text" name="no_origen" value={formData.no_origen}
              onChange={handleChange} className={styles.input} placeholder="Ej: 2024EE2345" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>No. Guía</label>
            <input type="text" name="no_guia" value={formData.no_guia}
              onChange={handleChange} className={styles.input} placeholder="Ej: RE2024FT34TR" />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Referenciados</label>
            <input type="text" name="referenciados" value={formData.referenciados}
              onChange={handleChange} className={styles.input}
              placeholder="Números de radicados anteriores relacionados" />
          </div>
        </div>

        <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Origen</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Medio de Correspondencia *</label>
            <select required name="medio_correspondencia" value={formData.medio_correspondencia}
              onChange={handleChange} className={styles.select}>
              <option value="Correo Electrónico">Correo Electrónico</option>
              <option value="Físico / Mensajería">Físico / Mensajería</option>
              <option value="Ventanilla Única">Ventanilla Única</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Clase de Correspondencia *</label>
            <select required name="clase_correspondencia" value={formData.clase_correspondencia}
              onChange={handleChange} className={styles.select}>
              <option value="OFICIAL">OFICIAL</option>
              <option value="CONFIDENCIAL">CONFIDENCIAL</option>
              <option value="RESERVADO">RESERVADO</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Cédula / NIT Origen *</label>
            <input required type="text" name="cedula_nit" value={formData.cedula_nit}
              onChange={handleChange} className={styles.input} placeholder="Ej: 900123456" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input type="email" name="correo" value={formData.correo}
              onChange={handleChange} className={styles.input} placeholder="Para notificación de radicado" />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Entidad / Empresa Origen *</label>
            <input required type="text" name="entidad_origen" value={formData.entidad_origen}
              onChange={handleChange} className={styles.input} placeholder="Razón social o Persona natural" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Dirección</label>
            <input type="text" name="direccion" value={formData.direccion}
              onChange={handleChange} className={styles.input} placeholder="Dirección del remitente" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono}
              onChange={handleChange} className={styles.input} placeholder="Teléfono del remitente" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre del Remitente *</label>
            <input required type="text" name="remitente" value={formData.remitente}
              onChange={handleChange} className={styles.input} placeholder="Quien firma el documento" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo de Documento *</label>
            <select required name="tipo_documento" value={formData.tipo_documento}
              onChange={handleChange} className={styles.select}>
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

        <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Destinatarios</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Dependencia Destino *</label>
            <select required name="dependencia_destino" value={formData.dependencia_destino}
              onChange={handleChange} className={styles.select}>
              <option value="">Seleccione una dependencia</option>
              <option value="1">Secretaría General</option>
              <option value="2">Departamento Jurídico</option>
              <option value="3">Archivo Central</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Destinatario Específico *</label>
            <input required type="text" name="destinatario" value={formData.destinatario}
              onChange={handleChange} className={styles.input} placeholder="A quién va dirigido" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Jefe de Dependencia</label>
            <input type="text" name="jefe_dependencia" value={formData.jefe_dependencia}
              onChange={handleChange} className={styles.input} placeholder="Nombre del jefe de dependencia" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Encargado</label>
            <input type="text" name="encargado" value={formData.encargado}
              onChange={handleChange} className={styles.input} placeholder="Nombre del encargado" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>¿Aplica Copia?</label>
            <select name="copia" value={formData.copia} onChange={handleChange} className={styles.select}>
              <option value="NO">NO</option>
              <option value="SÍ">SÍ</option>
            </select>
          </div>
        </div>

        <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Información Adicional del Documento</div>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Asunto *</label>
            <input required type="text" name="subject" value={formData.subject}
              onChange={handleChange} className={styles.input} placeholder="Resumen del contenido del documento" />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Observaciones</label>
            <input type="text" name="observaciones" value={formData.observaciones}
              onChange={handleChange} className={styles.input} placeholder="Anotaciones adicionales al radicar..." />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Número de Folios</label>
            <input type="number" name="folios" min="1" value={formData.folios}
              onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Número de Anexos</label>
            <input type="number" name="anexos" min="0" value={formData.anexos}
              onChange={handleChange} className={styles.input} />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Archivo Digital (PDF)</label>
            <label className={styles.fileBox}>
              <input type="file" className={styles.fileInput} accept=".pdf" />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              <span>Seleccionar archivo PDF</span>
            </label>
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Radicando documento..." : "Radicar documento"}
        </button>

        {successData && (
          <div className={styles.successMessage}>
            <strong>¡Documento Radicado Exitosamente!</strong><br />
            Número de Radicado: <span style={{ fontSize: "1.2em", fontWeight: "bold" }}>
              {successData.radication.radication_number}
            </span>
          </div>
        )}

      </form>
    </div>
  );
}