import express from 'express';
import * as path from 'path';
//  import * as favicon from ''serve-favicon";
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import hbs from 'hbs';
import * as http from "http";
import rfs from "rotating-file-stream";
import __dirname  from './approotdir.mjs';
import {
    normalisePort, onError, onListening, handle404, basicErrorHandler
} from "./appsupport.mjs";

import { useModel as useNotesModel } from './models/notes-store.mjs';
useNotesModel(process.env.NOTES_MODEL 
    ? process.env.NOTES_MODEL : 'memory')
    .catch(error => { 
        onError({ code: 'ENOTESTORE', error });
    });

import { router as indexRouter } from './routes/index.mjs';
import { router as usersRouter, initPassport } from './routes/users.mjs';
import { router as notesRouter } from './routes/notes.mjs';

import session from "express-session";
import sessionFileStore from "session-file-store";
const FileStore = sessionFileStore(session);
export const sessionCookieName = "notescookie.sid";

import debug from 'debug';
const dbg = debug('notes:app');

export const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
    stream: process.env.REQUEST_LOG_FILE ?
        rfs.createStream(process.env.REQUEST_LOG_FILE, {
            size: "10M",                 // rotate every 10 Megabytes written
            interval: "1d",             // rotate daily
            compress: "gzip"       // compress rotated files
        })
        : process.stdout
}));
if (process.env.REQUEST_LOG_FILE) {
    app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/vendor/bootstrap', 
    express.static(path.join(__dirname, 'theme', 'dist')));
app.use('/assets/vendor/feather-icons', 
    express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')));

app.use(session({
  store: new FileStore({ path: "sessions" }),
  secret: "keyboard mouse",
  resave: true,
  saveUninitialized: true,
  name: sessionCookieName
}));
initPassport(app);

//  router function lists
app.use('/', indexRouter);
app.use('/users', usersRouter);
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
server.on('request', (req, res) => {
    dbg(`${new Date().toISOString()} request ${req.method} ${req.url}`);
});