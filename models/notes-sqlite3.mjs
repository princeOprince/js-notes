import { default as Note, AbstractNotesStore } from "./Note.mjs";
import util from "util";
import debug from "debug";
import sqlite3 from "sqlite3";
const dbg = debug('notes:notes-sqlite3');
const error = debug('notes:error-sqlite3');

let db;

async function connectDB() {
    if (db) return db;
    const dbfile = process.env.SQLITE_FILE || "notesdb.sqlite3";
    dbg(`Database storage --- ${dbfile}`);
    await new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbfile,
            err => {
                if (err) return reject(err);
                resolve(db);
            });
    });
    await createSchema(db);
    return db; 
}

async function createSchema(db) {
    await new Promise((resolve, reject) => {
        db.run('CREATE TABLE IF NOT EXISTS ' +
                       'notes ( ' +
                            'notekey VARCHAR(255), ' +
                            'title VARCHAR(255), ' +
                            'body TEXT ' +
                        ')',
                    err => {
                        if (err)  {
                            error('error creating notes table');
                            reject(err);
                        }
                        else resolve();
                    });
    });
}

export default class SQLITE3NotesStore extends AbstractNotesStore {
    async close() {
        const _db = db;
        db = undefined;
        return _db ?
            new Promise((resolve, reject) => {
                _db.close()(err => {
                    if (err) reject(err);
                    else resolve();
                });
            }) : undefined;
    }

    async update(key, title, body) {
        const db = await connectDB();
        const note = new Note(key, title, body);
        await new Promise((resolve, reject) => {
            db.run('UPDATE notes ' + 
                'SET title = ?, body = ? WHERE notekey = ?',
                [ title, body, key ], err => {
                    if (err) return reject(err);
                    resolve(note);
                });
        });
        return note;
    }

    async create(key, title, body) {
        const db = await connectDB();
        const note = new Note(key, title, body);
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO notes ( notekey, title, body ) ' + 
                'VALUES ( ?, ?, ? )',
                [ key, title, body ], err => {
                    if (err) return reject(err);
                    resolve(note);
                });
        });
        return note;
    }

    async read(key) {
        const db = await connectDB();
        const note = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM notes WHERE notekey = ?', 
                key, (err, row) => {
                    if (err) return reject(err);
                    const note = new Note(row.notekey, row.title, row.body);
                    resolve(note);
                });
        });
        return note;
    }

    async keylist() {
        const db = await connectDB();
        const keys = await new Promise((resolve, reject) => {
            db.all('SELECT notekey FROM notes', 
                (err, rows) => {
                    dbg(`keys=${util.inspect(rows)}`);
                    if (err) return reject(err);
                    resolve(rows.map(row => row.notekey));
                });
        });
        return keys;
    }

    async count() {
        const db = await connectDB();
        const count = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(notekey) AS COUNT FROM notes', 
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row.count);
                });
        });
        return count;
    }

    async delete(key) {
        const db = await connectDB();
        return await new Promise((resolve, reject) => {
            db.run('DELETE FROM notes WHERE notekey = ?', 
                key, err => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    }
}