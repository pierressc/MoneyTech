/* --- 1. SELEÇÃO DE ELEMENTOS DO DOM --- */

const form = document.getElementById("form-add");
const inputDescricao = document.getElementById("descricao");
const inputValor = document.getElementById("valor");
const inputData = document.getElementById("data");
const selectTipo = document.getElementById("tipo");
const selectCategoria = document.getElementById("categoria");
const historicoLista = document.getElementById("lista-transacoes-body");
const dashboardReceitas = document.getElementById("total-receitas");
const dashboardDespesas = document.getElementById("total-despesas");
const dashboardSaldo = document.getElementById("saldo-total");
const inputIdEdicao = document.getElementById("transacao-id");
const formButton = document.querySelector("#form-add button");
const filtroPeriodo = document.getElementById("filtro-periodo");
const filtroCategoria = document.getElementById("categoria-relatorio");
const btnFiltrar = document.getElementById("btn-filtrar");
const listaPercentual = document.getElementById("lista-percentual-categoria");
const listaTransacoesFiltradas = document.querySelector(
  ".transacoes-filtradas-container"
);

/* --- 2. DADOS (O "BANCO DE DADOS" DO NAVEGADOR) --- */

let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

/* --- 3. FUNÇÃO PRINCIPAL: ADICIONAR TRANSAÇÃO (CREATE) --- */

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // 1. CAPTURAR OS DADOS DO FORMULÁRIO
  const descricao = inputDescricao.value.trim();
  const valor = inputValor.value;
  const data = inputData.value;
  const tipo = selectTipo.value;
  const categoria = selectCategoria.value;

  // 2. PEGAR O ID DE EDIÇÃO (Do input hidden)
  const idParaAtualizar = inputIdEdicao.value;

  // 3. VALIDAÇÃO
  if (descricao === "" || valor === "" || data === "") {
    alert(
      "Por favor, preencha os campos obrigatórios: Descrição, Valor e Data."
    );
    return;
  }

  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    alert("Por favor, insira um valor numérico válido e positivo.");
    return;
  }

  // 4. DECIDIR SE VAI CRIAR OU ATUALIZAR
  if (idParaAtualizar) {
    // --- LÓGICA DE UPDATE (ATUALIZAR) ---
    transacoes = transacoes.map(function (transacao) {
      if (transacao.id == idParaAtualizar) {
        return {
          id: transacao.id, // Mantém o ID original
          descricao: descricao,
          valor: valorNumerico,
          data: data,
          tipo: tipo,
          categoria: categoria,
        };
      }
      return transacao;
    });
  } else {
    // --- LÓGICA DE CREATE (CRIAR) ---
    const novaTransacao = {
      id: new Date().getTime(),
      descricao: descricao,
      valor: valorNumerico,
      data: data,
      tipo: tipo,
      categoria: categoria,
    };
    transacoes.unshift(novaTransacao);
  }

  // 5. SALVAR E ATUALIZAR A TELA
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
  resetarFormulario();
  atualizarInterface();
});

function resetarFormulario() {
  form.reset(); // Limpa os campos visíveis
  inputIdEdicao.value = ""; // Limpa o ID escondido
  formButton.textContent = "Adicionar"; // Restaura o texto do botão
}

function atualizarInterface() {
  console.log("=== ATUALIZANDO INTERFACE COMPLETA ===");

  // SEMPRE mostra TODAS as transações no histórico
  renderizarHistorico(transacoes);

  // Dashboard e relatório com TODAS as transações
  atualizarDashboard(transacoes);
  gerarRelatorioCategorias(transacoes);
}

/* --- 4. FUNÇÃO "READ": RENDERIZAR HISTÓRICO --- */

function renderizarHistorico(transacoesParaRenderizar) {
  console.log("Desenhando o histórico na tabela...");

  historicoLista.innerHTML = "";

  // 1. Iterar (fazer um loop) sobre o array 'transacoes'
  transacoesParaRenderizar.forEach(function (transacao) {
    // 2. Formatar os dados para exibição

    // 2.a. Classe CSS: Adiciona 'receita' ou 'despesa' no <tr>
    const cssClass = transacao.tipo === "receita" ? "receita" : "despesa";

    // 2.b. Valor (Formatação de Moeda)
    const valorParaFormatar =
      transacao.tipo === "receita" ? transacao.valor : -transacao.valor;

    const valorFormatado = valorParaFormatar.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    // 2.c. Data (Formatação de Data)
    const [ano, mes, dia] = transacao.data.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // 3. Criar o HTML da linha da tabela (<tr>)
    const tr = `
            <tr class="${cssClass}">
                <td>${transacao.descricao}</td>
                <td>${valorFormatado}</td>
                <td>${dataFormatada}</td>
                <td>${transacao.categoria}</td>
                <td class="acoes">
                    <button class="edit-btn" data-id="${transacao.id}">Editar</button>
                    <button class="delete-btn" data-id="${transacao.id}">Excluir</button>
                </td>
            </tr>
        `;

    // 4. Inserir o HTML no DOM
    historicoLista.innerHTML += tr;
  });
}

/* --- 5. FUNÇÃO "CÁLCULO": ATUALIZAR DASHBOARD --- */

function atualizarDashboard(transacoesParaCalcular) {
  console.log("Calculando e atualizando o dashboard...");

  // 1. CALCULAR TOTAL DE RECEITAS
  const todasReceitas = transacoesParaCalcular.filter(function (transacao) {
    return transacao.tipo === "receita";
  });

  // Pega o array filtrado (todasReceitas) e "reduz" ele a um único número.
  const totalReceitas = todasReceitas.reduce(function (total, transacao) {
    return total + transacao.valor;
  }, 0); // 0 é o valor inicial do 'total'

  // 2. CALCULAR TOTAL DE DESPESAS
  const todasDespesas = transacoesParaCalcular.filter(function (transacao) {
    return transacao.tipo === "despesa";
  });

  const totalDespesas = todasDespesas.reduce(function (total, transacao) {
    return total + transacao.valor;
  }, 0);

  // 3. CALCULAR SALDO TOTAL
  const saldoTotal = totalReceitas - totalDespesas;

  // 4. ATUALIZAR O HTML
  dashboardReceitas.innerHTML = totalReceitas.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  dashboardDespesas.innerHTML = totalDespesas.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  dashboardSaldo.innerHTML = saldoTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* --- 6. AÇÕES - "DELETE" --- */
/**
 * Adicionamos um "ouvinte" de clique na LISTA INTEIRA (o <tbody>).
 * Isso é "Delegação de Evento".
 */
historicoLista.addEventListener("click", function (event) {
  // 1. Verificamos se o clique foi em um botão "Excluir"
  if (event.target.classList.contains("delete-btn")) {
    // 2. Pegar o ID da transação
    const idParaExcluir = parseInt(event.target.dataset.id);

    // 3. Confirmar com o usuário
    const confirmou = confirm("Tem certeza que deseja excluir esta transação?");

    if (confirmou) {
      // 4. Chamar a função de exclusão
      excluirTransacao(idParaExcluir);
    }
  } else if (event.target.classList.contains("edit-btn")) {
    // 5. Lógica de preparar a edição
    const idParaEditar = parseInt(event.target.dataset.id);
    prepararEdicao(idParaEditar);
  }
});

/**
 * Função de "Delete": Remove uma transação do array 'transacoes'.
 * @param {number} id - O ID da transação a ser excluída.
 */
function excluirTransacao(id) {
  // 1. ATUALIZAR OS DADOS
  transacoes = transacoes.filter(function (transacao) {
    return transacao.id !== id;
  });

  // 2. SALVAR OS DADOS
  // Salvamos o novo array (sem o item excluído) no localStorage.
  localStorage.setItem("transacoes", JSON.stringify(transacoes));

  // 3. ATUALIZAR A TELA
  atualizarInterface();
}

/**
 * Função de "Update": Prepara o formulário para edição.
 * @param {number} id - O ID da transação a ser editada.
 */
function prepararEdicao(id) {
  // 1. Encontrar a transação no array 'transacoes'
  const transacaoParaEditar = transacoes.find(function (transacao) {
    return transacao.id === id;
  });

  // Se, por algum motivo, não encontrar, pare a função.
  if (!transacaoParaEditar) return;

  // 2. Preencher o formulário com os dados da transação
  inputDescricao.value = transacaoParaEditar.descricao;
  inputValor.value = transacaoParaEditar.valor;
  inputData.value = transacaoParaEditar.data;
  selectTipo.value = transacaoParaEditar.tipo;
  selectCategoria.value = transacaoParaEditar.categoria;

  // 3. Marcar o estado de "edição"
  inputIdEdicao.value = transacaoParaEditar.id;

  // 4. Mudar o texto do botão
  formButton.textContent = "Atualizar";

  // 5. Levar o usuário ao topo onde o formulário está.
  form.scrollIntoView({ behavior: "smooth" });
}

//Relatório por categorias
function gerarRelatorioCategorias(transacoesFiltradas) {
  listaPercentual.innerHTML = ""; // Limpa o relatório anterior

  // 1. Pegar SÓ as despesas da lista filtrada
  const despesas = transacoesFiltradas.filter((t) => t.tipo === "despesa");

  // 2. Calcular o total de despesas (apenas do filtro)
  const totalDespesas = despesas.reduce((total, t) => total + t.valor, 0);

  if (totalDespesas === 0) {
    listaPercentual.innerHTML = "<li>Nenhuma despesa no período.</li>";
    return;
  }

  // 3. Agrupar gastos por categoria
  const gastosPorCategoria = despesas.reduce(function (acumulador, transacao) {
    const categoria = transacao.categoria;

    if (!acumulador[categoria]) {
      acumulador[categoria] = 0;
    }

    acumulador[categoria] += transacao.valor;
    return acumulador;
  }, {});

  // 4. Calcular percentual e exibir no HTML
  for (const categoria in gastosPorCategoria) {
    const valorGasto = gastosPorCategoria[categoria];
    const percentual = (valorGasto / totalDespesas) * 100;

    const li = `
            <li>
                <strong>${categoria}:</strong>
                ${percentual.toFixed(2)}%
                (${valorGasto.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })})
            </li>
        `;
    listaPercentual.innerHTML += li;
  }
}

/* --- FUNÇÃO ESPECÍFICA PARA FILTROS NOS RELATÓRIOS --- */
function aplicarFiltros() {
  console.log("=== APLICANDO FILTROS APENAS PARA RELATÓRIOS ===");

  const periodoFiltrado = filtroPeriodo.value;
  const categoriaFiltrada = document.getElementById(
    "categoria-relatorio"
  ).value;

  console.log(
    "Filtros - Período:",
    periodoFiltrado,
    "Categoria:",
    categoriaFiltrada
  );

  let transacoesFiltradas = [];

  // Aplicar filtros APENAS para relatórios
  transacoesFiltradas = transacoes.filter(function (transacao) {
    let passaFiltroPeriodo = true;
    let passaFiltroCategoria = true;

    if (periodoFiltrado) {
      passaFiltroPeriodo = transacao.data.startsWith(periodoFiltrado);
    }

    if (categoriaFiltrada && categoriaFiltrada !== "Todas") {
      passaFiltroCategoria = transacao.categoria === categoriaFiltrada;
    }

    return passaFiltroPeriodo && passaFiltroCategoria;
  });

  console.log(
    "Transações filtradas para relatórios:",
    transacoesFiltradas.length
  );

  // ATUALIZAR APENAS RELATÓRIOS E DASHBOARD com dados filtrados
  atualizarDashboard(transacoesFiltradas); // Dashboard com dados filtrados
  gerarRelatorioCategorias(transacoesFiltradas); // Relatório com dados filtrados

  // NÃO atualiza o histórico - ele continua mostrando todas as transações
}

/* --- FUNÇÃO PARA RENDERIZAR TRANSAÇÕES FILTRADAS --- */
function renderizarTransacoesFiltradas(transacoesFiltradas) {
  console.log("Renderizando transações filtradas nos relatórios...");

  listaTransacoesFiltradas.innerHTML = "";

  if (transacoesFiltradas.length === 0) {
    listaTransacoesFiltradas.innerHTML =
      '<p class="sem-transacoes">Nenhuma transação encontrada para os filtros selecionados.</p>';
    return;
  }

  // Criar uma tabela similar ao histórico, mas sem botões de ação
  const tabelaHTML = `
        <table class="tabela-filtrada">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                </tr>
            </thead>
            <tbody>
                ${transacoesFiltradas
                  .map((transacao) => {
                    const cssClass =
                      transacao.tipo === "receita" ? "receita" : "despesa";
                    const [ano, mes, dia] = transacao.data.split("-");
                    const dataFormatada = `${dia}/${mes}/${ano}`;

                    const valorParaFormatar =
                      transacao.tipo === "receita"
                        ? transacao.valor
                        : -transacao.valor;
                    const valorFormatado = valorParaFormatar.toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    );

                    return `
                        <tr class="${cssClass}">
                            <td>${transacao.descricao}</td>
                            <td>${valorFormatado}</td>
                            <td>${dataFormatada}</td>
                            <td>${transacao.categoria}</td>
                            <td>${
                              transacao.tipo === "receita"
                                ? "Receita"
                                : "Despesa"
                            }</td>
                        </tr>
                    `;
                  })
                  .join("")}
            </tbody>
        </table>
    `;

  listaTransacoesFiltradas.innerHTML = tabelaHTML;
}

/* --- FUNÇÃO ESPECÍFICA PARA FILTROS NOS RELATÓRIOS --- */
function aplicarFiltros() {
  console.log("=== APLICANDO FILTROS PARA RELATÓRIOS ===");

  const periodoFiltrado = filtroPeriodo.value;
  const categoriaFiltrada = document.getElementById(
    "categoria-relatorio"
  ).value;

  let transacoesFiltradas = transacoes.filter(function (transacao) {
    let passaFiltroPeriodo = true;
    let passaFiltroCategoria = true;

    if (periodoFiltrado) {
      passaFiltroPeriodo = transacao.data.startsWith(periodoFiltrado);
    }

    if (categoriaFiltrada && categoriaFiltrada !== "Todas") {
      passaFiltroCategoria = transacao.categoria === categoriaFiltrada;
    }

    return passaFiltroPeriodo && passaFiltroCategoria;
  });

  console.log("Transações filtradas:", transacoesFiltradas.length);

  // ATUALIZAR: Dashboard + Lista Filtrada + Relatório de Categorias
  atualizarDashboard(transacoesFiltradas);
  renderizarTransacoesFiltradas(transacoesFiltradas);
  gerarRelatorioCategorias(transacoesFiltradas);
}

btnFiltrar.addEventListener("click", function () {
  console.log("Botão Filtrar - Atualizando apenas relatórios e dashboard");
  aplicarFiltros();
});

/* --- 7. INICIALIZAÇÃO --- */

function init() {
  console.log("Iniciando o aplicativo...");
  atualizarInterface();
}

// Chama a função de inicialização assim que o script é carregado.
init();
