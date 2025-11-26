Projeto Painel de Finanças Pessoais
Membros da Equipe
Pierre Simon 

Renan Mendes

Kewy Huang

Arthur Benevides

Jose Vasconcelos

Visão Geral
Este projeto consiste em uma aplicação web de Controle Financeiro Pessoal, desenvolvida para auxiliar o usuário na gestão de suas receitas e despesas. A interface permite o registro detalhado de transações financeiras, oferece uma visualização clara do saldo total e permite filtrar o histórico por períodos, facilitando o acompanhamento da saúde financeira.

Como Usar
1. Como registrar um lançamento
Para adicionar uma nova transação financeira, utilize o formulário principal localizado no topo da página:

Descrição: Digite um nome para a transação (ex: "Salário", "Conta de Luz").

Valor: Insira o valor monetário.

Tipo: Selecione se a transação é uma Entrada (Receita) ou Saída (Despesa).

Data: Escolha a data da ocorrência.

Finalizar: Clique no botão "Adicionar" para salvar o lançamento. O painel de resumo será atualizado automaticamente.

2. Como editar ou excluir
Na tabela de transações listada abaixo do formulário:

Editar: Clique no ícone de lápis (✏️) na linha da transação desejada. Os dados voltarão para o formulário para alteração. Após ajustar, clique em "Atualizar".

Excluir: Clique no ícone de lixeira (🗑️) ou botão "Excluir" na linha correspondente para remover a transação permanentemente do sistema e recalcular o saldo.

3. Como gerar relatórios
Para visualizar o histórico de um período específico:

Localize o filtro de Mês/Ano no topo da lista de transações.

Selecione o mês desejado.

A tabela e os cartões de resumo (Entradas, Saídas e Total) serão filtrados para exibir apenas os dados referentes àquele período.

## Lógica Aplicada

Para o desenvolvimento das funcionalidades principais do sistema, adotamos as seguintes estratégias de programação:

* **Armazenamento:** Optamos por usar o `localStorage` do navegador para persistir os dados de forma simples. Isso garante que as informações não sejam perdidas ao recarregar a página, sem a necessidade imediata de um banco de dados ou backend complexo.

* **Cálculo de Saldo:** O saldo é calculado em tempo real através da função `atualizarDashboard`. Utilizamos métodos de array modernos do JavaScript: o `filter` para separar o que é receita do que é despesa, e o `reduce` para somar os totais e obter o saldo líquido.

* **Edição e Exclusão:** Implementamos o conceito de **Delegação de Evento** no `<tbody>` da tabela para gerenciar os cliques nos botões. Cada botão de ação carrega um atributo único (`data-id`), que nos permite identificar com precisão qual objeto de transação deve ser alterado ou removido do array principal de dados.
