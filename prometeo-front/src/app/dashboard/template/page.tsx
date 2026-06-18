"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PlantillaDocumentoPDF, PlantillaDatos } from "@/components/PlantillaDocumentoPDF";
import styles from "./templates.module.css"; 

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div style={{padding: '2rem', textAlign: 'center', color: 'white'}}>Cargando previsualización...</div> }
);

export default function TemplatesPage() {
  const [formData, setFormData] = useState<PlantillaDatos>({
    tipoDocumento: "MEMORANDO", 
    entidad: "AGENCIA DISTRITAL PARA LA EDUCACIÓN SUPERIOR, LA CIENCIA Y LA TECNOLOGÍA",
    dependenciaOrigen: "SUBGERENCIA DE GESTIÓN ADMINISTRATIVA",
    para: "[Nombre Destinatario] - [Dependencia]",
    de: "SUBGERENCIA DE GESTION ADMINISTRATIVA",
    asunto: "DOCUMENTO DE PRUEBA",
    cuerpo: "Respetado (a) Doctor (a):\n\nEscriba aquí el cuerpo del documento. Este diseño base se usará luego en la radicación.",
    firmaNombre: "ALEXANDER MARULANDA PULIDO",
    firmaCargo: "SUBGERENTE DE GESTION ADMINISTRATIVA",
    piePagina: "Sede Administrativa: Carrera 10 #28-49. Torre A.\nLínea de Atención: (601) 6660006 - www.agenciaatenea.gov.co",
    logo: "", 
    tamanoFuente: 10,
    // --- DATOS SIMULADOS DEL RADICADO ---
    nroRadicado: "8-2025-6564",
    fechaRadicado: "17/04/2026",
    anexosRadicado: "N/A",
    destinoRadicado: "SUBG. GEST. ADM."
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1>Diseñador de Documentos Oficiales</h1>
        <p>Configura el diseño institucional.</p>
      </div>

      <div className={styles.splitView}>
        
        {/* PANEL IZQUIERDO */}
        <div className={styles.leftPanel}>
          
          <h2 className={styles.sectionTitle}>Apariencia y Marca</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Logo de la Entidad</label>
            <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className={styles.fileInput} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tamaño de la Letra (pt)</label>
            <input type="number" name="tamanoFuente" value={formData.tamanoFuente} onChange={handleChange} min="8" max="16" className={styles.input} />
          </div>

          <h2 className={styles.sectionTitle} style={{marginTop: '2rem'}}>Textos Institucionales</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Entidad Principal</label>
            <input type="text" name="entidad" value={formData.entidad} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Pie de Página (Contacto)</label>
            <textarea name="piePagina" value={formData.piePagina} onChange={handleChange} rows={4} className={styles.textarea} />
          </div>

          {/* SIMULACIÓN DEL RADICADO */}
          <h2 className={styles.sectionTitle} style={{marginTop: '2rem'}}>Simulación de Radicado</h2>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo de Documento</label>
            <input type="text" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className={styles.input} />
          </div>
          <div className="flex gap-4">
            <div className={styles.formGroup} style={{flex: 1}}>
              <label className={styles.label}>Nro Simulado</label>
              <input type="text" name="nroRadicado" value={formData.nroRadicado} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup} style={{flex: 1}}>
              <label className={styles.label}>Fecha Simulada</label>
              <input type="text" name="fechaRadicado" value={formData.fechaRadicado} onChange={handleChange} className={styles.input} />
            </div>
          </div>
          
        </div>

        {/* PANEL DERECHO: VISOR */}
        <div className={styles.rightPanel}>
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <PlantillaDocumentoPDF datos={formData} />
          </PDFViewer>
        </div>

      </div>
    </div>
  );
}