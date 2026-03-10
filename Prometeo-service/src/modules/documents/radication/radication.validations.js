// src/modules/documents/radication/radication.validations.js
// Validaciones simples para el payload de entrada.
// Puedes ampliar con Joi si lo deseas.

export function validateEntryPayload(payload) {
    const errors = [];
  
    // required fields
    if (!payload.fecha_documento) errors.push("fecha_documento is required");
    if (!payload.medio_correspondencia) errors.push("medio_correspondencia is required");
    if (!payload.cedula_nit) errors.push("cedula_nit is required");
    if (!payload.entidad_origen) errors.push("entidad_origen is required");
    if (!payload.remitente) errors.push("remitente is required");
    if (!payload.tipo_documento) errors.push("tipo_documento is required");
    if (!payload.dependencia_destino) errors.push("dependencia_destino is required");
    if (!payload.destinatario) errors.push("destinatario is required");
    if (!payload.asunto) errors.push("asunto is required");
  
    // optional small checks
    if (payload.folios && isNaN(Number(payload.folios))) {
      errors.push("folios must be a number");
    }
  
    // returns array: empty => ok
    return errors;
  }
  