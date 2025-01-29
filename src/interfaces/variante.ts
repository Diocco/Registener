import mongoose, { ObjectId } from "mongoose";

export interface variante {
    _id?: ObjectId|string, 
    producto: ObjectId|string, 
    color: string,
    talle: string,
    SKU: string,
    stock: number,
    esFavorito: boolean,
    usuario:mongoose.Schema.Types.ObjectId 
    save?: () => Promise<void>
    }
