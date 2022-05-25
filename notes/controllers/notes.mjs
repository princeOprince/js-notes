import { NotesStore as notes } from '../models/notes-store.mjs';
import debug from 'debug';
const log = debug('notes:notes-controller');
const err = debug('notes:error-notes-controller');

export const addNote = (req, res, next) => {
  res.render('noteedit', {
    title: "Add a Note",
    docreate: true,
    notekey: "",
    note: undefined,
    user: req.user
  });
};

export const saveNote = async (req, res, next) => {
  try {
    let note;
    if (req.body.docreate === "create") {
      note = await notes.create(
        req.body.notekey, req.body.title, req.body.body);
    }
    else {
      note = await notes.update(
        req.body.notekey, req.body.title, req.body.body);
    }
    res.redirect('/notes/view?key=' + req.body.notekey);
  } catch (error) {
    err(error);
    next(error);
  }
};

export const viewNote = async (req, res, next) => {
  try {
    const note = await notes.read(req.query.key);
    res.render('noteview', {
      title: note ? note.title : "",
      notekey: req.query.key,
      note: note,
      user: req.user ? req.user : undefined
    });
  } catch (error) {
    err(error);
    next(error);
  }
};

export const editNote = async (req, res, next) => {
  try {
    const note = await notes.read(req.query.key);
    res.render('noteedit', {
      title: note ? ("Edit " + note.title) : "Add a Note",
      docreate: false,
      notekey: req.query.key,
      note: note,
      user: req.user
    });
  } catch (error) {
    err(error);
    next(error);
  }
};

export const destroyNote = async (req, res, next) => {
  try {
    const note = await notes.read(req.query.key);
    res.render('notedestroy', {
      title: note ? `Delete ${note.title}` : "",
      notekey: req.query.key,
      note: note,
      user: req.user
    });
  } catch (error) {
    err(error);
    next(error);
  }
};

export const confirmNoteDestroy = async (req, res, next) => {
  try {
    await notes.destroy(req.body.notekey);
    res.redirect('/');
  } catch (error) {
    err(error);
    next(error);
  }
};