import React, { useState } from 'react';
// ✅ 1. Importar el objeto de configuración.
import { useLanguage } from '../context/LanguageContext'; 

// ✅ 2. El componente ahora recibe 'language' como un prop desde App.jsx.
function Legend() {
    const [isOpen, setIsOpen] = useState(false);

    // ✅ 3. Obtenemos el paquete de textos y datos para el idioma actual.
    // Si el idioma no existiera, por seguridad usa 'es'.
    const { localized } = useLanguage();

    return (
        <div className="legend-container">
            {/* ✅ 4. Usamos los textos del objeto 'localized' para los botones. */}
            <button onClick={() => setIsOpen(!isOpen)} className="legend-toggle-button">
                {isOpen ? localized.ui.legend.hide : localized.ui.legend.show}
                <span className={`legend-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>
            
            {/* Renderiza el contenido de la leyenda solo si 'isOpen' es verdadero */}
            {isOpen && (
                <div className="legend-content">
                    <table className="legend-table">
                        <thead>
                            <tr>
                                {/* ✅ 5. Usamos los textos de los encabezados desde 'localized'. */}
                                <th>{localized.ui.legend.headers.abbr}</th>
                                <th>{localized.ui.legend.headers.category}</th>
                                <th>{localized.ui.legend.headers.desc}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* ✅ 6. Mapeamos los datos de la leyenda desde 'localized' en lugar de una constante local. */}
                            {localized.componentData.legend.map((item) => (
                                <tr key={item.abbr}>
                                    <td><strong>{item.abbr}</strong></td>
                                    <td>{item.name}</td>
                                    <td>{item.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Legend;