/* --- 1. SELEÇÃO DE ELEMENTOS DO DOM --- */

const form = document.getElementById('form-add');
const inputDescricao = document.getElementById('descricao');
const inputValor = document.getElementById('valor');
const inputData = document.getElementById('data');
const selectTipo = document.getElementById('tipo');
const selectCategoria = document.getElementById('categoria');
const historicoLista = document.getElementById('lista-transacoes-body');
const dashboardReceitas = document.getElementById('total-receitas');
const dashboardDespesas = document.getElementById('total-despesas');
const dashboardSaldo = document.getElementById('saldo-total');
const inputIdEdicao = document.getElementById('transacao-id');
const formButton = document.querySelector('#form-add button');

/* --- 2. DADOS (O "BANCO DE DADOS" DO NAVEGADOR) --- */

let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];

/* --- 3. FUNÇÃO PRINCIPAL: ADICIONAR TRANSAÇÃO (CREATE) --- */

form.addEventListener('submit', function (event) {
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
    if (descricao === '' || valor === '' || data === '') {
        alert('Por favor, preencha os campos obrigatórios: Descrição, Valor e Data.');
        return;
    }

    const valorNumerico = parseFloat(valor);

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
        alert('Por favor, insira um valor numérico válido e positivo.');
        return;
    }

    // 4. DECIDIR SE VAI CRIAR OU ATUALIZAR
    if (idParaAtualizar) {
        // --- LÓGICA DE UPDATE (ATUALIZAR) ---        
        transacoes = transacoes.map(function(transacao) {
            if (transacao.id == idParaAtualizar) {
                return {
                    id: transacao.id, // Mantém o ID original
                    descricao: descricao,
                    valor: valorNumerico,
                    data: data,
                    tipo: tipo,
                    categoria: categoria
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
            categoria: categoria
        };
        transacoes.unshift(novaTransacao);
    }

    // 5. SALVAR E ATUALIZAR A TELA
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
    resetarFormulario();
    renderizarHistorico();
    atualizarDashboard();
});

function resetarFormulario() {
    form.reset(); // Limpa os campos visíveis
    inputIdEdicao.value = ''; // Limpa o ID escondido
    formButton.textContent = 'Adicionar'; // Restaura o texto do botão
}

/* --- 4. FUNÇÃO "READ": RENDERIZAR HISTÓRICO --- */

function renderizarHistorico() {
    console.log("Desenhando o histórico na tabela...");

    historicoLista.innerHTML = '';

    // 1. Iterar (fazer um loop) sobre o array 'transacoes'
    transacoes.forEach(function (transacao) {
        
        // 2. Formatar os dados para exibição

        // 2.a. Classe CSS: Adiciona 'receita' ou 'despesa' no <tr>
        const cssClass = transacao.tipo === 'receita' ? 'receita' : 'despesa';

        // 2.b. Valor (Formatação de Moeda)
        const valorParaFormatar = transacao.tipo === 'receita' ? transacao.valor : -transacao.valor;
        
        const valorFormatado = valorParaFormatar.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        // 2.c. Data (Formatação de Data)
        const [ano, mes, dia] = transacao.data.split('-');
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

function atualizarDashboard() {
    console.log("Calculando e atualizando o dashboard...");

    // 1. CALCULAR TOTAL DE RECEITAS
    const todasReceitas = transacoes.filter(function (transacao) {
        return transacao.tipo === 'receita';
    });

    // Pega o array filtrado (todasReceitas) e "reduz" ele a um único número.
    const totalReceitas = todasReceitas.reduce(function (total, transacao) {
        return total + transacao.valor;
    }, 0); // 0 é o valor inicial do 'total'

    
    // 2. CALCULAR TOTAL DE DESPESAS
    const todasDespesas = transacoes.filter(function (transacao) {
        return transacao.tipo === 'despesa';
    });

    const totalDespesas = todasDespesas.reduce(function (total, transacao) {
        return total + transacao.valor;
    }, 0);

    // 3. CALCULAR SALDO TOTAL
    const saldoTotal = totalReceitas - totalDespesas;
    
    // 4. ATUALIZAR O HTML
    dashboardReceitas.innerHTML = totalReceitas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    dashboardDespesas.innerHTML = totalDespesas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    dashboardSaldo.innerHTML = saldoTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/* --- 6. AÇÕES - "DELETE" --- */
/**
 * Adicionamos um "ouvinte" de clique na LISTA INTEIRA (o <tbody>).
 * Isso é "Delegação de Evento".
 */
historicoLista.addEventListener('click', function(event) {
    // 1. Verificamos se o clique foi em um botão "Excluir"
    if (event.target.classList.contains('delete-btn')) {
        
        // 2. Pegar o ID da transação
        const idParaExcluir = parseInt(event.target.dataset.id);

        // 3. Confirmar com o usuário
        const confirmou = confirm('Tem certeza que deseja excluir esta transação?');
        
        if (confirmou) {
            // 4. Chamar a função de exclusão
            excluirTransacao(idParaExcluir);
        }
    } else if (event.target.classList.contains('edit-btn')) {
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
    transacoes = transacoes.filter(function(transacao) {
        return transacao.id !== id;
    });

    // 2. SALVAR OS DADOS
    // Salvamos o novo array (sem o item excluído) no localStorage.
    localStorage.setItem('transacoes', JSON.stringify(transacoes));

    // 3. ATUALIZAR A TELA
    renderizarHistorico();
    atualizarDashboard();
}

/**
 * Função de "Update": Prepara o formulário para edição.
 * @param {number} id - O ID da transação a ser editada.
 */
function prepararEdicao(id) {
    // 1. Encontrar a transação no array 'transacoes'
    const transacaoParaEditar = transacoes.find(function(transacao) {
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
    formButton.textContent = 'Atualizar';

    // 5. Levar o usuário ao topo onde o formulário está.
    form.scrollIntoView({ behavior: 'smooth' });
}

/* --- 7. INICIALIZAÇÃO --- */

function init() {
    console.log("Iniciando o aplicativo...");
    renderizarHistorico();
    atualizarDashboard();
}

// Chama a função de inicialização assim que o script é carregado.
init();