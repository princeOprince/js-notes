import { Note } from "../models/Note.mjs";
import util from "util";

let note = new Note('key', 'title', 'body');
console.log(note.key);
console.log(note.title);

note[Symbol('key')] = "new key";
console.log(note);

note.title = "new title";
console.log(note);
console.log(note.title);

note.newTitle = "new new title";
console.log(note);
console.log(util.inspect(note));