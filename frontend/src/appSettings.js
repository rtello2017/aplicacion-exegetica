// src/appSettings.js

/**
 * CONFIGURACIÓN GLOBAL (Independiente del idioma)
 * Aquí van las configuraciones que no cambian entre idiomas, como las URLs.
 */
const globalSettings = {
    languages: [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' }
    ],
    urls: {
        // Plantilla para la URL de consulta de los números Strong.
        // {strongs} es el placeholder que será reemplazado por el número.
        strongs: 'https://biblehub.com/greek/{strongs}.htm',
        
        // Clave que se debe descomentar para la versión en DESARROLLO
        //apiBase: 'http://localhost:4000/api'
        
        // Clave que se debe descomentar para la versión en PRODUCCION
        apiBase: '/api',
    },
};

/**
 * LOCALIZACIONES (Textos y datos específicos para cada idioma)
 * Cada clave de primer nivel es un código de idioma (ej: 'es', 'en').
 */
const localizations = {
    // =====================================================================
    // ESPAÑOL (es)
    // =====================================================================
    es: {
        ui: {
            legend: {
                show: 'Mostrar Leyenda de Abreviaturas',
                hide: 'Ocultar Leyenda',
                headers: {
                    abbr: 'Abreviatura',
                    category: 'Categoría Gramatical',
                    desc: 'Descripción'
                }
            },
            passageSelector: {
                book: 'Libro',
                chapter: 'Capítulo',
                verse: 'Versículo',
                selectBook: 'Selecciona un libro',
                allVerses: 'TODOS',
                rangePlaceholder: 'Ej: John 3:16-18',
                loadButton: 'Cargar Pasaje'
            },
            passageNavigator: {
                prevBook: 'Libro Anterior',
                prevVerse: 'Versículo Anterior',
                nextVerse: 'Siguiente Versículo',
                nextBook: 'Siguiente Libro',
                add: 'Añadir Pasaje al Lienzo',
                print: 'Imprimir Pasaje',
                exportPdf: 'Exportar Pasaje a PDF'
            },
            studyNotes: {
                title: 'Notas de Estudio para: {reference}',
                noPassage: 'Ningún pasaje seleccionado',
                saveButton: 'Guardar Notas',
                exportPDFButton: 'Exportar Notas a PDF',
                exportWordButton: 'Exportar Notas a Word',
            },
            textViewer: {
                noPassage: 'Seleccione un pasaje para comenzar.',
                tooltipRoot: 'Raíz:',
                tooltipCategory: 'Categoría:',
                tooltipAnalysis: 'Análisis:',
                notAvailable: 'N/A'
            },
            syntaxDiagram: {
                importButton: 'Importar Texto',
                saveButton: 'Guardar Diagrama',
                clearButton: 'Limpiar Lienzo',
                exportPng: 'Exportar PNG',
                exportPdf: 'Exportar PDF',
                fitScreen: 'Ajustar al lienzo',
                fullscreen: 'Pantalla Completa',
                panelWordsTitle: 'Palabras del Pasaje',
                panelConnectorsTitle: 'Conectores',
                customTextDefault: 'Doble clic para editar',
                importAlert: 'No hay palabras en el pasaje actual para importar.',
                toolLabels: {
                    baseline: "Línea Base",
                    modifier: "Modificador",
                    modifierInverse: "Mod. Inverso",
                    subjectPredicate: "Sujeto/Pred.",
                    directObject: "Obj. Directo",
                    indirectObject: "Obj. Indirecto",
                    conjunction: "Conjunción",
                    apposition: "Aposición",
                    conjunctionInverse: "Conj. Inversa",
                    appositionInverse: "Apos. Inversa",
                    customText: "Texto",
                    ellipse: "Elipse",
                    arrowLR: "Flecha →",
                    arrowRL: "Flecha ←",
                    arcArrowLR: "Arco →",
                    arcArrowRL: "Arco ←"
                }
            },
            analysisPopup: {
                editButton: 'Editar Cambios',
                saveButton: 'Guardar Cambios',
                yourAnalysisTitle: 'Tu Análisis',
                strongLabel: 'Strong:',
                translationLabel: 'Traducción:',
                rootLabel: 'Raíz:',
                transliterationLabel: 'Transliteración:',
                glossLabel: 'Glosa breve:',
                definitionLabel: 'Definición:',
                morphologyTitle: 'Análisis Morfológico',
                posLabel: 'Categoría Gramatical:',
                parsingLabel: 'Análisis Detallado:',
                statsTitle: 'Estadísticas del NT',
                loading: 'Cargando...',
                lemmaOccurrences: 'La raíz {lemma} aparece: {count} veces.',
                textOccurrences: 'La forma {text} aparece: {count} veces.',
                concordanceButton: 'Ver Concordancia',
                morphEditor: {
                    editButton: 'Corregir',
                    confirmMessage: '¿Estás seguro de que quieres corregir el análisis morfológico? Esta acción modificará los datos base de forma permanente.',
                    parsingCodeLabel: 'Código de Análisis:',
                    parsingPlaceholder: 'Ej: V-PAPNPM-',
                    cancelButton: 'Cancelar',
                    saveButton: 'Guardar Morfología'
                }
            },
            concordanceModal: {
                errorMsg: 'Error al cargar la concordancia.',
                title: 'Concordancia para "{word}"',
                loading: 'Cargando concordancia...',
                lemmaHeader: 'Raíz: {lemma} ({count} veces)',
                textHeader: 'Forma Exacta: {text} ({count} veces)'
            },
            diagramNode: {
                textPlaceholder: 'Doble clic'
            },
            app: {
                title: 'Proyecto Exegética Bíblica',
                languageLabel: 'Idioma:',
                tabPassage: 'Pasaje',
                tabDiagram: 'Diagrama',
                loading: 'Cargando...',
                noPassageLoaded: 'Ningún pasaje cargado',
                noPassageFound: 'Pasaje no encontrado',
                // Alertas para Diagramas
                selectPassageFirstDiagram: 'Por favor, seleccione un pasaje antes de guardar el diagrama.',
                diagramSaveSuccess: 'Diagrama guardado correctamente.',
                diagramSaveError: 'Error al guardar el diagrama.',
                diagramConnectionError: 'Error de conexión al guardar el diagrama.',
                // Alertas para Notas
                selectPassageFirstNotes: 'Por favor, seleccione un pasaje antes de guardar notas.',
                notesSaveSuccess: 'Notas guardadas correctamente.',
                notesSaveError: 'Error al guardar las notas.',
                notesConnectionError: 'Error de conexión al guardar las notas.',
                noTokenFound: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo',
                closeSession: 'Cerrar Sesión',
                verifyingSession: 'Verificando sesión...',
                sessionExpired: 'Sesión expirada.',
                apiError: 'Error en la petición a la API',
                analysisMorphologyError: 'Error al guardar el análisis morfológico.'
            },
            loginPage: {
                title: 'Iniciar Sesión',
                registerTitle: 'Crear Cuenta',
                usernameLabel: 'Usuario',
                passwordLabel: 'Contraseña',
                submitButton: 'Ingresar',
                registerButton: 'Registrarse',
                toggleToRegister: '¿No tienes una cuenta?',
                toggleToLogin: '¿Ya tienes una cuenta?',
                registerLink: 'Regístrate',
                loginLink: 'Inicia sesión',
                registerSuccess: '¡Registro exitoso! Por favor, inicia sesión.',
                genericError: 'Ocurrió un error.'
            }
        },
        componentData: {
            legend: [
                { abbr: 'N-', name: 'Sustantivo', desc: 'Nombres de personas, lugares, cosas o ideas.' },
                { abbr: 'V-', name: 'Verbo', desc: 'Palabras que expresan acciones o estados del ser.' },
                { abbr: 'A-', name: 'Adjetivo', desc: 'Palabras que describen o califican a un sustantivo.' },
                { abbr: 'P-', name: 'Pronombre Personal', desc: 'Palabras como "yo", "tú", "él", que sustituyen a un sustantivo.' },
                { abbr: 'RP', name: 'Pronombre Relativo', desc: 'Palabras como "que", "el cual", "quien", que introducen una cláusula relativa.' },
                { abbr: 'RA', name: 'Pronombre Demostrativo', desc: 'Palabras como "este", "ese", "aquel", que señalan a un sustantivo.' },
                { abbr: 'RD', name: 'Pronombre Indefinido', desc: 'Palabras como "alguien", "alguno", "cierto", que no especifican a quién se refieren.' },
                { abbr: 'RI', name: 'Pronombre Interrogativo', desc: 'Palabras como "¿quién?", "¿qué?", "¿cuál?", usadas para preguntar.' },
                { abbr: 'D-', name: 'Artículo Definido', desc: 'El, la, los, las. En griego: ὁ, ἡ, τό.' },
                { abbr: 'C-', name: 'Conjunción', desc: 'Palabras como "y", "pero", "o", que unen palabras u oraciones.' },
                { abbr: 'RR', name: 'Adverbio', desc: 'Palabras que modifican a un verbo, adjetivo u otro adverbio.' },
                { abbr: 'I-', name: 'Interjección', desc: 'Expresiones como "¡oh!", "¡he aquí!".' },
                { abbr: 'X-', name: 'Partícula', desc: 'Palabras que no encajan fácilmente en otras categorías.' },
            ]
        }
    },
    // =====================================================================
    // INGLÉS (en)
    // =====================================================================
    en: {
        ui: {
            legend: {
                show: 'Show Abbreviation Legend',
                hide: 'Hide Legend',
                headers: {
                    abbr: 'Abbr.',
                    category: 'Grammatical Category',
                    desc: 'Description'
                }
            },
            passageSelector: {
                book: 'Book',
                chapter: 'Chapter',
                verse: 'Verse',
                selectBook: 'Select a book',
                allVerses: 'ALL',
                rangePlaceholder: 'e.g., John 3:16-18',
                loadButton: 'Load Passage'
            },
            passageNavigator: {
                prevBook: 'Previous Book',
                prevVerse: 'Previous Verse',
                nextVerse: 'Next Verse',
                nextBook: 'Next Book',
                add: 'Add Passage to Canvas',
                print: 'Print Passage',
                exportPdf: 'Export Passage to PDF'
            },
            studyNotes: {
                title: 'Study Notes for: {reference}',
                noPassage: 'No passage selected',
                saveButton: 'Save Notes',
                exportPDFButton: 'Export Notes to PDF',
                exportWordButton: 'Export Notes to Word'
            },
            textViewer: {
                noPassage: 'Select a passage to begin.',
                tooltipRoot: 'Root:',
                tooltipCategory: 'Category:',
                tooltipAnalysis: 'Analysis:',
                notAvailable: 'N/A'
            },
            syntaxDiagram: {
                importButton: 'Import Text',
                saveButton: 'Save Diagram',
                clearButton: 'Clear Canvas',
                exportPng: 'Export PNG',
                exportPdf: 'Export PDF',
                fitScreen: 'Fit to Canvas',
                fullscreen: 'Fullscreen',
                panelWordsTitle: 'Passage Words',
                panelConnectorsTitle: 'Connectors',
                customTextDefault: 'Double-click to edit',
                importAlert: 'There are no words in the current passage to import.',
                toolLabels: {
                    baseline: "Baseline",
                    modifier: "Modifier",
                    modifierInverse: "Inverse Mod.",
                    subjectPredicate: "Subject/Pred.",
                    directObject: "Direct Obj.",
                    indirectObject: "Indirect Obj.",
                    conjunction: "Conjunction",
                    apposition: "Apposition",
                    conjunctionInverse: "Inverse Conj.",
                    appositionInverse: "Inverse Appos.",
                    customText: "Text",
                    ellipse: "Ellipse",
                    arrowLR: "Arrow →",
                    arrowRL: "Arrow ←",
                    arcArrowLR: "Arc →",
                    arcArrowRL: "Arc ←"
                }
            },
            analysisPopup: {
                editButton: 'Edit Changes',
                saveButton: 'Save Changes',
                yourAnalysisTitle: 'Your Analysis',
                strongLabel: 'Strong:',
                rootLabel: 'Root:',
                translationLabel: 'Translation:',
                transliterationLabel: 'Transliteration:',
                glossLabel: 'Brief gloss:',
                definitionLabel: 'Definition:',
                morphologyTitle: 'Morphological Analysis',
                posLabel: 'Part of Speech:',
                parsingLabel: 'Detailed Parsing:',
                statsTitle: 'NT Statistics',
                loading: 'Loading...',
                lemmaOccurrences: 'The root {lemma} appears: {count} times.',
                textOccurrences: 'The form {text} appears: {count} times.',
                concordanceButton: 'View Concordance',
                morphEditor: {
                    editButton: 'Correct',
                    confirmMessage: 'Are you sure you want to correct the morphological analysis? This action will permanently modify the base data.',
                    parsingCodeLabel: 'Parsing Code:',
                    parsingPlaceholder: 'e.g., V-PAPNPM-',
                    cancelButton: 'Cancel',
                    saveButton: 'Save Morphology'
                }
            },
            concordanceModal: {
                errorMsg: 'Error loading concordance.',
                title: 'Concordance for "{word}"',
                loading: 'Loading concordance...',
                lemmaHeader: 'Root: {lemma} ({count} times)',
                textHeader: 'Exact Form: {text} ({count} times)'
            },
            diagramNode: {
                textPlaceholder: 'Double-click'
            },
            app: {
                title: 'Biblical Exegesis Project',
                languageLabel: 'Language:',
                tabPassage: 'Passage',
                tabDiagram: 'Diagram',
                loading: 'Loading...',
                noPassageLoaded: 'No passage loaded',
                noPassageFound: 'Passage not found',
                // Alerts for Diagrams
                selectPassageFirstDiagram: 'Please select a passage before saving the diagram.',
                diagramSaveSuccess: 'Diagram saved successfully.',
                diagramSaveError: 'Error saving the diagram.',
                diagramConnectionError: 'Connection error while saving the diagram.',
                // Alerts for Notes
                selectPassageFirstNotes: 'Please select a passage before saving notes.',
                notesSaveSuccess: 'Notes saved successfully.',
                notesSaveError: 'Error saving the notes.',
                notesConnectionError: 'Connection error while saving the notes.',
                noTokenFound: 'Your session has expired. Please log in again.',
                closeSession: 'Log Out',
                verifyingSession: 'Verifying session...',
                sessionExpired: 'Session expired.',
                apiError: 'Error in API request.',
                analysisMorphologyError: 'Error saving morphological analysis.'
            },
            loginPage: {
                title: 'Login',
                registerTitle: 'Create Account',
                usernameLabel: 'Username',
                passwordLabel: 'Password',
                submitButton: 'Login',
                registerButton: 'Register',
                toggleToRegister: "Don't have an account?",
                toggleToLogin: 'Already have an account?',
                registerLink: 'Sign up',
                loginLink: 'Log in',
                registerSuccess: 'Registration successful! Please log in.',
                genericError: 'An error occurred.'
            }
        },
        componentData: {
            legend: [
                { abbr: 'N-', name: 'Noun', desc: 'Names of people, places, things, or ideas.' },
                { abbr: 'V-', name: 'Verb', desc: 'Words that express actions or states of being.' },
                { abbr: 'A-', name: 'Adjective', desc: 'Words that describe or qualify a noun.' },
                { abbr: 'P-', name: 'Personal Pronoun', desc: 'Words like "I", "you", "he", that replace a noun.' },
                { abbr: 'RP', name: 'Relative Pronoun', desc: 'Words like "that", "which", "who", that introduce a relative clause.' },
                { abbr: 'RA', name: 'Demonstrative Pronoun', desc: 'Words like "this", "that", "these", which point to a noun.' },
                { abbr: 'RD', name: 'Indefinite Pronoun', desc: 'Words like "someone", "any", "a certain one", that do not specify whom they refer to.' },
                { abbr: 'RI', name: 'Interrogative Pronoun', desc: 'Words like "who?", "what?", "which?", used for asking questions.' },
                { abbr: 'D-', name: 'Definite Article', desc: '"The". In Greek: ὁ, ἡ, τό.' },
                { abbr: 'C-', name: 'Conjunction', desc: 'Words like "and", "but", "or", that join words or sentences.' },
                { abbr: 'RR', name: 'Adverb', desc: 'Words that modify a verb, adjective, or another adverb.' },
                { abbr: 'I-', name: 'Interjection', desc: 'Expressions like "oh!", "behold!".' },
                { abbr: 'X-', name: 'Particle', desc: 'Words that do not fit easily into other categories.' },
            ]
        }
    }
};
 
/**
 * EXPORTACIÓN PRINCIPAL
 * Exportamos una combinación de la configuración global y una función
 * para obtener el paquete de textos del idioma correcto.
 */
export const settings = {
    ...globalSettings,
    /**
     * Obtiene el objeto de configuración localizado para un idioma específico.
     * @param {string} language - El código del idioma ('es', 'en', etc.).
     * @returns {object} El objeto de configuración para ese idioma. Vuelve a 'es' si no se encuentra.
     */
    getLocalized: (language = 'es') => localizations[language] || localizations.es
};