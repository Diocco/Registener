import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';

export interface CategoriaI {
    _id:ObjectId
    nombre:string,
    estado:boolean,
    usuario:mongoose.Schema.Types.ObjectId, 
    }
