import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { UserPlus, Save, X, Mail, User, Shield, Lock, Phone, MapPin } from "lucide-react";
import api from "../../api/axiosConfig";
import {
  getProvincias,
  getCiudades,
  getCantones,
} from "../../api/ubicacionApi";
import {
  validarCampo,
  validarSoloLetras,
  validarEmail,
  validarTelefono,
  validarContrasena,
  sanitizarEntrada,
  capitalizarPrimerLetra,
} from "../../utils/validations";

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

  // Estado para errores de validación por campo
  const [erroresCampos, setErroresCampos] = useState({});

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    const { name, value } = e.target;
    let valorSanitizado = sanitizarEntrada(value);
    
    // Aplicar restricciones por campo
    if (name === 'nombre') {
      valorSanitizado = valorSanitizado.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'telefono') {
      valorSanitizado = valorSanitizado.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (name === 'email') {
      valorSanitizado = valorSanitizado.toLowerCase().trim();
    }
    
    setUsuario({ ...usuario, [name]: valorSanitizado });
    
    // Validar el campo cuando cambia
    validarCampoIndividual(name, valorSanitizado);
    setError("");
  };

  const validarCampoIndividual = (nombreCampo, valor) => {
    const nuevosErrores = { ...erroresCampos };
    
    if (nombreCampo === 'nombre') {
      const resultado = validarCampo(valor, 'nombre', { requerido: true, minimo: 2, maximo: 100 });
      if (resultado.valido) {
        delete nuevosErrores.nombre;
      } else {
        nuevosErrores.nombre = resultado.error;
      }
    } else if (nombreCampo === 'email') {
      const resultado = validarCampo(valor, 'email', { requerido: true });
      if (resultado.valido) {
        delete nuevosErrores.email;
      } else {
        nuevosErrores.email = resultado.error;
      }
    } else if (nombreCampo === 'telefono') {
      const resultado = validarCampo(valor, 'telefono', { requerido: true });
      if (resultado.valido) {
        delete nuevosErrores.telefono;
      } else {
        nuevosErrores.telefono = resultado.error;
      }
    } else if (nombreCampo === 'password' && valor) {
      const resultado = validarCampo(valor, 'contrasena');
      if (resultado.valido) {
        delete nuevosErrores.password;
      } else {
        nuevosErrores.password = resultado.error;
      }
    }
    
    setErroresCampos(nuevosErrores);
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
    // Limpiar errores previos
    const nuevosErrores = {};
    let valido = true;

    // Validar nombre
    const validNombre = validarCampo(usuario.nombre, 'nombre', { requerido: true, minimo: 2, maximo: 100 });
    if (!validNombre.valido) {
      nuevosErrores.nombre = validNombre.error;
      valido = false;
    }

    // Validar email
    const validEmail = validarCampo(usuario.email, 'email', { requerido: true });
    if (!validEmail.valido) {
      nuevosErrores.email = validEmail.error;
      valido = false;
    }

    // Validar teléfono
    const validTelefono = validarCampo(usuario.telefono, 'telefono', { requerido: true });
    if (!validTelefono.valido) {
      nuevosErrores.telefono = validTelefono.error;
      valido = false;
    }

    // Validar ubicación
    if (!usuario.provincia || !usuario.ciudad || !usuario.canton) {
      setError("Selecciona provincia, ciudad y cantón");
      valido = false;
    }

    // Validar contraseña
    if (!id && !usuario.password) {
      nuevosErrores.password = "La contraseña es obligatoria para usuarios nuevos";
      valido = false;
    } else if (usuario.password) {
      const validPassword = validarCampo(usuario.password, 'contrasena');
      if (!validPassword.valido) {
        nuevosErrores.password = validPassword.error;
        valido = false;
      }

      if (usuario.password !== usuario.confirmPassword) {
        nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
        valido = false;
      }
    }

    setErroresCampos(nuevosErrores);
    return valido;
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
                className={`form-input ${erroresCampos.nombre ? 'input-error' : ''}`}
                required
              />
              {erroresCampos.nombre && (
                <span className="input-error-msg">{erroresCampos.nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={usuario.email}
                onChange={handleChange}
                className={`form-input ${erroresCampos.email ? 'input-error' : ''}`}
                required
              />
              {erroresCampos.email && (
                <span className="input-error-msg">{erroresCampos.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Teléfono (10 dígitos)</label>
              <input
                type="text"
                name="telefono"
                value={usuario.telefono}
                onChange={handleChange}
                className={`form-input ${erroresCampos.telefono ? 'input-error' : ''}`}
                maxLength="10"
                placeholder="0912345678"
                required
              />
              {erroresCampos.telefono && (
                <span className="input-error-msg">{erroresCampos.telefono}</span>
              )}
              {usuario.telefono && !erroresCampos.telefono && (
                <span style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '4px' }}>✓ Válido</span>
              )}
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
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={usuario.password}
                  onChange={handleChange}
                  className={`form-input ${erroresCampos.password ? 'input-error' : ''}`}
                  placeholder="Min. 8 caracteres, mayúscula, minúscula y número"
                  {...(!id && { required: true })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {erroresCampos.password && (
                <span className="input-error-msg">{erroresCampos.password}</span>
              )}
              {usuario.password && !erroresCampos.password && (
                <span style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '4px' }}>✓ Contraseña fuerte</span>
              )}
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={usuario.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${erroresCampos.confirmPassword ? 'input-error' : ''}`}
                  {...(!id && { required: true })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {erroresCampos.confirmPassword && (
                <span className="input-error-msg">{erroresCampos.confirmPassword}</span>
              )}
              {usuario.confirmPassword && usuario.password === usuario.confirmPassword && !erroresCampos.confirmPassword && (
                <span style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '4px' }}>✓ Coinciden</span>
              )}
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
