import { ObjectId } from "mongoose";

export interface MetodoPagoI {
    _id?:ObjectId;
    nombre: string;        // Nombre del método de pago
    tipo: "Digital" | "Bancario" | "Efectivo"; // Tipo del método de pago
    estado: boolean;       // Estado (activo o inactivo)
    save?: () => Promise<void>
}