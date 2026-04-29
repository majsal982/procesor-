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
function dodajWiersz() {
    const tabela = document.querySelector(".tabela-programu tbody");
    const nowy = document.createElement("tr");
    nowy.innerHTML = '<td contenteditable="true"></td>';
    tabela.appendChild(nowy);
}
function usunWiersz() {
    const tabela = document.querySelector(".tabela-programu tbody");
    if (tabela.rows.length > 1) {
        tabela.deleteRow(-1);
    }
}
