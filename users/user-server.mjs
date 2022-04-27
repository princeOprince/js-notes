import restify from "restify";
import { 
    create as createUser, findOrCreate, findUser, listUsers, updateUser 
} from "./user-controller.mjs";
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

// Create a user
server.post('/create-user', createUser);
server.post('/find-or-create', findOrCreate);

//  Read user data
server.get('/find/:username', findUser);
server.get('/list', listUsers);

// Update user data
server.post('/update-user/:username', updateUser);

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