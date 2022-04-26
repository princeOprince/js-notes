import { Sequelize, DataTypes } from "sequelize";
import jsyaml from "js-yaml";
import { promises as fs } from "fs";
import debug from "debug";
const log = debug('users:model-users');
const error = debug('users:model-error');

let sequlz;
export let SQUser;

export async function connectDB() {
    if (sequlz) return;

    const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8');
    log(yamltext);
    const params = await jsyaml.load(yamltext, 'utf8');

    if (process.env.SEQUELIZE_DBNAME) {
        params.dbname = process.env.SEQUELIZE_DBNAME;
    }

    if (process.env.SEQUELIZE_DBUSER) {
        params.username = process.env.SEQUELIZE_DBUSER;
    }

    if (process.env.SEQUELIZE_DBPASSWD) {
        params.password = process.env.SEQUELIZE_DBPASSWD;
    }

    if (process.env.SEQUELIZE_DBHOST) {
        params.params.host = process.env.SEQUELIZE_DBHOST;
    }

    if (process.env.SEQUELIZE_DBPORT) {
        params.params.port = process.env.SEQUELIZE_DBPORT;
    }

    if (process.env.SEQUELIZE_DBDIALECT) {
        params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
    }

    log(params);

    sequlz = new Sequelize(params.dbname,
        params.username,
        params.password,
        params.params);

    SQUser = sequlz.define('SQUser', {
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        provider: DataTypes.STRING,
        familyName: DataTypes.STRING,
        givenName: DataTypes.STRING,
        middleName: DataTypes.STRING,
        emails: DataTypes.STRING,
        photos: DataTypes.STRING
    });

    await SQUser.sync();

    try {
        await sequlz.authenticate();
        log('Connection has been established successfully.');
    } catch (err) {
        error('Unable to connect to the database:', err);
        throw new Error(err);
    }
}

export async function close() {
    if (sequlz) sequlz.close();
    sequlz = undefined;
}

export function userParams(req) {
    return {
        username: req.params.username,
        password: req.params.password,
        provider: req.params.provider,
        familyName: req.params.familyName,
        givenName: req.params.givenName,
        middleName: req.params.middleName,
        emails: JSON.stringify(req.params.emails),
        photos: JSON.stringify(req.params.photos)
    };
}

export function sanitizedUser(user) {
    let ret = {
        id: user.username,
        username: user.username,
        provider: user.provider,
        familyName: user.familyName,
        givenName: user.givenName,
        middleName: user.middleName
    };

    try {
        ret.emails = JSON.parse(user.emails);
    } catch (e) {
        ret.emails = [];
    }

    try {
        ret.photos = JSON.parse(user.photos);
    } catch (e) {
        ret.photos = [];
    }

    return ret;
}

export async function findOneUser(username) {
    let user = await SQUser.findOne({
        where: { username }
    });
    return user ? sanitizedUser(user) : undefined;
}

export async function createUser(req) {
    let tocreate = userParams(req);
    await SQUser.create(tocreate);
    return findOneUser(req.params.username);
}