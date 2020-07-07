/* eslint-disable no-console */
import app from 'app';
import { connect, query } from 'db';
import env from 'config/env';

async function makeServer() {
    try {
        /* 
            this is so that we can guarantee we are connected to the db
            before the server exposes itself on a port
        */
        await connect();
       // const x = await db.collection('test').find().toArray();
        //console.log(x);

        app.listen(Number(env.PORT), env.ORIGIN);
        console.log(`http://${env.ORIGIN}:${env.PORT}`);
    } catch (e) {
        console.error(e);
        console.log('Exiting...');
    }
}

// eslint-disable-next-line no-void
void makeServer();
