import fs from "fs-extra";
import path from "path";
import __dirname from "../approotdir.mjs";
import { default as Note, AbstractNotesStore } from "./Note.mjs";
import debug from "debug";
const dbg = debug('notes:notes-fs');
const error = debug('notes:error-fs');
const filePath = (notesdir, key) => path.join(notesdir, `${key}.json`);

export default class FSNotesStore extends AbstractNotesStore {

    async close() { }

    async update(key, title, body) { 
        return crupdate(key, title, body);
    }

    async create(key, title, body) { 
        return crupdate(key, title, body);
    }

    async read(key) {
        const notesdir = await notesDir();
        return await readJSON(notesdir, key);
     }

    async destroy(key) {
        const notesdir = await notesDir();
        await fs.unlink(filePath(notesdir, key));
     }

    async keylist() {
        const notesdir = await notesDir();
        let files = await fs.readdir(notesdir);
        if (!files || typeof files === 'undefined') files = [];
        dbg(`keylist dir ${notesdir} files=${files}`);
        const notes = files.map(async fname => {
            const key = path.basename(fname, '.json');
            const note = await readJSON(notesdir, key);
            return note.key;
        });
        return Promise.all(notes);
     }

    async count() { 
        const notesdir = await notesDir();
        const files = await fs.readdir(notesdir);
        return files.length;
    }
}

async function notesDir() {
    const dir = process.env.NOTES_FS_DIR 
        || path.join(__dirname, 'notes-fs-data');
    await fs.ensureDir(dir);
    return dir;
}

async function readJSON(notesdir, key) {
    const readFrom = filePath(notesdir, key);
    const data = await fs.readFile(readFrom, 'utf8');
    return Note.fromJSON(data);
}

async function crupdate(key, title, body) {
    const notesdir =await notesDir();
    if (key.indexOf('/') >= 0) {
        error(`Invalid character '/' in key '${key}'`);
        throw new Error(`Key ${key} cannot contain '/'`);
    }
    const note = new Note(key, title, body);
    const writeTo = filePath(notesdir, key);
    const writeJSON = note.JSON;
    await fs.writeFile(writeTo, writeJSON, 'utf8');
    return note;
}

