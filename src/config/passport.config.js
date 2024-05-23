import { config } from 'dotenv';
config(); // Cargar las variables de entorno desde el archivo .env
import passport from "passport";
import local from "passport-local";
import userModel from "../dao/models/users.models.js";
import githubService from 'passport-github2';
import { createHash, isValidPassword } from "../utils/bycript.js";

const CONFIG = {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASS: process.env.ADMIN_PASS || 'admin123',
    GIT_CLIENT_ID: process.env.GIT_CLIENT_ID,
    GIT_CLIENT_SECRET: process.env.GIT_CLIENT_SECRET,
    REAL_USER_EMAIL: process.env.REAL_USER_EMAIL,
    REAL_USER_PASSWORD: process.env.REAL_USER_PASSWORD
};

const localStrategy = local.Strategy;

const initPassport = () => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    passport.use("register", new localStrategy({
        passReqToCallback: true,
        usernameField: "email",
        session: false
    }, async (req, username, password, done) => {
        try {
            const { first_name, last_name, email, age } = req.body;
            if (!first_name || !last_name || !email || !age) return done(null, false, { message: "Valores incompletos" });
            let user = await userModel.findOne({ email: username });
            if (user) {
                console.log("Error. El usuario ya existe.");
                return done(null, false, { message: "El usuario ya existe" });
            }
            const hashedPassword = await createHash(password);
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: hashedPassword,
            };
            let result = await userModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done("Error para registrar usuario. " + error);
        }
    }));

    passport.use("login", new localStrategy({
        passReqToCallback: true,
        usernameField: "email",
        passwordField: 'password',
        session: false
    }, async (req, username, password, done) => {
        try {
            if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASS) {
                req.session.user = {
                    first_name: 'Coderhouse',
                    last_name: '',
                    rol: 'admin',
                    email: 'adminCoder@coder.com',
                    age: 'N/A'
                };
                return done(null, req.session.user);
            } else {
                const user = await userModel.findOne({ email: username });
                if (!user) {
                    console.log("Error. El usuario no existe.");
                    return done(null, false, { message: 'El usuario no existe' });
                }
                const passwordValidate = await isValidPassword(user, password);
                if (!passwordValidate) {
                    console.log("Error. Las contraseñas no coinciden.");
                    return done(null, false, { message: "Contraseñas no coinciden" });
                }
                req.session.user = {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    age: user.age,
                    rol: 'user'
                };
                return done(null, user);
            }
        } catch (error) {
            return done('Error para iniciar sesión con el usuario. ' + error);
        }
    }));

    passport.use('github', new githubService({
        clientID: CONFIG.GIT_CLIENT_ID,
        clientSecret: CONFIG.GIT_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/session/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            let user = await userModel.findOne({ email });
            if (!user) {
                let newUser = {
                    first_name: profile._json.name.split(' ')[0],
                    last_name: profile._json.name.split(' ')[1] || '',
                    age: 18,
                    email,
                    password: ''
                };
                let result = await userModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    // Registro adicional con el correo electrónico real
    const registerRealEmailUser = async () => {
        const email = CONFIG.REAL_USER_EMAIL;
        let user = await userModel.findOne({ email });
        if (!user) {
            const newUser = {
                first_name: "Shanii",
                last_name: "Gomez",
                email,
                age: 18,
                password: await createHash(CONFIG.REAL_USER_PASSWORD) // Usar la contraseña segura desde el archivo .env
            };
            await userModel.create(newUser);
            console.log("Usuario con correo real registrado");
        } else {
            console.log("Usuario con correo real ya existe");
        }
    };

    registerRealEmailUser();
};

export default initPassport;
