import express from 'express';
export const router = express.Router();
import * as notesController  from "../controllers/notes.mjs";
import { ensureAuthenticated } from './users.mjs';

//  Add Note (create)
router.get('/add', ensureAuthenticated, notesController.addNote);

//  Save Note (create / update)
router.post('/save', ensureAuthenticated, notesController.saveNote);

//  Read Note (read)
router.get('/view', notesController.viewNote);

//  Edit Note (update)
router.get('/edit', notesController.editNote);

//  Ask to delete Note (destroy)
router.get('/destroy', notesController.destroyNote);

//  Really destroy Note (destroy)
router.post('/destroy/confirm', notesController.confirmNoteDestroy);
