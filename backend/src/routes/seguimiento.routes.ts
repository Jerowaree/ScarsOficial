import { Router } from "express";
import { prisma } from "../db/prisma";
import cors from 'cors';

const r = Router();

r.use(cors());

r.get("/consulta/:codigo", async (req, res) => {
  const codigo = req.params.codigo;

  try {
    let servicio = await prisma.servicios_activos.findFirst({
      where: {
        numero_seguimiento: codigo
      },
      include: {
        clientes: {
          select: {
            nombres: true,
            apellidos: true
          }
        },
        vehiculos: {
          select: {
            marca: true,
            modelo: true,
            anio: true,
            color: true
          }
        }
      }
    });

    // Si no encontramos, intentamos una búsqueda más flexible
    if (!servicio) {
      servicio = await prisma.servicios_activos.findFirst({
        where: {
          numero_seguimiento: {
            contains: codigo
          }
        },
        include: {
          clientes: {
            select: {
              nombres: true,
              apellidos: true
            }
          },
          vehiculos: {
            select: {
              marca: true,
              modelo: true,
              anio: true,
              color: true
            }
          }
        }
      });
    }

    // Intentamos buscar en servicios activos con una búsqueda más detallada
    if (!servicio) {
      const servicios = await prisma.servicios_activos.findMany({
        where: {
          OR: [
            { numero_seguimiento: codigo },
            { placa: codigo }
          ]
        },
        include: {
          clientes: true,
          vehiculos: true
        }
      });

      if (servicios.length > 0) {
        return res.json(servicios[0]);
      }
    }

    if (!servicio) {
      return res.status(404).json({
        message: "No se encontró ningún servicio con ese código de seguimiento."
      });
    }

    res.json(servicio);
  } catch (error) {
    console.error('Error al consultar seguimiento:', error);
    res.status(500).json({
      message: "Error al consultar el servicio. Por favor, intente nuevamente."
    });
  }
});

export default r;