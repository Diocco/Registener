import { ObjectId } from "mongoose"

export interface ElementoCarritoI{
    SKU:string,
    cantidad:number,
    precio:number,
    nombre:string
    _id?:ObjectId
}