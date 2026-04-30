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

