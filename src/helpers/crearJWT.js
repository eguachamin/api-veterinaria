import jwt from 'jsonwebtoken'
import Veterinario from '../models/veterinario.js'


const generarJWT = (id,rol)=>{
    return jwt.sign({id,rol},process.env.JWT_SECRET,{expiresIn:"1d"})
    //ingresar y va a encriptar la información  y le dice que se expire en un día 
}
//Método para verificar token 
const verificarAutenticacion = async (req,res,next)=>{
    //Verifica que xiste el token 

    if(!req.headers.authorization) return res.status(404).json({msg:"Lo sentimos, debes proprocionar un token"})    
        const {authorization} = req.headers
        try {
            const {id,rol} = jwt.verify(authorization.split(' ')[1],process.env.JWT_SECRET)
            //console.log(id,rol) al realizar se puede ver si se confirma o no si no sale
            if (rol==="Veterinario"){
                req.veterinarioBDD = await Veterinario.findById(id).lean().select("-password")
                //console.log(req.veterinarioBDD) // con esto se compruba que funcione
                next()
            }
            
        } catch (error) {
            const e = new Error("Formato del token no válido")
            return res.status(404).json({msg:e.message})
        }
    }

export {
    generarJWT,
    verificarAutenticacion
} 