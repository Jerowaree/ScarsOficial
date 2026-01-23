import { useState, useEffect } from "react";
import { UserPlus, Search, Trash2, Shield, Mail, User, X, RefreshCw, Edit } from "lucide-react";
import { listUsuarios, createUsuario, updateUsuario, deleteUsuario } from "@/features/usuarios/api";
import "./Usuarios.css";

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ nombre: "", correo: "", contrasena: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await listUsuarios();
            setUsuarios(data);
        } catch (err) {
            // Silencio
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError("");

            if (editingUser) {
                await updateUsuario(editingUser.id_usuario, formData);
            } else {
                await createUsuario(formData);
            }

            setShowModal(false);
            setEditingUser(null);
            setFormData({ nombre: "", correo: "", contrasena: "" });
            loadData();
        } catch (err) {
            setError(err?.response?.data?.error || "Error al procesar la solicitud");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            correo: user.correo,
            contrasena: "" // Vacío para no cambiarla a menos que se escriba
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este administrador?")) return;
        try {
            await deleteUsuario(id);
            loadData();
        } catch (err) {
            // Silencio
        }
    };

    const filtered = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.correo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="usuarios-page">
            <header className="usuarios-header">
                <div>
                    <h1>Gestión de Administradores</h1>
                    <p>Administra quiénes tienen acceso al panel de control</p>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <UserPlus size={20} /> Nuevo Admin
                </button>
            </header>

            <div className="usuarios-actions">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn-refresh" onClick={loadData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? "spinning" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Cargando usuarios...</div>
            ) : (
                <div className="usuarios-grid">
                    {filtered.map((user) => (
                        <div key={user.id_usuario} className="user-card">
                            <div className="user-avatar">
                                <Shield size={24} />
                            </div>
                            <div className="user-info">
                                <h3>{user.nombre}</h3>
                                <p className="user-email"><Mail size={14} /> {user.correo}</p>
                                <div className="user-tags">
                                    {user.roles.map(r => (
                                        <span key={r} className="role-tag">{r}</span>
                                    ))}
                                    <span className={`status-tag ${user.estado}`}>{user.estado}</span>
                                </div>
                            </div>
                            <div className="user-card-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => handleEdit(user)}
                                    title="Editar administrador"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(user.id_usuario)}
                                    title="Eliminar administrador"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="empty-state">No se encontraron usuarios</div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingUser ? "Editar Administrador" : "Nuevo Administrador"}</h2>
                            <button onClick={() => {
                                setShowModal(false);
                                setEditingUser(null);
                                setFormData({ nombre: "", correo: "", contrasena: "" });
                            }}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <div className="form-error">{error}</div>}
                            <div className="form-group">
                                <label><User size={16} /> Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div className="form-group">
                                <label><Mail size={16} /> Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    placeholder="admin@scars.com.pe"
                                />
                            </div>
                            <div className="form-group">
                                <label><Shield size={16} /> {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña Inicial"}</label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.contrasena}
                                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                                    placeholder={editingUser ? "Dejar en blanco para no cambiar" : "••••••••"}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => {
                                    setShowModal(false);
                                    setEditingUser(null);
                                    setFormData({ nombre: "", correo: "", contrasena: "" });
                                }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? "Procesando..." : (editingUser ? "Guardar Cambios" : "Crear Administrador")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
