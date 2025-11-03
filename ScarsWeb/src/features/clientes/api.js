// src/features/clientes/api.js
import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import { updateVehiculo, createVehiculo } from "@/features/vehiculos/api";

/** 🔹 Listar clientes (con búsqueda opcional) */
export async function listClientes(q) {
  try {
    // Obtener clientes y vehículos por separado y combinarlos
    console.log("Obteniendo clientes...");
    const clientesRes = await api.get(ENDPOINTS.clientes, { params: { q } });
    console.log("Clientes obtenidos:", clientesRes.data);
    
    console.log("Obteniendo vehículos...");
    const vehiculosRes = await api.get(ENDPOINTS.vehiculos);
    console.log("Vehículos obtenidos:", vehiculosRes.data);
    
    const clientes = clientesRes.data || [];
    const vehiculos = vehiculosRes.data || [];
    
    console.log(`Total clientes: ${clientes.length}`);
    console.log(`Total vehículos: ${vehiculos.length}`);
    
    // Combinar clientes con sus vehículos
    const clientesConVehiculos = clientes.map(cliente => {
      const vehiculo = vehiculos.find(v => v.id_cliente === cliente.id_cliente);
      console.log(`Cliente ${cliente.nombres} (ID: ${cliente.id_cliente}):`, vehiculo ? `Vehículo encontrado (${vehiculo.placa})` : "Sin vehículo");
      return {
        ...cliente,
        vehiculo: vehiculo || null
      };
    });
    
    console.log("Clientes combinados con vehículos:", clientesConVehiculos);
    
    // Verificar cuántos tienen vehículos
    const conVehiculos = clientesConVehiculos.filter(c => c.vehiculo);
    console.log(`Resultado final: ${conVehiculos.length}/${clientesConVehiculos.length} clientes con vehículos`);
    
    return clientesConVehiculos;
  } catch (error) {
    console.error("Error obteniendo clientes y vehículos:", error);
    throw error;
  }
}

/** 🔹 Crear cliente con su vehículo */
export async function createClienteWithVehiculo(payload) {
  const res = await api.post(`${ENDPOINTS.clientes}/with-vehiculo`, payload);
  return res.data;
}

/** 🔹 Actualizar cliente */
export async function updateCliente(id_cliente, data) {
  const res = await api.put(`${ENDPOINTS.clientes}/${id_cliente}`, data);
  return res.data;
}

/** 🔹 Actualizar cliente con su vehículo */
export async function updateClienteWithVehiculo(id_cliente, payload) {
  try {
    // Intentar usar endpoint específico si existe
    const res = await api.put(`${ENDPOINTS.clientes}/${id_cliente}/with-vehiculo`, payload);
    return res.data;
  } catch (error) {
    console.warn("Endpoint with-vehiculo no disponible, usando actualización separada:", error);
    
    // Fallback: actualizar cliente y vehículo por separado
    const { cliente, vehiculo } = payload;
    
    // Actualizar cliente
    await updateCliente(id_cliente, cliente);
    
    // Si hay datos de vehículo, actualizarlo o crearlo
    if (vehiculo) {
      // Primero obtener vehículos del cliente para ver si ya existe
      const vehiculosRes = await api.get(ENDPOINTS.vehiculos, { 
        params: { id_cliente } 
      });
      const vehiculosExistentes = vehiculosRes.data || [];
      const vehiculoExistente = vehiculosExistentes.find(v => v.id_cliente === id_cliente);
      
      if (vehiculoExistente) {
        // Actualizar vehículo existente
        console.log("Actualizando vehículo existente:", vehiculoExistente.id_vehiculo);
        await updateVehiculo(vehiculoExistente.id_vehiculo, {
          ...vehiculo,
          id_cliente
        });
      } else {
        // Crear nuevo vehículo
        console.log("Creando nuevo vehículo para cliente:", id_cliente);
        await createVehiculo({
          ...vehiculo,
          id_cliente
        });
      }
    }
    
    return { success: true };
  }
}

/** 🔹 Eliminar cliente */
export async function deleteCliente(id_cliente) {
  await api.delete(`${ENDPOINTS.clientes}/${id_cliente}`);
}
