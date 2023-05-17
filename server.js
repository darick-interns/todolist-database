import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import sqlite3 from 'sqlite3'
import session from 'express-session'

const app = express()
const PORT = 3069
const db = new sqlite3.Database('./database.db')

app.use(cors())
app.use(session({
	secret: 'todoapp',
	resave: false,
	saveUninitialized: false
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(express.static('public'))

function isAuth(req, res, next) {
	if (req.session.user) {
		next()
	} else {
		res.status(403).send({
			message: "Access Denied"
		})
	}
}

// Authentication
app.post('/login', (req, res) => {
	const sql = "SELECT username, password FROM users WHERE username = ?"
	const { username, password } = req.body
	db.get(sql, username, (err, row) => {
		if (row && row.password == password) {
			req.session.user = { username: username }
			req.session.save(function (err) {
				if (err) return next(err) 
			    res.sendFile(__dirname + '/public/app.html')
			})	
		} else {
			res.json('The username or password is invalid')
		}
	})
})

app.post('/logout', (req, res) => {
	req.session.user = null
	req.session.save(function (err) {
		if (err) next(err)
		req.session.regenerate(function (err) {
				if (err) next(err)
				res.redirect('http://localhost:5173/')
		})
	})
})

// ToDoApp
app.get('/todos', isAuth, (req, res) => {
	const sql = "SELECT * FROM todos"
	db.all(sql, (err, rows) => {
		res.json(rows)
	})
})

app.post('/todos', (req, res) => {
	const { todo, completed } = req.body
	const sql = "INSERT INTO todos (todo, completed) VALUES (?, 0)"
	db.run(sql, [todo, completed], () => {
		res.json(req.body)
	}) 
})

app.get('/todos/:id', (req, res) => {
	const { id } = req.params
	const sql = "SELECT * FROM todos WHERE id = ?"
	db.get(sql, id, (err, row) => {
		res.json(row)
	})
})

app.put('/todos/:id', (req, res) => {
	const { id } = req.params
	const { todo, completed } = req.body
	const sql = "UPDATE todos SET todo = ?, completed = 0 WHERE id = ?"
	db.run(sql, [todo, completed, id], (err, row) => {
		res.json(req.body)
	})
})

app.delete('/todos/:id', (req, res) => {
	const { id } = req.params
	const sql = "DELETE FROM todos WHERE id = ?"
	db.run(sql, id, (err, row) => {
		res.json({ message: 'Todo has been deleted' })
	})
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})