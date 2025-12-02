const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(express.static(PUBLIC_DIR));

const handleRoot = (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    console.log('Served /');
};

app.get('/', handleRoot);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const f1 = () => true;

const globalVar = 'I am global';

module.exports = { f1, globalVar };
