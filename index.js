const app = require('./server/app')
const { application } = require('./server/config')
const { port } = application()

app
    .listen(port, () => console.info('Serveur ouvert sur le port', port))
    .on('error', (error) => console.error('Erreur d\'ouverture du serveur', error.message))
