"use client";
import { useState } from "react";
import styles from "../radicar.module.css";
import { createOutputRadication } from "../../../services/api";

interface SuccessResponse {
  radication?: {
    radication_number: string;
  };
}

export default function RadicarPage() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<SuccessResponse | null>(null);

  const [formData, setFormData] = useState({
    fecha_documento: "",
    medio_correspondencia: "Correo Electrónico",
    cedula_nit: "",
    entidad_destino: "", // ✅ CORREGIDO
    remitente: "",
    tipo_documento: "Oficio",
    dependencia_destino: "",
    destinatario: "",
    asunto: "",
    correo: "",
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

      const response = await createOutputRadication(formData);
      console.log("RESPONSE:", response); // debug

      setSuccessData(response);

      // Reset limpio
      setFormData({
        fecha_documento: "",
        medio_correspondencia: "Correo Electrónico",
        cedula_nit: "",
        entidad_destino: "",
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
          <h1 className={styles.h1}>Radicación de salida</h1>
          <p className={styles.sub}>Registra documentos enviados</p>
        </div>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        
        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha del Documento *</label>
            <input required type="date" name="fecha_documento" value={formData.fecha_documento} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Medio *</label>
            <select name="medio_correspondencia" value={formData.medio_correspondencia} onChange={handleChange} className={styles.select}>
              <option>Correo Electrónico</option>
              <option>Físico / Mensajería</option>
              <option>Ventanilla Única</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cédula / NIT *</label>
            <input required type="text" name="cedula_nit" value={formData.cedula_nit} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Entidad Destino *</label>
            <input required type="text" name="entidad_destino" value={formData.entidad_destino} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Remitente *</label>
            <input required type="text" name="remitente" value={formData.remitente} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Correo</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Dependencia *</label>
            <select name="dependencia_destino" value={formData.dependencia_destino} onChange={handleChange} className={styles.select}>
              <option value="">Seleccione</option>
              <option value="1">Secretaría</option>
              <option value="2">Jurídico</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Destinatario *</label>
            <input required type="text" name="destinatario" value={formData.destinatario} onChange={handleChange} className={styles.input} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Asunto *</label>
            <input required type="text" name="asunto" value={formData.asunto} onChange={handleChange} className={styles.input} />
          </div>

        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Radicando..." : "Radicar"}
        </button>

        {/* ✅ PROTEGIDO */}
        {successData?.radication && (
          <div className={styles.successMessage}>
            <strong>Radicado creado</strong><br />
            {successData.radication.radication_number}
          </div>
        )}

      </form>
    </div>
  );
}