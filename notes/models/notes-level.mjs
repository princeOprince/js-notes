import { default as Note, AbstractNotesStore } from "./Note.mjs";
import { Level } from "level";
import debug from "debug";
const dbg = debug('notes:notes-level');
// const error = debug('notes:error-level');

let db;

async function connectDB() {
    if (typeof db !== 'undefined' || db) return db;
    db = new Level(
        process.env.LEVELDB_LOCATION || "notes-level-data", {
        valueEncoding: "json"
    });
    dbg('Level database', db.status);
    return db;
}

async function crupdate(key, title, body) {
    const db = await connectDB();
    const note = new Note(key, title, body);
    await db.put(key, note.JSON);
    return note;
}

export default class LevelNotesStore extends AbstractNotesStore {

    async close() {
        const _db = db;
        db = undefined;
        return _db ? _db.close() : undefined;
    }

    async update(key, title, body) {
        return crupdate(key, title, body);
    }

    async create(key, title, body) {
        return crupdate(key, title, body);
    }

    async read(key) {
        const db = await connectDB();
        const note = Note.fromJSON(await db.get(key));
        return note;
    }

    async destroy(key) {
        const db = await connectDB();
        await db.del(key);
    }

    async keylist() {
        const db = await connectDB();
        return db.keys().all();
    }

    async count() {
        const db = await connectDB();
        return db.keys().count;
    }
}
