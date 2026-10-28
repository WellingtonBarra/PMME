
async function carregarComponente(destino, arquivo) {
    const elemento = document.getElementById(destino);

    if (!elemento) return;

    try {
        const resposta = await fetch(arquivo);

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        elemento.innerHTML = await resposta.text();
    } catch (erro) {
        console.error(`Erro ao carregar ${arquivo}:`, erro);
        elemento.textContent = `Não foi possível carregar ${arquivo}. Abra pelo Live Server.`;
    }
}

async function iniciarComponentes() {
    await Promise.all([
        carregarComponente("header-container", "components/header.html"),
        carregarComponente("footer-container", "components/footer.html")
    ]);

    window.PMME_UI?.montarConta();
    if (new URLSearchParams(location.search).has('demonstracao')) {
        document.querySelectorAll('.menu-principal a').forEach(a => {
            a.href += '?demonstracao=1';
        });
    }
    const pagina = document.body.dataset.pagina;

    const link = document.querySelector(
        `.menu-principal a[data-pagina="${pagina}"]`
    );

    if (link) {
        link.classList.add("ativo");
        link.setAttribute("aria-current", "page");
    }
}

function iniciarCarrossel() {
    const moldura = document.querySelector(".carrossel-moldura");
    const trilho = document.querySelector(".carrossel-trilho");

    if (!moldura || !trilho) return;

    const originais = Array.from(trilho.querySelectorAll(".cartaz"));
    const pontos = Array.from(document.querySelectorAll(".pontos i"));
    const anterior = moldura.querySelector(".seta-esquerda");
    const proximo = moldura.querySelector(".seta-direita");

    if (originais.length < 2) return;

    const total = originais.length;
    const duracao = 500;
    const espera = 2000;

    const copiasAntes = originais.map(cartaz => cartaz.cloneNode(true));
    const copiasDepois = originais.map(cartaz => cartaz.cloneNode(true));

    trilho.prepend(...copiasAntes);
    trilho.append(...copiasDepois);

    const cartazes = Array.from(trilho.querySelectorAll(".cartaz"));

    let indice = total;
    let animando = false;
    let temporizador = null;

    function indiceReal() {
        return ((indice % total) + total) % total;
    }

    function atualizarPontos() {
        const atual = indiceReal();

        pontos.forEach((ponto, i) => {
            ponto.classList.toggle("selecionado", i === atual);
        });

        cartazes.forEach((cartaz, i) => {
            const distancia = Math.abs(i - indice);

            cartaz.classList.toggle("cartaz-lateral", distancia > 1);
        });
    }

    function posicionar(comAnimacao = true) {
        const cartaz = cartazes[indice];

        if (!cartaz) return;

        const centroCartaz = cartaz.offsetLeft + cartaz.offsetWidth / 2;

        trilho.style.transition = comAnimacao
            ? `transform ${duracao}ms ease-in-out`
            : "none";

        trilho.style.transform = `translateX(${-centroCartaz}px)`;

        atualizarPontos();
    }

    function agendarAvanco() {
        clearTimeout(temporizador);

        temporizador = setTimeout(() => {
            mover(1);
        }, espera);
    }

    function mover(direcao) {
        if (animando) return;

        clearTimeout(temporizador);

        animando = true;
        indice += direcao;

        posicionar(true);
    }

    trilho.addEventListener("transitionend", evento => {
        if (evento.target !== trilho || evento.propertyName !== "transform") {
            return;
        }

        if (!animando) return;

        animando = false;

        if (indice >= total * 2) {
            indice -= total;
            posicionar(false);
        } else if (indice < total) {
            indice += total;
            posicionar(false);
        }

        agendarAvanco();
    });

    anterior?.addEventListener("click", () => {
        mover(-1);
    });

    proximo?.addEventListener("click", () => {
        mover(1);
    });

    window.addEventListener("resize", () => {
        posicionar(false);
    });

    posicionar(false);
    agendarAvanco();
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarComponentes();
    iniciarCarrossel();
});
