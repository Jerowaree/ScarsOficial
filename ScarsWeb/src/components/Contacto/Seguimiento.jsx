import React, { useState } from 'react';
import './Seguimiento.css';

const estadosSimulados = {
  'ABC123': 'En diagnóstico',
  'DEF456': 'En reparación',
  'XYZ999': 'Listo para entrega',
};

const Seguimiento = () => {
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState(null);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (codigo.trim() === '') {
      setError('Por favor ingresa un código.');
      setEstado(null);
      return;
    }
    setError(null);
    const estadoActual = estadosSimulados[codigo.trim().toUpperCase()];
    if (estadoActual) {
      setEstado(estadoActual);
    } else {
      setEstado('No se encontró el código ingresado.');
    }
  };

  return (
    <div className="ct-seguimiento-container">
      <h2>Seguimiento de Servicio</h2>
      <form onSubmit={handleBuscar} className="ct-seguimiento-form">
        <input
          type="text"
          placeholder="Ingresa tu código de seguimiento"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          className="ct-seguimiento-input"
        />
        <button type="submit" className="ct-seguimiento-btn">Buscar</button>
      </form>
      {error && <p className="ct-seguimiento-error">{error}</p>}
      {estado && <p className="ct-seguimiento-estado">{estado}</p>}
    </div>
  );
};

export default Seguimiento;
