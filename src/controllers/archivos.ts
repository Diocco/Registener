
import { Request, Response } from 'express';

const cargarRegistener = (req: Request, res: Response) => {
    res.render("registener.hbs");
};




export{
    cargarRegistener
}