import express from 'express';
export const router = express.Router();
import { NotesStore as notes } from '../app.mjs';

/* GET home page. */
router.get('/', async (req, res, next) => {
    try {
        const keylist = await notes.keylist();
        const keyPromises = keylist.map(key => {
            return notes.read(key);
        });
        const notelist = await Promise.all(keyPromises);
        res.render('index', { title: 'Notes', notelist: notelist });
    }
    catch(err) {
        next(err);
    }
});

