const fs = require('fs');
const path = require('path');

function normalizeWord(word) {
  return word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ç/g, 'C')
    .trim();
}

const lexicoPath = path.join(__dirname, '..', 'temp-lexico', 'lexico');
const conjPath = path.join(__dirname, '..', 'temp-lexico', 'conjugações');
const icfPath = path.join(__dirname, '..', 'temp-lexico', 'icf');
const negPath = path.join(__dirname, '..', 'temp-lexico', 'listas', 'negativas');

const lexicoLines = fs.readFileSync(lexicoPath, 'utf-8').split('\n');
const conjLines = fs.readFileSync(conjPath, 'utf-8').split('\n');
const icfLines = fs.readFileSync(icfPath, 'utf-8').split('\n');
const negLines = fs.readFileSync(negPath, 'utf-8').split('\n');

const negativeSet = new Set();
for (const line of negLines) {
  const norm = normalizeWord(line);
  if (norm.length === 5) {
    negativeSet.add(norm);
  }
}

// Conjunto de todos os palpites válidos
const validGuessesSet = new Set();

// Adiciona palavras do léxico
const lexico5 = new Set();
for (const line of lexicoLines) {
  const norm = normalizeWord(line);
  if (norm.length === 5 && /^[A-Z]{5}$/.test(norm)) {
    validGuessesSet.add(norm);
    lexico5.add(norm);
  }
}

// Adiciona conjugações
for (const line of conjLines) {
  const norm = normalizeWord(line);
  if (norm.length === 5 && /^[A-Z]{5}$/.test(norm)) {
    validGuessesSet.add(norm);
  }
}

// Palavras-alvo (mais comuns baseadas no ICF score do léxico)
const targetCandidateScores = new Map();

for (const line of icfLines) {
  const parts = line.split(',');
  if (parts.length >= 2) {
    const raw = parts[0].trim();
    const score = parseFloat(parts[1]);
    const norm = normalizeWord(raw);

    if (norm.length === 5 && /^[A-Z]{5}$/.test(norm) && !isNaN(score)) {
      validGuessesSet.add(norm);
      if (!targetCandidateScores.has(norm) || score < targetCandidateScores.get(norm)) {
        targetCandidateScores.set(norm, score);
      }
    }
  }
}

// Filtra alvos: palavras que têm frequência razoável (ICF <= 13.5) e não são ofensivas
const targetWords = [];
for (const [word, score] of targetCandidateScores.entries()) {
  if (score <= 13.5 && !negativeSet.has(word) && lexico5.has(word)) {
    targetWords.push(word);
  }
}

// Ordena alfabeticamente
targetWords.sort();
const validGuesses = Array.from(validGuessesSet).sort();

console.log(`Palavras-alvo (Secretas comuns): ${targetWords.length}`);
console.log(`Total de palpites válidos aceitos: ${validGuesses.length}`);
console.log(`Verificação 'FIRMA' em válidos: ${validGuessesSet.has('FIRMA')}`);
console.log(`Verificação 'FIRMA' em alvos: ${targetWords.includes('FIRMA')}`);
console.log(`Verificação 'TERMO' em válidos: ${validGuessesSet.has('TERMO')}`);
console.log(`Verificação 'TERMO' em alvos: ${targetWords.includes('TERMO')}`);

const outDir = path.join(__dirname, '..', 'src', 'data');
const outData = {
  version: 'fserb-pt-br-v1',
  license: 'MIT (c) Fernando Serboncini',
  targetWords,
  validGuesses
};

fs.writeFileSync(path.join(outDir, 'lexicon.json'), JSON.stringify(outData));
console.log(`Arquivo salvo com sucesso em: ${path.join(outDir, 'lexicon.json')}`);
