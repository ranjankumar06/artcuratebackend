require('dotenv').config()
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const controller = require('./modules');

const app = express();
const cpus = os.cpus().length;
const port = process.env.PORT;


// if (cluster.isMaster) {
//     console.log(cpus);
//     for (let i = 0; i < cpus; i++) {
//         cluster.fork();
//     }
//     cluster.on('exit', function (worker) {
//         console.log(`worker ${worker.id} exited, respawning...`);
//         console.log(`worker ${worker.process.pid} died`);
//         cluster.fork();
//     });
// } else {

    
    // 'mongodb://localhost/artcurate'
    mongoose.connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true

    }).then(() => {
        console.log("DB Connected");
    }).catch(err => {
        console.log("Error : " + err);
    });

    app.use(cors());

    // app.use(function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    //     next();
    // });

    
    // app.use(function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    //   });
    // app.use(function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    //     next();
    // });

   
    // app.use(function(req, res, next) {
    //     // res.setHeader('Access-Control-Allow-Origin', '*');
    //     // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT ,DELETE');
    //     // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, x-token');
    //     // next();
    //     app.use((req,res,next)=>{
    //         res.setHeader('Acces-Control-Allow-Origin','*');
    //         res.setHeader('Acces-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    //         res.setHeader('Acces-Contorl-Allow-Methods','Content-Type','Authorization',' x-token');
    //         next(); 
    //     })
    //             res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
    //   });

    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(express.json({limit: '50mb'}));

    app.use(cookieParser());

    app.use(controller);
    // Route
    app.get('/', (req,res)=> {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', true);
    res.json({
        message: "Home Route",
        })
    })
    app.listen(port, () => {
        console.log('Server Running on Port ' + port);
    });
// }