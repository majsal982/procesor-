/* IGOR: Global RAM state and runtime metadata */

/** Maja: Application initialization and editor creation */
function init() {
    const tbody = document.getElementById('editor-body');
    tbody.innerHTML = '';
    for (let i = 0; i < 20; i++) addRow();
    renderAll();
}

/** Dodawanie nowego wiersza do edytora kodu */
function addRow() {
    const tbody = document.getElementById('editor-body');
    const tr = document.createElement('tr');
    // Dodajemy ID do wiersza, aby animacja wiedziała skąd startować
    tr.id = `row-${tbody.children.length}`; 
    tr.innerHTML = `
        <td style="background:#e0e0e0; font-weight:bold;">${tbody.children.length}</td>
        <td><input type="text" class="cell-label"></td>
        <td><select class="cell-instr">
            <option value=""></option>
            <option value="READ">READ</option><option value="WRITE">WRITE</option>
            <option value="LOAD">LOAD</option><option value="STORE">STORE</option>
            <option value="ADD">ADD</option><option value="SUB">SUB</option>
            <option value="MULT">MULT</option><option value="DIV">DIV</option>
            <option value="JUMP">JUMP</option><option value="JZERO">JZERO</option>
            <option value="HALT">HALT</option>
        </select></td>
        <td><input type="text" class="cell-arg"></td>
        <td><input type="text"></td>`;
    tbody.appendChild(tr);
}

/** Renderowanie całego interfejsu */
/** LILIANA: Renderowanie pamięci RAM */

function renderAll(){
    const mBody = document.getElementById('memory-body');
    if (mBody) {
        mBody.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            let addr = RAM.memoryOffset + i;
            if(addr >= 100) break;
            let val = RAM.registers[addr];
            mBody.innerHTML += `<tr id="mem-row-${addr}"><td class="addr-cell">${addr}</td><td class="${val===null?'val-null':'val-active'}">${val===null?'?':val}</td></tr>`;
        }
    }

}
/** BEATA: Renderowanie taśmy wejściowej */

/** BEATA: Renderowanie taśmy wyjściowej */

// IGOR: Highlight current editor line
// 4. Podświetlenie aktualnej linii

/** MAJA: Animation engine for flying packets */
/** Funkcja animująca "latający kwadrat" */
function animatePacket(fromElem, toElem, text, type = 'instr') {
    if (!fromElem || !toElem) return Promise.resolve();

    const start = fromElem.getBoundingClientRect();
    const end = toElem.getBoundingClientRect();

    const packet = document.createElement('div');
    packet.className = `data-packet ${type === 'data' ? 'packet-data' : 'packet-instr'}`;
    packet.innerText = String(text);
    packet.style.left = start.left + "px";
    packet.style.top = start.top + "px";
    document.body.appendChild(packet);

    const animation = packet.animate([
        { left: start.left + "px", top: start.top + "px", opacity: 1, transform: 'scale(1)' },
        { left: (end.left + end.width / 4) + "px", top: (end.top + end.height / 4) + "px", opacity: 0.5, transform: 'scale(0.8)' }
    ], {
        duration: 600,
        easing: 'ease-in-out'
    });

    return new Promise(resolve => {
        animation.onfinish = () => {
            packet.remove();
            if (toElem.closest && toElem.closest('#processor')) {
                toElem.classList.add('cpu-active');
                setTimeout(() => toElem.classList.remove('cpu-active'), 400);
            }
            resolve();
        };
    });
}
/** LILIANA: Memory cell lookup for animations */
/** Pobieranie elementu komórki pamięci do animacji */

function getMemCellElement(addr) {
    if (addr >= RAM.memoryOffset && addr < RAM.memoryOffset + 12) {
        const row = document.getElementById(`mem-row-${addr}`);
        return row ? row.cells[1] : null;
    }
    return null;
}

/** MAJA: Execute one program step and handle instruction flow */
/** Wykonanie kroku z animacjami */
async function executeStep() {
    if (RAM.currentLine >= RAM.program.length) { stop(); return; }
    
    const line = RAM.program[RAM.currentLine];
    const cpuBox = document.querySelector('#processor .proc-inner');
    const editorRow = document.getElementById(`row-${RAM.currentLine}`);

    if(!line.instr) { RAM.currentLine++; renderAll(); return; }
    
    
    const instrSource = editorRow ? editorRow.querySelector('.cell-instr') : null;
    await animatePacket(instrSource || editorRow, cpuBox, line.instr, 'instr');

    document.getElementById('instruction').value = line.instr;
    document.getElementById('argument').value = line.arg;
    
    let addr = parseInt(line.arg);
    let isLiteral = line.arg.startsWith('=');
    let val = isLiteral ? parseInt(line.arg.slice(1)) : (RAM.registers[addr] || 0);

    switch(line.instr) {
        case 'LOAD':
            if (!isLiteral) {
                const memCell = getMemCellElement(addr) || document.getElementById('memory-body');
                await animatePacket(memCell, cpuBox, val, 'data');
            }
            RAM.registers[0] = val;
            break;

    case 'STORE':
            const targetCell = getMemCellElement(addr) || document.getElementById('memory-body');
            await animatePacket(cpuBox, targetCell, RAM.registers[0], 'data');
            RAM.registers[addr] = RAM.registers[0];
            break;

    case 'READ':
            const inCells = document.querySelectorAll('#input-strip .komorka');
            const inSource = inCells[RAM.inputHead] || document.getElementById('input-strip');
            const memTarget = getMemCellElement(addr) || document.getElementById('memory-body');
            await animatePacket(inSource, memTarget, RAM.input[RAM.inputHead] || 0, 'data');
            RAM.registers[addr] = parseInt(RAM.input[RAM.inputHead++] || 0);
            break;

     case 'WRITE':
            const writeVal = line.arg === "" ? RAM.registers[0] : val;
            RAM.output.push(writeVal);
            renderAll();
            const outCell = document.getElementById('output-strip').lastElementChild || document.getElementById('output-strip');
            await animatePacket(cpuBox, outCell, writeVal, 'data');
            break;   

    case 'ADD': RAM.registers[0] = (RAM.registers[0]||0) + val; break;
        case 'SUB': RAM.registers[0] = (RAM.registers[0]||0) - val; break;
        case 'MULT': RAM.registers[0] = (RAM.registers[0]||0) * val; break;
        case 'DIV': RAM.registers[0] = val !== 0 ? Math.floor((RAM.registers[0]||0) / val) : 0; break;
        
    case 'JUMP': 
            if(RAM.labelMap[line.arg] !== undefined) { 
                RAM.currentLine = RAM.labelMap[line.arg]; 
                renderAll(); return; 
            }
            break;
            
        case 'JZERO':
            if((RAM.registers[0]||0) === 0 && RAM.labelMap[line.arg] !== undefined) { 
                RAM.currentLine = RAM.labelMap[line.arg]; 
                renderAll(); return; 
            }
            break;

        case 'HALT': 
            pause(); 
            document.getElementById('p-footer').innerText = "Status: HALT - Zakończono."; 
            renderAll(); return;
    }

    
    RAM.currentLine++;
    renderAll();
}

/** MAJA: Parse editor rows into program instructions and labels */
function loadProgram() {
    RAM.program = []; 
    RAM.labelMap = {};
    document.querySelectorAll('#editor-body tr').forEach((row, i) => {
        const label = row.querySelector('.cell-label').value.trim();
        const instr = row.querySelector('.cell-instr').value;
        const arg = row.querySelector('.cell-arg').value.trim();
        RAM.program.push({ instr, arg });
        if(label) RAM.labelMap[label] = i;
    });
}
/** IGOR: Runtime control functions */

/** BEATA: Add a value to the input tape */

/** LILIANA: Scroll the memory window and navigate addresses */
function scrollMemory(d) {
    RAM.memoryOffset = Math.max(0, Math.min(88, RAM.memoryOffset + d));
    renderAll();
}

function showAddressPrompt() {
    let a = prompt("Podaj adres (0-99):");
    if(a !== null) {
        RAM.memoryOffset = Math.max(0, Math.min(88, parseInt(a) || 0));
        renderAll();
    }
}


/** LILIANA: Save current program to a file */


function saveToFile() {
    let out = "";
    document.querySelectorAll('#editor-body tr').forEach(r => {
        const label = r.querySelector('.cell-label').value;
        const instr = r.querySelector('.cell-instr').value;
        const arg = r.querySelector('.cell-arg').value;
        const comment = r.querySelectorAll('input')[2].value;
        if(instr) out += `${label};${instr};${arg};${comment}\n`;
    });
    
}

/** IGOR: Load a program file into the editor */
