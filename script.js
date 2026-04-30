// --- STAN GLOBALNY ---
const RAM = {
    registers: Array(512).fill(null),
    program: [],
    currentLine: 0,
    isRunning: false,
    interval: null,
    input: [],
    output: [],
    headIn: 0,
    headOut: 0
};

// --- LOGIKA EDYTORA & PAMIĘCI ---
function addRow() {
    const tbody = document.getElementById('editor-body');
    const ln = tbody.children.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="background:#e0e0e0; text-align:center;">${ln}</td>
        <td><input type="text" class="cell-label" style="width:95%"></td>
        <td><select class="cell-instr" style="width:100%">
            <option value=""></option>
            <option value="LOAD">LOAD</option><option value="STORE">STORE</option>
            <option value="ADD">ADD</option><option value="SUB">SUB</option>
            <option value="MULT">MULT</option><option value="DIV">DIV</option>
            <option value="READ">READ</option><option value="WRITE">WRITE</option>
            <option value="JUMP">JUMP</option><option value="JZERO">JZERO</option>
            <option value="JGTZ">JGTZ</option><option value="HALT">HALT</option>
        </select></td>
        <td><input type="text" class="cell-arg" style="width:95%"></td>
        <td><input type="text" style="width:95%"></td>
    `;
    tbody.appendChild(tr);
}

function renderMemory() {
    const tbody = document.querySelector("#ramTable tbody");
    tbody.innerHTML = "";
    for (let i = 0; i < 15; i++) {
        tbody.innerHTML += `<tr><td style="background:#e3f2fd">${i}</td><td>${RAM.registers[i] ?? '?'}</td></tr>`;
    }
}

// --- LOGIKA TAŚM ---
function addToIn() {
    let v = document.getElementById('val-in').value;
    if(v!=="") { RAM.input.push(v); renderTape('input'); }
}

function renderTape(type) {
    const strip = document.getElementById(`${type}-strip`);
    if (!strip) return;
    strip.innerHTML = '';
    for(let i=0; i<10; i++) {
        strip.innerHTML += `<div class="komorka" style="border:1px solid gray; min-width:30px; text-align:center; background:white;">${RAM.input[i]||''}</div>`;
    }
}

// --- STEROWANIE ---
function step() {
    const rows = document.querySelectorAll('#editor-body tr');
    if (RAM.currentLine >= rows.length) return stop();

    rows.forEach(r => r.style.background = "");
    const currentRow = rows[RAM.currentLine];
    currentRow.style.background = "#ffffcc";

    const instr = currentRow.querySelector('.cell-instr').value;
    const arg = currentRow.querySelector('.cell-arg').value;

    // Aktualizacja wizualna procesora
    document.getElementById('instruction').value = instr;
    document.getElementById('argument').value = arg;

    if (instr === "HALT") stop();
    else RAM.currentLine++;
}

function runAuto() {
    if (RAM.isRunning) return;
    RAM.isRunning = true;
    RAM.interval = setInterval(step, 500);
}

function stop() {
    clearInterval(RAM.interval);
    RAM.isRunning = false;
    RAM.currentLine = 0;
    document.getElementById('p-footer').innerText = "Zatrzymano.";
}

// Start
window.onload = () => {
    for(let i=0; i<10; i++) addRow();
    renderMemory();
    renderTape('input');
};
