import { Note, AbstractNotesStore } from "./Note.mjs";

// const notes = [];

export class InMemoryNotesStore extends AbstractNotesStore {
    #notes = [];

    get notes() { return this.#notes }
    set notes(key) {this.#notes[key] = notes[key]}

    async close() { }

    async update(key, title, body) {
        this.notes[key] = new Note(key, title, body);
        return this.notes[key];
    }

    async create(key, title, body) {
        this.notes[key] = new Note(key, title, body);
        return this.notes[key];
    }

    async read(key) {
        if (this.notes[key]) return this.notes[key];
        else throw new Error(`Note ${key} does not exist`);
    }

    async destroy(key) {
        if (this.notes[key]) delete this.notes[key];
        else throw new Error(`Note ${key} does not exist`);
    }

    async keylist() {
        return Object.keys(this.notes);
    }

    async count() {
        return this.notes.length; 
    }
}
