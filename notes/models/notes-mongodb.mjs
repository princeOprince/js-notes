import { default as Note, AbstractNotesStore } from "./Note.mjs";
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;
import debug from "debug";
const dbg = debug('notes:notes-mongodb');
const error = debug('notes:notes-mongodb');

let client;

const connectDB = async () => {
    if (!client)
        client = await MongoClient.connect(process.env.MONGO_URL);
}

const db = () => client.db(process.env.MONGO_DBNAME);

export default class MongoDBNotesStore extends AbstractNotesStore {
    async close() {
        if (client) client.close();
        client = undefined;
    }

    async update(key, title, body) {
        await connectDB();
        const note = new Note(key, title, body);
        const collection = db().collection('notes');
        await collection.updateOne( { notekey: key },
            { $set: { title: title, body: body } } );
        return note;
    }

    async create(key, title, body) {
        await connectDB();
        const note = new Note(key, title, body);
        const collection = db().collection('notes');
        await collection.insertOne( { 
            notekey: key, title: title, body: body } );
        return note;
    }

    async read(key) {
        await connectDB();
        const collection = db().collection('notes');
        const doc = await collection.findOne( { notekey: key } );
        if (!doc) {
            error(`No note found for ${key}`);
            throw new Error(`No note found for ${key}`);
        }
        else {
            return new Note(doc.notekey, doc.title, doc.body);
        }
    }

    async destroy(key) {
        await connectDB();
        const collection = db().collection('notes');
        await collection.findOneAndDelete( { notekey: key } );
    }

    async keylist() {
        await connectDB();
        const collection = db().collection('notes');
        const notes = await collection.find({}).toArray();
        const notekeys = notes.map(note => note.notekey);
        dbg(`keys=${notekeys}`);
        return notekeys;
    }

    async count() {
        await connectDB();
        const collection = db().collection('notes');
        const count = await collection.count({});
        return count;
    }
}