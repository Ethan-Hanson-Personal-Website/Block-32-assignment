const pg = require('pg');
const express = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_flavors_db');


app.use(express.json());
app.use(require('morgan')('dev'));

app.post('/api/flavors', async (req, res, next) => {
    try {
        const response = await client.query('INSERT INTO flavors(name) VALUES($1) RETURNING *', [req.body.name]);
        res.send(response.rows[0]);
    }
    catch (error) {
        next(error);
    }
 });
app.get('/api/flavors', async (req, res, next) => { 
    try {
        const response = await client.query('SELECT * FROM flavors');
        res.send(response.rows);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const response = await client.query('SELECT * FROM flavors WHERE id = $1', [req.params.id]);
        res.send(response.rows[0]);
    }
    catch (error) {
        next(error);
    }
 });

app.delete('/api/flavors/:id', async (req, res, next) => { 
    try {
        const response = await client.query('DELETE FROM flavors WHERE id = $1 RETURNING *', [req.params.id]);
        res.send(response.rows[0]);
    }
    catch (error) {
        next(error);
    }
 });
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const response = await client.query('UPDATE flavors SET name = $1 WHERE id = $2 RETURNING *', [req.body.name, req.params.id]);
        res.send(response.rows[0]);
    }
    catch (error) {
        next(error);
    }
 });


const init = async () => {
    await client.connect();
    console.log('connected to db');
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    );
    `;
    await client.query(SQL);
    console.log('tables created');

    SQL = `
    INSERT INTO flavors(name) VALUES('vanilla');
    INSERT INTO flavors(name) VALUES('chocolate');
    INSERT INTO flavors(name) VALUES('strawberry');
    `;
    await client.query(SQL);
    console.log('data seeded');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => 
        console.log(`listening on port ${PORT}`));
};

init();
