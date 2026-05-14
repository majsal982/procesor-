/* IGOR: Global RAM state and runtime metadata */

/** IGOR: Application initialization and editor creation */

/** LILIANA: Renderowanie pamięci RAM */

/** BEATA: Renderowanie taśmy wejściowej */

/** BEATA: Renderowanie taśmy wyjściowej */

// IGOR: Highlight current editor line
// 4. Podświetlenie aktualnej linii

/** MAJA: Animation engine for flying packets */
/** Funkcja animująca "latający kwadrat" */

/** LILIANA: Memory cell lookup for animations */
/** Pobieranie elementu komórki pamięci do animacji */

/** MAJA: Execute one program step and handle instruction flow */
/** Wykonanie kroku z animacjami */
async function executeStep() {
    if (RAM.currentLine >= RAM.program.length) { stop(); return; }
    
    const line = RAM.program[RAM.currentLine];
    const cpuBox = document.querySelector('#processor .proc-inner');
    const editorRow = document.getElementById(`row-${RAM.currentLine}`);

    if(!line.instr) { RAM.currentLine++; renderAll(); return; }


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

/** IGOR: Save current program to a file */

/** IGOR: Load a program file into the editor */
