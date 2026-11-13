/* =========================================================
   DADOS DEMONSTRATIVOS DO QUADRO KANBAN E SPRINTS
========================================================= */
const sprintsData = {
  sprint1: {
    nome: "Sprint 1 — Fundação, Cadastro & Regras",
    objetivo: "Estruturar o repositório, requisitos iniciais e módulo Python de pacientes.",
    duracao: "2 semanas (01/03 a 14/03)",
    relatorio: {
      resultados: "100% das histórias entregues; módulo clinica_vida.py validado sem erros de execução.",
      desafios: "Garantir tratamento robusto para entradas não numéricas no campo de idade.",
      pontosPositivos: "Código limpo usando apenas listas e dicionários nativos, facilitando manutenção.",
      melhorias: "Adicionar exportação automática dos dados cadastrados em CSV nas próximas versões."
    },
    tarefas: [
      {
        id: "t1",
        titulo: "Levantamento de Requisitos da Clínica",
        data: "2026-03-04",
        status: "concluido",
        checklist: [
          { texto: "Entrevistar recepção fictícia", feito: true },
          { texto: "Definir campos obrigatórios do paciente", feito: true }
        ],
        comentarios: ["Requisitos aprovados pela coordenação."]
      },
      {
        id: "t2",
        titulo: "Desenvolver clinica_vida.py (Menu e Estatísticas)",
        data: "2026-03-10",
        status: "concluido",
        checklist: [
          { texto: "Implementar loop do menu 1 a 5", feito: true },
          { texto: "Calcular média, mais novo e mais velho", feito: true }
        ],
        comentarios: ["Testado com lista vazia e nomes parciais."]
      }
    ]
  },
  sprint2: {
    nome: "Sprint 2 — Triagem Lógica, Filas & UML",
    objetivo: "Validar tabelas-verdade de atendimento, fila FIFO e diagrama UML de casos de uso.",
    duracao: "2 semanas (15/03 a 28/03)",
    relatorio: {
      resultados: "Tabelas-verdade com 16 combinações verificadas e diagrama UML com <<include>> concluído.",
      desafios: "Diferenciar claramente regras de consulta eletiva e atendimento emergencial.",
      pontosPositivos: "Clareza visual no fluxo entre Secretária e Médico no diagrama.",
      melhorias: "Integrar a lógica booleana diretamente no módulo de triagem em Python."
    },
    tarefas: [
      {
        id: "t3",
        titulo: "Integração Futura com Banco SQLite",
        data: "2026-04-05",
        status: "backlog",
        checklist: [
          { texto: "Modelar tabela pacientes", feito: false },
          { texto: "Criar script de migração", feito: false }
        ],
        comentarios: ["Planejado para ciclo posterior."]
      },
      {
        id: "t4",
        titulo: "Simulação de Fila FIFO na Recepção",
        data: "2026-03-22",
        status: "sprint_atual",
        checklist: [
          { texto: "Escrever pseudocódigo ENQUEUE/DEQUEUE", feito: true },
          { texto: "Validar ordem dos 2 pacientes restantes", feito: false }
        ],
        comentarios: ["Falta revisar formatação final do algoritmo."]
      },
      {
        id: "t5",
        titulo: "Tabelas-Verdade de Consulta Normal e Emergência",
        data: "2026-03-24",
        status: "em_progresso",
        checklist: [
          { texto: "Calcular 16 combinações V/F", feito: true },
          { texto: "Documentar caso A=F, B=V, C=V, D=F", feito: true }
        ],
        comentarios: ["Conferido: 3/16 Normal e 6/16 Emergência."]
      },
      {
        id: "t6",
        titulo: "Diagrama UML de Casos de Uso",
        data: "2026-03-20",
        status: "concluido",
        checklist: [
          { texto: "Incluir atores Secretária e Médico", feito: true },
          { texto: "Aplicar setas <<include>> obrigatórias", feito: true }
        ],
        comentarios: ["Diagrama vetorial SVG validado."]
      }
    ]
  }
};

let currentSprintKey = "sprint2";
let draggedTaskId = null;

/* =========================================================
   RENDERIZAÇÃO DO QUADRO KANBAN
========================================================= */
function renderKanban() {
  const sprint = sprintsData[currentSprintKey];
  document.getElementById("sprintMeta").innerHTML =
    `<strong>Objetivo:</strong> ${sprint.objetivo} &nbsp;|&nbsp; <strong>Duração:</strong> ${sprint.duracao}`;

  const cols = ["backlog", "sprint_atual", "em_progresso", "concluido"];
  cols.forEach((status) => {
    const listEl = document.getElementById(`list-${status}`);
    listEl.innerHTML = "";
    const tasks = sprint.tarefas.filter((t) => t.status === status);
    document.getElementById(`count-${status}`).textContent = tasks.length;

    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.draggable = true;
      card.ondragstart = () => (draggedTaskId = task.id);

      const checklistHtml = task.checklist
        .map(
          (item, idx) => `
          <li class="${item.feito ? "done" : ""}">
            <input type="checkbox" ${item.feito ? "checked" : ""} onchange="toggleChecklist('${task.id}', ${idx})" />
            <span>${item.texto}</span>
          </li>`
        )
        .join("");

      const lastComment = task.comentarios.length
        ? `<div class="task-comments">💬 ${task.comentarios[task.comentarios.length - 1]}</div>`
        : "";

      card.innerHTML = `
        <div class="task-top">
          <div class="task-title">${task.titulo}</div>
          <button class="mini-btn" onclick="editarTituloTarefa('${task.id}')" title="Editar título">✏️</button>
        </div>
        <div class="task-date">📅 Entrega: ${task.data}</div>
        <ul class="checklist-list">${checklistHtml}</ul>
        ${lastComment}
        <div class="task-controls">
          <div>
            <button class="mini-btn" onclick="moverTarefaStep('${task.id}', -1)" title="Mover para esquerda">◀</button>
            <button class="mini-btn" onclick="moverTarefaStep('${task.id}', 1)" title="Mover para direita">▶</button>
          </div>
          <button class="mini-btn" onclick="adicionarComentario('${task.id}')">+ Comentário</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  });

  atualizarProgresso();
}

function atualizarProgresso() {
  const tarefas = sprintsData[currentSprintKey].tarefas;
  if (!tarefas.length) {
    document.getElementById("progressText").textContent = "0%";
    document.getElementById("progressFill").style.width = "0%";
    return;
  }
  const concluidas = tarefas.filter((t) => t.status === "concluido").length;
  const pct = Math.round((concluidas / tarefas.length) * 100);
  document.getElementById("progressText").textContent = `${pct}% (${concluidas}/${tarefas.length} tarefas)`;
  document.getElementById("progressFill").style.width = `${pct}%`;
}

function mudarSprint() {
  currentSprintKey = document.getElementById("sprintSelect").value;
  fecharRelatorio();
  renderKanban();
}

function allowDrop(ev) {
  ev.preventDefault();
}

function dropTask(ev, novoStatus) {
  ev.preventDefault();
  if (!draggedTaskId) return;
  const tarefa = sprintsData[currentSprintKey].tarefas.find((t) => t.id === draggedTaskId);
  if (tarefa) {
    tarefa.status = novoStatus;
    renderKanban();
  }
  draggedTaskId = null;
}

function moverTarefaStep(taskId, direcao) {
  const ordem = ["backlog", "sprint_atual", "em_progresso", "concluido"];
  const tarefa = sprintsData[currentSprintKey].tarefas.find((t) => t.id === taskId);
  if (!tarefa) return;
  const idxAtual = ordem.indexOf(tarefa.status);
  const novoIdx = Math.max(0, Math.min(ordem.length - 1, idxAtual + direcao));
  tarefa.status = ordem[novoIdx];
  renderKanban();
}

function toggleChecklist(taskId, itemIdx) {
  const tarefa = sprintsData[currentSprintKey].tarefas.find((t) => t.id === taskId);
  if (tarefa && tarefa.checklist[itemIdx]) {
    tarefa.checklist[itemIdx].feito = !tarefa.checklist[itemIdx].feito;
    renderKanban();
  }
}

function editarTituloTarefa(taskId) {
  const tarefa = sprintsData[currentSprintKey].tarefas.find((t) => t.id === taskId);
  if (!tarefa) return;
  const novo = prompt("Editar título da tarefa:", tarefa.titulo);
  if (novo && novo.trim()) {
    tarefa.titulo = novo.trim();
    renderKanban();
  }
}

function adicionarComentario(taskId) {
  const tarefa = sprintsData[currentSprintKey].tarefas.find((t) => t.id === taskId);
  if (!tarefa) return;
  const texto = prompt("Novo comentário na tarefa:");
  if (texto && texto.trim()) {
    tarefa.comentarios.push(texto.trim());
    renderKanban();
  }
}

/* MODAL NOVA TAREFA */
function abrirModalNovaTarefa() {
  document.getElementById("taskModal").classList.remove("hidden");
}

function fecharModalNovaTarefa() {
  document.getElementById("taskModal").classList.add("hidden");
  document.getElementById("newTaskForm").reset();
}

function salvarNovaTarefa(ev) {
  ev.preventDefault();
  const titulo = document.getElementById("taskTitleInput").value.trim();
  const data = document.getElementById("taskDateInput").value;
  const status = document.getElementById("taskStatusInput").value;
  const rawCheck = document.getElementById("taskChecklistInput").value;

  const checklist = rawCheck
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((texto) => ({ texto, feito: false }));

  sprintsData[currentSprintKey].tarefas.push({
    id: "t" + Date.now(),
    titulo,
    data,
    status,
    checklist: checklist.length ? checklist : [{ texto: "Executar tarefa", feito: false }],
    comentarios: ["Criada via painel Clínica Vida+."]
  });

  fecharModalNovaTarefa();
  renderKanban();
}

/* RELATÓRIO DA SPRINT */
function gerarRelatorioSprint() {
  const sprint = sprintsData[currentSprintKey];
  const concluidas = sprint.tarefas.filter((t) => t.status === "concluido").length;
  const total = sprint.tarefas.length;

  document.getElementById("reportTitle").textContent = `Relatório de Encerramento — ${sprint.nome}`;
  document.getElementById("reportContent").innerHTML = `
    <div class="report-item">
      <h4>📈 Resultados Alcançados</h4>
      <p>${sprint.relatorio.resultados} (<strong>${concluidas}/${total}</strong> tarefas concluídas).</p>
    </div>
    <div class="report-item">
      <h4>⚠️ Desafios Enfrentados</h4>
      <p>${sprint.relatorio.desafios}</p>
    </div>
    <div class="report-item">
      <h4>🌟 Pontos Positivos</h4>
      <p>${sprint.relatorio.pontosPositivos}</p>
    </div>
    <div class="report-item">
      <h4>🚀 Melhorias para Próxima Sprint</h4>
      <p>${sprint.relatorio.melhorias}</p>
    </div>
  `;
  document.getElementById("sprintReportBox").classList.remove("hidden");
}

function fecharRelatorio() {
  document.getElementById("sprintReportBox").classList.add("hidden");
}

function exportarRelatorioTXT() {
  const sprint = sprintsData[currentSprintKey];
  const concluidas = sprint.tarefas.filter((t) => t.status === "concluido").length;
  const conteudo = [
    `RELATÓRIO DE SPRINT - CLÍNICA VIDA+`,
    `Sprint: ${sprint.nome}`,
    `Objetivo: ${sprint.objetivo}`,
    `Duração: ${sprint.duracao}`,
    `Taxa de Conclusão: ${concluidas}/${sprint.tarefas.length} tarefas`,
    `--------------------------------------------------`,
    `1. RESULTADOS: ${sprint.relatorio.resultados}`,
    `2. DESAFIOS: ${sprint.relatorio.desafios}`,
    `3. PONTOS POSITIVOS: ${sprint.relatorio.pontosPositivos}`,
    `4. MELHORIAS: ${sprint.relatorio.melhorias}`
  ].join("\n");

  baixarArquivoTexto(`relatorio_${currentSprintKey}.txt`, conteudo, "text/plain;charset=utf-8");
}

/* =========================================================
   PASSO 2: DOWNLOAD E CÓPIA DO ARQUIVO PYTHON
========================================================= */
function baixarArquivoPython() {
  const codigo = document.getElementById("pythonSourceCode").textContent;
  baixarArquivoTexto("clinica_vida.py", codigo, "text/x-python;charset=utf-8");
}

function copiarCodigoPython() {
  const codigo = document.getElementById("pythonSourceCode").textContent;
  navigator.clipboard.writeText(codigo).then(() => {
    alert("Código clinica_vida.py copiado para a área de transferência!");
  });
}

/* =========================================================
   PASSO 3: GERAÇÃO EXATA DAS TABELAS-VERDADE (16 LINHAS)
========================================================= */
function gerarTabelasVerdade() {
  const tbodyNormal = document.querySelector("#tableNormal tbody");
  const tbodyEmerg = document.querySelector("#tableEmergencia tbody");

  let countN = 0;
  let countE = 0;

  for (let i = 0; i < 16; i++) {
    // Ordem padrão: V = true (bit 1), F = false (bit 0) começando de V,V,V,V até F,F,F,F
    const A = Boolean((i >> 3) & 1);
    const B = Boolean((i >> 2) & 1);
    const C = Boolean((i >> 1) & 1);
    const D = Boolean(i & 1);

    // Invertemos o índice para exibir V,V,V,V na linha 1 e F,F,F,F na linha 16
    const aVal = !A;
    const bVal = !B;
    const cVal = !C;
    const dVal = !D;

    const abc = aVal && bVal && cVal;
    const bcd = bVal && cVal && dVal;
    const resNormal = abc || bcd;

    const bOuD = bVal || dVal;
    const resEmerg = cVal && bOuD;

    if (resNormal) countN++;
    if (resEmerg) countE++;

    // Destaca o caso específico A=F, B=V, C=V, D=F
    const isTargetCase = !aVal && bVal && cVal && !dVal;
    const trClass = isTargetCase ? 'class="highlight-case"' : "";

    const vf = (bool) => (bool ? "V" : "F");
    const badge = (bool) =>
      bool ? '<span class="badge-v">V</span>' : '<span class="badge-f">F</span>';

    tbodyNormal.innerHTML += `
      <tr ${trClass}>
        <td>${i + 1}</td>
        <td>${vf(aVal)}</td>
        <td>${vf(bVal)}</td>
        <td>${vf(cVal)}</td>
        <td>${vf(dVal)}</td>
        <td>${vf(abc)}</td>
        <td>${vf(bcd)}</td>
        <td>${badge(resNormal)}</td>
      </tr>`;

    tbodyEmerg.innerHTML += `
      <tr ${trClass}>
        <td>${i + 1}</td>
        <td>${vf(aVal)}</td>
        <td>${vf(bVal)}</td>
        <td>${vf(cVal)}</td>
        <td>${vf(dVal)}</td>
        <td>${vf(bOuD)}</td>
        <td>${badge(resEmerg)}</td>
      </tr>`;
  }

  document.getElementById("countNormal").textContent = `${countN} de 16`;
  document.getElementById("countEmergencia").textContent = `${countE} de 16`;
}

/* =========================================================
   PASSO 5: EXPORTAR DIAGRAMA SVG & DOSSIÊ COMPLETO
========================================================= */
function baixarDiagramaSVG() {
  const svgEl = document.getElementById("umlDiagramSvg");
  const serializer = new XMLSerializer();
  const source = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(svgEl);
  baixarArquivoTexto("diagrama_casos_de_uso_clinica_vida.svg", source, "image/svg+xml;charset=utf-8");
}

function exportarDossieCompleto() {
  const dossie = [
    "============================================================",
    "PROJETO ACADÊMICO: CLÍNICA VIDA+",
    "============================================================",
    "",
    "PASSO 1 - GESTÃO ÁGIL (KANBAN & SPRINTS)",
    "- Listas: Backlog, Sprint Atual, Em Progresso, Concluído.",
    "- Sprints documentadas com objetivos, checklists e relatórios.",
    "",
    "PASSO 2 - SISTEMA PYTHON (clinica_vida.py)",
    "- Implementado com listas e dicionários, menu 1 a 5, estatísticas e validações.",
    "",
    "PASSO 3 - LÓGICA PROPOSICIONAL",
    "- Consulta Normal: (A ^ B ^ C) v (B ^ C ^ D) -> 3 de 16 situações liberadas.",
    "- Emergência: C ^ (B v D) -> 6 de 16 situações liberadas.",
    "- Caso A=F, B=V, C=V, D=F: Consulta Normal = F (Negada) | Emergência = V (Liberada).",
    "",
    "PASSO 4 - FILA FIFO EM PSEUDOCÓDIGO",
    "- Inseridos 3 pacientes (Ana Beatriz, Bruno Henrique, Camila Rocha).",
    "- Atendido 1º (Ana Beatriz); restantes na ordem: 1º Bruno Henrique, 2º Camila Rocha.",
    "",
    "PASSO 5 - DIAGRAMA UML DE CASOS DE USO",
    "- Atores: Secretária e Médico.",
    "- Relacionamentos <<include>>: Agendar/Confirmar -> Verificar cadastro; Gerar -> Imprimir receita."
  ].join("\n");

  baixarArquivoTexto("dossie_clinica_vida_plus.txt", dossie, "text/plain;charset=utf-8");
}

function baixarArquivoTexto(nomeArquivo, conteudo, mimeType) {
  const blob = new Blob([conteudo], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* INICIALIZAÇÃO */
document.addEventListener("DOMContentLoaded", () => {
  renderKanban();
  gerarTabelasVerdade();
});