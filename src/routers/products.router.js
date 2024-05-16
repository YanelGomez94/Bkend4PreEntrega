import {Router} from 'express'
import productsController from '../controllers/products.controller.js'
import { isAdmin } from "../middlewares/isAdmin.js"

const router = Router ()

router.get('/', productsController.getProducts)
router.get('/:pid', productsController.getProductById)
router.post('/', isAdmin,productsController.createProduct)
router.put('/:pid',isAdmin, productsController.updateProduct)
router.delete('/:pid', isAdmin,productsController.deleteProduct)

export default router