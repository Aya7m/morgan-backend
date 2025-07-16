import multer from "multer"
import path from "path"
import fs from "fs"
import { DateTime } from "luxon"
import { nanoid } from "nanoid"
import { extention } from "../utilites/fileExtention.utilites.js"


export const multerMiddleware = ({ filePath = 'general',allowedExtensions } = {}) => {
    const distanationPath = path.resolve(`src/uploads/${filePath}`)
    if (!fs.existsSync(distanationPath)) {
        fs.mkdirSync(distanationPath, { recursive: true })
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, distanationPath)
        },
        filename: (req, file, cb) => {
            const fileNameUnique = DateTime.now().toFormat("yyyy-MM-dd") + "__" + nanoid(4) + "__" + file.originalname
            cb(null, fileNameUnique)
        },



    })


    const fileFilter = (req, file, cb) => {
        if (allowedExtensions?.includes(file.mimetype)) {
            return cb(null, true)
        }
        cb(new AppError('Only .png, .jpg and .jpeg format allowed!', 400), false)


    }

    const fileUpload = multer({ fileFilter, storage ,limits:{fields:6,files:2}})
    return fileUpload

}


export const multerLocalhost=({allowedExtensions=extention.Images})=>{

   
    const storage = multer.diskStorage({})
       



    


    const fileFilter = (req, file, cb) => {
        if (allowedExtensions?.includes(file.mimetype)) {
            return cb(null, true)
        }
       else {
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false)
        }

    }

    const fileUpload = multer({ fileFilter, storage})
    return fileUpload


}