import perguntas from "./questoes.js";
// 1. DADOS (Configurações)
const totalCells = 60;
let playerPos = 0;
let moduloAtual = 1;
let streak = 0;
let pesoAtual = 1.0;
let poolPerguntasPorModulo = {};
const errosPorMateria = {};

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

function abrirLoja() {
  document.getElementById("loja-overlay").style.display = "flex";
  atualizarLoja();
}

function fecharLoja() {
  document.getElementById("loja-overlay").style.display = "none";
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


  atualizarLoja(`${tipo} comprado por ${precoFinal} pts!`);
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

// 2. ELEMENTOS DO DOM
let boardEl;
let playerEl;
let statusEl;
let btnDice;
let modalOverlay;
let shopOpenButtons;


// 3. INICIALIZAR
function init() {
  boardEl = document.getElementById('board');
  playerEl = document.getElementById('player');
  statusEl = document.getElementById('status');
  btnDice = document.getElementById('dice-btn');
  modalOverlay = document.getElementById('modal-overlay');
  shopOpenButtons = Array.from(document.querySelectorAll('#shop-open-btn, #shop-open-btn-2, .shop-toggle'));

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

  btnDice.onclick = async () => {
    btnDice.disabled = true;
    const dado = Math.floor(Math.random() * 6) + 1;

    atualizarStatus(`Você tirou ${dado}`);

    await movePlayer(dado);
    await processarCasaEspecial();

    btnDice.disabled = false;
  };

  inicializarPoolPerguntas(moduloAtual);
  casasEspeciais = gerarCasasEspeciaisControladas(totalCells, configEventosPorModulo[moduloAtual]);
  createBoard();
  setTimeout(updatePlayerPos, 100);
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


// Movimento
async function movePlayer(steps) {
    playerPos += steps;
    if (playerPos >= totalCells - 1) playerPos = totalCells - 1;
    if (playerPos < 0) playerPos = 0;


    updatePlayerPos();
    await new Promise(r => setTimeout(r, 600));


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




        modalOverlay.style.display = 'flex';




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
                modalOverlay.style.display = 'none';
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
                modalOverlay.style.display = 'none';




                if (i === q.correta) {
  streak++; // ✅ aumenta sequência


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
  atualizarStatus();
} else {
                    streak = 0;
                    jogador.vidas--;
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
window.comprarItem = comprarItem;




