import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";



const app = express();

const handleHome = (req, res) => res.send("Welcome to Jong-Hwan's server !!");

const get_data = (req, res) => {
    const login_email = req.body.login_email;
    const login_password = req.body.login_password;
    console.log("OK: "+login_email+"/"+login_password);

    res.json({
        email: login_email,
        password: login_password
    });
}

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());  // 보안 관련 미들웨어.
app.use(morgan("dev"));
app.set('view engine', 'pug');

app.get("/", handleHome);
app.get("/form", (req, res) => {
    res.render("form");
});

app.post('/form_receiver', (req,res) => {
    var title = req.body.title;
    var description = req.body.description;
    res.json({
        test_name: title,
        test_descrip: description
    });
});
app.post('/get_data', get_data);

export default app;
