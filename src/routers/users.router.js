import {Router} from 'express'
import UsersController from '../controllers/users.controller.js'

const router = Router ()

router.get('/', UsersController.getUsers)
router.get('/:uid', UsersController.getUserById)
router.post('/', UsersController.createUser)
router.put('/uid', UsersController.updateUser)
router.delete(':uid',UsersController.deleteUser)

export default router