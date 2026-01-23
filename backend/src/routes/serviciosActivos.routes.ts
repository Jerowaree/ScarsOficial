// src/routes/serviciosActivos.routes.ts
import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";
import { genSeguimiento } from "../utils/generate";
import { servicios_activos_proceso } from '@prisma/client';

const r = Router();

// Helpers: map texto legible -> enum Prisma (IDs con guiones bajos)
const PROCESOS_LABELS = [
  "Recepción del vehículo",
  "Diagnóstico técnico",
  "Evaluación y presupuesto",
  "Aprobación del cliente",
  "En espera de suministro",
  "Ejecución del servicio",
  "Control de calidad",
  "Entrega del vehículo",
  "Cierre del servicio",
];
const PROCESOS_ENUM_IDS: servicios_activos_proceso[] = [
  'Recepci_n_del_veh_culo',
  'Diagn_stico_t_cnico',
  'Evaluaci_n_y_presupuesto',
  'Aprobaci_n_del_cliente',
  'En_espera_de_suministro',
  'Ejecuci_n_del_servicio',
  'Control_de_calidad',
  'Entrega_del_veh_culo',
  'Cierre_del_servicio',
];
const norm = (s: string) => String(s || "")
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[\-_]+/g, ' ')
  .trim()
  .toLowerCase();
const toProcesoEnum = (input: string): servicios_activos_proceso => {
  const t = norm(input);
  for (let i = 0; i < PROCESOS_LABELS.length; i++) {
    if (norm(PROCESOS_LABELS[i]) === t) return PROCESOS_ENUM_IDS[i];
  }
  // Permitir que ya venga en enum id
  const idx = PROCESOS_ENUM_IDS.findIndex(e => norm(e) === t);
  return idx >= 0 ? PROCESOS_ENUM_IDS[idx] : PROCESOS_ENUM_IDS[0];
};

r.get("/", auth, requirePerm("servicio.activo:list"), async (req, res) => {
  const q = String(req.query.q || "");
  const data = await prisma.servicios_activos.findMany({
    where: q ? {
      OR: [
        { numero_seguimiento: { contains: q } },
        { cliente_nombre: { contains: q } },
        { placa: { contains: q } },
      ],
    } : undefined,
    orderBy: { created_at: "desc" }
  });
  res.json(data);
});

// Detalle de servicios seleccionados para un activo
r.get("/:id/detalle", auth, requirePerm("servicio.activo:list"), async (req, res) => {
  const id = Number(req.params.id);
  const rows = await prisma.detalle_servicio_activo.findMany({
    where: { id_servicio_activo: id },
    select: { id_servicio_catalogo: true }
  });
  const ids = rows.map(r => r.id_servicio_catalogo);
  const cat = ids.length
    ? await prisma.servicios_catalogo.findMany({ where: { id_servicio: { in: ids } }, select: { id_servicio: true, nombre: true } })
    : [];
  res.json(cat);
});

r.post("/", auth, requirePerm("servicio.activo:create"), async (req, res) => {
  const { codigoCliente, placa, tipo: tipoFrontend, fecha, serviciosIds, observaciones } = req.body as any;

  const cliente = await prisma.clientes.findUnique({ where: { codigo: codigoCliente } });
  if (!cliente) return res.status(400).json({ error: "CLIENTE_NO_EXISTE" });

  const vehiculo = await prisma.vehiculos.findFirst({
    where: { placa, id_cliente: cliente.id_cliente }
  });
  if (!vehiculo) return res.status(400).json({ error: "VEHICULO_NO_EXISTE" });

  const numero = genSeguimiento();

  // Validar/convertir fecha a Date (ISO)
  let fechaDate: Date | null = null;
  if (typeof fecha === "string" && fecha) {
    // Acepta "YYYY-MM-DD" desde el front y lo convierte a Date en UTC 00:00
    const iso = /T/.test(fecha) ? fecha : `${fecha}T00:00:00.000Z`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) fechaDate = d;
  } else if (fecha instanceof Date) {
    fechaDate = fecha;
  }
  if (!fechaDate) return res.status(400).json({ error: "FECHA_INVALIDA" });

  // Usar tipo del frontend si se proporciona, sino del vehículo
  const tipoFinal = tipoFrontend === "Automóvil" ? "Automovil" : tipoFrontend === "Moto" ? "Moto" : vehiculo.tipo;

  const activo = await prisma.servicios_activos.create({
    data: {
      id_cliente: cliente.id_cliente,
      id_vehiculo: vehiculo.id_vehiculo,
      numero_seguimiento: numero,
      cliente_nombre: `${cliente.nombres} ${cliente.apellidos}`,
      placa,
      tipo: tipoFinal as any,
      fecha: fechaDate,
      observaciones,
      created_by: (req as any).user.uid
    }
  });

  if (Array.isArray(serviciosIds) && serviciosIds.length) {
    await prisma.detalle_servicio_activo.createMany({
      data: serviciosIds.map((id: number) => ({
        id_servicio_activo: activo.id_servicio_activo,
        id_servicio_catalogo: id
      })),
      skipDuplicates: true
    });
  }

  res.status(201).json(activo);
});

// Cambiar proceso/estado; si finaliza -> mover a concluidos
r.patch("/:id/proceso", auth, requirePerm("servicio.activo:update"), async (req, res) => {
  const id = Number(req.params.id);
  const { proceso, observaciones } = req.body as { proceso: string; observaciones?: string };

  const prev = await prisma.servicios_activos.findUnique({
    where: { id_servicio_activo: id }
  });
  if (!prev) return res.status(404).json({ error: "NO_EXISTE" });

  const enumValue = toProcesoEnum(proceso);
  const fin = enumValue === 'Cierre_del_servicio';

  const updated = await prisma.servicios_activos.update({
    where: {
      id_servicio_activo: Number(id)
    },
    data: {
      proceso: enumValue,
      estado: fin ? 'Finalizado' : 'En_curso',
      observaciones: observaciones ?? null,
      updated_by: (req as any).user?.uid
    }
  });

  if (fin) {
    // 1) ids de servicios del detalle
    const detalles = await prisma.detalle_servicio_activo.findMany({
      where: { id_servicio_activo: id }
    });
    const srvIds = detalles.map(d => d.id_servicio_catalogo);

    // 2) nombres desde catálogo
    const srvCat = srvIds.length
      ? await prisma.servicios_catalogo.findMany({ where: { id_servicio: { in: srvIds } } })
      : [];
    const serviciosNombres = srvCat.map(s => s.nombre);

    // 3) registrar concluido y limpiar activo+detalle
    await prisma.servicios_concluidos.create({
      data: {
        id_cliente: prev.id_cliente,
        id_vehiculo: prev.id_vehiculo,
        cliente_nombre: prev.cliente_nombre,
        placa: prev.placa,
        tipo: prev.tipo as any,
        fecha: prev.fecha!,
        servicios_json: JSON.stringify(serviciosNombres),
        observaciones: updated.observaciones ?? undefined,
      }
    });
    await prisma.detalle_servicio_activo.deleteMany({ where: { id_servicio_activo: id } });
    await prisma.servicios_activos.delete({ where: { id_servicio_activo: id } });
  }

  res.json({ ok: true });
});

// Eliminar servicio activo (borra detalles asociados)
r.delete("/:id", auth, requirePerm("servicio.activo:update"), async (req, res) => {
  const id = Number(req.params.id);
  const exists = await prisma.servicios_activos.findUnique({ where: { id_servicio_activo: id } });
  if (!exists) return res.status(404).json({ error: "NO_EXISTE" });
  await prisma.detalle_servicio_activo.deleteMany({ where: { id_servicio_activo: id } });
  await prisma.servicios_activos.delete({ where: { id_servicio_activo: id } });
  res.status(204).end();
});

export default r;
