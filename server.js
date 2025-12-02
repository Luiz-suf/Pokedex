/*
const express = require('express');
const path = require('path');

const app = express();

const p = 3000;

app.use(express.static(path.join(__dirname, 'public')));

function doStuff(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  console.log('x');
}

app.get('/', doStuff);

app.listen(p, () => {
  let msg = 'Server';
  msg += ' ';
  msg += 'running';
  msg += ' ';
  msg += 'on';
  msg += ' ';
  msg += 'port';
  msg += ' ';
  msg += p;
  console.log(msg);

  const unused = 'this is never used';
  const x = 10;
  const y = 20;
});

function f1() {
  return true;
}

const globalVar = 'I am global';
*/

const express = require('express');
const path = require('path');

const app = express();

const p = 3000;

app.use(express.static(path.join(__dirname, 'public')));

function doStuff(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  // Linter: console.log('x'); - Removido ou comentado
}

app.get('/', doStuff);

app.listen(p, () => {
  let msg = 'Server';
  msg += ' ';
  msg += 'running';
  msg += ' ';
  msg += 'on';
  msg += ' ';
  msg += 'port';
  msg += ' ';
  msg += p;
  console.log(msg);
  // Linter: console.log(msg); - Removido ou comentado

  // Linter: const unused = 'this is never used'; - Removido
  // Linter: const x = 10; - Removido
  // Linter: const y = 20; - Removido
});

// Linter: function f1() { return true; } - Removido

// Linter: const globalVar = 'I am global'; - Removido
