import { promises as fs } from "fs";
import jsyaml from "js-yaml";
import Sequelize from "sequelize";
import debug from "debug";
const dbg = debug('notes:sequlz-sequlz');
const dbgerr = debug('notes:error-sequlz');

let sequlz;

export async function connectDB() {
    if (typeof sequlz === 'undefined') {
        const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8');
        const params = jsyaml.load(yamltext, 'utf8');
        dbg(params);

        if (typeof process.env.SEQUELIZE_DBNAME !== 'undefined'
            && process.env.SEQUELIZE_DBNAME !== '') {
            params.dbname = process.env.SEQUELIZE_DBNAME;
        }

        if (typeof process.env.SEQUELIZE_DBUSER !== 'undefined'
            && process.env.SEQUELIZE_DBUSER !== '') {
            params.username = process.env.SEQUELIZE_DBUSER;
        }

        if (typeof process.env.SEQUELIZE_DBPASSWD !== 'undefined'
            && process.env.SEQUELIZE_DBPASSWD !== '') {
            params.password = process.env.SEQUELIZE_DBPASSWD;
        }

        if (typeof process.env.SEQUELIZE_DBHOST !== 'undefined'
            && process.env.SEQUELIZE_DBHOST !== '') {
            params.params.host = process.env.SEQUELIZE_DBHOST;
        }

        if (typeof process.env.SEQUELIZE_DBPORT !== 'undefined'
            && process.env.SEQUELIZE_DBPORT !== '') {
            params.params.port = process.env.SEQUELIZE_DBPORT;
        }

        if (typeof process.env.SEQUELIZE_DBDIALECT !== 'undefined'
            && process.env.SEQUELIZE_DBDIALECT !== '') {
            params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
        }

        sequlz = new Sequelize(params.dbname,
            params.username,
            params.password,
            params.params,);

        try {
            await sequlz.authenticate();
            dbg('Connection has been established successfully.');
        } catch (error) {
            dbgerr('Unable to connect to the database:', error);
            throw new Error(error);
        }
    }

    return sequlz;
}

export async function close() {
    if (sequlz) sequlz.close();
    sequlz = undefined;
}