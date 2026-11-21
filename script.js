// Destaca no menu a seção visível
const links = [...document.querySelectorAll("nav ul a")];
const secoes = document.querySelectorAll("main section[id]");
const observer = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.toggle("ativo", l.hash === "#" + e.target.id));
      }
    });
  },
  { rootMargin: "-30% 0px -60% 0px" }
);
secoes.forEach((s) => observer.observe(s));

// Ano do rodapé
const ano = document.getElementById("ano");
if (ano) ano.textContent = new Date().getFullYear();

// Botão de voltar ao topo
const topo = document.getElementById("topo");
if (topo) {
  window.addEventListener("scroll", () => {
    topo.classList.toggle("visivel", window.scrollY > 600);
  });
  topo.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// Esconde a foto se o arquivo não carregar
const foto = document.querySelector(".foto");
if (foto) foto.addEventListener("error", () => foto.remove());

// Galeria de certificados: lê site/Certificados/<pasta>/<arquivos> do repositório
const GH = { usuario: "DCapulot", repo: "David_Capulot_Correa", pasta: "site/Certificados" };
const btnCerts = document.getElementById("btn-certs");
const galeria = document.getElementById("galeria");
const EXT_IMG = /\.(jpe?g|png|webp|gif|avif)$/i;
const EXT_PDF = /\.pdf$/i;
let galeriaCarregada = false;

// Devolve os caminhos relativos a site/Certificados (ex.: "Python/certificado.pdf")
async function listarArquivos() {
  try {
    const r = await fetch(`https://api.github.com/repos/${GH.usuario}/${GH.repo}/git/trees/HEAD?recursive=1`);
    if (!r.ok) throw new Error(r.status);
    const dados = await r.json();
    const prefixo = GH.pasta + "/";
    return dados.tree
      .filter((i) => i.type === "blob" && i.path.startsWith(prefixo))
      .map((i) => i.path.slice(prefixo.length));
  } catch {
    // Plano B: lista manual em site/Certificados/lista.json (["Python/a.pdf","Cyber/b.jpg"])
    const r = await fetch(`${GH.pasta}/lista.json`);
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
}

function aviso(texto) {
  const p = document.createElement("p");
  p.className = "aviso";
  p.textContent = texto;
  galeria.replaceChildren(p);
}

const limpar = (t) => t.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
const ordenar = (a, b) => a.localeCompare(b, "pt-BR", { numeric: true });

function montarGaleria(caminhos) {
  const grupos = new Map();
  caminhos
    .filter((c) => EXT_IMG.test(c) || EXT_PDF.test(c))
    .forEach((c) => {
      const partes = c.split("/");
      const grupo = partes.length > 1 ? partes[0] : "Outros";
      if (!grupos.has(grupo)) grupos.set(grupo, []);
      grupos.get(grupo).push({ caminho: c, arquivo: partes[partes.length - 1] });
    });
  if (!grupos.size) return aviso("Nenhum certificado encontrado na pasta ainda.");

  galeria.replaceChildren();
  [...grupos.keys()].sort(ordenar).forEach((grupo) => {
    const bloco = document.createElement("section");
    bloco.className = "cert-grupo";
    const titulo = document.createElement("h4");
    titulo.textContent = grupo.replace(/[_]+/g, " ").trim();
    const lista = document.createElement("div");
    lista.className = "cert-lista";

    grupos.get(grupo).sort((a, b) => ordenar(a.arquivo, b.arquivo)).forEach(({ caminho, arquivo }) => {
      const nome = limpar(arquivo);
      const a = document.createElement("a");
      a.className = "cert-item";
      a.href = `${GH.pasta}/${caminho.split("/").map(encodeURIComponent).join("/")}`;
      a.target = "_blank";
      a.rel = "noopener";
      if (EXT_IMG.test(arquivo)) {
        const img = new Image();
        img.src = a.href;
        img.alt = "Certificado: " + nome;
        img.loading = "lazy";
        a.append(img);
      } else {
        const pdf = document.createElement("div");
        pdf.className = "pdf";
        pdf.textContent = "PDF";
        a.append(pdf);
      }
      const legenda = document.createElement("span");
      legenda.textContent = nome;
      a.append(legenda);
      lista.append(a);
    });

    bloco.append(titulo, lista);
    galeria.append(bloco);
  });
}

if (btnCerts && galeria) {
  btnCerts.addEventListener("click", async () => {
    const abrir = galeria.hidden;
    galeria.hidden = !abrir;
    btnCerts.setAttribute("aria-expanded", String(abrir));
    btnCerts.textContent = abrir ? "Esconder certificados" : "Ver todos os certificados";
    if (abrir && !galeriaCarregada) {
      aviso("Carregando certificados…");
      try {
        montarGaleria(await listarArquivos());
        galeriaCarregada = true;
      } catch {
        aviso("Não consegui carregar os certificados agora. Tente de novo em instantes.");
      }
    }
  });
}
