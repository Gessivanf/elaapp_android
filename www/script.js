// Variáveis globais
let comodos = [];
let tipoInstalacao = "monofasico";

// Elementos DOM
document.addEventListener('DOMContentLoaded', function() {
    // Configurar listeners
    document.getElementById('adicionarComodo').addEventListener('click', adicionarComodo);
    document.getElementById('exportarPDF').addEventListener('click', exportarPDF);
    
    // Configurar tipo de instalação
    document.querySelectorAll('input[name="tipoInstalacao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            tipoInstalacao = this.value;
            atualizarResultados();
        });
    });
});

// Funções para gerenciar cômodos
function adicionarComodo() {
    const nomeComodo = document.getElementById('nomeComodo').value.trim();
    if (nomeComodo === '') {
        alert('Por favor, digite o nome do cômodo.');
        return;
    }
    
    const comodo = {
        id: Date.now(),
        nome: nomeComodo,
        tug: 1, // Tomada de uso geral (padrão)
        tue: 0, // Tomada de uso específico
        iluminacao: 1 // Ponto de iluminação (padrão)
    };
    
    comodos.push(comodo);
    document.getElementById('nomeComodo').value = '';
    renderizarComodos();
    atualizarResultados();
}

function removerComodo(id) {
    comodos = comodos.filter(comodo => comodo.id !== id);
    renderizarComodos();
    atualizarResultados();
}

function editarComodo(id) {
    const comodo = comodos.find(c => c.id === id);
    if (!comodo) return;
    
    const tugExtra = prompt(`Quantas tomadas de uso geral extras para ${comodo.nome}?`, comodo.tug - 1);
    const tue = prompt(`Quantas tomadas de uso específico para ${comodo.nome}?`, comodo.tue);
    const iluminacaoExtra = prompt(`Quantos pontos de iluminação extras para ${comodo.nome}?`, comodo.iluminacao - 1);
    
    comodo.tug = parseInt(tugExtra) + 1 || 1;
    comodo.tue = parseInt(tue) || 0;
    comodo.iluminacao = parseInt(iluminacaoExtra) + 1 || 1;
    
    renderizarComodos();
    atualizarResultados();
}

function renderizarComodos() {
    const listaComodos = document.getElementById('listaComodos');
    listaComodos.innerHTML = '';
    
    comodos.forEach(comodo => {
        const comodoElement = document.createElement('div');
        comodoElement.className = 'comodo-item';
        comodoElement.innerHTML = `
            <h3>${comodo.nome}</h3>
            <p>TUG: ${comodo.tug} | TUE: ${comodo.tue} | Iluminação: ${comodo.iluminacao}</p>
            <div class="comodo-actions">
                <button class="btn-editar" onclick="editarComodo(${comodo.id})">Editar</button>
                <button class="btn-remover" onclick="removerComodo(${comodo.id})">Remover</button>
            </div>
        `;
        listaComodos.appendChild(comodoElement);
    });
}

// Cálculos e resultados
function calcularPotencia() {
    let totalTUG = 0;
    let totalTUE = 0;
    let totalIluminacao = 0;
    
    comodos.forEach(comodo => {
        totalTUG += comodo.tug;
        totalTUE += comodo.tue;
        totalIluminacao += comodo.iluminacao;
    });
    
    // Cálculos simplificados para demonstração
    const potenciaTUG = totalTUG * 100; // 100W por TUG
    const potenciaTUE = totalTUE * 600; // 600W por TUE
    const potenciaIluminacao = totalIluminacao * 60; // 60W por ponto de iluminação
    
    const potenciaTotal = potenciaTUG + potenciaTUE + potenciaIluminacao;
    const fatorDemanda = tipoInstalacao === "monofasico" ? 0.8 : 0.7;
    const potenciaDemandada = potenciaTotal * fatorDemanda;
    
    return {
        totalTUG,
        totalTUE,
        totalIluminacao,
        potenciaTUG,
        potenciaTUE,
        potenciaIluminacao,
        potenciaTotal,
        potenciaDemandada,
        tipoInstalacao
    };
}

function atualizarResultados() {
    const resultados = calcularPotencia();
    const resultadosElement = document.getElementById('resultados');
    
    resultadosElement.innerHTML = `
        <h3>Resumo do Projeto</h3>
        <p><strong>Tipo de Instalação:</strong> ${resultados.tipoInstalacao === "monofasico" ? "Monofásico 220V" : "Trifásico 380V"}</p>
        <p><strong>Total de Cômodos:</strong> ${comodos.length}</p>
        <p><strong>Total de TUG:</strong> ${resultados.totalTUG} (${resultados.potenciaTUG}W)</p>
        <p><strong>Total de TUE:</strong> ${resultados.totalTUE} (${resultados.potenciaTUE}W)</p>
        <p><strong>Total de Pontos de Iluminação:</strong> ${resultados.totalIluminacao} (${resultados.potenciaIluminacao}W)</p>
        <p><strong>Potência Total Instalada:</strong> ${resultados.potenciaTotal}W</p>
        <p><strong>Potência Demandada:</strong> ${resultados.potenciaDemandada.toFixed(2)}W</p>
    `;
}

// Exportação de PDF (client-side com jsPDF)
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const nomeProjeto = document.getElementById('nomeProjeto').value.trim() || "Projeto Elétrico";
    const resultados = calcularPotencia();
    
    // Título
    doc.setFontSize(22);
    doc.text(nomeProjeto, 105, 20, { align: 'center' });
    
    // Informações gerais
    doc.setFontSize(14);
    doc.text("Informações Gerais", 20, 40);
    doc.setFontSize(12);
    doc.text(`Tipo de Instalação: ${resultados.tipoInstalacao === "monofasico" ? "Monofásico 220V" : "Trifásico 380V"}`, 20, 50);
    doc.text(`Total de Cômodos: ${comodos.length}`, 20, 60);
    
    // Resumo de potência
    doc.setFontSize(14);
    doc.text("Resumo de Potência", 20, 80);
    doc.setFontSize(12);
    doc.text(`Total de TUG: ${resultados.totalTUG} (${resultados.potenciaTUG}W)`, 20, 90);
    doc.text(`Total de TUE: ${resultados.totalTUE} (${resultados.potenciaTUE}W)`, 20, 100);
    doc.text(`Total de Pontos de Iluminação: ${resultados.totalIluminacao} (${resultados.potenciaIluminacao}W)`, 20, 110);
    doc.text(`Potência Total Instalada: ${resultados.potenciaTotal}W`, 20, 120);
    doc.text(`Potência Demandada: ${resultados.potenciaDemandada.toFixed(2)}W`, 20, 130);
    
    // Detalhes dos cômodos
    if (comodos.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Detalhes por Cômodo", 20, 20);
        
        let y = 30;
        comodos.forEach(comodo => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.text(`Cômodo: ${comodo.nome}`, 20, y);
            y += 10;
            doc.text(`TUG: ${comodo.tug} | TUE: ${comodo.tue} | Iluminação: ${comodo.iluminacao}`, 30, y);
            y += 20;
        });
    }
    
    // Salvar o PDF
    doc.save(`${nomeProjeto.replace(/\s+/g, '_')}.pdf`);
}
