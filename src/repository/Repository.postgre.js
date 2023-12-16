import pkg from 'pg';
import IRepositoryDatabase from './IRepository.database.js';

const { Pool } = pkg;

export default class RepositoryPostgre extends IRepositoryDatabase {
    constructor() {
        super();
        this._connection = null;
        this._pool = null;
        this._config = {
            user: process.env.DB_USERNAME,
            host: process.env.DB_HOSTNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
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
            await this._connection.release();
            await this._pool.end();
        } catch (error) {
            throw error;
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