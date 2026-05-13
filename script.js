const RAM_SIZE = 512;
const VIEW_SIZE = 10;

const RAM = {
  registers: Array(RAM_SIZE).fill(null),
  program: [],
  labelMap: {},
  currentLine: 0,
  isRunning: false,
  interval: null,
  input: [],
  output: [],
  inputHead: 0,
  outputHead: 0,
  memoryViewStart: 0
};

function init() {
  for (let i = 0; i < 10; i++) addRow();
  renderMemory();
  renderTape('input');
  renderTape('output');
  renderProcessor();
  document.getElementById('p-footer').innerText = 'Gotowe.';
}

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

function renderProcessor(instruction = '', argument = '') {
  const instructionField = document.getElementById('instruction');
  const argumentField = document.getElementById('argument');
  if (instructionField) instructionField.value = instruction;
  if (argumentField) argumentField.value = argument;
}

function renderMemory() {
  const tbody = document.querySelector('#ramTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  for (let i = 0; i < VIEW_SIZE; i++) {
    const addr = RAM.memoryViewStart + i;
    if (addr >= RAM_SIZE) break;

    const tr = document.createElement('tr');
    const tdAddr = document.createElement('td');
    const tdVal = document.createElement('td');

    tdAddr.textContent = addr;
    tdAddr.className = 'addrShade';
    if (addr === 0) {
      tdAddr.classList.add('acc');
      tdVal.classList.add('acc');
    }

    const val = RAM.registers[addr];
    if (val === null) {
      tdVal.textContent = '?';
      tdVal.classList.add('unknown');
    } else {
      tdVal.textContent = val;
    }

    tdVal.onclick = () => {
      const newVal = prompt('Nowa wartość:');
      if (newVal === null) return;
      RAM.registers[addr] = newVal === '' ? null : Number(newVal);
      renderMemory();
    };

    tr.appendChild(tdAddr);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  }
}

function scrollUp() {
  if (RAM.memoryViewStart > 0) {
    RAM.memoryViewStart -= 1;
    renderMemory();
  }
}

function scrollDown() {
  if (RAM.memoryViewStart < RAM_SIZE - VIEW_SIZE) {
    RAM.memoryViewStart += 1;
    renderMemory();
  }
}

function openModal() {
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function goToAddress() {
  const val = parseInt(document.getElementById('modalInput').value, 10);
  if (!Number.isNaN(val) && val >= 0 && val < RAM_SIZE) {
    RAM.memoryViewStart = val;
    renderMemory();
    closeModal();
  } else {
    alert('Niepoprawny adres!');
  }
}

function renderTape(type) {
  const strip = document.getElementById(`${type}-strip`);
  if (!strip) return;
  strip.innerHTML = '';
  const values = type === 'input' ? RAM.input : RAM.output;
  const headIndex = type === 'input' ? RAM.inputHead : RAM.outputHead;

  for (let i = 0; i < 10; i++) {
    const value = values[i] ?? '';
    const activeClass = i === headIndex ? ' active-cell' : '';
    strip.innerHTML += `<div class="komorka${activeClass}">${value}</div>`;
  }
  positionHead(type);
}

function positionHead(type) {
  const arrow = document.getElementById(`${type}-head`);
  const strip = document.getElementById(`${type}-strip`);
  if (!arrow || !strip || !strip.children.length) return;
  const headIndex = type === 'input' ? RAM.inputHead : RAM.outputHead;
  const index = Math.min(headIndex, strip.children.length - 1);
  const cell = strip.children[index];
  if (!cell) return;

  const containerRect = arrow.parentElement.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  const arrowWidth = arrow.offsetWidth || 20;
  const x = cellRect.left - containerRect.left + (cellRect.width - arrowWidth) / 2;
  arrow.style.transform = `translateX(${x}px)`;
}

function animateExecution(fromElement, toElement) {
  if (!fromElement || !toElement) return;
  const exec = document.createElement('div');
  exec.className = 'exec-box';
  const fromRect = fromElement.getBoundingClientRect();
  const toRect = toElement.getBoundingClientRect();
  exec.style.left = `${fromRect.left + fromRect.width / 2 - 10}px`;
  exec.style.top = `${fromRect.top + fromRect.height / 2 - 10}px`;
  document.body.appendChild(exec);
  requestAnimationFrame(() => {
    exec.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px)`;
  });
  setTimeout(() => exec.remove(), 500);
}

function addToIn() {
  const inputValue = document.getElementById('val-in').value;
  if (inputValue === '') return;
  RAM.input.push(inputValue);
  document.getElementById('val-in').value = '';
  renderTape('input');
}

function loadProgram() {
  const rows = Array.from(document.querySelectorAll('#editor-body tr'));
  RAM.labelMap = {};
  RAM.program = rows.map((row, index) => {
    const label = row.querySelector('.cell-label').value.trim();
    const instr = row.querySelector('.cell-instr').value.trim().toUpperCase();
    const arg = row.querySelector('.cell-arg').value.trim();
    if (label) RAM.labelMap[label] = index;
    return { instr, arg, row };
  });
}

function resolveJumpTarget(arg) {
  if (!arg) return null;
  if (RAM.labelMap[arg] !== undefined) return RAM.labelMap[arg];
  const direct = parseInt(arg, 10);
  if (!Number.isNaN(direct) && direct >= 1 && direct <= RAM.program.length) {
    return direct - 1;
  }
  return null;
}

function resolveMemoryAddress(arg) {
  if (!arg) return null;
  const addr = parseInt(arg, 10);
  if (!Number.isNaN(addr) && addr >= 0 && addr < RAM_SIZE) return addr;
  return null;
}

function highlightProgramLine(index) {
  const rows = document.querySelectorAll('#editor-body tr');
  rows.forEach((row, rowIndex) => {
    row.style.background = rowIndex === index ? '#ffffcc' : '';
  });
}

function executeStep() {
  if (RAM.currentLine < 0 || RAM.currentLine >= RAM.program.length) {
    stop();
    return;
  }

  const instruction = RAM.program[RAM.currentLine];
  highlightProgramLine(RAM.currentLine);
  renderProcessor(instruction.instr, instruction.arg);

  const instr = instruction.instr;
  const arg = instruction.arg;
  let jumped = false;

  if (!instr) {
    RAM.currentLine += 1;
    return;
  }

  switch (instr) {
    case 'LOAD': {
      const addr = resolveMemoryAddress(arg);
      RAM.registers[0] = addr === null ? null : RAM.registers[addr] ?? 0;
      break;
    }
    case 'STORE': {
      const addr = resolveMemoryAddress(arg);
      if (addr !== null) RAM.registers[addr] = RAM.registers[0];
      break;
    }
    case 'ADD': {
      const addr = resolveMemoryAddress(arg);
      const value = addr === null ? 0 : RAM.registers[addr] ?? 0;
      RAM.registers[0] = (RAM.registers[0] ?? 0) + value;
      break;
    }
    case 'SUB': {
      const addr = resolveMemoryAddress(arg);
      const value = addr === null ? 0 : RAM.registers[addr] ?? 0;
      RAM.registers[0] = (RAM.registers[0] ?? 0) - value;
      break;
    }
    case 'MULT': {
      const addr = resolveMemoryAddress(arg);
      const value = addr === null ? 0 : RAM.registers[addr] ?? 0;
      RAM.registers[0] = (RAM.registers[0] ?? 0) * value;
      break;
    }
    case 'DIV': {
      const addr = resolveMemoryAddress(arg);
      const value = addr === null ? 0 : RAM.registers[addr] ?? 0;
      RAM.registers[0] = value === 0 ? 0 : Math.trunc((RAM.registers[0] ?? 0) / value);
      break;
    }
    case 'READ': {
      const addr = resolveMemoryAddress(arg);
      if (addr !== null) {
        const nextValue = RAM.input[RAM.inputHead] ?? null;
        const inputCell = document.querySelector(`#input-strip .komorka:nth-child(${Math.min(RAM.inputHead + 1, 10)})`);
        animateExecution(instruction.row, inputCell);
        RAM.registers[addr] = Number.isNaN(Number(nextValue)) ? null : Number(nextValue);
        RAM.inputHead = Math.min(RAM.inputHead + 1, 9);
        renderTape('input');
      }
      break;
    }
    case 'WRITE': {
      const addr = resolveMemoryAddress(arg);
      const value = addr === null ? RAM.registers[0] ?? 0 : RAM.registers[addr] ?? 0;
      RAM.output.push(value);
      RAM.outputHead = Math.min(RAM.output.length - 1, 9);
      const outputCell = document.querySelector(`#output-strip .komorka:nth-child(${Math.min(RAM.outputHead + 1, 10)})`);
      animateExecution(instruction.row, outputCell);
      renderTape('output');
      break;
    }
    case 'JUMP': {
      const target = resolveJumpTarget(arg);
      if (target !== null) {
        RAM.currentLine = target;
        jumped = true;
      }
      break;
    }
    case 'JZERO': {
      const target = resolveJumpTarget(arg);
      if ((RAM.registers[0] ?? 0) === 0 && target !== null) {
        RAM.currentLine = target;
        jumped = true;
      }
      break;
    }
    case 'JGTZ': {
      const target = resolveJumpTarget(arg);
      if ((RAM.registers[0] ?? 0) > 0 && target !== null) {
        RAM.currentLine = target;
        jumped = true;
      }
      break;
    }
    case 'HALT': {
      stop();
      return;
    }
    default: {
      break;
    }
  }

  renderMemory();
  if (!jumped) RAM.currentLine += 1;
}

function step() {
  loadProgram();
  executeStep();
}

function runAuto() {
  if (RAM.isRunning) return;

  loadProgram();
  RAM.isRunning = true;
  RAM.interval = setInterval(() => {
    if (RAM.currentLine >= RAM.program.length) {
      stop();
      return;
    }
    executeStep();
  }, 400);
  document.getElementById('p-footer').innerText = 'Uruchomiono automatycznie...';
}

function stop() {
  clearInterval(RAM.interval);
  RAM.isRunning = false;
  RAM.interval = null;
  RAM.currentLine = 0;
  highlightProgramLine(-1);
  renderProcessor();
  document.getElementById('p-footer').innerText = 'Zatrzymano.';
}

window.onclick = function (e) {
  const modal = document.getElementById('modal');
  if (e.target === modal) {
    closeModal();
  }
};

window.onload = init;

<<<<<<< HEAD
