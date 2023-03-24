import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import  cors from  "cors";
import notesRoutes from "./routes/notes";
import userRoutes from "./routes/users";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore from "connect-mongo";
import { requiresAuth } from "./middleware/auth";
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const app = express();
app.use(express.json());

app.options(["http://localhost:3000", "https://todo-plum-iota.vercel.app"], cors());
app.use(cors({ origin: ['http://localhost:3000', 'https://todo-plum-iota.vercel.app'] , credentials : true}));;
app.set("trust proxy",1);
app.use(morgan("dev"));


app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING
    }),
}));

app.get("/", (req,res) => {
    try{
        res.send("Server running");
    }
    catch(err){
        res.status(500).json({message: err});
    }
});

app.use("/api/users", userRoutes);
app.use("/api/notes", requiresAuth, notesRoutes);

app.use((req, res, next) => {
    next(createHttpError(404, "Endpoint not found"));
});

// app.get("/", (req,res) => {
//     try{
//         res.send("Server running");
//     }
//     catch(err){
//         res.status(500).json({message: err});
//     }
// });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;
    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }
    res.status(statusCode).json({ error: errorMessage });
});

export default app;