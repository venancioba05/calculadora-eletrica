let contadorComodo = 0;
let textoRelatorioWhatsApp = "";

window.onload = function() {
    adicionarComodoComDados("Sala de Estar", 200, 1500, 15, "Ar Condicionado", 1400, 12);
    adicionarComodoComDados("Cozinha", 160, 2500, 12, "Forno / Geladeira", 2500, 10);
    adicionarComodoComDados("Suíte", 150, 1000, 14, "Chuveiro Elétrico", 5500, 10);
};

function adicionarComodo(nome = "", ilumW = "", tugW = "", distGeral = "10") {
    contadorComodo++;
    const container = document.getElementById('listaComodos');
    
    const div = document.createElement('div');
    div.className = 'item-comodo';
    div.id = `comodo-${contadorComodo}`;

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <input type="text" placeholder="Nome do Cômodo (ex: Quarto 1)" value="${nome}" id="nome-comodo-${contadorComodo}" style="font-weight: bold; width: 72%;">
            <button onclick="removerComodo(${contadorComodo})" style="background: #dc3545; width: auto; padding: 8px 12px; font-size: 13px; margin: 0;">Remover</button>
        </div>
        
        <div style="display: flex; gap: 6px; margin-bottom: 6px;">
            <div style="flex: 1;">
                <label>Iluminação (W):</label>
                <input type="number" placeholder="Ex: 100" value="${ilumW}" id="ilum-${contadorComodo}">
            </div>
            <div style="flex: 1;">
                <label>Tomadas TUG (W):</label>
                <input type="number" placeholder="Ex: 600" value="${tugW}" id="tug-${contadorComodo}">
            </div>
            <div style="flex: 0.8;">
                <label>Dist. (m):</label>
                <input type="number" placeholder="m" value="${distGeral}" id="dist-${contadorComodo}">
            </div>
        </div>

        <div style="margin-top: 10px;">
            <label style="color: #004080; font-weight: bold; margin-bottom: 6px;">Tomadas de Uso Específico (TUE):</label>
            <div id="lista-tues-${contadorComodo}">
                <!-- TUEs inseridas aqui -->
            </div>
            <button onclick="adicionarTUE(${contadorComodo})" style="background: #495057; padding: 8px; font-size: 13px; margin-top: 6px;">+ Adicionar TUE (Ar, Chuveiro, etc.)</button>
        </div>
    `;
    
    container.appendChild(div);
}

function adicionarComodoComDados(nome, ilumW, tugW, distGeral, nomeTue, potTue, distTue) {
    adicionarComodo(nome, ilumW, tugW, distGeral);
    if (nomeTue && potTue) {
        adicionarTUE(contadorComodo, nomeTue, potTue, distTue);
    }
}

function adicionarTUE(idComodo, nomeTue = "", potTue = "", distTue = "10") {
    const container = document.getElementById(`lista-tues-${idComodo}`);
    const idTue = Date.now() + Math.floor(Math.random() * 1000);

    const div = document.createElement('div');
    div.className = 'item-tue';
    div.id = `tue-${idTue}`;

    div.innerHTML = `
        <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" placeholder="Equip. (ex: Ar Split)" value="${nomeTue}" id="tue-nome-${idTue}" style="flex: 2;">
            <input type="number" placeholder="Watts" value="${potTue}" id="tue-pot-${idTue}" style="flex: 1;">
            <input type="number" placeholder="m" value="${distTue}" id="tue-dist-${idTue}" style="flex: 0.7;">
            <button onclick="document.getElementById('tue-${idTue}').remove()" style="background: #dc3545; width: auto; padding: 8px 10px; font-size: 12px; margin: 0;">X</button>
        </div>
    `;
    container.appendChild(div);
}

function removerComodo(id) {
    const item = document.getElementById(`comodo-${id}`);
    if (item) item.remove();
}

function dimensionarCircuito(corrente, tipoCircuito, distancia, tensao) {
    const tabelaCapacidade = [
        { bitola: 1.5, iMax: 17.5, r: 12.1 },
        { bitola: 2.5, iMax: 24.0, r: 7.41 },
        { bitola: 4.0, iMax: 32.0, r: 4.61 },
        { bitola: 6.0, iMax: 41.0, r: 3.08 },
        { bitola: 10.0, iMax: 57.0, r: 1.83 },
        { bitola: 16.0, iMax: 76.0, r: 1.15 },
        { bitola: 25.0, iMax: 101.0, r: 0.727 }
    ];
    const disjuntoresComerciais = [6, 10, 16, 20, 25, 32, 40, 50, 63, 70, 80];

    let bitolaMinimaNorma = (tipoCircuito === 'iluminacao') ? 1.5 : 2.5;

    let idxCabo = tabelaCapacidade.findIndex(item => item.iMax >= corrente && item.bitola >= bitolaMinimaNorma);
    if (idxCabo === -1) idxCabo = tabelaCapacidade.length - 1;

    let itemCabo = tabelaCapacidade[idxCabo];
    let reajustadoPorQueda = false;

    let quedaPct = (2 * distancia * corrente * itemCabo.r) / (tensao * 1000) * 100;

    while (quedaPct > 4.0 && idxCabo < tabelaCapacidade.length - 1) {
        idxCabo++;
        itemCabo = tabelaCapacidade[idxCabo];
        quedaPct = (2 * distancia * corrente * itemCabo.r) / (tensao * 1000) * 100;
        reajustadoPorQueda = true;
    }

    let disjuntor = disjuntoresComerciais.find(d => d >= corrente && d <= itemCabo.iMax);
    if (!disjuntor) disjuntor = disjuntoresComerciais.find(d => d >= corrente) || 63;

    return { 
        bitola: itemCabo.bitola, 
        iMax: itemCabo.iMax, 
        disjuntor: disjuntor, 
        queda: quedaPct, 
        reajustado: reajustadoPorQueda 
    };
}

function calcularQuadroCompleto() {
    const tipoRedeGeral = document.getElementById('tipoRede').value;
    const fd = parseFloat(document.getElementById('fatorDemanda').value) || 0.70;

    let potenciaTotalGeral = 0;
    let resultadosRelatorio = [];
    let textoWhatsAppComodos = [];

    for (let i = 1; i <= contadorComodo; i++) {
        const comodoDiv = document.getElementById(`comodo-${i}`);
        if (!comodoDiv) continue;

        const nomeComodo = document.getElementById(`nome-comodo-${i}`).value || `Cômodo ${i}`;
        const ilumW = parseFloat(document.getElementById(`ilum-${i}`).value) || 0;
        const tugW = parseFloat(document.getElementById(`tug-${i}`).value) || 0;
        const distComodo = parseFloat(document.getElementById(`dist-${i}`).value) || 10;
        const tensaoPadrao = 220;

        let resumoComodoHtml = `<strong>🏠 ${nomeComodo}</strong><br>`;
        let textoWpComodo = `🏠 *${nomeComodo}*`;

        if (ilumW > 0) {
            potenciaTotalGeral += ilumW;
            const correnteIlum = ilumW / (tensaoPadrao * 1.0);
            const dimIlum = dimensionarCircuito(correnteIlum, 'iluminacao', distComodo, tensaoPadrao);
            resumoComodoHtml += `&nbsp;&nbsp;• Iluminação (${ilumW}W): Cabo ${dimIlum.bitola}mm² | Disj: ${dimIlum.disjuntor}A<br>`;
            textoWpComodo += `\n   - Iluminação (${ilumW}W): ${dimIlum.bitola}mm² | ${dimIlum.disjuntor}A`;
        }

        if (tugW > 0) {
            potenciaTotalGeral += tugW;
            const correnteTug = tugW / (tensaoPadrao * 0.95);
            const dimTug = dimensionarCircuito(correnteTug, 'tug', distComodo, tensaoPadrao);
            resumoComodoHtml += `&nbsp;&nbsp;• TUGs (${tugW}W): Cabo ${dimTug.bitola}mm² | Disj: ${dimTug.disjuntor}A<br>`;
            textoWpComodo += `\n   - TUGs (${tugW}W): ${dimTug.bitola}mm² | ${dimTug.disjuntor}A`;
        }

        const containerTUEs = document.getElementById(`lista-tues-${i}`);
        const tuesNodes = containerTUEs.querySelectorAll('.item-tue');

        tuesNodes.forEach(tueNode => {
            const tueId = tueNode.id.replace('tue-', '');
            const nomeTue = document.getElementById(`tue-nome-${tueId}`).value || 'TUE';
            const potTue = parseFloat(document.getElementById(`tue-pot-${tueId}`).value) || 0;
            const distTue = parseFloat(document.getElementById(`tue-dist-${tueId}`).value) || distComodo;

            if (potTue > 0) {
                potenciaTotalGeral += potTue;
                const correnteTue = potTue / (tensaoPadrao * 0.95);
                const dimTue = dimensionarCircuito(correnteTue, 'tue', distTue, tensaoPadrao);
                resumoComodoHtml += `&nbsp;&nbsp;• TUE [${nomeTue}] (${potTue}W, ${distTue}m): Cabo <strong>${dimTue.bitola}mm²</strong> | Disj: <strong>${dimTue.disjuntor}A</strong><br>`;
                textoWpComodo += `\n   - TUE [${nomeTue}] (${potTue}W): ${dimTue.bitola}mm² | ${dimTue.disjuntor}A`;
            }
        });

        resultadosRelatorio.push(`<div class="comodo-card">${resumoComodoHtml}</div>`);
        textoWhatsAppComodos.push(textoWpComodo);
    }

    if (potenciaTotalGeral <= 0) {
        alert('Por favor, preencha as cargas de pelo menos um cômodo.');
        return;
    }

    const potDemandada = potenciaTotalGeral * fd;
    const fpGeral = 0.92;
    let correnteGeral = 0;
    let descRede = "";

    if (tipoRedeGeral === "mono220" || tipoRedeGeral === "bi220") {
        correnteGeral = potDemandada / (220 * fpGeral);
        descRede = "220V";
    } else if (tipoRedeGeral === "bi380") {
        correnteGeral = potDemandada / (380 * fpGeral);
        descRede = "Bifásico 380V";
    } else if (tipoRedeGeral === "tri380") {
        correnteGeral = potDemandada / (Math.sqrt(3) * 380 * fpGeral);
        descRede = "Trifásico 380/220V";
    } else if (tipoRedeGeral === "mono127") {
        correnteGeral = potDemandada / (127 * fpGeral);
        descRede = "Monofásico 127V";
    }

    const dimGeral = dimensionarCircuito(correnteGeral, 'geral', 5, 220);

    const box = document.getElementById('resultadoBox');
    const texto = document.getElementById('textoResultado');

    texto.innerHTML = `
        <h4 style="margin-top:0; color:#004080;">Circuitos por Cômodo:</h4>
        ${resultadosRelatorio.join('')}
        
        <h4 style="color:#004080; margin-top:15px;">Alimentador Geral do QDF (${descRede}):</h4>
        • Potência Total Instalada: <strong>${(potenciaTotalGeral/1000).toFixed(2)} kW</strong><br>
        • Potência Demandada (FD ${(fd*100).toFixed(0)}%): <strong>${(potDemandada/1000).toFixed(2)} kW</strong><br>
        • Corrente Geral (Ib): <strong>${correnteGeral.toFixed(2)} A</strong><br>
        • <strong>Cabo Alimentador Geral: ${dimGeral.bitola} mm²</strong><br>
        • <strong>Disjuntor Geral: ${dimGeral.disjuntor} A (DIN)</strong>
    `;

    textoRelatorioWhatsApp = `⚡ *PROJETO ELÉTRICO - DIVISÃO POR CÔMODOS (NBR 5410)* ⚡\n\n` +
        `📋 *AMBIENTES E CARGAS:*\n` +
        `${textoWhatsAppComodos.join('\n\n')}\n\n` +
        `📊 *ALIMENTADOR GERAL DO QUADRO (${descRede}):*\n` +
        `• Carga Instalada: ${(potenciaTotalGeral/1000).toFixed(2)} kW\n` +
        `• Fator de Demanda: ${(fd*100).toFixed(0)}%\n` +
        `• Carga Demandada: ${(potenciaDemandada/1000).toFixed(2)} kW\n` +
        `• Corrente Geral: ${correnteGeral.toFixed(2)} A\n` +
        `• *Cabo Alimentador Geral:* ${dimGeral.bitola} mm²\n` +
        `• *Disjuntor Geral QDF:* ${dimGeral.disjuntor} A (DIN)\n\n` +
        `_Calculado via App de Dimensionamento Elétrico_`;

    box.style.display = 'block';
}

function copiarRelatorio() {
    if (!textoRelatorioWhatsApp) return;

    navigator.clipboard.writeText(textoRelatorioWhatsApp).then(() => {
        alert('Relatório por cômodos copiado para o WhatsApp!');
    }).catch(() => {
        alert('Erro ao copiar.');
    });
}
