document.addEventListener('DOMContentLoaded', () => {
  const somErro = new Audio('som/erro.mp3');
  const somAcerto = new Audio('som/acerto.mp3'); 

  const todasImagens = [
    'foto1.jpeg', 'foto2.jpeg', 'foto3.jpeg', 'foto4.jpeg', 'foto5.jpeg',
    'foto6.jpeg', 'foto7.jpeg', 'foto8.jpeg', 'foto9.jpeg', 'foto10.jpeg',
    'foto11.jpeg', 'foto12.jpeg', 'foto13.jpeg', 'foto14.jpeg', 'foto15.jpeg',
    'foto16.jpeg', 'foto17.jpeg', 'foto18.jpeg', 'foto19.jpeg', 'foto20.jpeg',
    'foto21.jpeg', 'foto22.jpeg', 'foto23.jpeg', 'foto24.jpeg', 'foto25.jpeg'
  ];

  const tabuleiro = document.getElementById('tabuleiro');
  let primeiraCarta = null;
  let travarTabuleiro = false;
  let cartasViradas = 0;
  let startTime, interval;
  let totalPares = 12;
  let ranking = JSON.parse(localStorage.getItem('ranking')) || [];

  // Captura do clique nos botões de quantidade de pares
  document.querySelectorAll('.btn-pares').forEach(button => {
    button.addEventListener('click', (e) => {
      totalPares = parseInt(e.target.dataset.pares);
      iniciarJogo();
    });
  });

function pararRelogio() {
    clearInterval(interval);
    // Zerar o tempo no cronômetro
    document.getElementById('tempo').textContent = "00:00";
}

  // Inicializa o jogo
  function iniciarJogo() {
    cartasViradas = 0;
    startTime = new Date().getTime();
    document.getElementById('cronometro').style.display = 'block';
    interval = setInterval(atualizarTempo, 1000);

    document.getElementById('btn-novo-jogo').style.display = 'none';
    document.getElementById('btn-voltar-menu').style.display = 'block'; // Mostrar o botão voltar
    document.getElementById('ranking').style.display = 'none';

    document.getElementById('tela-inicial').classList.add('escondido');
    document.getElementById('titulo-jogo').classList.remove('escondido');
    tabuleiro.classList.remove('escondido');

    ajustarLayout();

    const imagensSelecionadas = selecionarImagens();
    const cartas = embaralhar([...imagensSelecionadas, ...imagensSelecionadas]);

    tabuleiro.innerHTML = '';
    cartas.forEach((img, index) => {
      const carta = document.createElement('div');
      carta.classList.add('carta');
      carta.innerHTML = `
        <div class="carta-inner">
          <div class="carta-costas">${index + 1}</div>
          <div class="carta-frente" style="background-image: url('imagens/${img}');"></div>
        </div>
      `;
      carta.addEventListener('click', () => virarCarta(carta));
      tabuleiro.appendChild(carta);
    });
  }

  function ajustarLayout() {
    tabuleiro.classList.remove('tabuleiro-6', 'tabuleiro-12', 'tabuleiro-18');
    if (totalPares === 6) {
      tabuleiro.classList.add('tabuleiro-6');
    } else if (totalPares === 12) {
      tabuleiro.classList.add('tabuleiro-12');
    } else if (totalPares === 18) {
      tabuleiro.classList.add('tabuleiro-18');
    }
  }

  function selecionarImagens() {
    const imagensSelecionadas = [];
    const copiaImagens = [...todasImagens];
    while (imagensSelecionadas.length < totalPares) {
      const index = Math.floor(Math.random() * copiaImagens.length);
      imagensSelecionadas.push(copiaImagens.splice(index, 1)[0]);
    }
    return imagensSelecionadas;
  }

  function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function virarCarta(carta) {
    if (travarTabuleiro || carta.classList.contains('virada')) return;
    carta.classList.add('virada');

    if (!primeiraCarta) {
      primeiraCarta = carta;
    } else {
      const segundaCarta = carta;
      const img1 = primeiraCarta.querySelector('.carta-frente').style.backgroundImage;
      const img2 = segundaCarta.querySelector('.carta-frente').style.backgroundImage;

      if (img1 === img2) {
        somAcerto.play();
        cartasViradas += 2;
        verificarFimDoJogo();
        primeiraCarta = null;
      } else {
        travarTabuleiro = true;
        setTimeout(() => {
          somErro.play();
          primeiraCarta.classList.remove('virada');
          segundaCarta.classList.remove('virada');
          primeiraCarta = null;
          travarTabuleiro = false;
        }, 1000);
      }
    }
  }

  function verificarFimDoJogo() {
    if (cartasViradas === totalPares * 2) {
      setTimeout(finalizarJogo, 500);
    }
  }

  function atualizarTempo() {
    const tempoAtual = Math.floor((new Date().getTime() - startTime) / 1000);
    const minutos = String(Math.floor(tempoAtual / 60)).padStart(2, '0');
    const segundos = String(tempoAtual % 60).padStart(2, '0');
    document.getElementById('tempo').textContent = `${minutos}:${segundos}`;
}
// Função para atualizar o ranking (exemplo básico)
function atualizarRanking() {
  const listaRanking = document.getElementById('lista-ranking');
  listaRanking.innerHTML = ''; // Limpar lista antes de atualizar

  // Carregar o ranking atualizado do localStorage
  ranking = JSON.parse(localStorage.getItem('ranking')) || [];

  console.log("Ranking atualizado:", ranking); // Verificar se está puxando os dados certos

  // Criar os elementos da lista com posição correta
  ranking.forEach((jogador, index) => {
      const novoItem = document.createElement('li');
      novoItem.textContent = `${index + 1}. ${jogador.nome} - ${jogador.tempo}s`;
      listaRanking.appendChild(novoItem);
  });
}

function finalizarJogo() {
  pararRelogio();  // Para o relógio
  const tempoFinal = Math.floor((new Date().getTime() - startTime) / 1000);
  const nomeJogador = prompt("Digite seu nome para o ranking:");

  if (nomeJogador && nomeJogador.trim() !== "") {
      // Carregar o ranking existente ou criar um novo
      ranking = JSON.parse(localStorage.getItem('ranking')) || [];

      // Adicionar o novo jogador ao ranking
      ranking.push({ nome: nomeJogador, tempo: tempoFinal });

      // Ordenar pelo tempo e limitar a 10 jogadores
      ranking.sort((a, b) => a.tempo - b.tempo);
      ranking = ranking.slice(0, 10);

      // Armazenar no localStorage antes de atualizar
      localStorage.setItem('ranking', JSON.stringify(ranking));

      // Atualizar e mostrar o ranking após salvar
      atualizarRanking();
      mostrarRanking();
  }

  document.getElementById('btn-novo-jogo').style.display = 'block';
}

 // Função para voltar ao menu inicial
function voltarAoMenu() {
  // Parar o cronômetro
  clearInterval(interval);

  // Esconder o tabuleiro e o cronômetro
  tabuleiro.classList.add('escondido');
  document.getElementById('titulo-jogo').classList.add('escondido');
  document.getElementById('btn-novo-jogo').style.display = 'none';
  document.getElementById('btn-voltar-menu').style.display = 'none';
  document.getElementById('ranking').style.display = 'none';
  document.getElementById('cronometro').style.display = 'none';

  // Mostrar a tela inicial
  document.getElementById('tela-inicial').classList.remove('escondido');
}

// Evento para o botão "Voltar ao Menu"
document.getElementById('btn-voltar-menu').addEventListener('click', voltarAoMenu);

  function ajustarLayoutRanking() {
    const rankingContainer = document.getElementById('ranking');
    rankingContainer.classList.remove('ranking-6', 'ranking-12', 'ranking-18');
  
    if (totalPares === 6) {
      rankingContainer.classList.add('ranking-6');
    } else if (totalPares === 12) {
      rankingContainer.classList.add('ranking-12');
    } else if (totalPares === 18) {
      rankingContainer.classList.add('ranking-18');
    }
  }
  
  function abrirRanking() {
    ajustarLayoutRanking(); // Ajustar o layout conforme os pares escolhidos
    const rankingContainer = document.getElementById('ranking');
    const lista = document.getElementById('lista-ranking');
    lista.innerHTML = '';

    // Carregar o ranking atualizado do localStorage
    ranking = JSON.parse(localStorage.getItem('ranking')) || [];

    ranking.forEach((jogador, index) => {
        const item = document.createElement('li');
        item.textContent = `${index + 1}. ${jogador.nome} - ${jogador.tempo}s`;
        lista.appendChild(item);
    });

    rankingContainer.style.display = 'block';
}

  function mostrarRanking() {
    console.log("Função mostrarRanking chamada");  // Verificação
    const ranking = document.getElementById('ranking');

    // Garantir que o ranking apareça
    ranking.style.display = 'block';
    ranking.style.visibility = 'visible';
    ranking.classList.remove('escondido');  // Remover a classe escondido
    ranking.classList.add('mostrar');  // Adicionar efeito de exibição

    // Ocultar automaticamente após 6 segundos
    setTimeout(() => {
        ranking.classList.remove('mostrar');
        ranking.classList.add('escondido');  // Ocultar após o efeito
    }, 6000);
}

  // Função para zerar o ranking
function zerarRanking() {
  localStorage.removeItem('ranking');
  ranking = [];
  abrirRanking();
}

// Evento para o botão de zerar ranking
document.getElementById('btn-zerar-ranking').addEventListener('click', () => {
  if (confirm("Tem certeza que deseja apagar todo o ranking?")) {
      zerarRanking();
      alert("Ranking zerado com sucesso!");
  }
});

  document.getElementById('btn-novo-jogo').addEventListener('click', iniciarJogo);
});


