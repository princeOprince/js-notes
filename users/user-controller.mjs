import { 
    SQUser, connectDB, userParams, findOneUser, createUser, sanitizedUser 
} from "./users-sequelize.mjs";
import debug from "debug";
const log = debug('users:controller-server');
const error = debug('users:controller-error');


export const create = async (req, res, next) => {
    try {
        await connectDB();
        const result = await createUser(req);
        res.contentType = 'json';
        log(result);
        res.send(result);
        next(false);
    } catch (err) {
        error(err);
        res.send(500, err);
        next(false);
    }
}

export const findOrCreate = async (req, res, next) => {
    try {
        await connectDB();
        let user = await findOneUser(req.params.username);
        if (!user) {
            user = await createUser(req);
            if (!user) {
                error("No user created");
               throw new Error('No user created');
            }
        }
        res.contentType = 'json';
        res.send(user);
        next(false);
    } catch (err) {
        error(err);
        res.send(500, err);
        next(false);
    }
}

export const findUser = async (req, res, next) => {
    try {
        await connectDB();
        const user = await findOneUser(req.params.username);
        if (!user) {
            error('Did not find user : ' + req.params.username);
            res.send(404, new Error('Did not find user : ' + req.params.username));
        } else {
            res.contentType = 'json';
            res.send(user);
        }
        next(false);
    } catch (err) {
        error(err);
        res.send(500, err);
        next(false);
    }
}

export const listUsers = async (req, res, next) => {
    try {
        await connectDB();
        let userlist = await SQUser.findAll({});
        userlist = userlist.map(user => sanitizedUser(user));
        if (!userlist) userlist = [];
        res.contentType = 'json';
        res.send(userlist);
        next(false);
    } catch (err) {
        error(err);
        res.send(500, err);
        next(false);
    }
}

export const updateUser = async (req, res, next) => {
    try {
        await connectDB();
        let toupdate = userParams(req);
        await SQUser.update(toupdate, { where: {
                username: req.params.username
            }
        });
        const result = await findOneUser(req.params.username);
        res.contentType = 'json';
        res.send(result);
        next(false);
    } catch (err) {
        error(err);
        res.send(500, err);
        next(false);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        await connectDB();
        const user = await SQUser.findOne({
            where: {
                username: req.params.username
            }
        });
        if (!user) {
            error(`Did not find requested user : ${req.params.username} to delete`);
            res.send(404, 
                new Error(`Did not find requested user : ${req.params.username} to delete`));
        } else {
            user.destroy();
            res.contentType = "json";
            res.send(req.params.username);
            next(false);
        }
    } catch (err) {
        error(err);
        res.send(500, err);
        next(false);
    }
}