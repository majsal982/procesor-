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

