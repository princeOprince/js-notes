const util = require('util');
const express = require('express');
const router = express.Router();
const notes = require('../models/notes-memory');

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
    let note;
    if (req.body.docreate === "create") {
        note = await notes.create(req.body.notekey, req.body.title, req.body.body);
    }
    else {
        note = await notes.update(req.body.notekey, req.body.title, req.body.body);
    }
    res.redirect('/notes/view?key=' + req.body.notekey);
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
    const note = await notes.read(req.query.key);
    res.render('noteedit', {
        title: note ? ("Edit " + note.title) : "Add a Note",
        docreate: false,
        notekey: req.query.key,
        note: note
    });
});

module.exports = router;
