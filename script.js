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

<<<<<<< HEAD
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
=======

////js linijek Mai//
// --- GLOBALNY STAN MASZYNY ---
const RAM = {
    registers: Array(512).fill(null), // null oznacza "?" w pamięci
    program: [],         // Tu przechowujemy instrukcje
    currentLine: 0,      // Wskaźnik instrukcji (IP)
    isRunning: false,
    interval: null
};

// --- LOGIKA EDYTORA (Twoja część) ---
function addRow() {
    const tbody = document.getElementById('editor-body');
    if (!tbody) return;
    const ln = tbody.children.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="col-ln">${ln}</td>
        <td><input type="text" class="cell-label"></td>
        <td>
            <select class="cell-instr">
                <option value=""></option>
                <option value="READ">READ</option>
                <option value="WRITE">WRITE</option>
                <option value="LOAD">LOAD</option>
                <option value="STORE">STORE</option>
                <option value="ADD">ADD</option>
                <option value="SUB">SUB</option>
                <option value="MULT">MULT</option>
                <option value="DIV">DIV</option>
                <option value="JUMP">JUMP</option>
                <option value="JZERO">JZERO</option>
                <option value="JGTZ">JGTZ</option>
                <option value="HALT">HALT</option>
            </select>
        </td>
        <td><input type="text" class="cell-arg"></td>
        <td><input type="text"></td>
        <td class="col-stats stats-col hidden">0</td>
        <td class="col-stats stats-col hidden">0%</td>
    `;
    tbody.appendChild(tr);
}

// Pobieranie programu z tabeli do tablicy RAM.program
function syncProgram() {
    const rows = document.querySelectorAll('#editor-body tr');
    RAM.program = Array.from(rows).map(row => ({
        label: row.querySelector('.cell-label').value.trim(),
        instr: row.querySelector('.cell-instr').value,
        arg: row.querySelector('.cell-arg').value.trim()
    }));
}

// Wykonanie jednego kroku (Step)
function step() {
    syncProgram();
    const rows = document.querySelectorAll('#editor-body tr');
    
    if (RAM.currentLine >= RAM.program.length) {
        stop();
        return;
    }

    // Podświetlenie linii
    rows.forEach(r => r.style.background = "");
    rows[RAM.currentLine].style.background = "#ffffcc";

    const currentOp = RAM.program[RAM.currentLine];
    console.log("Procesor wykonuje:", currentOp.instr, currentOp.arg);

    // --- MIEJSCE NA LOGIKĘ KOLEGÓW (Procesor) ---
    // Przykład prostej inkrementacji (jeśli nie ma skoku):
    if (currentOp.instr === "HALT") {
        stop();
    } else {
        RAM.currentLine++;
    }
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
    alert("Program zakończony");
}

// --- LOGIKA PAMIĘCI (Twoja druga część) ---
function renderMemory() {
    const tbody = document.querySelector("#ramTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    for (let i = 0; i < 10; i++) { // pokazujemy 10 pierwszych komórek
        const val = RAM.registers[i];
        tbody.innerHTML += `<tr><td class="addrShade">${i}</td><td>${val === null ? '?' : val}</td></tr>`;
    }
}

// Inicjalizacja po załadowaniu wszystkiego
window.onload = () => {
    for(let i=0; i<8; i++) addRow();
    renderMemory();
};

>>>>>>> 22c5ecf4da213e5adb6af9eace386eda0c9a4872
