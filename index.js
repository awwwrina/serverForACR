const express = require('express');
const path = require('path');


const app = express();

app.use(express.json({ extended: true }));

/* Возврат заголовков, для кроссдоменного AJAX (только для дев режима) */
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        res.header(`Access-Control-Allow-Origin`, '*');
        res.header(`Access-Control-Allow-Methods`, `GET, POST, OPTIONS, PUT, PATCH, DELETE`);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept, Set-Cookie, Authorization`);
        next();
    });
}


app.use('/api/coffee', require('./src/routes/coffee'));
app.use('/api/auth', require('./src/routes/auth'));

app.use('/api/img', express.static(path.join(__dirname, 'arts')));


if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'dist')));

    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
        if (error) {
            res.status(500).send(error);
        }
    });
}

const PORT = 3000;

async function start() {
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}`));
}

start();