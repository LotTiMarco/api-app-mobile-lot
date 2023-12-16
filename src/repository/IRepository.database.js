export default class IRepositoryDatabase {
    constructor() {
        if (this.constructor === IRepositoryDatabase) {
            throw new TypeError('Abstract class "IRepositoryDatabase" cannot be instantiated directly');
        }
    }

    async connect() {
        throw new Error('You have to implement the method connect!');
    }

    async disconnect() {
        throw new Error('You have to implement the method disconnect!');
    }

    async query() {
        throw new Error('You have to implement the method query!');
    }

    // async transaction() {
    //     throw new Error('You have to implement the method transaction!');
    // }

    // async commit() {
    //     throw new Error('You have to implement the method commit!');
    // }

    // async rollback() {
    //     throw new Error('You have to implement the method rollback!');
    // }

    // async begin() {
    //     throw new Error('You have to implement the method begin!');
    // }

    // async end() {
    //     throw new Error('You have to implement the method end!');
    // }

    // async savepoint() {
    //     throw new Error('You have to implement the method savepoint!');
    // }

    // async release() {
    //     throw new Error('You have to implement the method release!');
    // }

    // async rollbackTo() {
    //     throw new Error('You have to implement the method rollbackTo!');
    // }

    // async execute() {
    //     throw new Error('You have to implement the method execute!');
    // }

    // async executeFile() {
    //     throw new Error('You have to implement the method executeFile!');
    // }

    // async executeScript() {
    //     throw new Error('You have to implement the method executeScript!');
    // }

    // async executeTransaction() {
    //     throw new Error('You have to implement the method executeTransaction!');
    // }

    // async executeTransactionFile() {
    //     throw new Error('You have to implement the method executeTransactionFile!');
    // }

    // async executeTransactionScript() {
    //     throw new Error('You have to implement the method executeTransactionScript!');
    // }

    // async executeTransactionFunction() {
    //     throw new Error('You have to implement the method executeTransactionFunction!');
    // }

    // async executeTransactionFunctionFile() {
    //     throw new Error('You have to implement the method executeTransactionFunctionFile!');
    // }

    // async executeTransactionFunctionScript() {
    //     throw new Error('You have to implement the method executeTransactionFunctionScript!');
    // }

    // async executeTransactionProcedure() {
    //     throw new Error('You have to implement the method executeTransactionProcedure!');
    // }

    // async executeTransactionProcedureFile() {
    //     throw new Error('You have to implement the method executeTransactionProcedureFile!');
    // }

    // async executeTransactionProcedureScript() {
    //     throw new Error('You have to implement the method executeTransactionProcedureScript!');
    // }

    // async executeTransactionQuery() {
    //     throw new Error('You have to implement the method executeTransactionQuery!');
    // }

    // async executeTransactionQueryFile() {
    //     throw new Error('You have to implement the method executeTransactionQueryFile!');
    // }

    // async executeTransactionQueryScript() {
    //     throw new Error('You have to implement the method executeTransactionQueryScript!');
    // }

    // async executeTransactionQueryOne() {
    //     throw new Error('You have to implement the method executeTransactionQueryOne!');
    // }

    // async executeTransactionQueryOneFile() {
    //     throw new Error('You have to implement the method executeTransactionQueryOneFile!');
    // }

    // async executeTransactionQueryOneScript() {
    //     throw new Error('You have to implement the method executeTransactionQueryOneScript!');
    // }

    // async executeTransactionQueryMany() {
    //     throw new Error('You have to implement the method executeTransactionQueryMany!');
    // }

    // async executeTransactionQueryManyFile() {
    //     throw new Error('You have to implement the method executeTransactionQueryManyFile!');
    // }

    // async executeTransactionQueryManyScript() {
    //     throw new Error('You have to implement the method executeTransactionQueryManyScript!');
    // }

    // async executeTransactionQueryNone() {
    //     throw new Error('You have to implement the method executeTransactionQueryNone!');
    // }

    // async executeTransactionQueryNoneFile() {
    //     throw new Error('You have to implement the method executeTransactionQueryNoneFile!');
    // }

    // async executeTransactionQueryNoneScript() {
    //     throw new Error('You have to implement the method executeTransactionQueryNoneScript!');
    // }

    // async executeTransactionQueryExists() {
    //     throw new Error('You have to implement the method executeTransactionQueryExists!');
    // }
}