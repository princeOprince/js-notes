import { default as express } from 'express';
export const router = express.Router();

import notes from '../models/notes-memory.mjs';

/* GET home page. */
router.get('/', async (req, res, next) => {
    let keylist = await notes.keylist();
    let keyPromises = keylist.map(key => {
        return notes.read(key);
    });
    let notelist = await Promise.all(keyPromises);
  res.render('index', { title: 'Notes', notelist: notelist });
});

