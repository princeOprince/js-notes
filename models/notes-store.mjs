import debug from "debug";
const dbg = debug('notes:notes-store');
const error = debug('notes:error-store');

export let NotesStore;

export async function useModel(model) {
    try {
        const NotesStoreModule = await import(`./notes-${model}.mjs`);
        const NoteStoreClass = NotesStoreModule.default;
        NotesStore = new NoteStoreClass();
    } catch(err) {
        throw new Error(`No recognised NotesStore in notes-${model}.mjs \n --- ${err}`);
    }
}