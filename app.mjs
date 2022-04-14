import express from 'express';
import * as path from 'path';
//  import * as favicon from ''serve-favicon";
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import hbs from 'hbs';
import * as http from "http";
import __dirname  from './approotdir.mjs';
import {
    normalisePort, onError, onListening, handle404, basicErrorHandler
} from "./appsupport.mjs";

import { InMemoryNotesStore } from './models/notes-memory.mjs';
export const NotesStore = new InMemoryNotesStore();

import { router as indexRouter } from './routes/index.mjs';
// import { default as express } usersRouter = require('./routes/users');
import { router as notesRouter } from './routes/notes.mjs';

export const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/vendor/bootstrap', 
    express.static(path.join(__dirname, 'theme', 'dist')));
app.use('/assets/vendor/feather-icons', 
    express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')));

//  router function lists
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/notes', notesRouter);

//  error handlers
app.use(handle404);     // catch 404 and forward to error handler
app.use(basicErrorHandler);

export const port = normalisePort(process.env.PORT || '3000');
app.set('port', port);

export const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
