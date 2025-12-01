import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { UserPlus, Save, X, Mail, User, Shield, Lock, Phone, MapPin } from "lucide-react";
import api from "../../api/axiosConfig";
import {
  getProvincias,
  getCiudades,
  getCantones,
} from "../../api/ubicacionApi";

import "../adminPages.css";

const UsuarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cantones, setCantones] = useState([]);

  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    provincia: "",
    ciudad: "",
    canton: "",
    rol: "user",
    password: "",
    confirmPassword: "",
  });

  // ================================
  //  CARGA DE CATÁLOGOS
  // ================================
  const loadProvincias = async () => {
    const res = await getProvincias();
    setProvincias(res.data);
  };

  const loadCiudades = async (provinciaId) => {
    const res = await getCiudades();
    setCiudades(res.data.filter((c) => c.provincia === Number(provinciaId)));
  };

  const loadCantones = async (ciudadId) => {
    const res = await getCantones();
    setCantones(res.data.filter((c) => c.ciudad === Number(ciudadId)));
  };

  // ================================
  //  CARGAR USUARIO PARA EDITAR
  // ================================
  const loadUsuario = async () => {
    try {
      const res = await api.get(`/usuarios/${id}/`);

      setUsuario({
        nombre: res.data.nombre,
        email: res.data.email,
        telefono: res.data.telefono,
        provincia: res.data.provincia_id,
        ciudad: res.data.ciudad_id,
        canton: res.data.canton_id,
        rol: res.data.rol,
        password: "",
        confirmPassword: "",
      });

      await loadCiudades(res.data.provincia_id);
      await loadCantones(res.data.ciudad_id);
    } catch (e) {
      setError("No se pudo cargar la información del usuario");
    }
  };

  useEffect(() => {
    loadProvincias();
    if (id) loadUsuario();
  }, [id]);

  // ================================
  //  HANDLERS
  // ================================
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
    setError("");
  };

  const handleProvinciaChange = async (e) => {
    const provinciaId = e.target.value;
    setUsuario({
      ...usuario,
      provincia: provinciaId,
      ciudad: "",
      canton: "",
    });

    await loadCiudades(provinciaId);
    setCantones([]);
  };

  const handleCiudadChange = async (e) => {
    const ciudadId = e.target.value;
    setUsuario({
      ...usuario,
      ciudad: ciudadId,
      canton: "",
    });

    await loadCantones(ciudadId);
  };

  // ================================
  //  VALIDACIÓN
  // ================================
  const validateForm = () => {
    if (!usuario.nombre || !usuario.email || !usuario.telefono)
      return setError("Todos los campos son obligatorios"), false;

    if (!usuario.provincia || !usuario.ciudad || !usuario.canton)
      return setError("Selecciona provincia, ciudad y cantón"), false;

    if (!id && !usuario.password)
      return setError("La contraseña es obligatoria para usuarios nuevos"), false;

    if (usuario.password !== usuario.confirmPassword)
      return setError("Las contraseñas no coinciden"), false;

    if (usuario.password && usuario.password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres"), false;

    return true;
  };

  // ================================
  //  GUARDAR
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dataToSend = {
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        provincia_id: usuario.provincia,
        ciudad_id: usuario.ciudad,
        canton_id: usuario.canton,
        rol: usuario.rol,
      };

      if (usuario.password) dataToSend.password = usuario.password;

      if (id) {
        await api.put(`/usuarios/${id}/`, dataToSend);
      } else {
        await api.post("/usuarios/", dataToSend);
      }

      navigate("/usuarios");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          "Error al guardar usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  //  UI
  // ================================
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>
          <UserPlus style={{ marginRight: 12 }} />
          {id ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <X /> {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={usuario.nombre}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={usuario.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={usuario.telefono}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Provincia */}
            <div className="form-group">
              <label>Provincia</label>
              <select
                name="provincia"
                value={usuario.provincia}
                onChange={handleProvinciaChange}
                className="form-input"
                required
              >
                <option value="">Seleccione provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div className="form-group">
              <label>Ciudad</label>
              <select
                name="ciudad"
                value={usuario.ciudad}
                onChange={handleCiudadChange}
                className="form-input"
                required
              >
                <option value="">Seleccione ciudad</option>
                {ciudades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantón */}
            <div className="form-group">
              <label>Cantón</label>
              <select
                name="canton"
                value={usuario.canton}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Seleccione cantón</option>
                {cantones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Rol */}
            <div className="form-group form-grid-full">
              <label>Rol</label>
              <select
                name="rol"
                value={usuario.rol}
                onChange={handleChange}
                className="form-input"
              >
                <option value="user">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>{id ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
              <input
                type="password"
                name="password"
                value={usuario.password}
                onChange={handleChange}
                className="form-input"
                {...(!id && { required: true })}
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={usuario.confirmPassword}
                onChange={handleChange}
                className="form-input"
                {...(!id && { required: true })}
              />
            </div>
          </div>

          <div className="form-actions">
            <Link to="/usuarios" className="btn btn-secondary">
              <X /> Cancelar
            </Link>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : id ? "Actualizar Usuario" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioForm;
