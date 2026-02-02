// Utilidades generales del frontend

export const pickDeteccionImage = (deteccion) => {
	if (!deteccion) return null;
	return (
		deteccion.imagen ||
		deteccion.imagen_analizada ||
		deteccion.imagen_procesada ||
		deteccion.imagen_url ||
		deteccion.image ||
		null
	);
};

export const resolveMediaUrl = (url) => {
	if (!url) return null;
	// Ya absoluta: en producción, evitar hosts localhost y forzar origen del backend
	if (/^https?:\/\//i.test(url)) {
		if (!import.meta.env.DEV) {
			try {
				const u = new URL(url);
				const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(u.hostname);
				if (isLocal) {
					const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
					const origin = typeof apiBase === 'string' ? apiBase.replace(/\/?api\/?$/, '') : window.location.origin;
					// Mantener el path original
					return origin.replace(/\/$/, '') + u.pathname + (u.search || '');
				}
			} catch (_) {
				// Si falla URL, devolver tal cual
				return url;
			}
		}
		return url;
	}

	// Asegurar que la ruta comience con '/'
	const path = url.startsWith('/') ? url : `/${url}`;

	// Si es ruta de media, construir origen correcto
	if (path.startsWith('/media')) {
		let origin;
		if (import.meta.env.DEV) {
			origin = 'http://localhost:8000';
		} else {
			const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
			origin = typeof apiBase === 'string' ? apiBase.replace(/\/?api\/?$/, '') : window.location.origin;
		}
		return origin + path;
	}

	// Cualquier otro relativo: devolver tal cual (el navegador resolverá contra el origen del sitio)
	return path;
};

export default {
	pickDeteccionImage,
	resolveMediaUrl,
};
