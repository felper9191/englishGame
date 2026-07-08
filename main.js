import perguntas from "./questoes.js";
// 1. DADOS (Configurações)
const totalCells = 60;
const STORAGE_KEY = 'englishQuestState';
let playerPos = 0;
let moduloAtual = 1;
let streak = 0;
let pesoAtual = 1.0;
let poolPerguntasPorModulo = {};
const errosPorMateria = {};
let maiorStreak = 0;

// Sistema de Estatísticas de Desempenho
const estatisticas = {
  totalPerguntas: 0,
  acertosPorMateria: {},
  errosPorMateria: {},
  acertosPorModulo: {},
  errosPorModulo: {},
  nivelPorMateria: {} // para rastrear "Fácil", "Médio", "Dificil"
};

const pontosPorNivel = {
  facil: 10,
  medio: 20,
  dificil: 30
};


function calcularBonusSequencia(streak) {
  if (streak >= 5) return 20;
  if (streak >= 3) return 10;
  return 0;
}


const PESO_MIN = 0.5;
const PESO_MAX = 2.0;
const PASSO_PESO = 0.5;
const MAX_VIDAS = 5;
const MAX_AJUDA = 3;


// Estado do jogador
const jogador = {
    vidas: 3,
    pontos: 0,
    ajudas: {
        eliminar: 0,
        pular: 0
    }
};


let casasEspeciais = {};

const configEventosPorModulo = {
  1: { quiz: 16,
    avancar: 4,
    voltar: 4,
    ganhaVida: 3,
    perdeVida: 3,
    ganhaEliminar: 5,
    ganhaPular: 5,
    perdeAjuda: 4,
    perdeTodasAjudas: 1,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  2: { quiz: 16,
    avancar: 4,
    voltar: 4,
    ganhaVida: 3,
    perdeVida: 3,
    ganhaEliminar: 5,
    ganhaPular: 5,
    perdeAjuda: 4,
    perdeTodasAjudas: 1,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  3: { quiz: 16,
    avancar: 4,
    voltar: 4,
    ganhaVida: 3,
    perdeVida: 3,
    ganhaEliminar: 5,
    ganhaPular: 5,
    perdeAjuda: 4,
    perdeTodasAjudas: 1,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  4: { quiz: 20,
    avancar: 3,
    voltar: 3,
    ganhaVida: 3,
    perdeVida: 3,
    ganhaEliminar: 3,
    ganhaPular: 3,
    perdeAjuda: 5,
    perdeTodasAjudas: 2,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  5: { quiz: 20,
    avancar: 3,
    voltar: 3,
    ganhaVida: 3,
    perdeVida: 3,
    ganhaEliminar: 3,
    ganhaPular: 3,
    perdeAjuda: 5,
    perdeTodasAjudas: 2,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  6: { quiz: 20,
    avancar: 3,
    voltar: 3,
    ganhaVida: 3,
    perdeVida: 3,
    ganhaEliminar: 3,
    ganhaPular: 3,
    perdeAjuda: 5,
    perdeTodasAjudas: 2,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  7: { quiz: 24,
    avancar: 2,
    voltar: 3,
    ganhaVida: 2,
    perdeVida: 3,
    ganhaEliminar: 2,
    ganhaPular: 2,
    perdeAjuda: 5,
    perdeTodasAjudas: 2,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  8: { quiz: 24,
    avancar: 2,
    voltar: 3,
    ganhaVida: 2,
    perdeVida: 3,
    ganhaEliminar: 2,
    ganhaPular: 2,
    perdeAjuda: 5,
    perdeTodasAjudas: 2,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  9: { quiz: 24,
    avancar: 2,
    voltar: 3,
    ganhaVida: 2,
    perdeVida: 3,
    ganhaEliminar: 2,
    ganhaPular: 2,
    perdeAjuda: 5,
    perdeTodasAjudas: 2,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
},
  10: { quiz: 24,
    avancar: 2,
    voltar: 3,
    ganhaVida: 2,
    perdeVida: 3,
    ganhaEliminar: 2,
    ganhaPular: 2,
    perdeAjuda: 5,
    perdeTodasAjudas: 2,
    aumentaPeso: 2,
    diminuiPeso: 2,
    loja: 2
}
};

const classePorEvento = {
    quiz: 'cell-quiz',
    luck: 'cell-luck',
    badLuck: 'cell-badluck',
    ganhaVida: 'cell-vida',
    perdeVida: 'cell-perde-vida',
    ganhaEliminar: 'ajuda-eliminar',
    ganhaPular: 'ajuda-pular',
    perdeAjuda: 'cell-perde-ajuda',
    perdeTodasAjudas: 'cell-perde-todas',
    aumentaPeso: 'cell-peso-up',
    diminuiPeso: 'cell-peso-down',
    loja: 'loja'
};

const lojaItens = {
  vida: {
    preco: 50,
    comprar() {
      if (jogador.vidas >= MAX_VIDAS) return false;
      jogador.vidas++;
    }
  },
  eliminar: {
    preco: 30,
    comprar() {
      if (jogador.ajudas.eliminar >= MAX_AJUDA) return false;
      jogador.ajudas.eliminar++;
    }
  },
  pular: {
    preco: 30,
    comprar() {
      if (jogador.ajudas.pular >= MAX_AJUDA) return false;
      jogador.ajudas.pular++;
    }
  },
  peso: {
    preco: 70,
    comprar() {
      if (pesoAtual >= PESO_MAX) return false;
      pesoAtual += PASSO_PESO;
    }
  }
};

function getPrecoComModulo(precoBase) {
  return Math.round(precoBase * (1 + moduloAtual * 0.2));
}

function inicializarPoolPerguntas(modulo) {
  const perguntasModulo = perguntas.filter(p => p.modulo === modulo);

  poolPerguntasPorModulo[modulo] = [...perguntasModulo];
}

function mostrarOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.hidden = false;
  overlay.style.display = 'flex';
}

function ocultarOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.hidden = true;
  overlay.style.display = 'none';
}

function abrirLoja() {
  mostrarOverlay('loja-overlay');
  atualizarLoja();
}

function fecharLoja() {
  ocultarOverlay('loja-overlay');
}

function atualizarLoja(aviso = "") {
  document.getElementById("loja-pontos").innerText =
    `${aviso} Pontos: ${jogador.pontos} pts  •  Vidas: ${jogador.vidas}/${MAX_VIDAS}  •  Ajudas: ${jogador.ajudas.eliminar}/${MAX_AJUDA} | ${jogador.ajudas.pular}/${MAX_AJUDA}  •  Peso x${pesoAtual.toFixed(1)}`;
  atualizarStatus();
}

function comprarItem(tipo) {
  const item = lojaItens[tipo];
  if (!item) return;

  const precoFinal = getPrecoComModulo(item.preco);

  if (jogador.pontos < precoFinal) {
    atualizarLoja("Pontos insuficientes.");
    return;
  }


  const resultado = item.comprar?.();
  if (resultado === false) {
    atualizarLoja("Limite atingido.");
    return;
  }


  jogador.pontos -= precoFinal;


  salvarEstado();
  atualizarLoja(`${tipo} comprado por ${precoFinal} pts!`);
}


function salvarEstado() {
  try {
    const estado = {
      playerPos,
      moduloAtual,
      streak,
      pesoAtual,
      maiorStreak,
      jogador: {
        vidas: jogador.vidas,
        pontos: jogador.pontos,
        ajudas: {
          eliminar: jogador.ajudas.eliminar,
          pular: jogador.ajudas.pular
        }
      },
      errosPorMateria: { ...errosPorMateria },
      estatisticas: {
        totalPerguntas: estatisticas.totalPerguntas,
        acertosPorMateria: { ...estatisticas.acertosPorMateria },
        errosPorMateria: { ...estatisticas.errosPorMateria },
        acertosPorModulo: { ...estatisticas.acertosPorModulo },
        errosPorModulo: { ...estatisticas.errosPorModulo },
        nivelPorMateria: JSON.parse(JSON.stringify(estatisticas.nivelPorMateria))
      },
      poolPerguntasPorModulo: Object.fromEntries(
        Object.entries(poolPerguntasPorModulo).map(([modulo, perguntasRestantes]) => [
          modulo,
          perguntasRestantes.map(pergunta => ({ ...pergunta }))
        ])
      ),
      casasEspeciais: { ...casasEspeciais }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (error) {
    console.warn('Não foi possível salvar o estado:', error);
  }
}

function carregarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const estado = JSON.parse(raw);
    if (!estado) return false;

    playerPos = Number(estado.playerPos ?? 0);
    moduloAtual = Number(estado.moduloAtual ?? 1);
    streak = Number(estado.streak ?? 0);
    pesoAtual = Number(estado.pesoAtual ?? 1.0);
    maiorStreak = Number(estado.maiorStreak ?? 0);

    jogador.vidas = Number(estado.jogador?.vidas ?? 3);
    jogador.pontos = Number(estado.jogador?.pontos ?? 0);
    jogador.ajudas.eliminar = Number(estado.jogador?.ajudas?.eliminar ?? 0);
    jogador.ajudas.pular = Number(estado.jogador?.ajudas?.pular ?? 0);

    Object.keys(errosPorMateria).forEach(chave => delete errosPorMateria[chave]);
    Object.entries(estado.errosPorMateria || {}).forEach(([chave, valor]) => {
      errosPorMateria[chave] = valor;
    });

    estatisticas.totalPerguntas = Number(estado.estatisticas?.totalPerguntas ?? 0);
    estatisticas.acertosPorMateria = { ...(estado.estatisticas?.acertosPorMateria || {}) };
    estatisticas.errosPorMateria = { ...(estado.estatisticas?.errosPorMateria || {}) };
    estatisticas.acertosPorModulo = { ...(estado.estatisticas?.acertosPorModulo || {}) };
    estatisticas.errosPorModulo = { ...(estado.estatisticas?.errosPorModulo || {}) };
    estatisticas.nivelPorMateria = JSON.parse(JSON.stringify(estado.estatisticas?.nivelPorMateria || {}));

    poolPerguntasPorModulo = {};
    Object.entries(estado.poolPerguntasPorModulo || {}).forEach(([modulo, perguntasRestantes]) => {
      poolPerguntasPorModulo[modulo] = Array.isArray(perguntasRestantes)
        ? perguntasRestantes.map(pergunta => ({ ...pergunta }))
        : [];
    });

    casasEspeciais = estado.casasEspeciais ? { ...estado.casasEspeciais } : {};
    return true;
  } catch (error) {
    console.warn('Não foi possível carregar o estado salvo:', error);
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

function limparEstadoSalvo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Não foi possível limpar o estado salvo:', error);
  }
}

function criarPoolEventos(config) {
    const pool = [];




    for (const tipo in config) {
        for (let i = 0; i < config[tipo]; i++) {




            if (tipo === 'quiz')
                pool.push({ type: 'quiz' });




            if (tipo === 'avancar')
                pool.push({ type: 'luck', val: 2, msg: "Sorte! Avance 2." });




            if (tipo === 'voltar')
                pool.push({ type: 'badLuck', val: -3, msg: "Azar! Volte 3." });




            if (tipo === 'ganhaVida')
                pool.push({ type: 'ganhaVida', msg: "Você ganhou 1 vida!" });




            if (tipo === 'perdeVida')
                pool.push({ type: 'perdeVida', msg: "Você perdeu 1 vida!" });




            if (tipo === 'ganhaEliminar')
                pool.push({ type: 'ganhaEliminar', msg: "Ajuda: eliminar 2 alternativas!" });




            if (tipo === 'ganhaPular')
                pool.push({ type: 'ganhaPular', msg: "Ajuda: pular pergunta!" });




            if (tipo === 'perdeAjuda')
                pool.push({ type: 'perdeAjuda', msg: "Você perdeu uma ajuda!" });




            if (tipo === 'perdeTodasAjudas')
                pool.push({ type: 'perdeTodasAjudas', msg: "Você perdeu todas as ajudas!" });
               
            if (tipo === 'aumentaPeso')
  pool.push({
    type: 'aumentaPeso',
    msg: "Peso das perguntas aumentado"
  });


if (tipo === 'diminuiPeso')
  pool.push({
    type: 'diminuiPeso',
    msg: "Peso das perguntas diminuído"
  });
  if (tipo === 'loja')
  pool.push({ type: 'loja', msg: "Você encontrou uma loja" });
        }
    }
    return pool;
}


function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function gerarCasasEspeciaisControladas(totalCasas, config) {
    const eventosPool = criarPoolEventos(config);
    embaralhar(eventosPool);




    const especiais = {};
    const usadas = new Set();




    eventosPool.forEach(evento => {
        let pos;
        do {
            pos = Math.floor(Math.random() * (totalCasas - 2)) + 1;
        } while (usadas.has(pos));




        usadas.add(pos);
        especiais[pos] = { ...evento };
    });




    return especiais;
}

function mostrarFeedbackErro(pergunta) {
  const titulo = document.getElementById("modal-title");
  const msg = document.getElementById("modal-msg");
  const optsDiv = document.getElementById("modal-opts");
  const helpDiv = document.getElementById("modal-help");

  const explicacao = pergunta.feedbackErro?.explicacao || "Vamos revisar esse ponto.";
  const exemplo = pergunta.feedbackErro?.exemplo || "";
  const dica = pergunta.feedbackErro?.dica || "";

  titulo.innerText = "Resposta incorreta";

  msg.innerHTML = `
    <p><strong>Por quê?</strong><br>${explicacao}</p>
    ${exemplo ? `<p><strong>Exemplo correto:</strong><br>${exemplo}</p>` : ""}
    ${dica ? `<p><strong>Dica:</strong><br>${dica}</p>` : ""}
  `;

  optsDiv.innerHTML = "";
  helpDiv.innerHTML = "";

  const materia = pergunta.materia;
  if (errosPorMateria[materia] >= 3) {
    msg.innerHTML += `
      <p style="margin-top:10px;color:#e67e22">
        👀 Você está errando bastante <strong>${materia}</strong>.
        Que tal revisar esse conteúdo?
      </p>
    `;
  }

  const btn = document.createElement("button");
  btn.innerText = "Entendi, continuar";
  btn.onclick = () => {
    modalOverlay.style.display = "none";
  };

  optsDiv.appendChild(btn);

  modalOverlay.style.display = "flex";
}

// Função para rastrear desempenho
function rastrearDesempenho(pergunta, acertou) {
  // Incrementar total de perguntas
  estatisticas.totalPerguntas++;

  // Rastrear por matéria
  if (!estatisticas.acertosPorMateria[pergunta.materia]) {
    estatisticas.acertosPorMateria[pergunta.materia] = 0;
    estatisticas.errosPorMateria[pergunta.materia] = 0;
  }

  if (acertou) {
    estatisticas.acertosPorMateria[pergunta.materia]++;
  } else {
    estatisticas.errosPorMateria[pergunta.materia]++;
  }

  // Rastrear por módulo
  if (!estatisticas.acertosPorModulo[pergunta.modulo]) {
    estatisticas.acertosPorModulo[pergunta.modulo] = 0;
    estatisticas.errosPorModulo[pergunta.modulo] = 0;
  }

  if (acertou) {
    estatisticas.acertosPorModulo[pergunta.modulo]++;
  } else {
    estatisticas.errosPorModulo[pergunta.modulo]++;
  }

  // Rastrear nível por matéria
  if (!estatisticas.nivelPorMateria[pergunta.materia]) {
    estatisticas.nivelPorMateria[pergunta.materia] = {};
  }
  
  const nivel = pergunta.nivel;
  if (!estatisticas.nivelPorMateria[pergunta.materia][nivel]) {
    estatisticas.nivelPorMateria[pergunta.materia][nivel] = {
      acertos: 0,
      erros: 0
    };
  }

  if (acertou) {
    estatisticas.nivelPorMateria[pergunta.materia][nivel].acertos++;
  } else {
    estatisticas.nivelPorMateria[pergunta.materia][nivel].erros++;
  }

  // Atualizar maior sequência
  if (streak > maiorStreak) {
    maiorStreak = streak;
  }
}


// 2. ELEMENTOS DO DOM
let boardEl;
let playerEl;
let statusEl;
let btnDice;
let modalOverlay;
let shopOpenButtons;
let homeOverlay;

function mostrarTelaInicial() {
  if (homeOverlay) {
    homeOverlay.hidden = false;
    homeOverlay.style.display = 'flex';
  }
  atualizarResumoInicial();
}

function fecharTelaInicial() {
  if (homeOverlay) {
    homeOverlay.hidden = true;
    homeOverlay.style.display = 'none';
  }
}

function atualizarResumoInicial() {
  const taxaAcerto = calcularTaxaAcerto();
  const totalAcertos = Object.values(estatisticas.acertosPorMateria).reduce((a, b) => a + b, 0);
  const totalPerguntas = estatisticas.totalPerguntas || 0;
  const progresso = Math.round((playerPos / Math.max(totalCells - 1, 1)) * 100);

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  };

  setText('home-pontos', jogador.pontos);
  setText('home-vidas', jogador.vidas);
  setText('home-modulo', moduloAtual);
  setText('home-taxa', `${taxaAcerto}%`);
  setText('home-sequencia', maiorStreak);
  setText('home-progresso', `${progresso}%`);
  setText('home-status', totalPerguntas > 0
    ? `Você fez ${totalPerguntas} perguntas com ${totalAcertos} acertos.`
    : 'Seu progresso é salvo na sessão atual e pode ser retomado a qualquer momento.');
}

function reiniciarJogo() {
  playerPos = 0;
  moduloAtual = 1;
  streak = 0;
  pesoAtual = 1.0;
  poolPerguntasPorModulo = {};

  Object.keys(errosPorMateria).forEach(chave => delete errosPorMateria[chave]);
  Object.keys(jogador.ajudas).forEach(chave => { jogador.ajudas[chave] = 0; });
  jogador.vidas = 3;
  jogador.pontos = 0;

  estatisticas.totalPerguntas = 0;
  estatisticas.acertosPorMateria = {};
  estatisticas.errosPorMateria = {};
  estatisticas.acertosPorModulo = {};
  estatisticas.errosPorModulo = {};
  estatisticas.nivelPorMateria = {};
  maiorStreak = 0;

  limparEstadoSalvo();
  inicializarPoolPerguntas(moduloAtual);
  casasEspeciais = gerarCasasEspeciaisControladas(totalCells, configEventosPorModulo[moduloAtual]);
  createBoard();
  setTimeout(updatePlayerPos, 100);

  if (btnDice) btnDice.disabled = false;
  atualizarStatus('Novo jogo iniciado! Clique no dado para começar.');
  fecharTelaInicial();
}


// 3. INICIALIZAR
function init() {
  boardEl = document.getElementById('board');
  playerEl = document.getElementById('player');
  statusEl = document.getElementById('status');
  btnDice = document.getElementById('dice-btn');
  modalOverlay = document.getElementById('modal-overlay');
  shopOpenButtons = Array.from(document.querySelectorAll('#shop-open-btn, #shop-open-btn-2'));
  homeOverlay = document.getElementById('home-overlay');

  const btnNovoJogo = document.getElementById('btn-novo-jogo');
  const btnContinuar = document.getElementById('btn-continuar');
  const btnEstatisticasHome = document.getElementById('btn-estatisticas-home');
  const btnConfiguracoesHome = document.getElementById('btn-configuracoes-home');

  const temEstadoSalvo = carregarEstado();
  if (temEstadoSalvo) {
    const homeStatus = document.getElementById('home-status');
    if (homeStatus) {
      homeStatus.innerText = 'Partida salva encontrada. Você pode continuar de onde parou.';
    }
  }

  if (btnNovoJogo) btnNovoJogo.addEventListener('click', reiniciarJogo);
  if (btnContinuar) btnContinuar.addEventListener('click', () => {
    fecharTelaInicial();
    atualizarStatus('Continuando sua partida...');
  });
  if (btnEstatisticasHome) btnEstatisticasHome.addEventListener('click', () => { fecharTelaInicial(); abrirDashboard(); });
  if (btnConfiguracoesHome) btnConfiguracoesHome.addEventListener('click', () => {
    const homeStatus = document.getElementById('home-status');
    if (homeStatus) {
      homeStatus.innerText = 'Configurações rápidas: tema escuro, dicas ativadas e modo estudo pronto.';
    }
  });

  // Adicionar listener para botão de dashboard
  const dashboardBtn = document.getElementById('dashboard-btn');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', abrirDashboard);
  }

  // Fallbacks para localizar elementos quando IDs forem alterados acidentalmente
  if (!boardEl) boardEl = document.querySelector('#board') || document.querySelector('.board');
  if (!playerEl) playerEl = document.querySelector('#player') || document.querySelector('.player');
  if (!statusEl) statusEl = document.querySelector('#status') || document.querySelector('.status') || document.querySelector('[id^="status"]');
  if (!btnDice) btnDice = document.querySelector('#dice-btn') || document.querySelector('button[data-role="dice"]') || document.querySelector('button');
  if (!modalOverlay) modalOverlay = document.getElementById('modal-overlay') || document.querySelector('.modal-overlay');
  if (!shopOpenButtons.length) {
    const fallback = document.querySelector('[data-role="shop"]');
    if (fallback) shopOpenButtons = [fallback];
  }

  const missing = [];
  if (!boardEl) missing.push('board');
  if (!playerEl) missing.push('player');
  if (!statusEl) missing.push('status');
  if (!btnDice) missing.push('dice-btn');
  if (!modalOverlay) missing.push('modal-overlay');

  if (missing.length) {
    console.error('Erro ao inicializar elementos do DOM. IDs ausentes ou incorretos:', missing.join(', '));
    return;
  }

  shopOpenButtons.forEach(button => {
    button.addEventListener('click', abrirLoja);
  });

  window.addEventListener('beforeunload', salvarEstado);
  window.addEventListener('pagehide', salvarEstado);

  btnDice.onclick = async () => {
    btnDice.disabled = true;
    const dado = Math.floor(Math.random() * 6) + 1;

    atualizarStatus(`Você tirou ${dado}`);

    await movePlayer(dado);
    await processarCasaEspecial();

    btnDice.disabled = false;
  };

  if (!poolPerguntasPorModulo[moduloAtual] || poolPerguntasPorModulo[moduloAtual].length === 0) {
    inicializarPoolPerguntas(moduloAtual);
  }

  if (!casasEspeciais || Object.keys(casasEspeciais).length === 0) {
    casasEspeciais = gerarCasasEspeciaisControladas(totalCells, configEventosPorModulo[moduloAtual]);
  }

  createBoard();
  setTimeout(updatePlayerPos, 100);
  mostrarTelaInicial();
}


// Criar tabuleiro
function createBoard() {
    boardEl.innerHTML = "";
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = 'c' + i;




        if (i === 0) cell.innerText = "Início";
        else if (i === totalCells - 1) cell.innerText = "FIM";
        else cell.innerText = i;


        // Marcar casas especiais
if (casasEspeciais[i]) {
    const tipo = casasEspeciais[i].type;


    cell.classList.add('special');


    if (classePorEvento[tipo]) {
        cell.classList.add(classePorEvento[tipo]);
    }


    // Ícone visual
    if (tipo === 'quiz') cell.innerText += " ?";
    else cell.innerText += " !";
}


        boardEl.appendChild(cell);
    }
}


// Atualiza posição
function updatePlayerPos() {
    const cell = document.getElementById('c' + playerPos);
    if (!cell) return;
    playerEl.style.left = (cell.offsetLeft + 20) + 'px';
    playerEl.style.top = (cell.offsetTop + 20) + 'px';
}

// Anima o pulo da peça
async function playJumpAnimation() {
    const playerEl = document.getElementById('player');
    playerEl.classList.remove('jumping');
    // Trigger reflow para resetar a animação
    void playerEl.offsetWidth;
    playerEl.classList.add('jumping');
    
    // Aguardar a animação terminar
    await new Promise(r => setTimeout(r, 400));
    playerEl.classList.remove('jumping');
}

// Movimento com animação de pulo passo a passo
async function movePlayer(steps) {
    const initialPos = playerPos;
    const finalPos = Math.min(totalCells - 1, Math.max(0, initialPos + steps));
    const totalSteps = Math.abs(finalPos - initialPos);
    
    // Animar cada passo individual
    for (let i = 1; i <= totalSteps; i++) {
        if (finalPos > initialPos) {
            playerPos = initialPos + i;
        } else {
            playerPos = initialPos - i;
        }
        
        updatePlayerPos();
        await playJumpAnimation();
    }
    
    // Aguardar um pouco antes de processar eventos especiais
    await new Promise(r => setTimeout(r, 300));

    if (playerPos === totalCells - 1) {
        moduloAtual++;
        streak = 0;
        pesoAtual = 1.0;

        alert(`🎉 Módulo ${moduloAtual - 1} concluído! Bem-vindo ao módulo ${moduloAtual}`);
        abrirLoja();
        inicializarPoolPerguntas(moduloAtual);
        playerPos = 0;
        casasEspeciais = gerarCasasEspeciaisControladas(totalCells, configEventosPorModulo[moduloAtual]);
        createBoard();
        setTimeout(updatePlayerPos, 100);
    }

    salvarEstado();
}




// 4. LÓGICA
async function processarCasaEspecial() {
    const visitadas = new Set();
    let evento;

    while ((evento = casasEspeciais[playerPos])) {




        if (visitadas.has(playerPos)) break;
        visitadas.add(playerPos);




        if (evento.type === 'luck' || evento.type === 'badLuck') {
            await movePlayer(evento.val);
        }
        else if (evento.type === 'quiz') {
            await runQuiz();
        }
        else if (evento.type === 'ganhaVida') {
            jogador.vidas = Math.min(MAX_VIDAS, jogador.vidas + 1);
        }


        else if (evento.type === 'perdeVida') {
            jogador.vidas--;
            if (jogador.vidas <= 0) {
                alert("GAME OVER");
                location.reload();
            }
        }
        else if (evento.type === 'ganhaEliminar') {
            jogador.ajudas.eliminar = Math.min(MAX_AJUDA, jogador.ajudas.eliminar + 1);
        }
        else if (evento.type === 'ganhaPular') {
            jogador.ajudas.pular = Math.min(MAX_AJUDA, jogador.ajudas.pular + 1);
        }
        else if (evento.type === 'perdeAjuda') {
            perderAjudaAleatoria();
        }
        else if (evento.type === 'perdeTodasAjudas') {
            jogador.ajudas.eliminar = 0;
            jogador.ajudas.pular = 0;
        }
        else if (evento.type === 'aumentaPeso') {
  pesoAtual = Math.min(PESO_MAX, pesoAtual + PASSO_PESO);
}
else if (evento.type === 'diminuiPeso') {
  pesoAtual = Math.max(PESO_MIN, pesoAtual - PASSO_PESO);
}
else if (evento.type === 'loja') {
  abrirLoja();
}
       
        // ✅ só atualiza status se NÃO for quiz
        if (evento.type !== 'quiz') {
            atualizarStatus(evento.msg || "");
        }




    }
    salvarEstado();
}




// Quiz
function runQuiz() {
    return new Promise(resolve => {
        if (!poolPerguntasPorModulo[moduloAtual] || poolPerguntasPorModulo[moduloAtual].length === 0) {
  inicializarPoolPerguntas(moduloAtual);
}

const pool = poolPerguntasPorModulo[moduloAtual];
const index = Math.floor(Math.random() * pool.length);
const q = pool.splice(index, 1)[0]; // REMOVE a pergunta usada
        
        document.getElementById('modal-title').innerText = "DESAFIO";
        document.getElementById('modal-msg').innerText = q.questao;
        const optsDiv = document.getElementById('modal-opts');
        const helpDiv = document.getElementById('modal-help');




        optsDiv.innerHTML = "";
        helpDiv.innerHTML = "";

        if (modalOverlay) {
            modalOverlay.hidden = false;
            modalOverlay.style.display = 'flex';
        }




        // AJUDAS
        if (jogador.ajudas.eliminar > 0) {
            const btn = document.createElement('button');
            btn.innerText = "Eliminar 2";
            btn.onclick = () => {
                jogador.ajudas.eliminar--;
                let removidas = 0;
                [...optsDiv.children].forEach((b, i) => {
                    if (i !== q.correta && removidas < 2) {
                        b.disabled = true;
                        b.style.opacity = 0.3;
                        removidas++;
                    }
                });
                btn.remove();
            };
            helpDiv.appendChild(btn);
        }




        if (jogador.ajudas.pular > 0) {
            const btn = document.createElement('button');
            btn.innerText = "Pular";
            btn.onclick = () => {
                jogador.ajudas.pular--;
                atualizarStatus();
                if (modalOverlay) {
                    modalOverlay.hidden = true;
                    modalOverlay.style.display = 'none';
                }
                resolve();
            };
            helpDiv.appendChild(btn);
        }




        q.opcoes.forEach((txt, i) => {
            const btn = document.createElement('button');
            btn.classList.add('btn-opt');
            btn.type = 'button';
            btn.innerText = txt;
            btn.onclick = async () => {
                if (modalOverlay) {
                    modalOverlay.hidden = true;
                    modalOverlay.style.display = 'none';
                }

                if (i === q.correta) {
                  streak++; // ✅ aumenta sequência
                  rastrearDesempenho(q, true);

                  const nivelNormalizado = q.nivel
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");


  const base = pontosPorNivel[nivelNormalizado] || 0;
  const bonus = calcularBonusSequencia(streak);
  const total = Math.round((base * pesoAtual) + bonus);


  jogador.pontos += total;


  atualizarStatus(
    `Correto! +${base} pontos (${q.nivel})` +
  ` | Peso x${pesoAtual}` +
    (bonus > 0 ? ` Bônus sequência +${bonus}` : "") +
    ` | Sequência: ${streak}`
  );
  salvarEstado();
                } else {
                    streak = 0;
                    jogador.vidas--;
                    rastrearDesempenho(q, false);
                    atualizarStatus(`Incorreto! Vidas restantes: ${jogador.vidas}`);
                    const materia = q.materia;

                    errosPorMateria[materia] = (errosPorMateria[materia] || 0) + 1;

                    mostrarFeedbackErro(q);

                    if (jogador.vidas <= 0) {
                        alert("GAME OVER!");
                        location.reload();
                        return;
                    }
                }




                resolve();
            };




            optsDiv.appendChild(btn);
        });
    });
}

function perderAjudaAleatoria() {
    const arr = [];
    if (jogador.ajudas.eliminar > 0) arr.push('eliminar');
    if (jogador.ajudas.pular > 0) arr.push('pular');
    if (!arr.length) return;
    jogador.ajudas[arr[Math.floor(Math.random() * arr.length)]]--;
}

// Funções do Dashboard
function calcularTaxaAcerto() {
  if (estatisticas.totalPerguntas === 0) return 0;
  const totalAcertos = Object.values(estatisticas.acertosPorMateria).reduce((a, b) => a + b, 0);
  return ((totalAcertos / estatisticas.totalPerguntas) * 100).toFixed(1);
}

function gerarHTMLDashboard() {
  const taxaAcerto = calcularTaxaAcerto();
  const totalAcertos = Object.values(estatisticas.acertosPorMateria).reduce((a, b) => a + b, 0);
  const totalErros = Object.values(estatisticas.errosPorMateria).reduce((a, b) => a + b, 0);

  let html = `
    <div class="dashboard-header">
      <h2>📊 Dashboard de Desempenho</h2>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <span class="stat-label">Total de Perguntas</span>
        <span class="stat-value">${estatisticas.totalPerguntas}</span>
      </div>
      <div class="stat-card success">
        <span class="stat-label">Total de Acertos</span>
        <span class="stat-value">${totalAcertos}</span>
      </div>
      <div class="stat-card danger">
        <span class="stat-label">Total de Erros</span>
        <span class="stat-value">${totalErros}</span>
      </div>
      <div class="stat-card accent">
        <span class="stat-label">Taxa de Acerto</span>
        <span class="stat-value">${taxaAcerto}%</span>
      </div>
      <div class="stat-card gold">
        <span class="stat-label">Maior Sequência</span>
        <span class="stat-value">${maiorStreak}</span>
      </div>
    </div>

    <div class="dashboard-section">
      <h3>📚 Desempenho por Matéria</h3>
      <div class="performance-table">
        <div class="table-header">
          <div class="col-materia">Matéria</div>
          <div class="col-acertos">Acertos</div>
          <div class="col-erros">Erros</div>
          <div class="col-taxa">Taxa</div>
        </div>
  `;

  // Gerar linhas por matéria
  for (const materia in estatisticas.acertosPorMateria) {
    const acertos = estatisticas.acertosPorMateria[materia] || 0;
    const erros = estatisticas.errosPorMateria[materia] || 0;
    const total = acertos + erros;
    const taxa = total > 0 ? ((acertos / total) * 100).toFixed(0) : 0;

    html += `
      <div class="table-row">
        <div class="col-materia"><strong>${materia}</strong></div>
        <div class="col-acertos"><span class="badge success">${acertos}</span></div>
        <div class="col-erros"><span class="badge danger">${erros}</span></div>
        <div class="col-taxa"><span class="badge accent">${taxa}%</span></div>
      </div>
    `;
  }

  html += `
      </div>
    </div>

    <div class="dashboard-section">
      <h3>📈 Desempenho por Módulo</h3>
      <div class="performance-table">
        <div class="table-header">
          <div class="col-modulo">Módulo</div>
          <div class="col-acertos">Acertos</div>
          <div class="col-erros">Erros</div>
          <div class="col-taxa">Taxa</div>
        </div>
  `;

  // Gerar linhas por módulo
  for (const modulo in estatisticas.acertosPorModulo) {
    const acertos = estatisticas.acertosPorModulo[modulo] || 0;
    const erros = estatisticas.errosPorModulo[modulo] || 0;
    const total = acertos + erros;
    const taxa = total > 0 ? ((acertos / total) * 100).toFixed(0) : 0;

    html += `
      <div class="table-row">
        <div class="col-modulo"><strong>Módulo ${modulo}</strong></div>
        <div class="col-acertos"><span class="badge success">${acertos}</span></div>
        <div class="col-erros"><span class="badge danger">${erros}</span></div>
        <div class="col-taxa"><span class="badge accent">${taxa}%</span></div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

function abrirDashboard() {
  const dashboardOverlay = document.getElementById('dashboard-overlay');
  const dashboardContent = document.getElementById('dashboard-content');
  
  if (dashboardContent) {
    dashboardContent.innerHTML = gerarHTMLDashboard();
  }
  
  if (dashboardOverlay) {
    dashboardOverlay.hidden = false;
    dashboardOverlay.style.display = 'flex';
  }
}

function fecharDashboard() {
  const dashboardOverlay = document.getElementById('dashboard-overlay');
  if (dashboardOverlay) {
    dashboardOverlay.hidden = true;
    dashboardOverlay.style.display = 'none';
  }
}





function atualizarStatus(mensagem = null) {
  // atualizar a linha de status (parágrafo)
  if (statusEl && mensagem !== null) {
    statusEl.innerText = mensagem;
  }

  // atualizar os itens visuais no painel
  const uiPontos = document.getElementById('ui-pontos');
  const uiVidas = document.getElementById('ui-vidas');
  const uiPular = document.getElementById('ui-pular');
  const uiEliminar = document.getElementById('ui-eliminar');
  const uiPeso = document.getElementById('ui-peso');
  if (uiPontos) uiPontos.innerText = jogador.pontos;
  if (uiVidas) uiVidas.innerText = jogador.vidas;
  if (uiPular) uiPular.innerText = jogador.ajudas.pular;
  if (uiEliminar) uiEliminar.innerText = jogador.ajudas.eliminar;
  if (uiPeso) uiPeso.innerText = `x${pesoAtual.toFixed(1)}`;

  atualizarResumoInicial();
  salvarEstado();
}




// Iniciar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.abrirLoja = abrirLoja;
window.fecharLoja = fecharLoja;
window.comprarItem = comprarItem;
window.abrirDashboard = abrirDashboard;
window.fecharDashboard = fecharDashboard;




