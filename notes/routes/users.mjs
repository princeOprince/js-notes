import path from "path";
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as usersModel from "../models/users-superagent.mjs";
import { sessionCookieName } from "../app.mjs";
import debug from "debug";
const log = debug('notes:router-users');
const error = debug('notes:error-users');

export const router = express.Router();

export function initPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
}

export function ensureAuthenticated(req, res, next) {
  try {
    if (req.user) next();
    else res.redirect('/users/login');
  }
  catch (e) {
    error(e);
    next(e);
  }
}

router.get('/login', (req, res, next) => {
  try {
    res.render('login', { 
      title: "Login to Notes", user: req.user
    });
  } 
  catch (e) {
    error(e);
    next(e);
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: 'login'
}));
