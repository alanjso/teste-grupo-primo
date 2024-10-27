import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import routes from './routes';
import sequelize from './database/pgsql';

sequelize.authenticate().then(() => {
    console.log(`Conectado com sucesso ao POSTGRES!`)
}).catch(error => {
    console.log(`** Erro ao conectar com o Postgres! **`)
    console.log(`** ${error} **`)
});

const PORT = process.env.PORT || 4001

const HOSTNAME = process.env.HOSTNAME || 'http://localhost'

const app = express()

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
    res.status(200).send({ msg: 'Server Up' })
})

app.use('/v1', routes);

app.use((req, res) => {
    res.status(404).send({ msg: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso ${HOSTNAME}:${PORT}`)
})