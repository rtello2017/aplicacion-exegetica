import React, { useState } from 'react';

// Datos de la leyenda basados en la tabla que creamos.
const legendData = [
    { abbr: 'N-', name: 'Sustantivo (Noun)', desc: 'Nombres de personas, lugares, cosas o ideas.' },
    { abbr: 'V-', name: 'Verbo (Verb)', desc: 'Palabras que expresan acciones o estados del ser.' },
    { abbr: 'A-', name: 'Adjetivo (Adjective)', desc: 'Palabras que describen o califican a un sustantivo.' },
    { abbr: 'P-', name: 'Pronombre Personal', desc: 'Palabras como "yo", "tú", "él", que sustituyen a un sustantivo.' },
    { abbr: 'RP', name: 'Pronombre Relativo', desc: 'Palabras como "que", "el cual", "quien", que introducen una cláusula relativa.' },
    { abbr: 'RA', name: 'Pronombre Demostrativo', desc: 'Palabras como "este", "ese", "aquel", que señalan a un sustantivo.' },
    { abbr: 'RD', name: 'Pronombre Indefinido', desc: 'Palabras como "alguien", "alguno", "cierto", que no especifican a quién se refieren.' },
    { abbr: 'RI', name: 'Pronombre Interrogativo', desc: 'Palabras como "¿quién?", "¿qué?", "¿cuál?", usadas para preguntar.' },
    { abbr: 'D-', name: 'Artículo Definido', desc: 'El, la, los, las. En griego: ὁ, ἡ, τό.' },
    { abbr: 'C-', name: 'Conjunción (Conjunction)', desc: 'Palabras como "y", "pero", "o", que unen palabras u oraciones.' },
    { abbr: 'RR', name: 'Adverbio (Adverb)', desc: 'Palabras que modifican a un verbo, adjetivo u otro adverbio.' },
    { abbr: 'I-', name: 'Interjección (Interjection)', desc: 'Expresiones como "¡oh!", "¡he aquí!".' },
    { abbr: 'X-', name: 'Partícula (Particle)', desc: 'Palabras que no encajan fácilmente en otras categorías.' },
];

function Legend() {
    // Estado para controlar si la leyenda está visible o no.
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="legend-container">
            <button onClick={() => setIsOpen(!isOpen)} className="legend-toggle-button">
                {isOpen ? 'Ocultar Leyenda' : 'Mostrar Leyenda de Abreviaturas'}
                <span className={`legend-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>
            {/* Renderiza el contenido de la leyenda solo si 'isOpen' es verdadero */}
            {isOpen && (
                <div className="legend-content">
                    <table className="legend-table">
                        <thead>
                            <tr>
                                <th>Abreviatura</th>
                                <th>Categoría Gramatical</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {legendData.map((item) => (
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
