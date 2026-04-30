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

let memory = Array.from({length: RAM_SIZE}, () => {
    return Math.random() > 0.5 ? Math.floor(Math.random()*100) : null;
});

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