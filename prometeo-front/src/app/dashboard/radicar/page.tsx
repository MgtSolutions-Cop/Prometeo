"use client";
import { useState } from "react";
import styles from "./radicar.module.css";
import { createEntryRadication } from "../../services/api"; // Ajusta la ruta

export default function RadicarPage() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Estado con todos los campos requeridos por el backend
  const [formData, setFormData] = useState({
    fecha_documento: "",
    medio_correspondencia: "Correo Electrónico",
    cedula_nit: "",
    entidad_origen: "",
    remitente: "",
    tipo_documento: "Oficio",
    dependencia_destino: "",
    destinatario: "",
    asunto: "",
    correo: "", // Opcional, pero usado para notificación
    folios: "1",
    observaciones: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSuccessData(null);
      
      // Llamada a la API
      const response = await createEntryRadication(formData);
      
      // Mostrar éxito y limpiar formulario
      setSuccessData(response);
      setFormData({
        fecha_documento: "",
        medio_correspondencia: "Correo Electrónico",
        cedula_nit: "",
        entidad_origen: "",
        remitente: "",
        tipo_documento: "Oficio",
        dependencia_destino: "",
        destinatario: "",
        asunto: "",
        correo: "",
        folios: "1",
        observaciones: ""
      });
      
    } catch (error: any) {
      alert("Error al radicar: " + error.message);
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Nuevo radicado
        </span>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        
        <div className={styles.formGrid}>
          {/* Columna Izquierda / Derecha */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha del Documento Físico *</label>
            <input required type="date" name="fecha_documento" value={formData.fecha_documento} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Medio de Correspondencia *</label>
            <select required name="medio_correspondencia" value={formData.medio_correspondencia} onChange={handleChange} className={styles.select}>
              <option value="Correo Electrónico">Correo Electrónico</option>
              <option value="Físico / Mensajería">Físico / Mensajería</option>
              <option value="Ventanilla Única">Ventanilla Única</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cédula / NIT Origen *</label>
            <input required type="text" name="cedula_nit" value={formData.cedula_nit} onChange={handleChange} className={styles.input} placeholder="Ej: 900123456" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Entidad / Empresa Origen *</label>
            <input required type="text" name="entidad_origen" value={formData.entidad_origen} onChange={handleChange} className={styles.input} placeholder="Razón social o Persona natural" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre del Remitente *</label>
            <input required type="text" name="remitente" value={formData.remitente} onChange={handleChange} className={styles.input} placeholder="Quien firma el documento" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico Remitente</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} className={styles.input} placeholder="Para notificación de radicado" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo de Documento *</label>
            <select required name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className={styles.select}>
              <option value="Oficio">Oficio</option>
              <option value="Derecho de Petición">Derecho de Petición</option>
              <option value="Factura">Factura</option>
              <option value="Notificación Judicial">Notificación Judicial</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Dependencia Destino *</label>
            {/* TODO: Esto debe conectarse luego al endpoint de obtener dependencias */}
            <select required name="dependencia_destino" value={formData.dependencia_destino} onChange={handleChange} className={styles.select}>
              <option value="">Seleccione una dependencia</option>
              <option value="1">Secretaría General</option>
              <option value="2">Departamento Jurídico</option>
              <option value="3">Archivo Central</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Destinatario Específico *</label>
            <input required type="text" name="destinatario" value={formData.destinatario} onChange={handleChange} className={styles.input} placeholder="A quién va dirigido" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Número de Folios</label>
            <input type="number" name="folios" min="1" value={formData.folios} onChange={handleChange} className={styles.input} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Asunto *</label>
            <input required type="text" name="asunto" value={formData.asunto} onChange={handleChange} className={styles.input} placeholder="Resumen del contenido del documento" />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Observaciones</label>
            <input type="text" name="observaciones" value={formData.observaciones} onChange={handleChange} className={styles.input} placeholder="Anotaciones adicionales al radicar..." />
          </div>

          {/* Selector de Archivo Físico (Visual por ahora) */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Archivo Digital (PDF)</label>
            <label className={styles.fileBox}>
              <input type="file" className={styles.fileInput} accept=".pdf" />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            Número de Radicado: <span style={{fontSize: '1.2em', fontWeight: 'bold'}}>{successData.radication.radication_number}</span>
          </div>
        )}
      </form>
    </div>
  );
}