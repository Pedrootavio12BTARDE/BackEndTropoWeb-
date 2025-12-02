import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD } = process.env;

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

// ================================
// Conexão com MySQL
// ================================
const database = mysql.createPool({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    connectionLimit: 10
});

// ================================
// ROTA HOME (TESTE)
// ================================
app.get("/", (req, res) => {
    const sql = "SELECT name, email, age FROM usersNew";

    database.query(sql, (error, users) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro ao buscar usuários" });
        }
        res.json(users);
    });
});

// ================================
// CADASTRO
// ================================
app.post("/cadastrar", (req, res) => {
    const { name, email, age, password } = req.body.user;

    const sql = `
        INSERT INTO usersNew (name, email, age, password_hash)
        VALUES (?, ?, ?, ?)
    `;

    database.query(sql, [name, email, age, password], (error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro ao cadastrar usuário" });
        }
        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    });
});

// ================================
// LOGIN
// ================================
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM usersNew WHERE email = ?";

    database.query(sql, [email], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro no login" });
        }

        if (results.length === 0 || password !== results[0].password_hash) {
            return res.json({ message: "Email ou senha incorretos!" });
        }

        res.json({
            id: results[0].id,
            name: results[0].name
        });
    });
});

// ================================
// RANKING (GET)
// ================================
// ================================
// RANKING (GET) — CORRIGIDO
// ================================
app.get("/ranking", (req, res) => {
    const sql = `
        SELECT name, acertos, tempo
        FROM usersNew
        ORDER BY acertos DESC, tempo ASC
    `;

    database.query(sql, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro ao buscar ranking" });
        }

        res.json(results);
    });
});
// ================================
// SALVAR RESULTADO DO QUIZ
// ================================
app.post("/salvarResultado", (req, res) => {
    const { usuario, acertos, tempo } = req.body;

    if (!usuario || !usuario.id) {
        return res.status(400).json({ message: "Usuário não logado" });
    }

    const sql = `
        UPDATE usersNew
        SET acertos = ?, tempo = ?
        WHERE id = ?
    `;

    database.query(sql, [acertos, tempo, usuario.id], (error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro ao salvar resultado" });
        }

        res.json({ message: "Resultado salvo com sucesso!" });
    });
});

// ================================
// INICIAR SERVIDOR
// ================================
app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
});
