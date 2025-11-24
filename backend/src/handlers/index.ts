import {Request, Response} from 'express'
import {validationResult} from 'express-validator'
import User from "../models/User"
import { checkPassword, hashPassword } from '../utils/auth'
import slug from 'slug'
import jwt from 'jsonwebtoken'
import { generateJWT } from '../utils/jwt'
import formidable from 'formidable'
import { v4 as uuid } from 'uuid'
import cloudinary from '../config/cloudinary'

export const createAccount = async(req: Request, res: Response)=>{

    const {email, password, handle} = req.body

    const userExists = await User.findOne({email}) //findOne es como un where en bd relacionales

    if(userExists){
        const error = new Error('El usuario ya está registrado')
        return res.status(409).json({error: error.message})
    }

    //Otra forma de agregar datos / instanciar el modelo User:
    const user = new User(req.body)
    user.password = await hashPassword(password)

    console.log(slug(handle, ''))
    
    //Hash contraseñas:
    //const hash = await hashPassword(password)
    //console.log(hash)
    //

    await user.save()

    res.status(201).send('Registro creado correctamente')
}

export const login = async (req: Request, res: Response) => {
    //Manejar errores
    let errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()})
    }

    const {email, password} = req.body

    const user = await User.findOne({email})

    if(!user){
        const error = new Error('El usuario no existe')
        return res.status(404).json({error: error.message})
    }
    
    //Comprobar el password
    //console.log(user.password)
    //checkPassword(password, user.password)

    const isPasswordCorrect = await checkPassword(password, user.password)

    if(!isPasswordCorrect){
        const error = new Error('Password incorrecto')
        return res.status(401).json({error: error.message})
        //401: porque no está autorizado a acceder al recurso
    }
    
    //res.send('Autenticado...')

    //Hasta aquí tenemos un usuario que ingresó correctamente, entonces:
    const token = generateJWT({id: user._id})
    res.send(token)

}

export const getUser = async(req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links, image } = req.body
        const requestedHandle = req.body.handle ? slug(req.body.handle, '') : req.user.handle

        if (requestedHandle && requestedHandle !== req.user.handle) {
            const handleExists = await User.findOne({ handle: requestedHandle })
            if (handleExists && handleExists.email !== req.user.email) {
                const error = new Error('Nombre de usuario no disponible')
                return res.status(409).json({ error: error.message })
            }
            req.user.handle = requestedHandle
        }

        if (typeof description === 'string') {
            req.user.description = description
        }

        if (Array.isArray(links)) {
            req.user.links = links
        }

        if (typeof image === 'string' && image.length) {
            req.user.image = image
        }

        await req.user.save()
        res.send('Perfil actualizado correctamente')
    } catch (error) {
        const err = new Error('Hubo un error')
        return res.status(500).json({ error: err.message })
    }
}

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.params
        const user = await User.findOne({ handle }).select('-password -email -__v')
        
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }
        
        res.json(user)
    } catch (error) {
        const err = new Error('Hubo un error')
        return res.status(500).json({ error: err.message })
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    try {
        const form = formidable({ multiples: false })
        form.parse(req, (err, _fields, files) => {
            if (err) {
                const error = new Error('Hubo un error al procesar el archivo')
                return res.status(500).json({ error: error.message })
            }

            const file = (files.file as formidable.File[] | undefined)?.[0]
            if (!file?.filepath) {
                const error = new Error('No se recibió ningún archivo')
                return res.status(400).json({ error: error.message })
            }

            cloudinary.uploader.upload(file.filepath, { public_id: uuid() })
                .then(async result => {
                    if (result?.secure_url) {
                        req.user.image = result.secure_url
                        await req.user.save()
                        return res.json({ image: result.secure_url })
                    }
                    const error = new Error('Hubo un error al subir la imagen')
                    return res.status(500).json({ error: error.message })
                })
                .catch(() => {
                    const error = new Error('Hubo un error al subir la imagen')
                    return res.status(500).json({ error: error.message })
                })
        })
    } catch (e) {
        const error = new Error('Hubo un error')
        return res.status(500).json({ error: error.message })
    }
}
