import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 60, paddingHorizontal: 50, fontFamily: 'Helvetica', color: '#333' },
  // El header ahora es un contenedor Flex Row (Logo a la izquierda, Caja a la derecha)
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logoContainer: { width: '45%' },
  logo: { width: 130, height: 60, objectFit: 'contain' },
  // Estilos para la caja de radicado en la esquina superior derecha
  radicadoBox: { width: '45%', border: 1, borderColor: '#000', padding: 5, fontSize: 8, textAlign: 'center' },
  radicadoTextBold: { fontWeight: 'bold', marginBottom: 2 },
  radicadoText: { marginBottom: 2 },
  
  title: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 70, fontWeight: 'bold' },
  value: { flex: 1 },
  body: { marginTop: 20, marginBottom: 30, lineHeight: 1.5, textAlign: 'justify' },
  firmaContainer: { marginTop: 40 },
  firmaNombre: { fontWeight: 'bold', marginTop: 30 },
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, textAlign: 'center', fontSize: 8, color: 'grey', borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 5 }
});

export interface PlantillaDatos {
  tipoDocumento: string;
  entidad: string;
  dependenciaOrigen: string;
  para: string;
  de: string;
  asunto: string;
  cuerpo: string;
  firmaNombre: string;
  firmaCargo: string;
  piePagina: string;
  logo: string; 
  tamanoFuente: number; 
  // Nuevos datos dinámicos que inyectará el backend al radicar
  nroRadicado: string;
  fechaRadicado: string;
  anexosRadicado: string;
  destinoRadicado: string;
}

export const PlantillaDocumentoPDF = ({ datos }: { datos: PlantillaDatos }) => (
  <Document>
    <Page size="A4" style={[styles.page, { fontSize: Number(datos.tamanoFuente) || 10 }]}>
      
      {/* --- CABECERA DIVIDIDA --- */}
      <View style={styles.header}>
        {/* Izquierda: Logo */}
        <View style={styles.logoContainer}>
          {datos.logo && <Image src={datos.logo} style={styles.logo} />}
        </View>

        {/* Derecha: Cuadro de Radicación */}
        <View style={styles.radicadoBox}>
          <Text style={styles.radicadoTextBold}>ALCALDÍA MAYOR DE BOGOTÁ</Text>
          <Text style={styles.radicadoTextBold}>{datos.entidad}</Text>
          <Text style={styles.radicadoText}>AL RESPONDER CITAR EL NR.</Text>
          <Text style={styles.radicadoText}>Nro. Rad: <Text style={styles.radicadoTextBold}>{datos.nroRadicado}</Text></Text>
          <Text style={styles.radicadoText}>Fecha: {datos.fechaRadicado} - Anexos: {datos.anexosRadicado}</Text>
          <Text style={styles.radicadoText}>Destino: <Text style={styles.radicadoTextBold}>{datos.destinoRadicado}</Text></Text>
        </View>
      </View>

      {/* --- RESTO DEL DOCUMENTO --- */}
      <Text style={styles.title}>{datos.tipoDocumento}</Text>

      <View style={styles.row}><Text style={styles.label}>Para:</Text><Text style={styles.value}>{datos.para}</Text></View>
      <View style={styles.row}><Text style={styles.label}>De:</Text><Text style={styles.value}>{datos.de}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Asunto:</Text><Text style={styles.value}>{datos.asunto}</Text></View>

      <View style={styles.body}>
        <Text>{datos.cuerpo}</Text>
      </View>

      <View style={styles.firmaContainer}>
        <Text>Cordialmente,</Text>
        <Text style={styles.firmaNombre}>{datos.firmaNombre}</Text>
        <Text>{datos.firmaCargo}</Text>
      </View>

      <View style={styles.footer} fixed>
        <Text>{datos.piePagina}</Text>
      </View>

    </Page>
  </Document>
);