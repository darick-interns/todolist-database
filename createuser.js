import sqlite3 from 'sqlite3'
import bcrypt from 'bcrypt'

const db = new sqlite3.Database('./database.db')
const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'
const saltRounds = 10;
const myPlaintextPassword = '000000'

bcrypt.genSalt(saltRounds, function(err, salt) {
	bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
		const payload = ['lancelot', hash]
		db.run(sql, payload, () => {
			console.log('Account has been saved')
		})
	})
})