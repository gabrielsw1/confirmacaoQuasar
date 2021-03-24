const ini = require('ini'),
    fs = require('fs'),
    {
        Pool
    } = require('pg')

const connect = ini.parse(fs.readFileSync('./dbconf.ini', 'utf-8'))

module.exports = {
    pool: new Pool({
        user: 'hd_faturamento',
        host: connect.HOSTNAME.hostname,
        database: connect.DATABASE.database,
        password: 'fat0516fat',
        port: connect.PORTA.porta,
    })
}