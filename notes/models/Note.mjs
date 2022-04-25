export default class Note {
    #note_key;
    #note_title;
    #note_body;
    
    constructor(key, title, body) {
        this.#note_key = key;
        this.#note_title = title;
        this.#note_body = body;
    }

    get key() { return this.#note_key; }
    get title() { return this.#note_title; }
    set title(newTitle) { this.#note_title = newTitle; }
    get body() { return this.#note_body; }
    set body(newBody) { this.#note_body = newBody; }
    get JSON() {
        return JSON.stringify({
            key: this.#note_key, title: this.#note_title, body: this.#note_body
        });
    }

    static fromJSON(json) {
        const data = JSON.parse(json);
        if (typeof data !== 'object'
            || !data.hasOwnProperty('key')
            || typeof data.key !== 'string'
            || !data.hasOwnProperty('title')
            || typeof data.title !== 'string'
            || !data.hasOwnProperty('body')
            || typeof data.body !== 'string') {
                throw new Error(`Not a Note: ${json}`);
            }
        const note = new Note(data.key, data.title, data.body);
        return note;
    }
};

export class AbstractNotesStore {
    async close() { }
    async update(key, title, body) { }
    async create(key, title, body) { }
    async read(key) { }
    async destroy(key) { }
    async keylist() { }
    async count() { }
}