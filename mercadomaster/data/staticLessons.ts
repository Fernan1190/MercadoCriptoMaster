import { LessonContent } from '../../types';

// Database of static, handcrafted lessons to ensure high quality
export const STATIC_LESSONS: Record<string, LessonContent> = {
  // ============================================================================
  // RUTA: INVERSOR DE BOLSA (STOCKS)
  // ============================================================================

  // --- UNIDAD 1: Fundamentos del Mercado ---
  "stocks-s1-1": {
      id: "stocks-s1-1",
      title: "Tendencias de Mercado",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Tendencia Alcista (Bullish)",
              content: "Una **Tendencia Alcista** se define por una serie de máximos y mínimos cada vez más altos. Los compradores tienen el control y empujan el precio hacia arriba con fuerza.",
              analogy: "Es como subir una escalera: das un paso atrás para descansar, pero luego subes dos más.",
              icon: "🚀",
              visualType: "chart_line",
              visualMeta: { trend: "up", label: "Máximos Crecientes" }
          },
          {
              title: "Tendencia Bajista (Bearish)",
              content: "Por el contrario, una **Tendencia Bajista** ocurre cuando el precio crea máximos y mínimos cada vez más bajos. El pánico o la toma de ganancias dominan.",
              analogy: "Una pelota cayendo por una colina.",
              icon: "📉",
              visualType: "chart_line",
              visualMeta: { trend: "down", label: "Mínimos Decrecientes" }
          }
      ],
      quiz: [
          {
              type: "candle_chart",
              question: "¿Qué tipo de tendencia muestra este patrón de velas?",
              chartData: { trend: 'up', indicatorHint: "Mínimos crecientes" },
              difficulty: "easy",
              explanation: "Es una tendencia alcista clara.",
              options: ["Alcista (Bullish)", "Bajista (Bearish)"],
              correctIndex: 0,
              correctAnswerText: "Alcista (Bullish)"
          }
      ]
  },
  "stocks-s1-2": {
      id: "stocks-s1-2",
      title: "Riesgo vs Recompensa",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "El Balancín Financiero",
              content: "En finanzas, no hay almuerzos gratis. Si quieres ganar más dinero (Recompensa), debes estar dispuesto a asumir más posibilidad de perderlo (Riesgo). \n\nLos Bonos del gobierno son seguros pero pagan poco. Las acciones tecnológicas son volátiles pero pueden multiplicar tu dinero.",
              analogy: "A mayor velocidad (rendimiento), mayor riesgo de choque.",
              icon: "⚖️"
          }
      ],
      quiz: [
          {
              type: "risk_slider",
              question: "Ajusta el nivel de riesgo para un estudiante de 20 años con $500 que quiere aprender y crecer su capital.",
              riskScenario: { correctValue: 80, tolerance: 20, minLabel: "Conservador", maxLabel: "Agresivo" },
              difficulty: "medium",
              explanation: "Al ser joven y tener poco capital, tienes tiempo para recuperarte de caídas, por lo que puedes permitirte asumir más riesgo para buscar mayor crecimiento.",
              pedagogicalGoal: "Perfil de Riesgo"
          }
      ]
  },
  "stocks-s1-3": {
    id: "stocks-s1-3",
    title: "¿Qué es una Acción?",
    isBossLevel: false,
    generatedBy: "static",
    slides: [
      {
        title: "La Analogía de la Pizza",
        content: "Imagina que tienes una pizzería muy exitosa, pero quieres abrir 10 locales más. No tienes dinero suficiente. \n\nDecides 'cortar' tu empresa en 1000 pedazos (acciones) y vender cada pedazo a $100. Quien compre un pedazo es dueño de una pequeña parte de tu pizzería.",
        analogy: "Una acción es como una rebanada de la empresa.",
        icon: "🍕",
        keyTerms: ["Acción", "Capital", "Propiedad"]
      }
    ],
    quiz: [
      {
        type: "multiple_choice",
        question: "Si compras una acción de Apple, ¿qué obtienes realmente?",
        options: ["Un iPhone gratis", "Una parte de la propiedad de la empresa", "Deuda que Apple te tiene que pagar", "Nada, es solo un papel"],
        correctIndex: 1,
        correctAnswerText: "Una parte de la propiedad de la empresa",
        difficulty: "easy",
        explanation: "Las acciones representan capital social (equity), lo que significa que posees una fracción del negocio.",
        pedagogicalGoal: "Concepto de Acción"
      }
    ]
  },
  "stocks-s1-4": {
      id: "stocks-s1-4",
      title: "Soportes y Resistencias",
      isBossLevel: false,
      generatedBy: "static",
      slides: [{ title: "Pisos y Techos", content: "El precio no se mueve aleatoriamente. Rebota en zonas clave.\n\n**Soporte (Piso):** Donde el precio suele dejar de bajar y rebota. Es buen lugar para comprar.\n**Resistencia (Techo):** Donde el precio suele dejar de subir. Buen lugar para vender.", analogy: "Es como una pelota rebotando en una habitación.", icon: "🚧" }],
      quiz: [{ type: "binary_prediction", question: "El precio de una acción toca una Resistencia fuerte por tercera vez. ¿Qué es más probable que ocurra?", options: ["Rompe y sube", "Rebota y baja"], correctIndex: 1, correctAnswerText: "Rebota y baja", difficulty: "medium", explanation: "Las resistencias suelen rechazar el precio. Si rompe, se convierte en soporte, pero la probabilidad inicial es el rechazo." }]
  },
  "stocks-s1-5": {
      id: "stocks-s1-5",
      title: "Volumen: El Combustible",
      isBossLevel: true,
      generatedBy: "static",
      slides: [{ title: "¿Verdad o Mentira?", content: "El **Volumen** es la cantidad de acciones que se compraron y vendieron en un periodo. Es el detector de mentiras del mercado.\n\nSi el precio sube pero el volumen es bajo, es una subida débil (trampa). Si sube con mucho volumen, es una subida real.", analogy: "El precio es el coche, el volumen es la gasolina.", icon: "⛽", proTip: "Nunca operes una ruptura de soporte/resistencia sin confirmar con volumen." }],
      quiz: [{ type: "multiple_choice", question: "Una acción rompe su máximo histórico, pero el volumen es muy bajo. ¿Qué deberías pensar?", options: ["Es una compra segura", "Es una trampa (Falsa ruptura)", "El mercado está cerrado", "Es irrelevante"], correctIndex: 1, correctAnswerText: "Es una trampa (Falsa ruptura)", difficulty: "hard", explanation: "Sin 'gasolina' (volumen), el coche (precio) no llegará lejos y probablemente retrocederá." }]
  },

  // --- UNIDAD 2: Análisis Fundamental (NUEVO) ---
  "stocks-s2-1": {
      id: "stocks-s2-1",
      title: "El Balance General",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "La Foto de la Empresa",
              content: "El **Balance General** nos dice qué tiene la empresa y qué debe en un momento exacto.\n\n**Activos:** Lo que posee (Dinero, Fábricas).\n**Pasivos:** Lo que debe (Deudas, Préstamos).\n**Patrimonio:** Lo que queda para los dueños.",
              analogy: "Es como mirar tu cuenta bancaria + tu casa - tu hipoteca.",
              icon: "📸",
              keyTerms: ["Activos", "Pasivos", "Patrimonio"]
          }
      ],
      quiz: [
          {
              type: "matching",
              question: "Clasifica estos conceptos contables:",
              pairs: [
                  { left: "Fábrica", right: "Activo" },
                  { left: "Préstamo Bancario", right: "Pasivo" },
                  { left: "Dinero en Caja", right: "Activo" }
              ],
              difficulty: "easy",
              explanation: "Los activos ponen dinero en tu bolsillo, los pasivos lo sacan o son obligaciones futuras."
          }
      ]
  },
  "stocks-s2-2": {
      id: "stocks-s2-2",
      title: "PER: ¿Barato o Caro?",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Price to Earnings (PER)",
              content: "El **PER** nos dice cuántos años tardaríamos en recuperar nuestra inversión con los beneficios actuales.\n\nSi una empresa vale $100 por acción y gana $5 al año, su PER es 20. Estás pagando 20 veces sus beneficios.",
              analogy: "Si compras un bar por 100k y gana 10k al año, tardas 10 años en recuperarlo (PER 10).",
              icon: "🏷️",
              visualType: "chart_volume", // Usamos gráfico de barras para comparar
              visualMeta: { label: "Comparación de PER" }
          }
      ],
      quiz: [
          {
              type: "binary_prediction",
              question: "Tesla tiene un PER de 60 y Ford de 7. ¿Cuál espera el mercado que crezca más rápido?",
              options: ["Tesla", "Ford"],
              correctIndex: 0,
              correctAnswerText: "Tesla",
              difficulty: "medium",
              explanation: "Un PER alto suele indicar que los inversores esperan un crecimiento futuro explosivo (Growth)."
          }
      ]
  },
  "stocks-s2-3": {
      id: "stocks-s2-3",
      title: "Ventajas Competitivas",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "El Foso Económico (Moat)",
              content: "Warren Buffett busca empresas con 'Fosos'. Son barreras que protegen a la empresa de sus rivales.\n\nEjemplos: Marca potente (Coca-Cola), Coste de cambio (Apple), Efecto Red (Facebook).",
              analogy: "Un castillo (la empresa) rodeado por un foso con cocodrilos.",
              icon: "🏰"
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "¿Cuál de estas es una ventaja competitiva tipo 'Coste de Cambio'?",
              options: ["Tener el precio más bajo", "Que sea muy difícil para el cliente irse a la competencia", "Tener el mejor logo", "Vender en muchos países"],
              correctIndex: 1,
              correctAnswerText: "Que sea muy difícil para el cliente irse a la competencia",
              difficulty: "medium",
              explanation: "El coste de cambio (Switching Cost) atrapa al cliente. Ejemplo: Cambiar todo el software de una empresa es un dolor de cabeza."
          }
      ]
  },
  "stocks-s2-4": {
      id: "stocks-s2-4",
      title: "Dividendos",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "La Renta Pasiva",
              content: "Algunas empresas reparten parte de sus beneficios directamente a los accionistas. Esto se llama **Dividendo**.\n\nEs dinero que entra en tu cuenta solo por tener la acción, suba o baje el precio.",
              analogy: "Es como tener un piso alquilado y cobrar la renta cada mes.",
              icon: "💸"
          }
      ],
      quiz: [
          {
              type: "true_false",
              question: "Si una empresa paga dividendos, ¿el precio de su acción baja automáticamente el día del pago?",
              options: ["Verdadero", "Falso"],
              correctIndex: 0,
              correctAnswerText: "Verdadero",
              difficulty: "hard",
              explanation: "Sí. El dinero sale de la caja de la empresa, por lo tanto, la empresa vale menos exactamente en la cantidad pagada."
          }
      ]
  },
  "stocks-s2-5": {
      id: "stocks-s2-5",
      title: "BOSS: El Analista",
      isBossLevel: true,
      generatedBy: "static",
      slides: [
          {
              title: "Uniendo Piezas",
              content: "El análisis fundamental no es un solo número. Es mirar el Balance, el PER y la Competencia a la vez.\n\n**¡Demuestra que sabes valorar un negocio!**",
              icon: "🕵️‍♂️"
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "Empresa A: PER 5, Deuda Alta, Sin Ventaja. Empresa B: PER 25, Sin Deuda, Gran Marca. ¿Cuál es más segura a largo plazo?",
              options: ["Empresa A", "Empresa B"],
              correctIndex: 1,
              correctAnswerText: "Empresa B",
              difficulty: "hard",
              explanation: "Aunque B es más cara (PER 25), la calidad (Sin deuda + Marca) la hace más segura (Quality Investing)."
          }
      ]
  },

  // --- UNIDAD 3: Análisis Técnico (NUEVO) ---
  "stocks-s3-1": {
      id: "stocks-s3-1",
      title: "Tipos de Gráficos",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Líneas vs Velas",
              content: "El gráfico de línea es simple, pero esconde información. El gráfico de **Velas Japonesas** muestra apertura, cierre, máximo y mínimo de cada sesión.",
              icon: "📊",
              visualType: "chart_candle",
              visualMeta: { trend: "up", label: "Velas Japonesas" }
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "¿Qué gráfico usan los traders profesionales?",
              options: ["Línea", "Pastel", "Velas Japonesas"],
              correctIndex: 2,
              correctAnswerText: "Velas Japonesas",
              difficulty: "easy",
              explanation: "Las velas dan mucha más información sobre la psicología del mercado."
          }
      ]
  },
  "stocks-s3-2": {
      id: "stocks-s3-2",
      title: "Medias Móviles",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Suavizando el Ruido",
              content: "Una **Media Móvil (MA)** es el precio promedio de los últimos X días. Ayuda a ver la tendencia real ignorando el ruido diario.",
              analogy: "Como el promedio de notas de un alumno, ignora un mal examen puntual.",
              icon: "〰️",
              visualType: "chart_line",
              visualMeta: { trend: "volatile", showIndicators: true, label: "Precio vs Media" }
          }
      ],
      quiz: [
          {
              type: "binary_prediction",
              question: "El precio cruza por encima de su media móvil de 200 días. ¿Es una señal...?",
              options: ["Alcista", "Bajista"],
              correctIndex: 0,
              correctAnswerText: "Alcista",
              difficulty: "medium",
              explanation: "Romper la media al alza suele indicar inicio de tendencia positiva (Golden Cross)."
          }
      ]
  },
  "stocks-s3-3": {
      id: "stocks-s3-3",
      title: "RSI y MACD",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Indicadores de Fuerza",
              content: "El **RSI** (Índice de Fuerza Relativa) nos dice si un activo está 'Sobrecomprado' (caro) o 'Sobrevendido' (barato).\n\nSi el RSI > 70, cuidado, puede caer. Si RSI < 30, oportunidad de compra.",
              icon: "🧭"
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "El RSI de una acción está en 85. ¿Qué significa?",
              options: ["Está en Sobreventa (Barato)", "Está en Sobrecompra (Caro)", "No significa nada"],
              correctIndex: 1,
              correctAnswerText: "Está en Sobrecompra (Caro)",
              difficulty: "medium",
              explanation: "RSI > 70 indica euforia y alta probabilidad de corrección."
          }
      ]
  },
  "stocks-s3-4": {
      id: "stocks-s3-4",
      title: "Estructura de Mercado",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "HH y HL",
              content: "El mercado se mueve en zigzag. En una tendencia alcista, crea **Higher Highs** (Máximos más altos) y **Higher Lows** (Mínimos más altos).",
              icon: "🏗️",
              visualType: "chart_line",
              visualMeta: { trend: "up", label: "Estructura Alcista" }
          }
      ],
      quiz: [
          {
              type: "true_false",
              question: "¿En una tendencia bajista, los máximos son cada vez más bajos?",
              options: ["Verdadero", "Falso"],
              correctIndex: 0,
              correctAnswerText: "Verdadero",
              difficulty: "medium",
              explanation: "Correcto. Se llaman 'Lower Highs' (Máximos Decrecientes)."
          }
      ]
  },
  "stocks-s3-5": {
      id: "stocks-s3-5",
      title: "BOSS: El Chartista",
      isBossLevel: true,
      generatedBy: "static",
      slides: [
          {
              title: "Lectura de Gráficos",
              content: "Los gráficos cuentan la historia de la batalla entre compradores y vendedores. ¿Puedes predecir quién ganará?",
              icon: "🔮"
          }
      ],
      quiz: [
          {
              type: "candle_chart",
              question: "Ves un patrón de 'Doble Techo' en una resistencia fuerte. ¿Qué haces?",
              chartData: { trend: 'doji_reversal' },
              options: ["Vender (Short)", "Comprar (Long)"],
              correctIndex: 0,
              correctAnswerText: "Vender (Short)",
              difficulty: "hard",
              explanation: "El doble techo es un patrón clásico de reversión bajista."
          }
      ]
  },


  // ============================================================================
  // RUTA: EXPERTO CRIPTO
  // ============================================================================

  // --- UNIDAD 1: Blockchain 101 (YA EXISTENTE) ---
  "crypto-c1-1": {
      id: "crypto-c1-1",
      title: "El Oro Digital",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "¿Por qué Bitcoin?",
              content: "El dinero normal (Fiat) es impreso por gobiernos infinitamente, lo que causa inflación. Bitcoin es diferente: solo existirán **21 millones**.\n\nEs descentralizado: nadie lo controla, ningún banco puede congelar tu cuenta.",
              analogy: "Bitcoin es como oro que puedes teletransportar por internet.",
              icon: "🪙"
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "¿Cuál es el límite máximo de Bitcoins que existirán jamás?",
              options: ["Infinito", "21 Millones", "100 Millones", "Depende de los mineros"],
              correctIndex: 1,
              correctAnswerText: "21 Millones",
              difficulty: "easy",
              explanation: "La escasez programada (Hard Cap) es lo que le da valor frente al dinero fiat."
          }
      ]
  },
  "crypto-c1-2": {
      id: "crypto-c1-2",
      title: "La Blockchain",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "La Cadena de Bloques",
              content: "Imagina un libro contable compartido por todo el mundo. Cada vez que alguien hace una transacción, se anota en una página (Bloque). Cuando la página se llena, se sella y se une a la anterior.",
              analogy: "Un grupo de WhatsApp donde nadie puede borrar mensajes.",
              icon: "🔗"
          }
      ],
      quiz: [
          {
              type: "ordering",
              question: "Ordena el proceso de una transacción en Bitcoin:",
              correctOrder: ["Usuario envía BTC", "Transacción va a la Mempool", "Mineros crean un Bloque", "Bloque se añade a la Blockchain"],
              difficulty: "medium",
              explanation: "Envío -> Mempool -> Minería -> Confirmación."
          }
      ]
  },
  "crypto-c1-3": {
      id: "crypto-c1-3",
      title: "Hot vs Cold Wallets",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "¿Dónde guardo mis Criptos?",
              content: "**Hot Wallet**: Conectada a internet (Metamask, Exchange). Es cómoda para trading pero menos segura.\n\n**Cold Wallet**: Desconectada (Ledger, Trezor). Es como una caja fuerte física, ideal para guardar ahorros a largo plazo.",
              analogy: "Hot Wallet es tu billetera del bolsillo. Cold Wallet es tu caja fuerte en casa.",
              icon: "🛡️"
          }
      ],
      quiz: [
          {
              type: "matching",
              question: "Empareja el tipo de wallet con su característica:",
              pairs: [
                  { left: "Hot Wallet", right: "Conectada a Internet" },
                  { left: "Cold Wallet", right: "Máxima Seguridad Offline" },
                  { left: "Exchange", right: "Custodia de Terceros" }
              ],
              difficulty: "medium",
              explanation: "Las Hot Wallets son para uso diario, las Cold Wallets para seguridad (HODL)."
          }
      ]
  },
  "crypto-c1-4": {
      id: "crypto-c1-4",
      title: "Minería (Proof of Work)",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "El Sudoku Más Difícil",
              content: "Los mineros no 'buscan' monedas en la tierra. Usan ordenadores potentes para resolver un problema matemático muy difícil.\n\nEl primero que lo resuelve, gana el derecho a añadir el siguiente bloque a la cadena y recibe Bitcoins nuevos como recompensa.",
              analogy: "Es como una lotería donde compras más boletos si tienes más potencia de cálculo.",
              icon: "⛏️",
              commonPitfall: "Mucha gente cree que minar es gratis. Requiere mucha electricidad y hardware costoso."
          }
      ],
      quiz: [
          {
              type: "true_false",
              question: "¿Cualquier ordenador casero puede minar Bitcoin rentablemente hoy en día?",
              options: ["Verdadero", "Falso"],
              correctIndex: 1,
              correctAnswerText: "Falso",
              difficulty: "easy",
              explanation: "Hoy en día se necesitan chips especializados (ASICs) porque la dificultad de la red es extremadamente alta."
          }
      ]
  },
  "crypto-c1-5": {
      id: "crypto-c1-5",
      title: "El Halving",
      isBossLevel: true, // Boss Level!
      generatedBy: "static",
      slides: [
          {
              title: "El Shock de Oferta",
              content: "Cada 4 años, la cantidad de Bitcoins que ganan los mineros se corta a la mitad. Esto se llama **Halving**.\n\nSi la demanda se mantiene igual pero la oferta nueva se reduce a la mitad, el precio tiende a subir por escasez.",
              analogy: "Imagina que de repente las minas de oro producen la mitad de oro. El oro existente valdría más.",
              icon: "✂️"
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "¿Qué efecto suele tener el Halving en el precio a largo plazo (históricamente)?",
              options: ["El precio se desploma a cero", "Inicia un ciclo alcista (Bull Run)", "No pasa nada", "Bitcoin deja de funcionar"],
              correctIndex: 1,
              correctAnswerText: "Inicia un ciclo alcista (Bull Run)",
              difficulty: "easy",
              explanation: "Históricamente, el año posterior al Halving ha sido muy alcista debido al shock de oferta."
          }
      ]
  },

  // --- UNIDAD 2: Bitcoin & Ethereum (NUEVO) ---
  "crypto-c2-1": {
      id: "crypto-c2-1",
      title: "El Trilema Blockchain",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "El Problema Imposible",
              content: "Es muy difícil tener las tres cosas a la vez en una criptomoneda:\n1. **Seguridad**\n2. **Descentralización**\n3. **Escalabilidad** (Rapidez)\n\nBitcoin elige Seguridad y Descentralización, pero es lento.",
              analogy: "Bueno, Bonito y Barato. Solo puedes elegir dos.",
              icon: "⚠️",
              visualType: "diagram_flow",
              visualMeta: { label: "Trilema Blockchain" }
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "Solana es muy rápida y barata, pero a veces se apaga. ¿Qué sacrifica en el trilema?",
              options: ["Escalabilidad", "Descentralización/Seguridad", "Precio", "Nada"],
              correctIndex: 1,
              correctAnswerText: "Descentralización/Seguridad",
              difficulty: "medium",
              explanation: "Para ser muy rápido, a menudo se centralizan los nodos o se relajan los requisitos de seguridad."
          }
      ]
  },
  "crypto-c2-2": {
      id: "crypto-c2-2",
      title: "Smart Contracts",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Código es Ley",
              content: "Ethereum introdujo los **Contratos Inteligentes**. Son programas que se ejecutan solos cuando pasa algo.\n\nEjemplo: 'Si llega el viernes, envía 1 ETH a María'. Nadie tiene que aprobarlo, sucede automático.",
              analogy: "Una máquina expendedora: metes moneda, sale refresco. No hay camarero.",
              icon: "📜"
          }
      ],
      quiz: [
          {
              type: "true_false",
              question: "¿Se necesita un abogado para ejecutar un Smart Contract?",
              options: ["Verdadero", "Falso"],
              correctIndex: 1,
              correctAnswerText: "Falso",
              difficulty: "easy",
              explanation: "Se ejecutan automáticamente por código en la blockchain."
          }
      ]
  },
  "crypto-c2-3": {
      id: "crypto-c2-3",
      title: "Gas Fees (Comisiones)",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "El Precio de la Red",
              content: "Para usar Ethereum, debes pagar 'Gas'. Es la tarifa que cobras los validadores por procesar tu operación.\n\nCuando mucha gente usa la red, el Gas sube (atasco).",
              analogy: "Es como un peaje de autopista: más caro en hora punta.",
              icon: "⛽",
              visualType: "chart_volume",
              visualMeta: { label: "Congestión de Red" }
          }
      ],
      quiz: [
          {
              type: "binary_prediction",
              question: "Hay un lanzamiento de NFT muy popular ahora mismo. ¿Qué pasará con el precio del Gas?",
              options: ["Subirá mucho", "Bajará"],
              correctIndex: 0,
              correctAnswerText: "Subirá mucho",
              difficulty: "easy",
              explanation: "La alta demanda congestiona la red y dispara las comisiones."
          }
      ]
  },
  "crypto-c2-4": {
      id: "crypto-c2-4",
      title: "PoW vs PoS",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Guerra de Consenso",
              content: "**Proof of Work (Bitcoin):** Usa electricidad y hardware para seguridad. Muy seguro, poco ecológico.\n\n**Proof of Stake (Ethereum):** Usa monedas bloqueadas (Staking) para seguridad. 99% menos energía.",
              analogy: "PoW es una competición de fuerza. PoS es una votación de accionistas.",
              icon: "⚔️"
          }
      ],
      quiz: [
          {
              type: "matching",
              question: "Empareja la moneda con su sistema:",
              pairs: [
                  { left: "Bitcoin", right: "Proof of Work (Minería)" },
                  { left: "Ethereum 2.0", right: "Proof of Stake (Validación)" }
              ],
              difficulty: "medium",
              explanation: "Ethereum cambió a PoS en 'The Merge' para ser más verde."
          }
      ]
  },
  "crypto-c2-5": {
      id: "crypto-c2-5",
      title: "BOSS: El Arquitecto",
      isBossLevel: true,
      generatedBy: "static",
      slides: [
          {
              title: "Construyendo el Futuro",
              content: "Has aprendido sobre Blockchain, Contratos y Consenso. ¿Estás listo para demostrar que entiendes la tecnología?",
              icon: "🏗️"
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "Quieres crear una app descentralizada de préstamos. ¿Qué red usas?",
              options: ["Bitcoin (Solo pagos)", "Ethereum (Smart Contracts)"],
              correctIndex: 1,
              correctAnswerText: "Ethereum (Smart Contracts)",
              difficulty: "hard",
              explanation: "Bitcoin no soporta lógica compleja nativa. Ethereum es la computadora mundial."
          }
      ]
  },

  // --- UNIDAD 3: Trading Cripto (NUEVO) ---
  "crypto-c3-1": {
      id: "crypto-c3-1",
      title: "Exchanges",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "CEX vs DEX",
              content: "**CEX (Binance, Coinbase):** Una empresa custodia tu dinero. Fácil de usar, pero arriesgado si quiebran.\n\n**DEX (Uniswap):** Tú tienes el control total, operas directo en la blockchain. Nadie puede congelar tus fondos.",
              analogy: "CEX es un Banco. DEX es un mercadillo callejero P2P.",
              icon: "🏦"
          }
      ],
      quiz: [
          {
              type: "true_false",
              question: "En un DEX (Exchange Descentralizado), ¿tienes que dar tu DNI (KYC)?",
              options: ["Verdadero", "Falso"],
              correctIndex: 1,
              correctAnswerText: "Falso",
              difficulty: "medium",
              explanation: "Los DEX son anónimos y sin permiso, solo necesitas tu wallet."
          }
      ]
  },
  "crypto-c3-2": {
      id: "crypto-c3-2",
      title: "Stablecoins",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "Dólares Digitales",
              content: "Las **Stablecoins** (USDT, USDC) son criptomonedas diseñadas para valer siempre $1. Sirven para refugiarte cuando el mercado cae sin tener que salir a dinero fiat (euros/dólares).",
              analogy: "Fichas de casino que valen dinero real.",
              icon: "💵"
          }
      ],
      quiz: [
          {
              type: "multiple_choice",
              question: "¿Para qué usarías principalmente USDT?",
              options: ["Para hacerme rico rápido", "Para proteger valor (Refugio)", "Para votar en la red"],
              correctIndex: 1,
              correctAnswerText: "Para proteger valor (Refugio)",
              difficulty: "easy",
              explanation: "Como no sube de precio, no sirve para especular, sino para mantener valor."
          }
      ]
  },
  "crypto-c3-3": {
      id: "crypto-c3-3",
      title: "Pares de Trading",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "BTC/USD vs ETH/BTC",
              content: "En cripto, todo se opera en pares. **BTC/USD** significa que compras Bitcoin con Dólares.\n\n**ETH/BTC** significa que compras Ethereum pagando con Bitcoin. Si ETH sube más que BTC, ganas más satoshis.",
              icon: "💱"
          }
      ],
      quiz: [
          {
              type: "matching",
              question: "Empareja el par con su significado:",
              pairs: [
                  { left: "BTC/USD", right: "Compras BTC con Dólares" },
                  { left: "ETH/BTC", right: "Compras ETH con Bitcoin" }
              ],
              difficulty: "medium",
              explanation: "La segunda moneda del par es la que usas para pagar."
          }
      ]
  },
  "crypto-c3-4": {
      id: "crypto-c3-4",
      title: "Volatilidad",
      isBossLevel: false,
      generatedBy: "static",
      slides: [
          {
              title: "La Montaña Rusa",
              content: "Cripto es el mercado más volátil del mundo. Bitcoin puede caer un 10% en una hora. Las 'Altcoins' (monedas pequeñas) pueden subir un 100% o caer un 90% en un día.",
              analogy: "La bolsa es un paseo en barco. Cripto es surfear en un tsunami.",
              icon: "🎢"
          }
      ],
      quiz: [
          {
              type: "risk_slider",
              question: "Estás invirtiendo en una Altcoin muy pequeña y nueva. ¿Cuál es el nivel de riesgo?",
              riskScenario: { correctValue: 90, tolerance: 10, minLabel: "Bajo", maxLabel: "Extremo" },
              difficulty: "easy",
              explanation: "Las 'Small Caps' en cripto tienen un riesgo de pérdida total altísimo."
          }
      ]
  },
  "crypto-c3-5": {
      id: "crypto-c3-5",
      title: "BOSS: El Trader DeFi",
      isBossLevel: true,
      generatedBy: "static",
      slides: [
          {
              title: "Dominando el Caos",
              content: "Has aprendido sobre exchanges, stablecoins y volatilidad. Ahora te enfrentas al mercado real descentralizado (DeFi). ¿Sobrevivirás?",
              icon: "🌐"
          }
      ],
      quiz: [
          {
              type: "sentiment_swipe",
              question: "Analiza estas noticias de DeFi:",
              sentimentCards: [
                  { text: "Protocolo DeFi sufre hackeo de $100M", sentiment: "bearish" },
                  { text: "Nuevo DEX lanza trading sin comisiones", sentiment: "bullish" },
                  { text: "Regulador advierte sobre Uniswap", sentiment: "bearish" }
              ],
              difficulty: "medium",
              explanation: "La seguridad es el mayor riesgo en DeFi. Los hacks siempre tiran el precio."
          }
      ]
  }
};