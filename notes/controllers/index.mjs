import { NotesStore as notes } from '../models/notes-store.mjs';
import debug from 'debug';
const log = debug('notes:index-controller');
const error = debug('notes:error-index-controller');

export const index = async (req, res, next) => {
  try {
    const keylist = await notes.keylist();
    const keyPromises = keylist.map(key => {
      return notes.read(key);
    });
    const notelist = await Promise.all(keyPromises);
    res.render('index', {
      title: 'Notes',
      notelist: notelist,
      user: req.user ? req.user : undefined
    });
  }
  catch (err) {
    error(err);
    next(err);
  }
}