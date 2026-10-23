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
