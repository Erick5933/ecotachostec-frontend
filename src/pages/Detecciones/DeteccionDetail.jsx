import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";

const DeteccionDetail = () => {
  const { id } = useParams();
  const [deteccion, setDeteccion] = useState(null);

  const loadDeteccion = async () => {
    try {
      const res = await api.get(`/deteccion/${id}/`);
      setDeteccion(res.data);
    } catch (e) {
      console.error("Error cargando detección", e);
    }
  };

  useEffect(() => {
    loadDeteccion();
  }, [id]);

  if (!deteccion) return <p>Cargando detalle...</p>;

  return (
    <div>
      <h2>Detalle de Detección #{id}</h2>

      <p><b>Tacho:</b> {deteccion.tacho_nombre}</p>
      <p><b>Tipo residuo:</b> {deteccion.tipo_residuo}</p>
      <p><b>Confianza:</b> {deteccion.confianza}%</p>
      <p><b>Fecha:</b> {deteccion.fecha}</p>

      {deteccion.imagen && (
        <div>
          <h4>Imagen</h4>
          <img src={deteccion.imagen} alt="Detección" width="400" />
        </div>
      )}
    </div>
  );
};

export default DeteccionDetail;
