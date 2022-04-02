const bodyParser = require('body-parser');
const express = require('express');
const { renderSlot } = require('vue');
const programmer = require('./database/tables/programmer');

const app = express();
const port = 5000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

app.get('/syncDatabase', async (req, res) =>{
    const database = require('./database/db');

    try {
        await database.sync();

        res.send(`Database succesfully sync'ed`);
    }catch (error) {
        res.send(error);
    }
});

app.post('/createProgrammer', async (req, res) =>{  //POST - envia informações ao servidor
    try {
        const params = req.body;

        const properties = ['name', 'python', 'java', 'javascript'];

        const check = properties.every((property) => {
            return property in params;
        });

        if (!check) {
            const propStr = properties.join(', ');
            res.send(`All parameters needed to create a programmer must be sent: ${propStr}`);
            return;
        }

        const newProgrammer = await programmer.create({
            name: params.name,
            python: params.python,
            javascript: params.javascript,
            java: params.java,
        });

        res.send(newProgrammer);
    } catch (error) {
        res.send(error);
    }
});

app.get('/retrieveProgrammer', async (req, res) => {
    try {
        const params = req.query;

        if ('id' in params) {
            const record = await programmer.findByPk(params.id);
            if (record) {
                res.send(record);
            } else {
                res.send('No programmer found using received ID');
            }

            return;
        }

        const records = await programmer.findAll();

        res.send(records);
    } catch(error) {
        res.send(error)
    }
});

app.put('/updateProgrammer', async (req, res) =>{ //PUT - atualiza dados de um registro específico
    try {
        const params = req.body;

        if(!('id' in params)) {
            res.send(`Missing ID in request body`);
            return;
        }

        const record = await programmer.findByPk(params.id);

        if(!record) {
            res.send(`Programmer ID not found.`);
            return;
        }

        const properties = ['name', 'python', 'java', 'javascript'];

        const check = properties.some((property) => {
            return property in params;
        });

        if (!check) {
            const propStr = properties.join(', ');
            res.send(`Request body doesn't have any of the following properties: ${propStr}`);
            return;
        }

        record.name = params.name || record.name; 
        //record.python = params.python || record.python; //- SE ATUALIZAR PARA FALSE, E ESTIVER SALVO COMO TRUE, CÓDIGO IRÁ RETORNAR TRUE  - erro de sintaxe
        /*if ('python' in params) {      - CORREÇÃO COM CONDICIONAL IF
            record.python = params.python;
        }*/
        record.pyton = 'python' in params ? params.java : record.java;//CORREÇÃO COM IF TERNARIO
        record.java = 'java' in params ? params.java : record.java; //estrutura - SE HOUVER JAVA NOS PARAMETROS, USARÁ params.java (IF) // SE NÃO HOUVER JAVA NOS PARAMETROS, USARÁ :record.java(ELSE) 
        record.java = 'javascript' in params ? params.javascript : record.javascript; 

        await record.save();

        res.send(`${record.id} ${record.name} - Updated succesfully`);
    } catch(error) {
        res.send(error);
    }
});

app.delete('/deleteProgrammer', async (req, res) =>{
    try {
        const params = req.body;

        if (!('id' in params)) {
            res.send(`Missing ID in request body`);
            return;
        }

        const record = await programmer.findByPk(params.id)

        if (!record) {
            res.send(`Programmer ID not found`);
            return;
        }

        record.destroy();

        res.send(`${record.id} ${record.name} - Deleted succesfully`)
    } catch (error){
        res.send(error)
    }
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

