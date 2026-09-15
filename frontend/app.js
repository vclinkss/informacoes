// ---- Configuração da API (backend/ nesta pasta, "npm run dev") ----
const API_BASE_URL = "https://informacoes.onrender.com/api";

// ---- Estado local ----
var token = localStorage.getItem("token") || sessionStorage.getItem("token") || null;
var usuario = null; // { id, nome, email, role, status }
var contatos = [];  // [{ id, liderId, lider, nome, endereco, bairro, whatsapp, votacao, liguei, obs }]

var CORES = ["#1F6E56", "#5DCAA5", "#0F6E56", "#9FE1CB", "#04342C", "#7F77DD", "#D85A30", "#534AB7"];

// ---- Ícones (SVG inline, herdam a cor do texto via currentColor) ----
var ICONE_PIN = '<svg class="icone" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
var ICONE_USERS = '<svg class="icone" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
var ICONE_PHONE = '<svg class="icone" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>';
var ICONE_CALENDARIO = '<svg class="icone" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>';

function waLink(numero) {
  var digits = (numero || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.indexOf("55") !== 0) digits = "55" + digits;
  return "https://wa.me/" + digits;
}

// Link de "traçar rota" do Google Maps — grátis, sem chave de API.
// Se já tivermos coordenada exata, usa ela (mais preciso); senão, manda o texto e o
// próprio Google Maps localiza na hora de abrir.
function googleMapsRotaLink(lat, lng, textoBusca) {
  var destino = (lat != null && lng != null) ? (lat + "," + lng) : encodeURIComponent(textoBusca);
  return "https://www.google.com/maps/dir/?api=1&destination=" + destino;
}

function mostrarErroEm(elId, msg) {
  var el = document.getElementById(elId);
  el.textContent = msg;
  el.style.display = "block";
}
function limparErroEm(elId) {
  document.getElementById(elId).style.display = "none";
}
function mostrarErro(msg) { mostrarErroEm("erro", msg); }
function limparErro() { limparErroEm("erro"); }
function mostrarAvisoConexao(mostrar) {
  document.getElementById("avisoConfig").style.display = mostrar ? "block" : "none";
}

async function api(path, options) {
  var resp;
  var headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  try {
    resp = await fetch(API_BASE_URL + path, Object.assign({ headers: headers }, options));
  } catch (e) {
    mostrarAvisoConexao(true);
    throw new Error("Não foi possível conectar à API.");
  }
  mostrarAvisoConexao(false);
  var json = null;
  try { json = await resp.json(); } catch (e) { /* corpo vazio, ok */ }
  if (!resp.ok) {
    var msg = (json && json.error && json.error.message) || "Erro na requisição (" + resp.status + ")";
    var erro = new Error(msg);
    erro.status = resp.status;
    throw erro;
  }
  return json;
}

// ---- Alternar entre telas ----
function mostrarAuth() {
  document.getElementById("viewAuth").hidden = false;
  document.getElementById("viewCarregando").hidden = true;
  document.getElementById("viewApp").hidden = true;
}
function mostrarCarregando() {
  document.getElementById("viewAuth").hidden = true;
  document.getElementById("viewCarregando").hidden = false;
  document.getElementById("viewApp").hidden = true;
}
function mostrarApp() {
  document.getElementById("viewAuth").hidden = true;
  document.getElementById("viewCarregando").hidden = true;
  document.getElementById("viewApp").hidden = false;
}
function mostrarLogin() {
  document.getElementById("formLogin").hidden = false;
  document.getElementById("formCadastro").hidden = true;
  limparErroEm("erroAuth");
  limparErroEm("erroCadastro");
}
function mostrarCadastro() {
  document.getElementById("formLogin").hidden = true;
  document.getElementById("formCadastro").hidden = false;
  limparErroEm("erroAuth");
  limparErroEm("erroCadastro");
}

document.getElementById("linkIrCadastro").addEventListener("click", function (e) { e.preventDefault(); mostrarCadastro(); });
document.getElementById("linkIrLogin").addEventListener("click", function (e) { e.preventDefault(); mostrarLogin(); });

// ---- Login ----
document.getElementById("btnLogin").addEventListener("click", async function () {
  var email = document.getElementById("loginEmail").value.trim();
  var senha = document.getElementById("loginSenha").value;
  if (!email || !senha) { mostrarErroEm("erroAuth", "Preencha e-mail e senha."); return; }

  var botao = this;
  botao.disabled = true;
  try {
    var resultado = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: email, senha: senha }) });
    token = resultado.token;
    usuario = resultado.usuario;
    var manterConectado = document.getElementById("manterConectado").checked;
    if (manterConectado) {
      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("token", token);
      localStorage.removeItem("token");
    }
    document.getElementById("loginSenha").value = "";
    limparErroEm("erroAuth");
    mostrarCarregando();
    await iniciarApp();
  } catch (e) {
    mostrarErroEm("erroAuth", e.message);
  } finally {
    botao.disabled = false;
  }
});

// ---- Cadastro ----
document.getElementById("btnCadastrar").addEventListener("click", async function () {
  var nome = document.getElementById("cadNome").value.trim();
  var email = document.getElementById("cadEmail").value.trim();
  var senha = document.getElementById("cadSenha").value;
  if (!nome || !email || !senha) { mostrarErroEm("erroCadastro", "Preencha todos os campos."); return; }
  if (senha.length < 6) { mostrarErroEm("erroCadastro", "A senha precisa ter pelo menos 6 caracteres."); return; }

  var botao = this;
  botao.disabled = true;
  try {
    await api("/auth/registrar", { method: "POST", body: JSON.stringify({ nome: nome, email: email, senha: senha }) });
    document.getElementById("cadNome").value = "";
    document.getElementById("cadEmail").value = "";
    document.getElementById("cadSenha").value = "";
    limparErroEm("erroCadastro");
    mostrarLogin();
    mostrarErroEm("erroAuth", "Cadastro enviado! Assim que um administrador aprovar, você já pode entrar.");
    document.getElementById("erroAuth").style.color = "#1F6E56";
  } catch (e) {
    mostrarErroEm("erroCadastro", e.message);
  } finally {
    botao.disabled = false;
  }
});

// ---- Logout ----
document.getElementById("btnSair").addEventListener("click", function () {
  token = null;
  usuario = null;
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  mostrarLogin();
  mostrarAuth();
});

// ---- Busca de endereço em tempo real (ao sair do campo Bairro/Local de votação/Endereço) ----
var bairroGeoEscolhido = null;
var votacaoGeoEscolhido = null;
var enderecoGeoEscolhido = null;

function encurtarNome(nomeCompleto) {
  // Nominatim devolve o endereço inteiro; mostra só o começo (mais legível) na caixinha de sugestão.
  var partes = nomeCompleto.split(",");
  return partes.slice(0, 3).join(",").trim();
}

var buscasPendentes = {};
var debounceBusca = {};

async function aguardarBusca(inputId) {
  if (buscasPendentes[inputId]) {
    try { await buscasPendentes[inputId]; } catch (e) { /* já tratado dentro da busca */ }
  }
}

function configurarBuscaEndereco(inputId, caixaId, aoEscolher, aoDigitarLivre, substituirTexto) {
  var input = document.getElementById(inputId);
  var caixa = document.getElementById(caixaId);

  function esconder() { caixa.hidden = true; caixa.innerHTML = ""; }

  input.addEventListener("input", function () {
    aoDigitarLivre();
    input.classList.remove("campo-confirmado");
    esconder();
    clearTimeout(debounceBusca[inputId]);
    debounceBusca[inputId] = setTimeout(function () {
      buscasPendentes[inputId] = executarBusca();
    }, 450);
  });

  input.addEventListener("blur", function () {
    clearTimeout(debounceBusca[inputId]);
    buscasPendentes[inputId] = executarBusca();
  });

  async function executarBusca() {
    var termo = input.value.trim();
    if (termo.length < 3) { esconder(); return; }

    caixa.hidden = false;
    caixa.innerHTML = '<div class="sugestao-carregando">Buscando endereço...</div>';
    try {
      var sugestoes = await api("/geo/buscar?q=" + encodeURIComponent(termo));
      // Se a pessoa já começou a digitar outra coisa enquanto a busca rodava, não sobrescreve.
      if (input.value.trim() !== termo) return;

      if (!sugestoes.length) {
        caixa.innerHTML = '<div class="sugestao-carregando">Não encontramos automaticamente. Tente digitar de outro jeito (ex.: nome completo da escola) e saia do campo de novo.</div>';
        return;
      }
      caixa.innerHTML = sugestoes.map(function (s, idx) {
        return '<button type="button" class="sugestao-item" data-idx="' + idx + '">' + escaparAtributo(encurtarNome(s.nome)) + "</button>";
      }).join("");
      caixa.querySelectorAll(".sugestao-item").forEach(function (el) {
        el.addEventListener("mousedown", function (e) {
          e.preventDefault(); // evita perder o clique por causa do blur do input
          var s = sugestoes[parseInt(el.dataset.idx, 10)];
          // Bairro/Local de votação precisam do nome padronizado pra agrupar certo no mapa.
          // Endereço mantém o que a pessoa escreveu (só confirma a localização por trás).
          if (substituirTexto) input.value = encurtarNome(s.nome);
          input.classList.add("campo-confirmado");
          aoEscolher({ lat: s.lat, lng: s.lng });
          esconder();
        });
      });
    } catch (e) {
      caixa.innerHTML = '<div class="sugestao-carregando">Erro ao buscar: ' + escaparAtributo(e.message) + "</div>";
    }
  }
}

configurarBuscaEndereco("votacao", "sugestoesVotacao", function (geo) { votacaoGeoEscolhido = geo; }, function () { votacaoGeoEscolhido = null; }, true);
configurarBuscaEndereco("endereco", "sugestoesEndereco", function (geo) { enderecoGeoEscolhido = geo; }, function () { enderecoGeoEscolhido = null; }, false);

// Bairro agora é uma lista fixa (select) já com localização confirmada — ao escolher, já sabemos o lat/lng.
var bairrosDisponiveis = {};
document.getElementById("bairro").addEventListener("change", function () {
  bairroGeoEscolhido = bairrosDisponiveis[this.value] || null;
});

// ---- Formulário de contato ----
document.getElementById("salvar").addEventListener("click", async function () {
  var campos = ["nome", "endereco", "bairro", "whatsapp", "votacao"];
  var valores = {};
  campos.forEach(function (id) {
    valores[id] = document.getElementById(id).value.trim();
  });

  await aguardarBusca("votacao"); // se a busca do local de votação ainda tava rodando, espera terminar

  if (valores.votacao && !votacaoGeoEscolhido) {
    mostrarErro('Escolha o "Local de votação" a partir da lista de sugestões que aparece ao sair do campo — assim o local fica exato. Ou deixe o campo em branco.');
    return;
  }

  var botao = this;
  botao.disabled = true;
  try {
    await api("/contatos", {
      method: "POST",
      body: JSON.stringify({
        nome: valores.nome,
        endereco: valores.endereco,
        bairro: valores.bairro,
        whatsapp: valores.whatsapp,
        localVotacao: valores.votacao,
        bairroGeo: bairroGeoEscolhido || undefined,
        votacaoGeo: votacaoGeoEscolhido || undefined,
        enderecoGeo: enderecoGeoEscolhido || undefined,
      }),
    });
  } catch (e) {
    mostrarErro("Erro ao salvar contato: " + e.message);
    return;
  } finally {
    botao.disabled = false;
  }

  campos.forEach(function (id) {
    document.getElementById(id).value = "";
    document.getElementById(id).classList.remove("campo-confirmado");
  });
  bairroGeoEscolhido = null;
  votacaoGeoEscolhido = null;
  enderecoGeoEscolhido = null;
  limparErro();
  await carregarContatos();
  await carregarLogistica();
  await carregarSugestoes();
});

// ---- Lista com busca (nome, bairro ou líder), "liguei" e observação ----
async function carregarContatos() {
  var dados;
  try {
    dados = await api("/contatos");
  } catch (e) {
    mostrarErro(e.message);
    return;
  }

  contatos = (dados || []).map(function (c) {
    return {
      id: c.id,
      liderId: c.liderId,
      lider: c.liderNome,
      nome: c.nome,
      endereco: c.endereco,
      enderecoLat: c.enderecoLat,
      enderecoLng: c.enderecoLng,
      bairro: c.bairro,
      whatsapp: c.whatsapp,
      votacao: c.localVotacao,
      liguei: c.liguei,
      obs: c.observacao || "",
      dataCadastro: c.dataCadastro,
    };
  });
  renderLista();
  renderGraficos();
  renderStats();
}

function animarNumero(elId, valorFinal) {
  var el = document.getElementById(elId);
  var inicio = parseInt(el.textContent, 10) || 0;
  if (inicio === valorFinal) { el.textContent = valorFinal; return; }
  var passos = 16;
  var atual = 0;
  clearInterval(el._timer);
  el._timer = setInterval(function () {
    atual++;
    var valor = Math.round(inicio + ((valorFinal - inicio) * atual) / passos);
    el.textContent = valor;
    if (atual >= passos) clearInterval(el._timer);
  }, 20);
}

async function renderStats() {
  animarNumero("statTotal", contatos.length);
  animarNumero("statLigados", contatos.filter(function (c) { return c.liguei; }).length);

  if (usuario && usuario.role === "admin") {
    document.getElementById("statTerceiroLabel").textContent = "Líderes ativos";
    try {
      var lideres = await api("/lideres");
      animarNumero("statTerceiro", lideres.length);
    } catch (e) { /* silencioso */ }
  } else {
    document.getElementById("statTerceiroLabel").textContent = "Bairros diferentes";
    var bairros = {};
    contatos.forEach(function (c) { bairros[c.bairro] = true; });
    animarNumero("statTerceiro", Object.keys(bairros).length);
  }
}

var editandoId = null;

function escaparAtributo(valor) {
  return (valor || "").replace(/"/g, "&quot;");
}

var editBairroGeoEscolhido = null;
var editVotacaoGeoEscolhido = null;

function renderCardEdicao(c) {
  var opcoesBairro = '<option value="">Selecione o bairro...</option>' +
    Object.keys(bairrosDisponiveis).sort().map(function (nome) {
      return '<option value="' + escaparAtributo(nome) + '"' + (nome === c.bairro ? " selected" : "") + ">" + nome + "</option>";
    }).join("");
  // Se o bairro atual do contato não estiver na lista confirmada, mostra ele mesmo assim (não perde o dado).
  if (!bairrosDisponiveis[c.bairro]) {
    opcoesBairro += '<option value="' + escaparAtributo(c.bairro) + '" selected>' + c.bairro + " (não confirmado)</option>";
  }

  return (
    '<div class="contato" data-contato-id="' + c.id + '">' +
      '<h3 class="card-titulo card-titulo--edicao">Editando contato</h3>' +
      '<label>Nome completo</label>' +
      '<input type="text" class="editNome" value="' + escaparAtributo(c.nome) + '" autocomplete="off" />' +
      '<label>Endereço</label>' +
      '<input type="text" class="editEndereco" value="' + escaparAtributo(c.endereco) + '" autocomplete="off" />' +
      '<div class="grid2">' +
        '<div><label>Bairro</label><select class="editBairro">' + opcoesBairro + "</select></div>" +
        '<div><label>WhatsApp</label><input type="tel" class="editWhatsapp" value="' + escaparAtributo(c.whatsapp) + '" autocomplete="off" /></div>' +
      "</div>" +
      '<div class="campo-com-busca">' +
        '<label>Local de votação</label>' +
        '<input type="text" id="editVotacaoInput" value="' + escaparAtributo(c.votacao) + '" autocomplete="off" />' +
        '<div class="sugestoes-caixa" id="editVotacaoSugestoes" hidden></div>' +
      "</div>" +
      '<p class="detalhe">Se mudar o local de votação, digite e escolha a nova opção da lista pra manter o mapa certo.</p>' +
      '<div class="rodape-acoes">' +
        '<button type="button" class="botao-pequeno btnCancelarEdicao" data-id="' + c.id + '">Cancelar</button>' +
        '<button type="button" class="btnSalvarEdicao" data-id="' + c.id + '">Salvar</button>' +
      "</div>" +
    "</div>"
  );
}

function formatarDataCadastro(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  var dataStr = d.toLocaleDateString("pt-BR");
  var horaStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return dataStr + " às " + horaStr;
}

function renderLista() {
  var termo = document.getElementById("busca").value.trim().toLowerCase();
  var liderFiltroEl = document.getElementById("filtroLider");
  var liderFiltro = liderFiltroEl ? liderFiltroEl.value : "";

  var filtrados = contatos.filter(function (c) {
    var passaTexto = !termo ||
      c.nome.toLowerCase().indexOf(termo) !== -1 ||
      c.bairro.toLowerCase().indexOf(termo) !== -1 ||
      c.lider.toLowerCase().indexOf(termo) !== -1;
    var passaLider = !liderFiltro || String(c.liderId) === liderFiltro;
    return passaTexto && passaLider;
  });

  var lista = document.getElementById("lista");
  if (filtrados.length === 0) {
    lista.innerHTML = '<p class="detalhe">Nenhum contato encontrado.</p>';
    return;
  }

  var mostrarLiderNaLinha = usuario && usuario.role === "admin";

  var somenteLeitura = usuario && usuario.role === "motorista";

  lista.innerHTML = filtrados.map(function (c, idx) {
    if (editandoId === c.id) return renderCardEdicao(c);

    var pillClasse = c.liguei ? "status-pill--sim" : "status-pill--nao";
    var pillTexto = c.liguei ? "Ligou" : "Pendente";
    var atraso = Math.min(idx * 0.05, 0.5);
    var dataStr = formatarDataCadastro(c.dataCadastro);
    var linhaLider = mostrarLiderNaLinha
      ? '<p class="detalhe">' + ICONE_USERS + 'Líder: ' + c.lider + " · Vota em " + c.votacao + "</p>"
      : '<p class="detalhe">' + ICONE_USERS + "Vota em " + c.votacao + "</p>";
    var linhaData = dataStr ? '<p class="detalhe detalhe--data">Cadastrado em ' + dataStr + "</p>" : "";

    var rodapeEdicao = somenteLeitura
      ? ""
      : '<div class="rodape-contato">' +
          '<label class="liguei-label">' +
            '<input type="checkbox" data-id="' + c.id + '" class="chkLiguei" ' + (c.liguei ? "checked" : "") + " />Liguei" +
          "</label>" +
          '<input type="text" data-id="' + c.id + '" class="obsInput" placeholder="Observação" value="' + escaparAtributo(c.obs) + '" />' +
        "</div>";

    var rodapeAcoesGestao = somenteLeitura
      ? ""
      : '<div class="rodape-acoes">' +
          '<button type="button" class="botao-pequeno btnEditar" data-id="' + c.id + '">Editar</button>' +
          '<button type="button" class="botao-pequeno botao-rejeitar btnExcluir" data-id="' + c.id + '">Excluir</button>' +
        "</div>";

    var linkWhats = waLink(c.whatsapp);
    var telefoneHtml = linkWhats
      ? '<a class="whatsapp-link" href="' + linkWhats + '" target="_blank" rel="noopener">' + ICONE_PHONE + c.whatsapp + "</a>"
      : "";

    return (
      '<div class="contato" data-contato-id="' + c.id + '" style="animation-delay:' + atraso + 's">' +
        '<div class="contato-topo">' +
          '<div class="avatar">' + (c.nome.slice(0, 2).toUpperCase() || "?") + "</div>" +
          '<div class="contato-info">' +
            '<p class="nome">' + (c.nome || "(sem nome)") + ' <span class="status-pill ' + pillClasse + '">' + pillTexto + "</span></p>" +
            '<p class="detalhe">' + ICONE_PIN + (c.endereco || "Endereço não informado") + " - " + (c.bairro || "Bairro não informado") + "</p>" +
            linhaLider +
            linhaData +
          "</div>" +
          telefoneHtml +
        "</div>" +
        rodapeEdicao +
        '<div class="rodape-acoes rodape-acoes--rotas">' +
          '<a class="botao-pequeno botao-rota" target="_blank" rel="noopener" href="' +
            googleMapsRotaLink(null, null, c.endereco + ", " + c.bairro + ", Macapá, Amapá") +
          '">Ir até o endereço</a>' +
          '<a class="botao-pequeno botao-rota" target="_blank" rel="noopener" href="' +
            googleMapsRotaLink(null, null, c.votacao + ", Macapá, Amapá") +
          '">Ir até a escola</a>' +
        "</div>" +
        rodapeAcoesGestao +
      "</div>"
    );
  }).join("");

  document.querySelectorAll(".btnEditar").forEach(function (el) {
    el.addEventListener("click", function () {
      editandoId = parseInt(el.dataset.id);
      editVotacaoGeoEscolhido = null;
      renderLista();
    });
  });
  document.querySelectorAll(".btnCancelarEdicao").forEach(function (el) {
    el.addEventListener("click", function () {
      editandoId = null;
      editVotacaoGeoEscolhido = null;
      renderLista();
    });
  });
  if (editandoId !== null) {
    configurarBuscaEndereco("editVotacaoInput", "editVotacaoSugestoes",
      function (geo) { editVotacaoGeoEscolhido = geo; },
      function () { editVotacaoGeoEscolhido = null; }, true);
  }

  document.querySelectorAll(".btnSalvarEdicao").forEach(function (el) {
    el.addEventListener("click", async function () {
      var id = parseInt(el.dataset.id);
      var card = el.closest(".contato");
      var dados = {
        nome: card.querySelector(".editNome").value.trim(),
        endereco: card.querySelector(".editEndereco").value.trim(),
        bairro: card.querySelector(".editBairro").value.trim(),
        whatsapp: card.querySelector(".editWhatsapp").value.trim(),
        localVotacao: card.querySelector("#editVotacaoInput").value.trim(),
      };
      await aguardarBusca("editVotacaoInput");
      el.disabled = true;
      try {
        await api("/contatos/" + id, {
          method: "PUT",
          body: JSON.stringify(Object.assign({}, dados, {
            bairroGeo: bairrosDisponiveis[dados.bairro] || undefined,
            votacaoGeo: editVotacaoGeoEscolhido || undefined,
          })),
        });
        editandoId = null;
        editVotacaoGeoEscolhido = null;
        limparErro();
        await carregarContatos();
        await carregarLogistica();
      } catch (e) {
        mostrarErro("Erro ao salvar edição: " + e.message);
      } finally {
        el.disabled = false;
      }
    });
  });
  document.querySelectorAll(".btnExcluir").forEach(function (el) {
    el.addEventListener("click", async function () {
      var id = parseInt(el.dataset.id);
      var c = contatos.find(function (x) { return x.id === id; });
      var confirmar = window.confirm("Excluir o contato \"" + (c ? c.nome : "") + "\"? Essa ação não pode ser desfeita.");
      if (!confirmar) return;
      el.disabled = true;
      try {
        await api("/contatos/" + id, { method: "DELETE" });
        await carregarContatos();
        await carregarLogistica();
      } catch (e) {
        mostrarErro("Erro ao excluir: " + e.message);
        el.disabled = false;
      }
    });
  });

  document.querySelectorAll(".chkLiguei").forEach(function (el) {
    el.addEventListener("change", async function () {
      var id = parseInt(el.dataset.id);
      var c = contatos.find(function (x) { return x.id === id; });
      if (c) c.liguei = el.checked; // otimista, pra UI não travar

      var pill = el.closest(".contato").querySelector(".status-pill");
      if (pill) {
        pill.classList.toggle("status-pill--sim", el.checked);
        pill.classList.toggle("status-pill--nao", !el.checked);
        pill.textContent = el.checked ? "Ligou" : "Pendente";
      }

      try {
        await api("/contatos/" + id + "/ligacao", {
          method: "PATCH",
          body: JSON.stringify({ liguei: el.checked, observacao: c ? c.obs : "" }),
        });
      } catch (e) {
        mostrarErro("Erro ao atualizar: " + e.message);
      }
      renderStats();
    });
  });
  document.querySelectorAll(".obsInput").forEach(function (el) {
    var timer = null;
    el.addEventListener("input", function () {
      var id = parseInt(el.dataset.id);
      var valor = el.value;
      var c = contatos.find(function (x) { return x.id === id; });
      if (c) c.obs = valor;
      clearTimeout(timer);
      timer = setTimeout(async function () {
        try {
          await api("/contatos/" + id + "/ligacao", {
            method: "PATCH",
            body: JSON.stringify({ liguei: c ? c.liguei : false, observacao: valor }),
          });
        } catch (e) {
          mostrarErro("Erro ao atualizar observação: " + e.message);
        }
      }, 600); // debounce pra não gravar a cada tecla digitada
    });
  });
}
document.getElementById("busca").addEventListener("input", renderLista);
document.getElementById("filtroLider").addEventListener("change", renderLista);

// ---- Gráficos donut: por bairro e por local de votação (a partir da lista já carregada) ----
var chartBairro = null;
var chartEscola = null;

function contarPor(campo) {
  var contagem = {};
  contatos.forEach(function (c) { contagem[c[campo]] = (contagem[c[campo]] || 0) + 1; });
  return contagem;
}

function montarDonut(ctxId, contagem, chartRefSetter, chartRefAtual) {
  var labels = Object.keys(contagem);
  var valores = labels.map(function (l) { return contagem[l]; });
  if (chartRefAtual) chartRefAtual.destroy();
  var novo = new Chart(document.getElementById(ctxId), {
    type: "doughnut",
    data: { labels: labels, datasets: [{ data: valores, backgroundColor: CORES.slice(0, labels.length), borderColor: "#fff", borderWidth: 2 }] },
    options: { responsive: true, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } }
  });
  chartRefSetter(novo);
}

function renderGraficos() {
  montarDonut("chartBairro", contarPor("bairro"), function (c) { chartBairro = c; }, chartBairro);
  montarDonut("chartEscola", contarPor("votacao"), function (c) { chartEscola = c; }, chartEscola);
}

// ---- Painel de aprovação (só admin) ----
async function carregarPendentes() {
  if (!usuario || usuario.role !== "admin") {
    document.getElementById("cardPendentes").hidden = true;
    return;
  }
  var pendentes;
  try {
    pendentes = await api("/lideres/pendentes");
  } catch (e) {
    return;
  }

  var card = document.getElementById("cardPendentes");
  if (!pendentes.length) { card.hidden = true; return; }
  card.hidden = false;

  document.getElementById("listaPendentes").innerHTML = pendentes.map(function (p) {
    return (
      '<div class="pendente-item">' +
        '<div class="pendente-info">' +
          '<p class="nome">' + p.nome + "</p>" +
          '<p class="detalhe">' + p.email + "</p>" +
        "</div>" +
        '<div class="pendente-acoes">' +
          '<button type="button" class="btnAprovar" data-id="' + p.id + '">Aprovar</button>' +
          '<button type="button" class="botao-rejeitar" data-id="' + p.id + '">Rejeitar</button>' +
        "</div>" +
      "</div>"
    );
  }).join("");

  document.querySelectorAll(".btnAprovar").forEach(function (el) {
    el.addEventListener("click", async function () {
      await atualizarStatusLider(el.dataset.id, "aprovado");
    });
  });
  document.querySelectorAll(".botao-rejeitar").forEach(function (el) {
    el.addEventListener("click", async function () {
      await atualizarStatusLider(el.dataset.id, "rejeitado");
    });
  });
}

async function atualizarStatusLider(id, status) {
  try {
    await api("/lideres/" + id + "/status", { method: "PATCH", body: JSON.stringify({ status: status }) });
    await carregarPendentes();
    await carregarPapeis();
    renderStats();
  } catch (e) {
    mostrarErro("Erro ao atualizar líder: " + e.message);
  }
}

function popularFiltroLider(aprovados) {
  var campo = document.getElementById("campoFiltroLider");
  var select = document.getElementById("filtroLider");
  if (!campo || !select) return;
  if (!usuario || usuario.role !== "admin" || !aprovados.length) {
    campo.hidden = true;
    return;
  }
  campo.hidden = false;
  var valorAtual = select.value;
  select.innerHTML = '<option value="">Todos os líderes</option>' +
    aprovados.map(function (l) {
      return '<option value="' + l.id + '">' + l.nome + "</option>";
    }).join("");
  select.value = valorAtual;
}

// ---- Gerenciar papel de cada líder (admin) ----
async function carregarPapeis() {
  if (!usuario || usuario.role !== "admin") {
    document.getElementById("cardGerenciarPapeis").hidden = true;
    popularFiltroLider([]);
    return;
  }
  var todos;
  try {
    todos = await api("/lideres");
  } catch (e) {
    return;
  }

  var aprovados = todos.filter(function (l) { return l.status === "aprovado"; });
  popularFiltroLider(aprovados);
  var card = document.getElementById("cardGerenciarPapeis");
  if (!aprovados.length) { card.hidden = true; return; }
  card.hidden = false;

  var rotulos = { lider: "Líder", admin: "Admin", agenda: "Agenda", motorista: "Motorista" };
  document.getElementById("listaPapeis").innerHTML = aprovados.map(function (l) {
    return (
      '<div class="papel-item">' +
        '<div>' +
          '<p class="nome">' + l.nome + (l.id === usuario.id ? " (você)" : "") + "</p>" +
          '<p class="detalhe">' + l.email + "</p>" +
        "</div>" +
        '<select class="selectPapel" data-id="' + l.id + '" ' + (l.id === usuario.id ? "disabled" : "") + '>' +
          Object.keys(rotulos).map(function (r) {
            return '<option value="' + r + '"' + (r === l.role ? " selected" : "") + ">" + rotulos[r] + "</option>";
          }).join("") +
        "</select>" +
      "</div>"
    );
  }).join("");

  document.querySelectorAll(".selectPapel").forEach(function (el) {
    el.addEventListener("change", async function () {
      try {
        await api("/lideres/" + el.dataset.id + "/role", { method: "PATCH", body: JSON.stringify({ role: el.value }) });
      } catch (e) {
        mostrarErro("Erro ao mudar papel: " + e.message);
      }
    });
  });
}

document.getElementById("btnAlternarPapeis").addEventListener("click", function () {
  var lista = document.getElementById("listaPapeis");
  var seta = document.getElementById("setaPapeis");
  lista.hidden = !lista.hidden;
  seta.classList.toggle("aberta", !lista.hidden);
});

// ---- Logística de transporte: mapa (OpenStreetMap/Leaflet) + tabela bairro -> local de votação ----
var mapaLeaflet = null;
var camadaLogistica = null;
var camadaContatos = null;
var ultimoMapaLogistica = null;

function capacidadeCarro() {
  var valor = parseInt(document.getElementById("pessoasPorCarro").value, 10);
  return valor && valor > 0 ? valor : 4;
}

async function carregarLogistica() {
  document.getElementById("resumoLogistica").textContent = "Carregando mapa...";
  try {
    ultimoMapaLogistica = await api("/geo/mapa");
  } catch (e) {
    document.getElementById("resumoLogistica").textContent = "Não consegui carregar o mapa de logística.";
    return;
  }
  renderLogistica();
}

function popupComCorrecao(titulo, nome, tipo) {
  return (
    '<div class="pin-popup"><strong>' + titulo + "</strong><br>" + nome +
    '<br><button type="button" class="botao-pequeno btnCorrigirPopup" data-nome="' + escaparAtributo(nome) + '" data-tipo="' + tipo + '">Corrigir localização</button></div>'
  );
}

function renderLogistica() {
  if (!ultimoMapaLogistica) return;
  var dados = ultimoMapaLogistica;
  var capacidade = capacidadeCarro();

  var pontosBairro = {};
  dados.bairros.forEach(function (p) { pontosBairro[p.nome] = p; });
  var pontosLocal = {};
  dados.locaisVotacao.forEach(function (p) { pontosLocal[p.nome] = p; });

  var rotas = dados.rotas.slice().sort(function (a, b) { return b.total - a.total; });
  var totalPessoas = rotas.reduce(function (s, r) { return s + r.total; }, 0);
  var totalCarros = rotas.reduce(function (s, r) { return s + Math.ceil(r.total / capacidade); }, 0);

  document.getElementById("resumoLogistica").textContent =
    rotas.length
      ? rotas.length + " rota(s) · " + totalPessoas + " pessoa(s) · aproximadamente " + totalCarros + " carro(s) no total"
      : "Nenhum contato com bairro/local de votação pra calcular ainda.";

  var elAviso = document.getElementById("avisoNaoLocalizados");
  if (dados.naoLocalizados && dados.naoLocalizados.length) {
    elAviso.innerHTML =
      "Não encontrei automaticamente no mapa: " +
      dados.naoLocalizados.map(function (item) {
        return (
          '<span class="nao-localizado">' + item.nome +
          ' <button type="button" class="botao-pequeno btnCorrigirLocal" data-nome="' + escaparAtributo(item.nome) + '" data-tipo="' + item.tipo + '">Corrigir no mapa</button></span>'
        );
      }).join(", ");
    document.querySelectorAll(".btnCorrigirLocal").forEach(function (el) {
      el.addEventListener("click", function () { iniciarCorrecaoManual(el.dataset.nome, el.dataset.tipo); });
    });
  } else {
    elAviso.innerHTML = "";
  }

  // Tabela
  document.getElementById("corpoTabelaLogistica").innerHTML = rotas.map(function (r) {
    var carros = Math.ceil(r.total / capacidade);
    return (
      "<tr><td>" + r.bairro + "</td><td>" + r.localVotacao + "</td><td>" + r.total + "</td><td>" + carros + "</td></tr>"
    );
  }).join("") || '<tr><td colspan="4" class="detalhe">Sem dados ainda.</td></tr>';

  // Mapa (OpenStreetMap via Leaflet)
  if (!mapaLeaflet) {
    mapaLeaflet = L.map("mapaLogistica").setView([0.0356, -51.07], 12); // Macapá/Santana
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    }).addTo(mapaLeaflet);

    // Delega o clique do botão "Corrigir localização" de dentro de qualquer popup do mapa
    mapaLeaflet.on("popupopen", function (e) {
      var el = e.popup.getElement();
      var btn = el && el.querySelector(".btnCorrigirPopup");
      if (btn) {
        btn.addEventListener("click", function () {
          mapaLeaflet.closePopup();
          iniciarCorrecaoManual(btn.dataset.nome, btn.dataset.tipo);
        });
      }
    });
  }
  if (camadaLogistica) camadaLogistica.remove();
  camadaLogistica = L.layerGroup().addTo(mapaLeaflet);
  if (camadaContatos) camadaContatos.remove();
  camadaContatos = L.markerClusterGroup({ maxClusterRadius: 45 }).addTo(mapaLeaflet);

  var bounds = [];

  // Pontos de bairro ficam guardados (pra achar coordenada nas linhas individuais e na correção
  // manual, via botão "Corrigir no mapa" na lista de não localizados), mas não desenha mais no mapa
  // o ponto/linha "média do bairro" — só os locais de votação e as pessoas de verdade.
  dados.locaisVotacao.forEach(function (p) {
    bounds.push([p.lat, p.lng]);
    L.circleMarker([p.lat, p.lng], { radius: 8, color: "#0F3D30", fillColor: "#E9D9A4", fillOpacity: 0.95, weight: 2 })
      .bindPopup(popupComCorrecao("Local de votação", p.nome, "votacao"))
      .addTo(camadaLogistica);
  });

  (dados.contatos || []).forEach(function (c) {
    bounds.push([c.lat, c.lng]);
    var pillTexto = c.liguei ? "Ligou" : "Pendente";
    L.circleMarker([c.lat, c.lng], { radius: 5, color: "#0F3D30", fillColor: "#7F77DD", fillOpacity: 0.9, weight: 1.5 })
      .bindPopup(
        '<div class="pin-popup"><strong>' + c.nome + "</strong><br>" +
        "Bairro: " + c.bairro + "<br>Vota em: " + c.localVotacao + "<br>" + pillTexto + "</div>"
      )
      .addTo(camadaContatos);

    // Linha fina da casa exata da pessoa até a escola dela.
    var destino = pontosLocal[c.localVotacao];
    if (destino) {
      L.polyline([[c.lat, c.lng], [destino.lat, destino.lng]], {
        color: "#534AB7",
        weight: 2,
        opacity: 0.6,
        dashArray: "4,5",
      })
        .bindPopup('<div class="pin-popup"><strong>' + c.nome + "</strong><br>até " + c.localVotacao + "</div>")
        .addTo(camadaContatos);
    }
  });

  if (bounds.length) mapaLeaflet.fitBounds(bounds, { padding: [24, 24] });

  setTimeout(function () { mapaLeaflet.invalidateSize(); }, 150);
}

// ---- Corrigir manualmente um bairro/local que o mapa não achou sozinho (ou achou errado) ----
var corrigindoNome = null;
var corrigindoTipo = null;

function iniciarCorrecaoManual(nome, tipo) {
  if (!mapaLeaflet) return;
  corrigindoNome = nome;
  corrigindoTipo = tipo || "bairro";
  document.getElementById("resumoLogistica").textContent =
    'Clique no mapa no local certo de "' + nome + '" (procure no Google Maps se precisar e clique no ponto equivalente aqui).';
  document.getElementById("mapaLogistica").classList.add("mapa-mira");
  mapaLeaflet.once("click", async function (e) {
    document.getElementById("mapaLogistica").classList.remove("mapa-mira");
    try {
      await api("/geo/local", {
        method: "PUT",
        body: JSON.stringify({ nome: corrigindoNome, lat: e.latlng.lat, lng: e.latlng.lng, tipo: corrigindoTipo }),
      });
      corrigindoNome = null;
      await carregarLogistica();
      await carregarSugestoes();
    } catch (err) {
      mostrarErro("Erro ao salvar localização: " + err.message);
      renderLogistica();
    }
  });
}

document.getElementById("pessoasPorCarro").addEventListener("input", renderLogistica);

// ---- Sugestões (autocompletar) de bairro/local de votação já confirmados no mapa ----
async function carregarSugestoes() {
  try {
    var bairros = await api("/geo/sugestoes?tipo=bairro");
    bairrosDisponiveis = {};
    bairros.forEach(function (p) { bairrosDisponiveis[p.nome] = { lat: p.lat, lng: p.lng }; });

    var selectBairro = document.getElementById("bairro");
    var valorAtual = selectBairro.value;
    selectBairro.innerHTML = '<option value="">Selecione o bairro...</option>' +
      bairros.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }).map(function (p) {
        return '<option value="' + escaparAtributo(p.nome) + '">' + p.nome + "</option>";
      }).join("");
    if (bairrosDisponiveis[valorAtual]) selectBairro.value = valorAtual;
  } catch (e) { /* lista de bairros é só um bônus, não trava o app se falhar */ }
}

// ---- Agenda de compromissos ----
var agendamentos = [];
var editandoAgendaId = null;

function formatarDataHora(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function paraISOComOffset(valorDatetimeLocal) {
  // O <input type="datetime-local"> não carrega fuso horário; sem isso o servidor
  // (que roda em UTC) interpretava a hora digitada como se já fosse UTC, adiantando
  // 3h. Amapá/Brasil não tem horário de verão, então o offset -03:00 é sempre fixo.
  if (!valorDatetimeLocal) return valorDatetimeLocal;
  return valorDatetimeLocal.length === 16 ? valorDatetimeLocal + ":00-03:00" : valorDatetimeLocal + "-03:00";
}

function paraInputDatetimeLocal(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  var pad = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

async function carregarAgenda() {
  var temAcesso = usuario && (usuario.role === "admin" || usuario.role === "agenda");
  document.getElementById("secaoAgenda").hidden = !temAcesso;
  if (!temAcesso) return; // líder comum não tem acesso à agenda

  document.getElementById("tituloAgenda").textContent = "Todos os compromissos";
  try {
    agendamentos = await api("/agenda");
  } catch (e) {
    document.getElementById("listaAgenda").innerHTML = '<p class="detalhe">Não consegui carregar a agenda.</p>';
    return;
  }
  renderAgenda();
}

function renderCardAgendaEdicao(a) {
  return (
    '<div class="agendamento-item" data-agenda-id="' + a.id + '">' +
      '<h3 class="card-titulo card-titulo--edicao">Editando compromisso</h3>' +
      '<label>Nome</label>' +
      '<input type="text" class="editAgendaNome" value="' + escaparAtributo(a.nome) + '" autocomplete="off" />' +
      '<div class="grid2">' +
        '<div><label>WhatsApp</label><input type="tel" class="editAgendaWhatsapp" value="' + escaparAtributo(a.whatsapp) + '" autocomplete="off" /></div>' +
        '<div><label>Data e hora</label><input type="datetime-local" class="editAgendaDataHora" value="' + paraInputDatetimeLocal(a.dataHora) + '" /></div>' +
      "</div>" +
      '<label>Local</label>' +
      '<input type="text" class="editAgendaLocal" value="' + escaparAtributo(a.local) + '" autocomplete="off" />' +
      '<label>Observação</label>' +
      '<input type="text" class="editAgendaObservacao" value="' + escaparAtributo(a.observacao) + '" autocomplete="off" />' +
      '<div class="rodape-acoes">' +
        '<button type="button" class="botao-pequeno btnCancelarAgendaEdicao" data-id="' + a.id + '">Cancelar</button>' +
        '<button type="button" class="btnSalvarAgendaEdicao" data-id="' + a.id + '">Salvar</button>' +
      "</div>" +
    "</div>"
  );
}

var agendaModalAberto = false;
var LIMITE_AGENDA_RESUMO = 3;

function renderAgendaItem(a, vTudo) {
  if (editandoAgendaId === a.id) return renderCardAgendaEdicao(a);
  var quem = vTudo ? '<p class="detalhe">' + ICONE_USERS + "Cadastrado por " + a.liderNome + "</p>" : "";
  var dataStr = formatarDataHora(a.dataHora);
  var linkWhatsAgenda = waLink(a.whatsapp);
  var telefoneAgendaHtml = linkWhatsAgenda
    ? '<div class="rodape-acoes rodape-acoes--rotas">' +
        '<a class="botao-pequeno botao-rota" target="_blank" rel="noopener" href="' + linkWhatsAgenda + '">' + ICONE_PHONE + a.whatsapp + "</a>" +
      "</div>"
    : "";
  return (
    '<div class="agendamento-item" data-agenda-id="' + a.id + '">' +
      '<p class="nome">' + (a.nome || "(sem nome)") + "</p>" +
      (a.local ? '<p class="detalhe">' + ICONE_PIN + a.local + "</p>" : "") +
      '<p class="detalhe">' + ICONE_CALENDARIO + (dataStr || "Sem data definida") + "</p>" +
      (a.observacao ? '<p class="detalhe">Obs: ' + a.observacao + "</p>" : "") +
      quem +
      telefoneAgendaHtml +
      '<div class="rodape-acoes">' +
        '<button type="button" class="botao-pequeno btnEditarAgenda" data-id="' + a.id + '">Editar</button>' +
        '<button type="button" class="botao-pequeno botao-rejeitar btnExcluirAgenda" data-id="' + a.id + '">Excluir</button>' +
      "</div>" +
    "</div>"
  );
}

function renderAgenda() {
  var lista = document.getElementById("listaAgenda");
  var btnVerMais = document.getElementById("btnVerMaisAgenda");
  if (!agendamentos.length) {
    lista.innerHTML = '<p class="detalhe">Nenhum compromisso ainda.</p>';
    btnVerMais.hidden = true;
    document.getElementById("modalAgendaCompleta").hidden = true;
    agendaModalAberto = false;
    return;
  }
  var vTudo = usuario && (usuario.role === "admin" || usuario.role === "agenda");

  lista.innerHTML = agendamentos.slice(0, LIMITE_AGENDA_RESUMO).map(function (a) {
    return renderAgendaItem(a, vTudo);
  }).join("");

  var restantes = agendamentos.length - LIMITE_AGENDA_RESUMO;
  btnVerMais.hidden = restantes <= 0;
  btnVerMais.textContent = "Ver mais (" + restantes + ")";

  var modal = document.getElementById("modalAgendaCompleta");
  modal.hidden = !agendaModalAberto;
  if (agendaModalAberto) {
    document.getElementById("listaAgendaCompleta").innerHTML = agendamentos.map(function (a) {
      return renderAgendaItem(a, vTudo);
    }).join("");
  }

  document.querySelectorAll(".btnEditarAgenda").forEach(function (el) {
    el.addEventListener("click", function () { editandoAgendaId = parseInt(el.dataset.id); renderAgenda(); });
  });
  document.querySelectorAll(".btnCancelarAgendaEdicao").forEach(function (el) {
    el.addEventListener("click", function () { editandoAgendaId = null; renderAgenda(); });
  });
  document.querySelectorAll(".btnSalvarAgendaEdicao").forEach(function (el) {
    el.addEventListener("click", async function () {
      var id = parseInt(el.dataset.id);
      var card = el.closest(".agendamento-item");
      var dados = {
        nome: card.querySelector(".editAgendaNome").value.trim(),
        whatsapp: card.querySelector(".editAgendaWhatsapp").value.trim(),
        dataHora: paraISOComOffset(card.querySelector(".editAgendaDataHora").value),
        local: card.querySelector(".editAgendaLocal").value.trim(),
        observacao: card.querySelector(".editAgendaObservacao").value.trim(),
      };
      el.disabled = true;
      try {
        await api("/agenda/" + id, { method: "PUT", body: JSON.stringify(dados) });
        editandoAgendaId = null;
        limparErro();
        await carregarAgenda();
      } catch (e) {
        mostrarErro("Erro ao salvar compromisso: " + e.message);
      } finally {
        el.disabled = false;
      }
    });
  });
  document.querySelectorAll(".btnExcluirAgenda").forEach(function (el) {
    el.addEventListener("click", async function () {
      var id = parseInt(el.dataset.id);
      var a = agendamentos.find(function (x) { return x.id === id; });
      if (!window.confirm('Excluir o compromisso com "' + (a ? a.nome : "") + '"?')) return;
      el.disabled = true;
      try {
        await api("/agenda/" + id, { method: "DELETE" });
        await carregarAgenda();
      } catch (e) {
        mostrarErro("Erro ao excluir: " + e.message);
        el.disabled = false;
      }
    });
  });
}

document.getElementById("btnVerMaisAgenda").addEventListener("click", function () {
  agendaModalAberto = true;
  renderAgenda();
});
document.getElementById("btnFecharModalAgenda").addEventListener("click", function () {
  agendaModalAberto = false;
  renderAgenda();
});

document.getElementById("salvarAgendamento").addEventListener("click", async function () {
  var campos = ["agendaNome", "agendaWhatsapp", "agendaDataHora", "agendaLocal"];
  var valores = {};
  campos.forEach(function (id) {
    valores[id] = document.getElementById(id).value.trim();
  });

  var botao = this;
  botao.disabled = true;
  try {
    await api("/agenda", {
      method: "POST",
      body: JSON.stringify({
        nome: valores.agendaNome,
        whatsapp: valores.agendaWhatsapp,
        dataHora: paraISOComOffset(valores.agendaDataHora),
        local: valores.agendaLocal,
        observacao: document.getElementById("agendaObservacao").value.trim(),
      }),
    });
  } catch (e) {
    mostrarErroEm("erroAgenda", "Erro ao salvar: " + e.message);
    return;
  } finally {
    botao.disabled = false;
  }

  campos.concat(["agendaObservacao"]).forEach(function (id) { document.getElementById(id).value = ""; });
  limparErroEm("erroAgenda");
  await carregarAgenda();
});

// ---- Sessão / inicialização ----
async function iniciarApp() {
  try {
    usuario = await api("/auth/me");
  } catch (e) {
    token = null;
    usuario = null;
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    mostrarLogin();
    mostrarAuth();
    return;
  }

  // Líder não usa este acesso — só o link específico dele.
  if (usuario.role === "lider") {
    token = null;
    usuario = null;
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    mostrarLogin();
    mostrarAuth();
    mostrarErroEm("erroAuth", "Este acesso não está disponível para o seu perfil.");
    return;
  }

  var rotulosPapel = { admin: "Administrador", agenda: "Agenda", motorista: "Motorista", lider: "Líder" };
  document.getElementById("heroSubtitulo").textContent = (rotulosPapel[usuario.role] || "Líder") + " · " + usuario.nome;

  var vTudoContatos = usuario.role === "admin" || usuario.role === "motorista";
  document.getElementById("tituloLista").textContent = vTudoContatos ? "Todos os contatos" : "Meus contatos";
  document.getElementById("statTotalLabel").textContent = vTudoContatos ? "Contatos cadastrados" : "Meus contatos";

  // Motorista só visualiza: não cadastra contato novo.
  document.getElementById("cardNovoContato").hidden = usuario.role === "motorista";

  // Papel "agenda" só enxerga a agenda — nada de contatos, mapa, estatísticas etc.
  document.getElementById("secaoOperacional").hidden = usuario.role === "agenda";

  mostrarApp();
  await carregarPendentes();
  await carregarPapeis();
  await carregarContatos();
  await carregarLogistica();
  await carregarSugestoes();
  await carregarAgenda();
}

(function init() {
  if (token) {
    mostrarCarregando();
    iniciarApp();
  } else {
    mostrarLogin();
    mostrarAuth();
  }
})();
