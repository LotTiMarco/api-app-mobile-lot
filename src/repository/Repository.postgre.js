import pkg from 'pg';
import IRepositoryDatabase from './IRepository.database.js';

const { Pool } = pkg;

export default class RepositoryPostgre extends IRepositoryDatabase {
    constructor() {
        super();
        this._connection = null;
        this._pool = null;
        this._config = {
            user: process.env.AAML_DB_USERNAME,
            host: process.env.AAML_DB_HOSTNAME,
            password: process.env.AAML_DB_PASSWORD,
            database: process.env.AAML_DB_DATABASE,
            port: process.env.AAML_DB_PORT,
            ssl: {
                rejectUnauthorized: false,
            }
        };
    }

    async connect() {
        try {
            this._pool = new Pool(this._config);
            this._connection = await this._pool.connect();
        } catch (error) {
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this._connection) {
                await this._connection.release();
            }
        } catch (error) {
            throw error;
        } finally {
            if (this._pool) {
                await this._pool.end();
            }
        }
    }

    async query(query, values = []) {
        try {
            return await this._connection.query(query, values);
        } catch (error) {
            throw error;
        }
    }
}