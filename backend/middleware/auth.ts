import { RequestHandler } from "express";
import createHttpError from "http-errors";
import  jwt, { JwtPayload } from 'jsonwebtoken';
// import "dotenv/config";
import env from "../util/validateEnv";
export const requiresAuth: RequestHandler = (req, res, next) => {
    const authenticatedUserId:any = req.headers.cookie?.slice(6, req.headers.cookie.length);
    console.log("running middleware");
    console.log(req.headers.cookie?.slice(6, req.headers.cookie.length));

    var user:any= jwt.verify(authenticatedUserId, env.JWT_SECRET);
    // console.log(user);
    if (user) {
        req.body.userId = user.id;
        console.log("sending user id");
        // next(user);
        next();
    } else {
        next(createHttpError(401, "User not authenticated"));
    }
};


