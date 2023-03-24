import { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt  from 'jsonwebtoken';
import jwtdecode from 'jwt-decode';
import env from "../util/validateEnv";
import UserModel from "../models/user";
import bcrypt from "bcrypt";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    // console.log("running getAuthUser")
    try {
        const user = await UserModel.findById(req.body.userId);
        console.log(user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

interface SignUpBody {
    username?: string,
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;

    try {
        if (!username || !email || !passwordRaw) {
            throw createHttpError(400, "Parameters missing");
        }

        const existingUsername = await UserModel.findOne({ username: username }).exec();

        if (existingUsername) {
            throw createHttpError(409, "Username already taken. Please choose a different one or log in instead.");
        }

        const existingEmail = await UserModel.findOne({ email: email }).exec();

        if (existingEmail) {
            throw createHttpError(409, "A user with this email address already exists. Please log in instead.");
        }

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        const user = await UserModel.create({
            username: username,
            email: email,
            password: passwordHashed,
        });

        var token = jwt.sign({
            id: user._id,
            username: user.username
        }, env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {sameSite: "none", secure: true})
        res.json(user).sendStatus(200)
    } catch (error) {
        next(error);
    }
};

interface LoginBody {
    username?: string,
    password?: string,
}

export const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        if (!username || !password) {
            throw createHttpError(400, "Parameters missing");
        }

        const user = await UserModel.findOne({ username: username }).select("+password +email").exec();

        if (!user) {
            throw createHttpError(401, "Invalid credentials");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw createHttpError(401, "Invalid credentials");
        }
        var token = jwt.sign({
            id: user._id,
            username: user.username
        }, env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {sameSite: "none", secure: true})
        res.json(user).sendStatus(200)
        // res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const logout: RequestHandler = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(200);
        }
    });
};