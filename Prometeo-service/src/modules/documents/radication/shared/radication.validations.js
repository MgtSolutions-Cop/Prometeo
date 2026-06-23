export function validateEntryPayload(payload) {
  const errors = [];
  if (!payload.fecha_documento)       errors.push("fecha_documento is required");
  if (!payload.medio_correspondencia) errors.push("medio_correspondencia is required");
  if (!payload.cedula_nit)            errors.push("cedula_nit is required");
  if (!payload.entidad_origen)        errors.push("entidad_origen is required");
  if (!payload.remitente)             errors.push("remitente is required");
  if (!payload.tipo_documento)        errors.push("tipo_documento is required");
  if (!payload.dependencia_destino)   errors.push("dependencia_destino is required");
  if (!payload.destinatario)          errors.push("destinatario is required");
  if (!payload.subject)               errors.push("asunto is required");
  if (payload.folios && isNaN(Number(payload.folios))) {
    errors.push("folios must be a number");
  }
  return errors;
}