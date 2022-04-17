import express from 'express';
export const router = express.Router();
import { index } from "../controllers/index.mjs";

/* GET home page. */
router.get('/', index);

