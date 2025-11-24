import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";

const UsuarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    rol: "",
    telefono: "",
    provincia: "",
    canton: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);

  const loadUsuario = async () => {
    try {
      const res = await api.get(`/usuarios/${id}/`);
      setUsuario({
        nombre: res.data.nombre,
        email: res.data.email,
        rol: res.data.rol,
        telefono: res.data.telefono,
        provincia: res.data.provincia,
        canton: res.data.canton,
      });
    } catch (e) {
      console.error("Error cargando usuario", e);
    }
  };

  const loadProvinciasCantones = async () => {
    try {
      const p = await api.get("/provincias/");
      const c = await api.get("/cantones/");
      setProvincias(p.data);
      setCantones(c.data);
    } catch (e) {
      console.error("Error cargando ubicaciones", e);
    }
  };

  useEffect(() => {
    loadProvinciasCantones();
    if (id) loadUsuario();
  }, [id]);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await api.put(`/usuarios/${id}/`, usuario);
      } else {
        await api.post("/usuarios/", usuario);
      }
      navigate("/dashboard/usuarios");
    } catch (e) {
      console.error("Error guardando usuario", e);
      alert("Error al guardar");
    }
  };

  return (
    <div>
      <h2>{id ? "Editar Usuario" : "Nuevo Usuario"}</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <label>Nombre:</label>
        <input name="nombre" value={usuario.nombre} onChange={handleChange} />

        <br /><br />

        <label>Email:</label>
        <input name="email" value={usuario.email} onChange={handleChange} />

        <br /><br />

        <label>Rol:</label>
        <select name="rol" value={usuario.rol} onChange={handleChange}>
          <option value="">Seleccione</option>
          <option value="admin">Admin</option>
          <option value="operador">Operador</option>
          <option value="usuario">Usuario</option>
        </select>

        <br /><br />

        <label>Teléfono:</label>
        <input name="telefono" value={usuario.telefono} onChange={handleChange} />

        <br /><br />

        <label>Provincia:</label>
        <select name="provincia" value={usuario.provincia} onChange={handleChange}>
          <option value="">Seleccione</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Cantón:</label>
        <select name="canton" value={usuario.canton} onChange={handleChange}>
          <option value="">Seleccione</option>
          {cantones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        <button type="submit">💾 Guardar</button>
      </form>
    </div>
  );
};

export default UsuarioForm;
