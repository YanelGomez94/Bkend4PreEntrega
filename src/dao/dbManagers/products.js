import productsModel from '../models/products.models.js'

export default class Products{

    constructor(){
        //console.log('Trabajando con productos en mongoDB')
    }

    getProducts = async() => {
        let products = await productsModel.find().lean()
        return products;
    }

    getProductById = async(id) => {
        let product = await productsModel.findOne({_id: id})
        return product;
    }

    createProduct = async (product) => {
        let result = await productsModel.create(product)
        return result
    }

    updateProduct = async (id, product) => {
        let result = []
        const exist = await this.getById(id)
        if(exist)
            result = await productsModel.updateOne({_id: id}, product)
        else
            result = false
        return result
    }

    deleteProduct = async (id) => {
        let result = []
        const exist = await this.getById(id)
        if(exist)
            result = await productsModel.deleteOne({_id: id})
        else
            result = false
        return result
    }
}