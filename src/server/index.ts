/* eslint-disable no-console */
import app from 'app';
import log from 'lib/log';
import env from 'config/env';
import { connect as connectToDb } from 'db';

async function makeServer() {
    try {
        /* 
            this is so that we can guarantee we are connected to the db
            before the server exposes itself on a port
        */
        log.initStatus(['mongodb']);
        await connectToDb();
        app.listen(Number(env.PORT), env.ORIGIN);
        console.log(`http://${env.ORIGIN}:${env.PORT}`);
    } catch (e) {
        console.error(e);
        console.log('Exiting...');
    }
}

// eslint-disable-next-line no-void
void makeServer();
