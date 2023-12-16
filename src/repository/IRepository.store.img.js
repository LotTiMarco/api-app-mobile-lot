export default class IRepositoryStoreImg {
    constructor() {
        if (this.constructor === IRepositoryStoreImg) {
            throw new TypeError('Abstract class "IRepositoryStoreImg" cannot be instantiated directly');
        }
    }
    async storeImg() {
        throw new Error('You have to implement the method storeImg!');
    }

    async deleteImg() {
        throw new Error('You have to implement the method deleteImg!');
    }
}