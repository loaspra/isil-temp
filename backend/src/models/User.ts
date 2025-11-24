import mongoose, {Schema, Document} from 'mongoose'

export interface ILink {
    name: string
    url: string
    enabled: boolean
    id: number
}

export interface IUser extends Document {
    handle: string
    name: string
    email: string
    password: string
    description: string
    image: string
    links: ILink[]
}

const userSchema = new Schema({
    //Atributos del usuario
    handle: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    name: {
        type: String,
        required : true,
        trim: true //es una función que quita espacios en blanco
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    links: {
        type: [{
            name: {
                type: String,
                trim: true
            },
            url: {
                type: String,
                trim: true
            },
            enabled: {
                type: Boolean,
                default: true
            },
            id: {
                type: Number,
                default: 0
            }
        }],
        default: []
    }
})

//Crear el modelo
const UserModel = mongoose.model<IUser>('User', userSchema)
export default UserModel