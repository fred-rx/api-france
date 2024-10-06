require('dotenv').config()

const application = () => {

    const { APP_HOST, APP_PORT, JWT_SECRET } = process.env

    if (APP_HOST && !isNaN(Number(APP_PORT)) && JWT_SECRET) {
        return {host: APP_HOST, port: Number(APP_PORT), secret: JWT_SECRET}
    } else {
        const missing = Object.entries({APP_HOST, APP_PORT, JWT_SECRET})
            .filter(([value]) => !value)
            .map(([key]) => key.replace('APP_', '').toLowerCase())
        throw new Error(`${missing.length > 1 ? 'Les variables' : 'La variable'} d'environnement APP "${missing.join('", "')}" ${missing.length > 1 ? 'doivent être assignées' : 'doit être assignée'}`)
    }
}

const optionsSQL = () => {
    
    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env

    if (DB_HOST && !isNaN(Number(DB_PORT)) && DB_USER && DB_PASSWORD) {
        return {host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, multipleStatements: true}
    } else {
        const missing = Object.entries({ DB_HOST, DB_PORT, DB_USER, DB_PASSWORD })
            .filter(([value]) => !value)
            .map(([key]) => key.replace('DB_', '').toLowerCase())
        throw new Error(`${missing.length > 1 ? 'Les variables' : 'La variable'} d'environnement MySQL "${missing.join('", "')}" ${missing.length > 1 ? 'doivent être assignées' : 'doit être assignée'}`)
    }

}

const connectionSQL = ({name}) => {

    const mysql = require('mysql2/promise')
    
    try {
        const connectionURI = {...optionsSQL(), database: name}
        return mysql.createPool(connectionURI)
    } catch (error) {
        throw error
    }

}

const endpoints = {
    '/api': {name: 'cities', identifier: false, subs: {
        '/countries': {table: 'country', identifier: true, subs: {
            '/regions': {table: 'region', identifier: false},
            '/departments': {table: 'department', identifier: false},
            '/municipalities': {table: 'municipality', identifier: false}
        }},
        '/regions': {table: 'region', identifier: true, subs: {
            '/departments': {table: 'department', identifier: false},
            '/municipalities': {table: 'municipality', identifier: false}
        }},
        '/departments': {table: 'department', identifier: true, subs: {
            '/municipalities': {table: 'municipality', identifier: false}
        }},
        '/auth': {name: 'cities_users', identifier: false, subs: {
            '/register': {table: 'users', identifier: false},
            '/profile': {table: 'users', identifier: false},
            '/logout': {table: 'users', identifier: false}
        }},
        '/admin': {name: 'cities_users', identifier: false, subs: {
            '/users': {table: 'users', identifier: true}
        }}
    }}
}

const environment = (request) => {

    const { url, params } = request
    const segments = url.split('/').filter(Boolean)
    let configuration = endpoints

    for (const segment of segments) {

        const key = `/${segment}`

        if (configuration.identifier && (!params || !params.id)) {
            throw new Error('L\'URL de la requête est incorrecte')
        }

        if (configuration[key]) {
            configuration = configuration[key]
        } else if (configuration.subs && configuration.subs[key]) {
            const { table, identifier, subs } = configuration.subs[key]
            configuration = {...configuration, table: table, identifier: identifier, subs: subs}
        } else if (params.id === segment.toLowerCase()) {
            continue
        } else {
            throw new Error('L\'URL de la requête est invalide')
        }

    }

    if (!configuration.table) {
        throw new Error('L\'URL de la requête est incomplète')
    }

    const connection = connectionSQL(configuration)

    delete configuration.identifier
    delete configuration.subs
    return { connection, configuration }

}

const requests = [
    {url: '/api/countries', result: {state: 'Success', object: {name: 'cities', table: 'country'}}},
    {url: '/api/countries/fr', params: {id: 'fr'}, result: {state: 'Success', object: {name: 'cities', table: 'country'}}},
    {url: '/api/countries/fr/regions', params: {id: 'fr'}, result: {state: 'Success', object: {name: 'cities', table: 'region'}}},
    {url: '/api', result: {state: 'Failure', message: 'L\'URL de la requête est incomplète'}},
    {url: '/api/countries/regions', result: {state: 'Failure', message: 'L\'URL de la requête est incorrecte'}},
    {url: '/api/regions/12/countries', params: {id: '12'}, result: {state: 'Failure', message: 'L\'URL de la requête est invalide'}}
]

for (const request of requests) {
    const { url, params, result } = request
    try {
        const expected = result.object
        const { configuration } = environment(request)
        if (result.state === 'Success' && JSON.stringify(configuration) === JSON.stringify(expected)) {
            console.info('Test "Success" réussi =>', url)
        } else {
            console.error('Test "Success" échoué =>', url)
        }
    } catch (error) {
        if (result.state === 'Failure' && error.message === result.message) {
            console.info('Test "Failure" réussi =>', url)
        } else {
            console.error('Test "Failure" échoué =>', url)
        }
    }
}

module.exports = { application, environment }