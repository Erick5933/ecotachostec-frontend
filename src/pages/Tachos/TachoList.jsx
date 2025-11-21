import { useEffect, useState } from "react";
import { getTachos, deleteTacho } from "../../api/tachoApi";

const TachoList = () => {
  const [tachos, setTachos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTachos = async () => {
    setLoading(true);
    try {
      const data = await getTachos();
      setTachos(data);
    } catch (err) {
      setError("No se pudieron cargar los tachos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este tacho?")) return;
    try {
      await deleteTacho(id);
      setTachos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Error al eliminar el tacho");
    }
  };

  useEffect(() => {
    fetchTachos();
  }, []);

  if (loading) return <p>Cargando tachos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Lista de Tachós</h2>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tachos.map((tacho) => (
            <tr key={tacho.id}>
              <td>{tacho.codigo}</td>
              <td>{tacho.nombre}</td>
              <td>{`${tacho.ubicacion_lat}, ${tacho.ubicacion_lon}`}</td>
              <td>{tacho.descripcion}</td>
              <td>
                <button onClick={() => handleDelete(tacho.id)}>Eliminar</button>
                {/* Puedes agregar un botón para editar o ver detalle */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TachoList;
