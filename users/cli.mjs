import program from "commander";
import restify from "restify-clients";

let client_port, client_host, client_protocol, client_version = "*";
const authid = "them", authcode = "D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF";

const client = (program) => {
    if (typeof process.env.PORT === 'string')
        client_port = parseInt(process.env.PORT);
    if (typeof program.port === 'string')
        client_port = parseInt(program.port);
    if (typeof program.host === 'string')
        client_host = parseInt(program.host);
    if (typeof program.url === 'string') {
        const purl = new URL(program.url);
        if (purl.host) client_host = purl.host;
        if (purl.port) client_port = purl.port;
        if (purl.protocol) client_protocol = purl.protocol;
    }
    const connect_url = new URL('http://localhost:5858');
    if (client_protocol) connect_url.protocol = client_protocol;
    if (client_host) connect_url.host = client_host;
    if (client_port) connect_url.port = client_port;
    const client = restify.createJSONClient({
        url: connect_url.href,
        version: client_version
    });
    client.basicAuth(authid, authcode);
    return client;
}

program
    .Option('-p, --port <port>',
        'Port number for user server, if using localhost')
    .Option('-h, --host <host>',
        'Host for user server, if using localhost')
    .Option('-u, --url <url>',
        'Connection URL for user server, if using a remote server');


program.parse(process.argv);