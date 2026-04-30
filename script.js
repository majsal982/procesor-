
// LOGIKA PROCESORA

const processor = {
  instruction: '',
  argument: '',

  set(instruction, argument) {
    this.instruction = instruction;
    this.argument = argument;
    this.render();
  },

  clear() {
    this.instruction = '';
    this.argument = '';
    this.render();
  },

  render() {
    document.getElementById('instruction').value = this.instruction;
    document.getElementById('argument').value = this.argument;
  }
}

// KONIEC
// tsama po
let data = { input: [], output: [] };
let head = { input: 0, output: 0 };
let view = { input: 0, output: 0 };
function addToIn() {
    let v = document.getElementById('val-in').value;
    if(v!=="") { data.input.push(v); render('input'); }
}
function render(type) {
    const strip = document.getElementById(`${type}-strip`);
    const nums = document.getElementById(`${type}-numbers`);
    const arrow = document.getElementById(`${type}-head`);
    strip.innerHTML = '';
    nums.innerHTML = '';
    for(let i=0; i<100; i++) {
        strip.innerHTML += `<div class="komorka ${i===head[type]?'active':''}">${data[type][i]||''}</div>`;
        nums.innerHTML += `<div class="num-box">${i+1}</div>`;
    }
    const unit = 60; 
    const shift = -view[type] * unit;
    strip.style.transform = `translateX(${shift}px)`;
    nums.style.transform = `translateX(${shift}px)`;
    const arrowShift = (head[type] - view[type]) * unit;
    arrow.style.transform = `translateX(${arrowShift}px)`;
    arrow.style.visibility = (head[type] < view[type] || head[type] >= view[type]+5) ? 'hidden' : 'visible';
}
function scrollT(type, act) {
    if(act==='start') view[type]=0;
    else view[type] = Math.max(0, view[type]+act);
    render(type);
}
render('input');
render('output');
//tasma kon


// pamiec po

const RAM_SIZE = 512;
const VIEW_SIZE = 10;

let start = 0;

let memory = Array.from({length: RAM_SIZE}, () => null);

function render() {
    const tbody = document.querySelector("#ramTable tbody");
    tbody.innerHTML = "";

    for (let i = 0; i < VIEW_SIZE; i++) {
        let addr = start + i;
        if (addr >= RAM_SIZE) break;

        let tr = document.createElement("tr");
        let tdAddr = document.createElement("td");
        let tdVal = document.createElement("td");

        tdAddr.textContent = addr;
        tdAddr.classList.add("addrShade");

        if (addr === 0) {
            tdAddr.classList.add("acc");
            tdVal.classList.add("acc");
        }

        let val = memory[addr];

        if (val === null) {
            tdVal.textContent = "?";
            tdVal.classList.add("unknown");
        } else {
            tdVal.textContent = val;
        }

        tdVal.onclick = () => {
            let newVal = prompt("Nowa wartość:");
            if (newVal === null) return;

            memory[addr] = newVal === "" ? null : parseInt(newVal);
            render();
        };

        tr.appendChild(tdAddr);
        tr.appendChild(tdVal);
        tbody.appendChild(tr);
    }
}

function scrollUp() {
    if (start > 0) {
        start--;
        render();
    }
}

function scrollDown() {
    if (start < RAM_SIZE - VIEW_SIZE) {
        start++;
        render();
    }
}


function openModal() {
    document.getElementById("modal").style.display = "block";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function goToAddress() {
    let val = parseInt(document.getElementById("modalInput").value);

    if (!isNaN(val) && val >= 0 && val < RAM_SIZE) {
        start = val;
        render();
        closeModal();
    } else {
        alert("Niepoprawny adres!");
    }
}

window.onclick = function(e) {
    let modal = document.getElementById("modal");
    if (e.target === modal) {
        closeModal();
    }
};

render();

//pamiec kon

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
