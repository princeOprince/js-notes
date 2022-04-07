import express from 'express';
export const router = express.Router();
import { NotesStore as notes } from '../app.mjs';

//  Add Note (create)
router.get('/add', (req, res, next) => {
    res.render('noteedit', {
        title: "Add a Note", 
        docreate: true,
        notekey: "",
        note: undefined
    });
});

//  Save Note (create / update)
router.post('/save', async (req, res, next) => {
    try {
        let note;
        if (req.body.docreate === "create") {
            note = await notes.create(req.body.notekey, req.body.title, req.body.body);
        }
        else {
            note = await notes.update(req.body.notekey, req.body.title, req.body.body);
        }
        res.redirect('/notes/view?key=' + req.body.notekey);
    } catch (error) {
        next(err);
    }
});

//  Read Note (read)
router.get('/view', async (req, res, next) => {
    const note = await notes.read(req.query.key);
    res.render('noteview', {
        title: note ? note.title : "",
        notekey: req.query.key,
        note: note
    });
});

//  Edit Note (update)
router.get('/edit', async (req, res, next) => {
    try {
        const note = await notes.read(req.query.key);
        res.render('noteedit', {
            title: note ? ("Edit " + note.title) : "Add a Note",
            docreate: false,
            notekey: req.query.key,
            note: note
        });
    } catch (error) {
        next(error);
    }
});

//  Ask to delete Note (destroy)
router.get('/destroy', async (req, res, next) => {
    const note = await notes.read(req.query.key);
    res.render('notedestroy', {
        title: note ? note.title : "",
        notekey: req.query.key,
        note: note
    });
});

//  Really destroy Note (destroy)
router.post('/destroy/confirm', async (req, res, next) => {
    await notes.destroy(req.body.notekey);
    res.redirect('/');
});
