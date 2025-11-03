import { useState } from "react";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import "./Perfil.css";

export default function Perfil() {
  const [perfil, setPerfil] = useState({
    nombres: "Admin",
    apellidos: "Usuario",
    correo: "admin@scars.com",
    telefono: "999888777",
    direccion: "Lima, Perú",
  });

  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
    // Aquí iría la lógica para guardar en el backend
    console.log("Perfil guardado:", perfil);
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <button 
          className={`btn-${editing ? 'primary' : 'secondary'}`}
          onClick={editing ? handleSave : () => setEditing(true)}
        >
          {editing ? <><Save size={16} /> Guardar</> : 'Editar'}
        </button>
      </div>

      <div className="perfil-card">
        <div className="perfil-avatar">
          <User size={48} />
        </div>

        <div className="perfil-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombres</label>
              <input
                type="text"
                value={perfil.nombres}
                onChange={(e) => setPerfil({...perfil, nombres: e.target.value})}
                disabled={!editing}
              />
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <input
                type="text"
                value={perfil.apellidos}
                onChange={(e) => setPerfil({...perfil, apellidos: e.target.value})}
                disabled={!editing}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Mail size={16} /> Correo</label>
              <input
                type="email"
                value={perfil.correo}
                onChange={(e) => setPerfil({...perfil, correo: e.target.value})}
                disabled={!editing}
              />
            </div>
            <div className="form-group">
              <label><Phone size={16} /> Teléfono</label>
              <input
                type="tel"
                value={perfil.telefono}
                onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
                disabled={!editing}
              />
            </div>
          </div>

          <div className="form-group">
            <label><MapPin size={16} /> Dirección</label>
            <input
              type="text"
              value={perfil.direccion}
              onChange={(e) => setPerfil({...perfil, direccion: e.target.value})}
              disabled={!editing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
