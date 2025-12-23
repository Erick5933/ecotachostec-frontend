import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, PlusCircle } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

export default function DeteccionList() {
  const [detecciones, setDetecciones] = useState([]);

  useEffect(() => {
    api.get("/detecciones/")
      .then(res => setDetecciones(res.data))
      .catch(err => console.error("Error cargando detecciones:", err));
  }, []);

  return (
    <div className="admin-page">
      <h2>
        <Brain /> Detecciones IA
      </h2>

      <Link to="/detecciones/ia" className="btn btn-primary">
        <PlusCircle /> Nueva detección IA
      </Link>

      {/* aquí luego va la tabla o cards */}
    </div>
  );
}
