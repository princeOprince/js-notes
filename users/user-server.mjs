import restify from "restify";
import { 
    SQUser, connectDB, userParams, findOneUser, createUser, sanitizedUser 
} from "./users-sequelize.mjs";
import debug from "debug";
const log = debug('users:server-service');
const error = debug('users:server-error');

// Set up the REST server

const server = restify.createServer({
    name: "User-Auth-Service",
    version: "0.0.1"
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({
    mapParams: true
}));

server.post('/create-user', async (req, res, next) => {
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
});

server.post('/find-or-create', async (req, res, next) => {
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
        res.send(500, err);
        next(false);
    }
});

server.listen(process.env.PORT, 'localhost', () => {
    log(`${server.name} listening at ${server.url}`);
});

process.on('uncaughtException', (err) => {
    error(`Program crashed! \n --- ${(err.stack || err)}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    error(`Unhandled rejection at Promise:  \n`,`Error code: ${reason.code} \n`, `Cause ::: ${reason.error}`);
    process.exit(1);
});

//  Mimic API Key authentication

const apiKeys = [
    {
        user: "them",
        key: "D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF"
    }
];

function check(req, res, next) {
    if (req.authorization && req.authorization.basic) {
        let found = false;

        for (let auth of apiKeys) {
            if (auth.key === req.authorization.basic.password
                && auth.user === req.authorization.basic.username) {
                    found = true;
                    break;
            }
        }

        if (found) next();
        else {
            res.send(401, new Error('Not authenticated'));
            next(false);
        }
    }
    else {
        res.send(500, new Error('No Authorization Key'));
        next(false);
    }
}