import { getData ,getPage, getRepairShop } from "./scraper";
import multer from "multer";
import fs from "fs";
import path from "path";
import mime from "mime"
import { count } from "console";
import e from "express";

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null,'images/');
        },
        filename: (req, file, cb) => {
            cb(null,new Date().valueOf() + path.extname(file.originalname));
        }
    }),
});

module.exports = function(app, PartsMoaUser, Parts, RepairShop, LikeItems, ){
    const Maker = function(id){
        this.id = id;
        this.lineUpList = [];
    }
    
    const LineUp = function(id, year){
        this.id = id;
        this.year = year;
    }
    async function insertItem(maker){
        const categoryList = [ 2010, 2020, 2030, 2040];
        let count = 0;
        let makerid = maker.id;

        for (let lineup of maker.lineUpList){
            for (let year of lineup.year){
                for(let category of categoryList){
                    var testurl = `https://gogomotors.co.kr/theme/basic/shop/search_iframe.php?qcaid=${makerid}${lineup.id}${year}&qsort=it_id&qorder=desc&ca_id=${category}&page=`; 
                        
                    const page_result = await getPage(testurl);
                    if(page_result == -1) {
                        let result = await getData(testurl,-1);
                        for(var i = 0; i<result.length; i++){
                            // console.log(result[i]);
        
                            var parts = new Parts();
                            parts.id = makerid+lineup.id+year;
                            parts.ca_id = category;
                            parts.img = result[i].img;
                            parts.url = result[i].url;
                            parts.text = result[i].txt;
                            parts.price = result[i].price;
        
                            parts.save((err) => {
                                if(err){
                                    console.error(err);
                                    //res.json({message: "생성실패..."});
                                    return;
                                }
                                count++;
                                //console.log(`makerid:${makerid}, count =${count}`);
                                //console.log(parts);
                            });
                        }
                    } else {

                        for (var page = 0; page<page_result; page++){    // 페이지별 아이템 정보 스크래핑 해와서 DB 저장.
        
                            let result = await getData(testurl,page+1);

                                for(var i = 0; i<result.length; i++){
                                //    console.log(result[i]);
                
                                    var parts = new Parts();
                                    parts.id = makerid+lineup.id+year;
                                    parts.ca_id = category;
                                    parts.img = result[i].img;
                                    parts.url = result[i].url;
                                    parts.text = result[i].txt;
                                    parts.price = result[i].price;
                
                                    parts.save((err) => {
                                        if(err){
                                            console.error(err);
                                            //res.json({message: "생성실패..."});
                                            return;
                                        }
                                        count++;
                                        //console.log(`makerid:${makerid}, count =${count}`);
                                        //console.log(parts);
                                    });
                                }
                            
                        }
                    }
                }
            }
        }
        return `makerid=${makerid} / done ! ${count}`;
    }

    app.post('/userImageUpload',upload.single('image'), (req,res) => {
        res.json(req.file);
        console.log(req.file.filename);
        console.log(req.body.email);
    });

    // Create
    app.post('/sign_in', (req,res) => {
        var join_partsUser = new PartsMoaUser();
        join_partsUser.username = req.body.join_username;
        join_partsUser.email = req.body.join_email;
        join_partsUser.password = req.body.join_password;
        join_partsUser.carid = req.body.join_carid;
        join_partsUser.carinfo = req.body.join_carinfo;

        join_partsUser.save((err) => {
            if(err) {
                console.error(err);
                res.json({message: '생성 실패..'});
                return;
            }
            console.log(join_partsUser);
            res.json({ 
                username: join_partsUser.username,
                email: join_partsUser.email,
                password: join_partsUser.password,
                carid: join_partsUser.carid,
                carinfo: join_partsUser.carinfo
            });
        });
    });

    app.post('/likeItemCheck', (req, res) => {
        var message = "empty";
        LikeItems.find({'useremail': {$eq: req.body.user_email}}, (err, docs) => {
            console.log(docs);
            for(let likeItem of docs){
                if(likeItem.itemurl == req.body.item_url){
                    message = "exist";
                }
            }
            res.json(`${message}`);
        })
        
    })

    app.post('/likeItemload', (req,res) => {
        LikeItems.find({'useremail':{$eq: req.body.user_email}}).populate("likeItem").exec((err, data) => {
            if(err){
                console.error(err);
                res.status(500).send('like item load error!');
            }
            // console.log(data[2].likeItem);
            var itemList = [];
            for(let item of data){
                itemList.push(item.likeItem);
                // res.json(item.likeItem);
            }
            res.json(itemList);
            // res.json(data.likeItem);
        })
        // LikeItems.find({'useremail':{$eq: req.body.user_email}},(err, docs) => {
        //     console.log(docs);
        //     console.log(docs.length);
        //     var items = ""
        //     for(var i=0; i<docs.length; i++){
        //         console.log(docs[i].itemurl);
        //         Parts.find({'url': {$eq: docs[i].itemurl}}, (err, data) => {
        //             if(err){
        //                 console.error(err);
        //             }
        //             console.log(data);
        //         });
        //         console.log("out of find function: ");
                
        //     }

        //     if(err){
        //         console.error(err);
        //         res.status(500).send('like item load error!');
        //     }
        // })

    })


    app.post('/likeItemUpdate', (req,res) =>{
        // var like_items = new LikeItems();
        // like_items.useremail = req.body.user_email;
        // like_items.itemurl = req.body.item_url;

        // console.log(req.body.user_email);
        // console.log(req.body.item_url);

        Parts.findOne({'url': {$eq: req.body.item_url}}, (err, data) => {
            if(err){
                console.error(err);
            }
            console.log(data);
            var like_items = new LikeItems();
            like_items.useremail = req.body.user_email;
            like_items.likeItem = data._id;
            like_items.itemurl = req.body.item_url;
            like_items.save((err) => {
                if(err){
                    console.error(err);
                    res.json({message:'like Item create Error'});
                    return;
                }
                console.log(like_items);
                res.json({message: 'like Item Create OK'});
            });
        });

        // like_items.save((err) =>{
        //     if(err){
        //         console.error(err);
        //         res.json({message:'like Item create error!'});
        //         return;
        //     }
        //     console.log(like_items);
        //     res.json({message:'likeItem Create OK'});
        // });
        
    });

    app.post('/likeItemDelete', (req,res) => {
        LikeItems.remove({itemurl: req.body.item_url, useremail: req.body.user_email}, (err) =>{
            if(err){
                console.error(err);
                res.json({message:'like Item delete error!'});
                return;
            }
            res.json({message: 'like Item delete OK'});
        });
    });

    app.post('/likeItemDeleteAll', (req, res) => {
        LikeItems.remove({}, (err, result) =>{
            if(err) console.error(err);
            console.log(result);
        });
    });

    //Read
    app.post('/join_emailCheck', (req, res) => {
        var login_email = req.body.join_email;
        console.log(login_email);
        PartsMoaUser.findOne({'email':{$eq:login_email}}, (err, partsUser) => {

            //console.log(partsUser);
            if(err){
                return res.status(500).send();
            }
            if(partsUser == null){
                console.log(partsUser);
                console.log("Email Check..OK.. Join Continue ! ");
                return res.json({
                    email: "join_continue"
                });
            } else if(partsUser.email == login_email){
                console.log("Email Check.. Exist.. Please input another Email.");
                return res.json({
                    email: "exist"
                });
            }
            res.json();
        });
    });

    app.post('/profiledownload', (req, res) => {
        var login_email = req.body.email;
        console.log(req.body.email);
        PartsMoaUser.findOne({'email': {$eq:login_email}}, (err, partsUser) => {
            console.log(partsUser.imgprofile);
            if(partsUser.imgprofile == null){
                var defaultProfile = "images/defaultProfile.jpeg";

                fs.readFile(defaultProfile, (err,data) => {
                    console.log(data);
                    res.writeHead(200,{'Content-Type': mime.getType(defaultProfile)});
                    res.end(data);
                });
            }else{
                fs.readFile(partsUser.imgprofile, (err,data) => {
                    console.log(data);
                    res.writeHead(200,{'Content-Type':mime.getType(partsUser.imgprofile)});
                    res.end(data);
                });
            }
        })
    });
    
    app.post('/cardownload', (req, res) => {
        var login_email = req.body.email;
        console.log(req.body.email);
        PartsMoaUser.findOne({'email': {$eq:login_email}}, (err, partsUser) => {
            console.log(partsUser.imgCar);
            if(partsUser.imgCar == null){
                var defaultCar = "images/defaultCar.jpg";

                fs.readFile(defaultCar, (err, data) => {
                    console.log(data);
                    res.writeHead(200,{'Content-Type': mime.getType(defaultCar)});
                    res.end(data);
                });
            } else {
                fs.readFile(partsUser.imgCar, (err,data) => {
                    console.log(data);
                    res.writeHead(200,{'Content-Type':mime.getType(partsUser.imgCar)});
                    res.end(data);
                });
            }
        });
    });
    
    app.post('/login', (req, res) => {
        var login_email = req.body.login_email;
        var login_password = req.body.login_password;
        console.log("[REQUEST: android -> node]");
        console.log(login_email+"\n"+login_password);

        PartsMoaUser.findOne({'email': {$eq:login_email}},(err, partsUsers) => {
            if(err){
                console.error(err);
                return res.status(500).send({error: 'Mongo Read Error'});
            }
            if(partsUsers == null){
                console.log("User Info : Null .. ");
                return res.status(400).send();
            } else if(partsUsers.password != login_password){
                console.log("Password not correct!!");
                return res.status(402).send();
            }
            console.log("Mongo DB : User check read");
            console.log(partsUsers);
            console.log("-----------------");
            console.log(partsUsers.username);
            console.log(partsUsers.email);
            console.log(partsUsers.password);
            console.log(partsUsers.carid);
            console.log(partsUsers.imgprofile);
            console.log(partsUsers.imgCar);

            res.json({
                username: partsUsers.username,
                email: partsUsers.email,
                password: partsUsers.password,
                carid: partsUsers.carid,
                carinfo: partsUsers.carinfo,
            });
            res.status(200).send();
        });
    });

    function encode_base64(filename){
        fs.readFile(filename, (err,data) => {
            var buffer = Buffer.from(data);
            var base64 = buffer.toString('base64');
            console.log(base64);
            return base64;
        })
    }

    app.post("/userUpdateWithImg",upload.array('image'), (req, res) => {
        console.log(req.files[0].destination+req.files[0].filename);
        console.log(req.files[1].destination+req.files[1].filename);
        console.log(req.body.email);
        console.log(req.body.carid);
        console.log(req.body.carinfo);
        console.log(req.body.password);
        PartsMoaUser.update({ email: req.body.email}, { $set: {carid: req.body.carid, carinfo: req.body.carinfo, password: req.body.password,
                        imgprofile: req.files[0].destination+req.files[0].filename, imgCar: req.files[1].destination+req.files[1].filename}}, (err,user) => {
            if(err){
                console.error(err);
                return res.status(500).send({error:'Parts User read error!'});
            }
            console.log(user);
            res.json({message: 'User Update OK'});
        });

    });

    app.post("/userUpdateWithProfile",upload.single('image'), (req, res) => {
        console.log(req.file.destination+req.file.filename);
        console.log(req.body.email);
        console.log(req.body.carid);
        console.log(req.body.carinfo);
        console.log(req.body.password);
        PartsMoaUser.update({ email: req.body.email}, { $set: {carid: req.body.carid, carinfo: req.body.carinfo, password: req.body.password,
                        imgprofile: req.file.destination+req.file.filename }}, (err,user) => {
            if(err){
                console.error(err);
                return res.status(500).send({error:'Parts User read error!'});
            }
            console.log(user);
            res.json({message: 'User Update OK'});
        });
    });

    app.post("/userUpdateWithCar",upload.single('image'), (req, res) => {
        console.log(req.file.destination+req.file.filename);
        console.log(req.body.email);
        console.log(req.body.carid);
        console.log(req.body.carinfo);
        console.log(req.body.password);
        PartsMoaUser.update({ email: req.body.email}, { $set: {carid: req.body.carid, carinfo: req.body.carinfo, password: req.body.password,
                        imgCar: req.file.destination+req.file.filename }}, (err,user) => {
            if(err){
                console.error(err);
                return res.status(500).send({error:'Parts User read error!'});
            }
            console.log(user);
            res.json({message: 'User Update OK'});
        });
    });

    app.post("/userUpdate", (req, res) => {
        console.log(req.body.email);
        console.log(req.body.carid);
        console.log(req.body.carinfo);
        console.log(req.body.password);
        PartsMoaUser.update({ email: req.body.email}, { $set: {carid: req.body.carid, carinfo: req.body.carinfo, password: req.body.password }}, (err,user) => {
            if(err){
                console.error(err);
                return res.status(500).send({error:'Parts User read error!'});
            }
            console.log(user);
            res.json({message: 'User Update OK'});
        });
    });

    app.post("/loadItem", (req, res) => {
        var carid = req.body.carid;
        console.log(carid);
        Parts.find({'id':{$eq:carid}},(err, docs) =>{
            if(err){
                console.error(err);
                return res.status(500).send({error:'Parts item read error!'});
            }
            console.log(docs);
            res.json(docs);
        });
    });
    app.post("/loadItemWithCategory", (req, res) => {
        var carid = req.body.carid;
        var ca_id = req.body.ca_id;
        console.log(carid);
        console.log(ca_id);
        Parts.find({'id':{$eq:carid},'ca_id':{$eq:ca_id}},(err, docs) =>{
            if(err){
                console.error(err);
                return res.status(500).send({error:'Parts item read error!'});
            }
            console.log(docs);
            res.json(docs);
        });
    });

    app.post("/loadRepairShop", (req, res) => {
        var latitude = req.body.lat;
        var longitude = req.body.lng;
        console.log(`${latitude}/${longitude}`);
        // 1km 이내 자동차 공업소 정보.
        RepairShop.find({'lat':{$lte:latitude+0.045,$gte:latitude-0.045},'lng':{$lte:longitude+0.0560,$gte:longitude-0.0560}}, (err, docs) => {
            if(err){
                console.error(err);
                return res.status(500).send({error:'Repair shop read error!'});
            }
            console.log(docs);
            res.json(docs);
        });
    });

    app.post('/partsReload',(req, res) => {
        Parts.remove({},function(err,result){
            if(err){ console.log(err)}
            else { /*console.log("Result: ", result)*/}
        });
    });

    app.post('/hyundaiCreate', async(req,res) => {

        //-------------hyundai-------------
        let i30 = new LineUp('10',['10','20','30']); // 07~11, 11~16, 16
        let i40 = new LineUp('20',['10']); // 11~
        let grandeur = new LineUp('30',['10','20','30','40']); // 3세대(98~05), 4세대(05~ 11), 5세대(11~ 16), 6세대(16~)
        let migthy = new LineUp('40',['10','20']); // 2세대(98-15), 3g(15~)
        let maxcruz = new LineUp('50',['10']); //1g(13-19)
        let veracruz = new LineUp('60',['10']); // 1g(06-15)
        let venue = new LineUp('65',['10']); // 1g(19~)
        let verna = new LineUp('70',['10','20']); // 1g(99~05) , 2g(05-10)
        let veloster = new LineUp('80',['10','20']); // 1g(11-17) 2g(18-)
        let starex = new LineUp('90',['10','20']); // 1g(97-07) 2g(07~ )
        let santafe = new LineUp('a0',['10','20','30']); //2g(05~12) 3g(12-18) 4g(18-)
        let sonata = new LineUp('b0',['10','20','30','40','50']); // 4g(98-04) 5g(04-09) 6g(09-14) 7g(14-19) 8g(19-)
        let avante = new LineUp('d0',['10','20','30','40']); // 2g(00-06) 3g(06-10) 4g(10-15) 5g(15-)
        let ioniq = new LineUp('f0',['10']); //1g(16-)
        let equus = new LineUp('g0',['10','20']); //1g(99-08) 2g(09-15)
        let kona = new LineUp('j3',['10']); // 1g(17-)
        let tucson = new LineUp('n0',['10','20','30']); // 1g(01-09) 2g(09-15) 3g(15-)
        let palisade = new LineUp('o5',['10']); // 1g(18-)
        let porter = new LineUp('p0',['10']); // 4g(04-)

        var hyundai = new Maker('3011');
        
        hyundai.lineUpList.push(i30);
        hyundai.lineUpList.push(i40);
        hyundai.lineUpList.push(grandeur);
        hyundai.lineUpList.push(migthy);
        hyundai.lineUpList.push(maxcruz);
        hyundai.lineUpList.push(veracruz);
        hyundai.lineUpList.push(venue);
        hyundai.lineUpList.push(verna);
        hyundai.lineUpList.push(veloster);
        hyundai.lineUpList.push(starex);
        hyundai.lineUpList.push(santafe);
        hyundai.lineUpList.push(sonata);
        hyundai.lineUpList.push(avante);
        hyundai.lineUpList.push(ioniq);
        hyundai.lineUpList.push(equus);
        hyundai.lineUpList.push(kona);
        hyundai.lineUpList.push(tucson);
        hyundai.lineUpList.push(palisade);
        hyundai.lineUpList.push(porter);

        var result = await insertItem(hyundai);
        res.json({message: result});
    });

    app.post('/genesisCreate',async(req,res) => {
        //--------------genesis---------------
        let g70 = new LineUp('05',['10']); // 1g(17 -)
        let g80 = new LineUp('10',['10']); // 1g(16 -)
        let g90 = new LineUp('20',['10']); // 1g(15 -)
        
        var genesis = new Maker('3012');
        genesis.lineUpList.push(g70);
        genesis.lineUpList.push(g80);
        genesis.lineUpList.push(g90);

        var result = await insertItem(genesis);

        res.json({message: result});
    });

    app.post('/kiaCreate', async(req, res) => {
        //--------------kia---------------

        var kia = new Maker('3013');

        let k3 = new LineUp('10',['10','20']); // 1g(12-18) 2g(18-)
        let k5 = new LineUp('20',['10','20','30']); // 1g(10-15) 2g(15-19) 3g(19-)
        let k7 = new LineUp('30',['10','20']); //1g(09-16) 2g(16-)
        let k9 = new LineUp('40',['10','20']); //1g(12-18) 2g(18-)
        let niro = new LineUp('50',['16']); // 1g(16-)
        let ray = new LineUp('60',['10']); // 1g(11-)
        let lotze = new LineUp('70',['10']); // 1g(05-10)
        let morning = new LineUp('80',['10','20','30']); // 1g(04-11) 2g(11-17) 3g(17-)
        let mohave = new LineUp('90',['10']); // 1g(08-)
        let bongo = new LineUp('a0',['10']); // 4g(04-)
        let seltos = new LineUp('a2',['10']); // 1g(19-)
        let stonic = new LineUp('a4',['10']); // 1g(17-)
        let stinger = new LineUp('b0',['10']); // 1g(17-)
        let sportage = new LineUp('c0',['10','20','30']); // 2g(04-10) 3g(10-15) 4g(16-)
        let cerato = new LineUp('d0',['10']); // 1g(03-08)
        let sorento = new LineUp('e0',['10','20','30']); // 1g(99-09) 2g(09-14) 3g(14-)
        let soul = new LineUp('f0',['10','20','30']); // 1g(08-13) 2g(13-19) 3g(19-)
        let opirus = new LineUp('g0',['10']); // 1g(03-11)
        let optima = new LineUp('h0',['10']); // 1g(00-05)
        let carnival = new LineUp('i0',['10','20','30']); // 1g(01-05) 2g(05-14) 3g(14-)
        let carens = new LineUp('j0',['10','20','30']); // 1g(02-06) 2g(06-13) 3g(13-18)
        let forte = new LineUp('k0',['10']); // 1g(08-13)
        let pride = new LineUp('l0',['10','20']); // 2g(05-11) 3g(11-17)

        kia.lineUpList.push(k3);
        kia.lineUpList.push(k5);
        kia.lineUpList.push(k7);
        kia.lineUpList.push(k9);
        kia.lineUpList.push(niro);
        kia.lineUpList.push(ray);
        kia.lineUpList.push(lotze);
        kia.lineUpList.push(morning);
        kia.lineUpList.push(mohave);
        kia.lineUpList.push(bongo);
        kia.lineUpList.push(seltos);
        kia.lineUpList.push(stonic);
        kia.lineUpList.push(stinger);
        kia.lineUpList.push(sportage);
        kia.lineUpList.push(cerato);
        kia.lineUpList.push(sorento);
        kia.lineUpList.push(soul);
        kia.lineUpList.push(opirus);
        kia.lineUpList.push(optima);
        kia.lineUpList.push(carnival);
        kia.lineUpList.push(carens);
        kia.lineUpList.push(forte);
        kia.lineUpList.push(pride);

        var result = await insertItem(kia);

        res.json({message: result});
    });

    app.post('/chevroletCreate',async(req,res) => {
       //--------------chevrolet---------------
       var chevrolet = new Maker('3014');

       let damas = new LineUp('20',['10']); // 1g(08-)
       let labo = new LineUp('30',['10']); // 1g(08-)
       let lacetti = new LineUp('40',['10','20']); // 1g(02-08) 2g(08-11)
       let matiz = new LineUp('50',['10','20']); // 2g(05-09) 3g(09-11)
       let malibu = new LineUp('60',['10','20']); // 8g(11-16) 9g(16-)
       let bolt = new LineUp('80',['10']); // 2g(16-)
       let spark = new LineUp('a0',['10','20']); // 1g(11-15) 2g(15-)
       let aveo = new LineUp('b0',['10']); // 2g(11-)
       let alpheon = new LineUp('c0',['10']); // 1g(10-15)
       let orlando = new LineUp('d0',['10']); // 1g(11-18)
       let winstorm = new LineUp('e0',['10']); // 1g(06-10)
       let equinox = new LineUp('e5',['10']); // 1g(18-)
       let impala = new LineUp('f0',['10']); // 10g(15-)
       let camaro = new LineUp('h0',['10','20']); // 5g(11-15) 6g(16-)
       let captiva = new LineUp('j0',['10']); // 1g(11-18)
       let colorado = new LineUp('j5',['10']); // 2g(19-)
       let cruze = new LineUp('k0',['10','20']); // 1g(10-17) 2g(17-18)
       let tosca = new LineUp('l0',['10']); // 1g(06-10)
       let traverse = new LineUp('l5',['10']); // 2g(19-)
       let trax = new LineUp('m0',['10']); // 1g(13-)
       
       chevrolet.lineUpList.push(damas);
       chevrolet.lineUpList.push(labo);
       chevrolet.lineUpList.push(lacetti);
       chevrolet.lineUpList.push(matiz);
       chevrolet.lineUpList.push(malibu);
       chevrolet.lineUpList.push(bolt);
       chevrolet.lineUpList.push(spark);
       chevrolet.lineUpList.push(aveo);
       chevrolet.lineUpList.push(alpheon);
       chevrolet.lineUpList.push(orlando);
       chevrolet.lineUpList.push(winstorm);
       chevrolet.lineUpList.push(equinox);
       chevrolet.lineUpList.push(impala);
       chevrolet.lineUpList.push(camaro);
       chevrolet.lineUpList.push(captiva);
       chevrolet.lineUpList.push(colorado);
       chevrolet.lineUpList.push(cruze);
       chevrolet.lineUpList.push(tosca);
       chevrolet.lineUpList.push(traverse);
       chevrolet.lineUpList.push(trax);
       
       var result = await insertItem(chevrolet);
       res.json({message: result});
    });

    app.post('/renault_samsungCreate',async(req,res) => {
        //--------------renault_samsung---------------
        var renault_samsung = new Maker('3015');

        let sm3 = new LineUp('10',['10','20']); // 1g(02-11) 2g(09-)
        let sm5 = new LineUp('20',['10','20','30']); // 1g(98-05) 2g(05-10) 3g(10-19)
        let sm6 = new LineUp('30',['10']); // 1g(16-)
        let sm7 = new LineUp('40',['10','20']); // 1g(04-11) 2g(11-)
        let qm3 = new LineUp('50',['10']); // 1g(13-)
        let qm5 = new LineUp('60',['10']); // 1g(07-15)
        let qm6 = new LineUp('70',['10']); // 1g(16-)
        let master = new LineUp('72',['10']); // 3g(18-) 
        let clio = new LineUp('75',['10']); // 4g(18-)
        let twizy = new LineUp('80',['10']); // 1g(12-)

        renault_samsung.lineUpList.push(sm3);
        renault_samsung.lineUpList.push(sm5);
        renault_samsung.lineUpList.push(sm6);
        renault_samsung.lineUpList.push(sm7);
        renault_samsung.lineUpList.push(qm3);
        renault_samsung.lineUpList.push(qm5);
        renault_samsung.lineUpList.push(qm6);
        renault_samsung.lineUpList.push(master);
        renault_samsung.lineUpList.push(clio);
        renault_samsung.lineUpList.push(twizy);

        var result = await insertItem(renault_samsung);

        res.json({message: result});
    });

    app.post('/ssangyongCreate', async(req,res) => {
        //--------------ssangyong---------------
        
        var ssangyong = new Maker('3016');

        let rexton = new LineUp('10',['10','20','30','40']); // 1g(01-06) 2g(06-12) 3g(12-17) g4(17-)
        let rextonSport = new LineUp('15',['10']); // 1g(18-) 
        let rodius = new LineUp('20',['10']); // 1g(04-13) 
        let musso = new LineUp('30',['10']); // 1g(93-06)
        let actyon = new LineUp('40',['10']); // 1g(05-11)
        let chairman = new LineUp('50',['10','20']); // 1g(97-11) 2g(08-17)
        let kyron = new LineUp('60',['10']); // 1g(05-11)
        let korando = new LineUp('70',['10','20','30']); // 2g(06-05) 3g-korandoC(11-19) 4g(19-)
        let korandoSport = new LineUp('80',['10']); // 1g(12-19)
        let korandoTurismo = new LineUp('90',['10']); // 1g(13-19)
        let tivoli = new LineUp('a0',['10']); // 1g(15-)
        let tivoliair = new LineUp('b0',['10']); // 1g(16)

        ssangyong.lineUpList.push(rexton);
        ssangyong.lineUpList.push(rextonSport);
        ssangyong.lineUpList.push(rodius);
        ssangyong.lineUpList.push(musso);
        ssangyong.lineUpList.push(actyon);
        ssangyong.lineUpList.push(chairman);
        ssangyong.lineUpList.push(kyron);
        ssangyong.lineUpList.push(korando);
        ssangyong.lineUpList.push(korandoSport);
        ssangyong.lineUpList.push(korandoTurismo);
        ssangyong.lineUpList.push(tivoli);
        ssangyong.lineUpList.push(tivoliair);
        
        var result = await insertItem(ssangyong);

        res.json({message: result});
    });

    app.post('/bmwCreate', async(req,res) => {
        //--------------bmw---------------
        var bmw = new Maker('3021');

        let the1 = new LineUp('10',['10','20','30']); // 1g(04-11) 2g(12-19) 3g(19-)
        let the2 = new LineUp('20',['10']); // 1g(13-)
        let the3 = new LineUp('30',['10','20','30','40']); // 4g(98-05) 5g(05-11) 6g(12-19) 7g(19-)
        let the4 = new LineUp('40',['10']); // 1g(14-)
        let the5 = new LineUp('50',['10','20','30','40']); // 4g(95-03) 5g(03-09) 6g(10-17) 7g(17-)
        let the6 = new LineUp('60',['10','20','30']); // 2g(03-10) 3g(11-17) 4g(17-)
        let the7 = new LineUp('70',['10','20','30']); // 4g(01-08) 5g(08-15) 6g(15-)
        let the8 = new LineUp('80',['10']); // 1g(18-) 
        let m1 = new LineUp('90',['10']); // 1g(11-19) 
        let m2 = new LineUp('a0',['10']); // 1g(16-) 
        let m3 = new LineUp('b0',['10','20','30']); // 3g(00-07) 4g(07-14) 5g(14-18) 
        let m4 = new LineUp('c0',['10']); // 1g(14-) 
        let m5 = new LineUp('d0',['10','20','30','40']); // 3g(99-03) 4g(05-10) 5g(11-17) 6g(18-) 
        let m6 = new LineUp('e0',['10','20']); // 2g(05-10) 3g(12-18) 
        let m8 = new LineUp('e5',['10']); // 1g(19-)
        let x1 = new LineUp('f0',['10','20']); // 1g(09-15) 2g(16-)
        let x2 = new LineUp('f5',['10']); // 1g(18-)
        let x3 = new LineUp('g0',['10','20','30']); // 1g(04-10) 2g(11-17) 3g(18-)
        let x4 = new LineUp('h0',['10','20']); // 1g(14-18) 2g(18-)
        let x5 = new LineUp('i0',['10','20','30','40']); // 1g(99-06) 2g(07-13) 3g(14-18) 4g(18-)
        let x6 = new LineUp('j0',['10','20']); // 1g(08-14) 2g(14-)
        let x7 = new LineUp('l0',['10']); // 1g(18-)
        let z3 = new LineUp('m0',['10']); //1g(95-02)
        let z4 = new LineUp('n0',['10','20','30']); //1g(02-09) 2g(09-16) 3g(19-)
        let z8 = new LineUp('o0',['10']); //1g(99-03)
        let i3 = new LineUp('r0',['10']); // 1g(14-)
        let i8 = new LineUp('s0',['10']); // 1g(15-)        

        bmw.lineUpList.push(the1);
        bmw.lineUpList.push(the2);
        bmw.lineUpList.push(the3);
        bmw.lineUpList.push(the4);
        bmw.lineUpList.push(the5);
        bmw.lineUpList.push(the6);
        bmw.lineUpList.push(the7);
        bmw.lineUpList.push(the8);
        bmw.lineUpList.push(m1);
        bmw.lineUpList.push(m2);
        bmw.lineUpList.push(m3);
        bmw.lineUpList.push(m4);
        bmw.lineUpList.push(m5);
        bmw.lineUpList.push(m6);
        bmw.lineUpList.push(m8);
        bmw.lineUpList.push(x1);
        bmw.lineUpList.push(x2);
        bmw.lineUpList.push(x3);
        bmw.lineUpList.push(x4);
        bmw.lineUpList.push(x5);
        bmw.lineUpList.push(x6);
        bmw.lineUpList.push(x7);
        bmw.lineUpList.push(z3);
        bmw.lineUpList.push(z4);
        bmw.lineUpList.push(z8);
        bmw.lineUpList.push(i3);
        bmw.lineUpList.push(i8);
        
        var result = await insertItem(bmw);

        res.json({message: result});
    });

    app.post('/nissanCreate',async(req,res) => {
        //--------------nissan---------------

        var nissan = new Maker('3028');

        let gt_r = new LineUp('20',['10']); // 1g(01-)
        let rogue = new LineUp('30',['10','20']); // 1g(07-13) 2g(13-)
        let leaf = new LineUp('40',['10','20']); // 1g(10-17) 2g(17-)
        let maxima = new LineUp('50',['10']); // 1g(15-)
        let murano = new LineUp('60',['10','20','30']); // 1g(02-07) 2g(07-14) 3g(14-)
        let altima = new LineUp('70',['10','20','30']); // 1g(06-12) 2g(12-18) 3g(18-)
        let juke = new LineUp('80',['10']); // 1g(10-18)
        let qashqai = new LineUp('90',['10','20']); // 1g(06-13) 2g(13-)
        let cube = new LineUp('a0',['10','20']); // 2g(02-09) 3g(09-)
        let pathfinder = new LineUp('b0',['10']); // 4g(12-)

        nissan.lineUpList.push(gt_r);
        nissan.lineUpList.push(rogue);
        nissan.lineUpList.push(leaf);
        nissan.lineUpList.push(maxima);
        nissan.lineUpList.push(murano);
        nissan.lineUpList.push(altima);
        nissan.lineUpList.push(juke);
        nissan.lineUpList.push(qashqai);
        nissan.lineUpList.push(cube);
        nissan.lineUpList.push(pathfinder);

        var result = await insertItem(nissan);

        res.json({message: result});
    });

    app.post('/landroverCreate',async(req,res) => {
        //--------------landrover---------------

        var landrover = new Maker('302a');
        
        let discovery = new LineUp('10',['10','20','30']); // 3g(04-09) 4g(09-17) 5g(17-)
        let discovery_sport = new LineUp('20',['10']); // 1g(14-)
        let rangerover = new LineUp('30',['10','20']); // 3g(02-12) 4g(12-)
        let rangerover_velar = new LineUp('40',['10']); // 1g(17-)
        let rangerover_sport = new LineUp('50',['10','20']); // 1g(05-13) 2g(13-)
        let rangerover_evoke = new LineUp('60',['10','20']); // 1g(11-18) 2g(18-)
        let freelander = new LineUp('70',['10']); // 2g(06-14)

        landrover.lineUpList.push(discovery);
        landrover.lineUpList.push(discovery_sport);
        landrover.lineUpList.push(rangerover);
        landrover.lineUpList.push(rangerover_sport);
        landrover.lineUpList.push(rangerover_velar);
        landrover.lineUpList.push(rangerover_evoke);
        landrover.lineUpList.push(freelander);

        var result = await insertItem(landrover);

        res.json({message: result});
    });

    app.post('/lexusCreate',async(req,res) => {
        //-------------Lexus---------------
        let ct = new LineUp('10',['10']);   // 10~ , 
        let is = new LineUp('50',['10','20','30']); // 98~05, 05-13, 13-
        let es = new LineUp('20',['10','20','30','40']); // 01-06 , 06-12, 12-18, 18-
        let gs = new LineUp('30',['10','20','30']); // 97-04, 05-12, 12-19
        let ls = new LineUp('70',['10','20','30']); // 00-06, 06-16, 18-
        var Lexus = new Maker('3025');
        Lexus.lineUpList.push(ct);
        Lexus.lineUpList.push(is);
        Lexus.lineUpList.push(es);
        Lexus.lineUpList.push(gs);
        Lexus.lineUpList.push(ls);

        var result = await insertItem(Lexus);

        res.json({message: result});
    });

    app.post('/lincolnCreate', async(req,res) => {
        //--------------lincoln---------------

        var lincoln = new Maker('302c');

        let ls_lincoln = new LineUp('10',['10']); // 1g(00-06)
        let mks = new LineUp('30',['10']); // 1g(09-16)
        let mkx = new LineUp('40',['10','20']); // 1g(07-15) 2g(16-18)
        let mkz = new LineUp('50',['10','20']); //1g(05-12) 2g(12-)
        let notilus = new LineUp('55',['10']); // 1g(18-)
        let aviator = new LineUp('60',['10','20']); // 1g(03-05) 2g(19-)
        let continental = new LineUp('70',['10']); // 10g(17-)

        lincoln.lineUpList.push(ls_lincoln);
        lincoln.lineUpList.push(mks);
        lincoln.lineUpList.push(mkx);
        lincoln.lineUpList.push(mkz);
        lincoln.lineUpList.push(notilus);
        lincoln.lineUpList.push(aviator);
        lincoln.lineUpList.push(continental);

        var result = await insertItem(lincoln);
        res.json({message: result});
    });

    app.post('/maseratiCreate',async(req,res) => {
        //--------------maserati---------------

        var maserati = new Maker('302d');

        let granturismo = new LineUp('20',['10']); //1g(07-)
        let ghibli = new LineUp('30',['10']); // 3g(13-)
        let levante = new LineUp('40',['10']); // 1g(17-)
        let quattroporte = new LineUp('50',['10','20']); //5g(03-12) 6g(13-)

        maserati.lineUpList.push(granturismo);
        maserati.lineUpList.push(ghibli);
        maserati.lineUpList.push(levante);
        maserati.lineUpList.push(quattroporte);

        var result = await insertItem(maserati);

        res.json({message: result});
    });

    app.post('/miniCreate', async(req,res) => {
        //--------------mini---------------

        var mini = new Maker('3026');

        let convertible = new LineUp('20',['10','20','30']); // 1g(05-08) 2g(09-15) 3g(16-)
        let contryman = new LineUp('30',['10','20']); // 1g(11-16) 2g(17-)
        let cooper = new LineUp('40',['10']); // 1g(12-15)
        let clubman = new LineUp('50',['10','20']); // 1g(08-14) 2g(15-)
        let hatch = new LineUp('70',['10','20','30']); // 1g(01-06) 2g(07-14) 3g(14-)

        mini.lineUpList.push(convertible);
        mini.lineUpList.push(contryman);
        mini.lineUpList.push(cooper);
        mini.lineUpList.push(clubman);
        mini.lineUpList.push(hatch);

        var result = await insertItem(mini);

        res.json({message: result});
    });

    app.post('/venzCreate', async(req,res) => {
        //--------------venz---------------

        var venz = new Maker('3022');

        let a_class = new LineUp('10',['10','20','30']); // 2g(04-12) 3g(13-18) 4g(18-)
        let b_class = new LineUp('20',['10','20','30']); // 1g(05-11) 2g(12-19) 3g(19-) 
        let c_class = new LineUp('30',['10','20','30']); // 2g(00-07) 3g(07-14) 4g(14-)
        let cl_class = new LineUp('40',['10','20']); // 2g(99-06) 3g(06-13)
        let cla = new LineUp('50',['10','20']); // 1g(14-18) 2g(19-)
        let clk = new LineUp('60',['10','20']); // 1g(96-03) 2g(03-09)
        let cls = new LineUp('70',['10','20','30']); // 1g(04-10) 2g(10-18) 3g(19-)
        let e_class = new LineUp('80',['10','20','30','40']); // 2g(95-02) 3g(02-09) 4g(09-16) 5g(16-)
        let eqc = new LineUp('85',['10']); // 1g(19-)
        let g_class = new LineUp('90',['10','20']); // 2g(09-18) 3g(18-)
        let gla = new LineUp('b0',['10']); // 1g(14-)
        let glc = new LineUp('c0',['10']); // 1g(16-)
        let gle = new LineUp('d0',['10','20']); // 1g(16-19) 2g(19-)
        let glk = new LineUp('e0',['10']); // 1g(09-15)
        let gls = new LineUp('f0',['10']); // 1g(16-)
        let m_class = new LineUp('g0',['10','20','30']); // 1g(97-05) 2g(05-12) 3g(11-16)
        let s_class = new LineUp('i0',['10','20','30','40']); // 3g(91-99) 4g(98-06) 5g(06-13) 6g(14-)
        let sl_class = new LineUp('j0',['10','20']); // 5g(02-12) 6g(12-)
        let slc = new LineUp('k0',['10']); // 3g(16-)
        let slk = new LineUp('l0',['10','20','30']); // 1g(96-04) 2g(04-10) 3g(10-16)
        let amgGT = new LineUp('o0',['10']); // 1g(14-)

        venz.lineUpList.push(a_class);
        venz.lineUpList.push(b_class);
        venz.lineUpList.push(c_class);
        venz.lineUpList.push(cl_class);
        venz.lineUpList.push(cla);
        venz.lineUpList.push(clk);
        venz.lineUpList.push(cls);
        venz.lineUpList.push(e_class);
        venz.lineUpList.push(eqc);
        venz.lineUpList.push(g_class);
        venz.lineUpList.push(gla);
        venz.lineUpList.push(glc);
        venz.lineUpList.push(gle);
        venz.lineUpList.push(glk);
        venz.lineUpList.push(gls);
        venz.lineUpList.push(m_class);
        venz.lineUpList.push(s_class);
        venz.lineUpList.push(sl_class);
        venz.lineUpList.push(slc);
        venz.lineUpList.push(slk);
        venz.lineUpList.push(amgGT);

        var result = await insertItem(venz);

        res.json({message: result});
        
    });
//--------------------------------------------------
    app.post('/bentleyCreate',async(req,res) => {

        var bentley = new Maker('302f');

        let mulsanne = new LineUp('10',['10']); // 2g(09-)
        let bentayga = new LineUp('15',['10']); // 1g(16-)
        let continental = new LineUp('20',['10','20','30']); // 1g(03-11) 2g(11-17) 3g(17-)
        let flyingSpur = new LineUp('30',['10','20','30']); // 1g(05-13) 2g(13-19) 3g(19-)

        bentley.lineUpList.push(mulsanne);
        bentley.lineUpList.push(bentayga);
        bentley.lineUpList.push(continental);
        bentley.lineUpList.push(flyingSpur);
        
        var result = await insertItem(bentley);

        res.json({message: result});
    });

    app.post('/volvoCreate',async(req,res) => {

        var volvo = new Maker('302g');

        let c30 = new LineUp('10',['10']); // 1g(07-13)
        let c70 = new LineUp('20',['10']); // 2g(06-13)
        let s40 = new LineUp('30',['10']); // 2g(04-12)
        let s60 = new LineUp('40',['10','20','30']); // 1g(00-09) 2g(10-18) 3g(18-)
        let s70 = new LineUp('50',['10']); // 1g(97-00)
        let s80 = new LineUp('60',['10','20']); // 1g(98-06) 2g(06-16)
        let s90 = new LineUp('70',['10']); // 2g(16-)
        let v40 = new LineUp('80',['10']); // 2g(13-)
        let v50 = new LineUp('90',['10']); // 1g(04-12)
        let v60 = new LineUp('a0',['10','20']); // 1g(11-18) 2g(18-)
        let v70 = new LineUp('b0',['10']); // 3g(07-16)
        let xc60 = new LineUp('d0',['10','20']); // 1g(08-17) 2g(17-)
        let xc70 = new LineUp('e0',['10']); // 3g(07-16)
        let xc90 = new LineUp('f0',['10','20']); // 1g(02-15) 2g(15-) 

        volvo.lineUpList.push(c30);
        volvo.lineUpList.push(c70);
        volvo.lineUpList.push(s40);
        volvo.lineUpList.push(s60);
        volvo.lineUpList.push(s70);
        volvo.lineUpList.push(s80);
        volvo.lineUpList.push(s90);
        volvo.lineUpList.push(v40);
        volvo.lineUpList.push(v50);
        volvo.lineUpList.push(v60);
        volvo.lineUpList.push(v70);
        volvo.lineUpList.push(xc60);
        volvo.lineUpList.push(xc70);
        volvo.lineUpList.push(xc90);
        
        var result = await insertItem(volvo);

        res.json({message: result});
    });

    app.post('/citroenCreate',async(req,res) => {

        var citroen = new Maker('302j');

        let c3_aircross = new LineUp('03',['10']); // 1g(17-)
        let c4_spacetourer = new LineUp('07',['10']); // 1g(18-)
        let c4_cactus = new LineUp('10',['10']);    // 1g(14-)
        let c4_picasso = new LineUp('20',['10']);   // 2g(13-17)
        let c4_aircross = new LineUp('25',['10']);  // 1g(17-)
        let ds3 = new LineUp('30',['10','20']);     // 1g(09-18) 2g(19-)
        let ds4 = new LineUp('40',['10']);      // 1g(10-18)
        let ds5 = new LineUp('50',['10']);      // 1g(10-18)
        let ds7 = new LineUp('60',['10']);      // 1g(19-)
        
        citroen.lineUpList.push(c3_aircross);
        citroen.lineUpList.push(c4_spacetourer);
        citroen.lineUpList.push(c4_cactus);
        citroen.lineUpList.push(c4_picasso);
        citroen.lineUpList.push(c4_aircross);
        citroen.lineUpList.push(ds3);
        citroen.lineUpList.push(ds4);
        citroen.lineUpList.push(ds5);
        citroen.lineUpList.push(ds7);

        var result = await insertItem(citroen);

        res.json({message: result});
    });

    app.post('/audiCreate',async(req,res) => {

        var audi = new Maker('3023');

        let a1 = new LineUp('10',['10']); // 1g(10-)
        let a3 = new LineUp('20',['10','20']); // 2g(03-12) 3g(12-) 
        let a4 = new LineUp('30',['10','20','30','40']); // 2g(01-04) 3g(04-08) 4g(09-15) 5g(15-)
        let a5 = new LineUp('40',['10','20']); // 1g(07-16) 2g(16-)
        let a6 = new LineUp('50',['10','20','30','40']); // 2g(97-04) 3g(04-11) 4g(11-19) 5g(19-)
        let a7 = new LineUp('60',['10','20']); // 1g(10-17) 2g(18-)
        let a8 = new LineUp('70',['10','20','30']); // 2g(02-09) 3g(09-17) 4g(18-)
        let s3 = new LineUp('80',['10','20']); // 2g(06-13) 3g(13-)
        let s4 = new LineUp('90',['10','20','30','40']);  // 2g(03-05) 3g(05-09) 4g(09-16) 5g(16-)
        let s5 = new LineUp('a0',['10','20']);  // 1g(07-16) 2g(16-)
        let s6 = new LineUp('b0',['10','20','30','40']);  // 2g(99-03) 3g(06-11) 4g(12-19) 5g(19-)
        let s7 = new LineUp('c0',['10']);   // 1g(12-)
        let s8 = new LineUp('d0',['10','20']); // 2g(02-12) 3g(12-)
        let tt = new LineUp('e0',['10','20','30']); // 1g(98-06) 2g(06-14) 3g(14-)
        let tts = new LineUp('f0',['10','20']);     // 2g(06-14) 3g(14-)
        let tt_rs = new LineUp('g0',['10','20']);    // 2g(06-14) 3g(14-)
        let rs3 = new LineUp('h0',['10','20']); // 2g(03-12) 3g(12-)
        let rs4 = new LineUp('i0',['10','20','30']);    // 1g(06-08) 2g(12-15) 3g(18-)
        let rs5 = new LineUp('j0',['10','20']);     // 1g(10-16) 2g(16-)
        let rs6 = new LineUp('k0',['10','20','30']);    // 2g(02-04) 3g(08-10) 4g(12-)
        let rs7 = new LineUp('l0',['10']);  // 1g(13-)
        let q3 = new LineUp('m0',['10']);   // 1g(11-)
        let q5 = new LineUp('n0',['10','20']);      // 1g(08-17) 2g(17-)
        let q7 = new LineUp('o0',['10','20']);      // 1g(05-15) 2g(15-)
        let sq5 = new LineUp('p0',['10','20']);     // 1g(13-17) 2g(17-)
        let sq7 = new LineUp('q0',['10']);      // 2g(15-)
        let rs_q3 = new LineUp('r0',['10']);    // 1g(13-)
        let r8 = new LineUp('s0',['10','20']);      // 1g(07-15) 2g(15-)

        audi.lineUpList.push(a1);
        audi.lineUpList.push(a3);
        audi.lineUpList.push(a4);
        audi.lineUpList.push(a5);
        audi.lineUpList.push(a6);
        audi.lineUpList.push(a7);
        audi.lineUpList.push(a8);
        audi.lineUpList.push(s3);
        audi.lineUpList.push(s4);
        audi.lineUpList.push(s5);
        audi.lineUpList.push(s6);
        audi.lineUpList.push(s7);
        audi.lineUpList.push(s8);
        audi.lineUpList.push(tt);
        audi.lineUpList.push(tts);
        audi.lineUpList.push(tt_rs);
        audi.lineUpList.push(rs3);
        audi.lineUpList.push(rs4);
        audi.lineUpList.push(rs5);
        audi.lineUpList.push(rs6);
        audi.lineUpList.push(rs7);
        audi.lineUpList.push(q3);
        audi.lineUpList.push(q5);
        audi.lineUpList.push(q7);
        audi.lineUpList.push(sq5);
        audi.lineUpList.push(sq7);
        audi.lineUpList.push(rs_q3);
        audi.lineUpList.push(r8);
        
        var result = await insertItem(audi);

        res.json({message: result});
    });

    app.post('/infinitiCreate',async(req,res) => {

        var infiniti = new Maker('302k');

        let ex = new LineUp('10',['10']);   // 1g(08-12)
        let fx = new LineUp('20',['10','20']);   // 1g(03-08) 2g(08-13)
        let g = new LineUp('30',['10','20']);   // 3g(02-07) 4g(06-15)
        let jx35 = new LineUp('40',['10']);     //1g(12-13)
        let m = new LineUp('50',['10','20']);   //4g(04-10) 5g(10-12)
        let q30 = new LineUp('60',['10']);      //1g(15-)
        let q50 = new LineUp('70',['10']);      //4g(14-)
        let q60 = new LineUp('80',['10','20']);      // cv36(14-17) cv37(17-)
        let q70 = new LineUp('90',['10']);      // 4g(13-19)
        let qx30 = new LineUp('a0',['10']);     // 1g(16-)
        let qx50 = new LineUp('b0',['10','20']);    //1g(13-18) 2g(18-)
        let qx60 = new LineUp('c0',['10']);     //1g(13-)
        let qx70 = new LineUp('d0',['10']);     //2g(13-18)
        let qx80 = new LineUp('e0',['10']);     //1g(10-)

        infiniti.lineUpList.push(ex);
        infiniti.lineUpList.push(fx);
        infiniti.lineUpList.push(g);
        infiniti.lineUpList.push(jx35);
        infiniti.lineUpList.push(m);
        infiniti.lineUpList.push(q30);
        infiniti.lineUpList.push(q50);
        infiniti.lineUpList.push(q60);
        infiniti.lineUpList.push(q70);
        infiniti.lineUpList.push(qx30);
        infiniti.lineUpList.push(qx50);
        infiniti.lineUpList.push(qx60);
        infiniti.lineUpList.push(qx70);
        infiniti.lineUpList.push(qx80);

        var result = await insertItem(infiniti);

        res.json({message: result});
    });

    app.post('/jaguarCreate',async(req,res) => {

        var jaguar = new Maker('302l');

        let e_face = new LineUp('05',['10']);   // 1g(18-)
        let f_type = new LineUp('10',['10']);   // 1g(13-)
        let f_face = new LineUp('20',['10']);   // 1g(16-)
        let i_face = new LineUp('25',['10']);   // 1g(18-)
        let s_type = new LineUp('30',['10']);   // 1g(00-08)
        let x_type = new LineUp('40',['10']);   // 1g(01-09)
        let xe = new LineUp('50',['10']);       // 1g(15-)
        let xf = new LineUp('60',['10','20']);  // 1g(08-15) 2g(16-)
        let xj = new LineUp('70',['10','20']);   // 4g(03-09) 5g(09-)
        let xk = new LineUp('80',['10']);   // 2g(06-14)

        jaguar.lineUpList.push(e_face);
        jaguar.lineUpList.push(f_type);
        jaguar.lineUpList.push(f_face);
        jaguar.lineUpList.push(i_face);
        jaguar.lineUpList.push(s_type);
        jaguar.lineUpList.push(x_type);
        jaguar.lineUpList.push(xe);
        jaguar.lineUpList.push(xf);
        jaguar.lineUpList.push(xj);
        jaguar.lineUpList.push(xk);
        

        var result = await insertItem(jaguar);

        res.json({message: result});
    });

    app.post('/jeepCreate',async(req,res) => {

        var jeep = new Maker('302m');

        let grandCherokee = new LineUp('10',['10','20','30']);  //2g(99-05) 3g(05-10) 4g(10-)
        let wrangler = new LineUp('20',['10','20','30']);     //2g(97-06) 3g(07-18) 4g(18-)
        let renegade = new LineUp('30',['10']);     // 1g(14-)
        let cheroke = new LineUp('40',['10','20']);     //3g(02-07) 5g(13-)
        let commander = new LineUp('45',['10']);        //1g(06-10)
        let compass = new LineUp('50',['10','20']);     //1g(07-17) 2g(17-)

        jeep.lineUpList.push(grandCherokee);
        jeep.lineUpList.push(wrangler);
        jeep.lineUpList.push(renegade);
        jeep.lineUpList.push(cheroke);
        jeep.lineUpList.push(commander);
        jeep.lineUpList.push(compass);

        var result = await insertItem(jeep);

        res.json({message: result});
    });

    app.post('/cadillacCreate',async(req,res) => {

        var cadillac = new Maker('302n');

        let ats = new LineUp('10',['10']);  // 1g(13-)
        let bls = new LineUp('20',['10']);  // 2g(05-09)
        let ct6 = new LineUp('30',['10']);  // 1g(16-)
        let cts = new LineUp('40',['10','20','30']);  // 1g(03-07) 2g(08-14) 3g(14-)
        let dts = new LineUp('50',['10']);      //1g(06-11)
        let srx = new LineUp('60',['10','20']);      //1g(04-09) 2g(10-16)
        let sts = new LineUp('70',['10','20']);     //1g(04-07) 2g(08-12)
        let xt5 = new LineUp('80',['10']);      //1g(16-)
        let deville = new LineUp('90',['10']);  //8g(00-05)
        let seville = new LineUp('a0',['10']);  //5g(98-04)
        let escalade = new LineUp('b0',['10','20']); //3g(06-14) 4g(15-)

        cadillac.lineUpList.push(ats);
        cadillac.lineUpList.push(bls);
        cadillac.lineUpList.push(ct6);
        cadillac.lineUpList.push(cts);
        cadillac.lineUpList.push(dts);
        cadillac.lineUpList.push(srx);
        cadillac.lineUpList.push(sts);
        cadillac.lineUpList.push(xt5);
        cadillac.lineUpList.push(deville);
        cadillac.lineUpList.push(seville);
        cadillac.lineUpList.push(escalade);

        var result = await insertItem(cadillac);

        res.json({message: result});
    });

    app.post('/toyotaCreate',async(req,res) => {

        var toyota = new Maker('302p');

        let _86 = new LineUp('10',['10']);  //1g(12-)
        let fjcruiser = new LineUp('20',['10']);    //1g(06-16)
        let rav4 = new LineUp('30',['10','20','30']);   //3g(05-13) 4g(13-18) 5g(19-)
        let venza = new LineUp('40',['10']);    //1g(08-15)
        let sienna = new LineUp('50',['10']);   //3g(11-)
        let avalon = new LineUp('60',['10','20','30']);    // 3g(05-12) 4g(12-18) 5g(18-)
        let camry = new LineUp('70',['10','20','30','40']); // 6g(06-11) 7g(11-14) 8g(15-17) 9g(18-)
        let corolla = new LineUp('80',['10']);  // 10g(06-13)
        let prius = new LineUp('90',['10','20']);       //3g(09-15) 4g(15-)

        toyota.lineUpList.push(_86);
        toyota.lineUpList.push(fjcruiser);
        toyota.lineUpList.push(rav4);
        toyota.lineUpList.push(venza);
        toyota.lineUpList.push(sienna);
        toyota.lineUpList.push(avalon);
        toyota.lineUpList.push(camry);
        toyota.lineUpList.push(corolla);
        toyota.lineUpList.push(prius);

        var result = await insertItem(toyota);

        res.json({message: result});
    });

    app.post('/fordCreate',async(req,res) => {

        var ford = new Maker('3027');

        let f_series = new LineUp('10',['10','20','30']);   // 11g(04-08) 12g(09-14) 13g(15-)
        let mustang = new LineUp('20',['10','20','30']);  // 4g(94-04) 5g(05-14) 6g(15-)
        let mondeo = new LineUp('30',['10','20','30']);     //2g(00-07) 3g(07-14) 4g(14-)
        let escape = new LineUp('40',['10','20','30','40']);    // 1g(00-06) 2g(07-12) 3g(12-19) 4g(19-)
        let explorer = new LineUp('50',['10','20']);    //5g(10-19) 6g(19-)
        let kuga = new LineUp('60',['10','20']);    //1g(08-12) 2g(12-)
        let taurus = new LineUp('70',['10','20','30']); // 4g(00-07) 5g(07-09) 6g(09-19)
        let five_hundred = new LineUp('80',['10']);     //1g(04-07)
        let focus = new LineUp('90',['10','20']);   //3g(11-18) 4g(18-)
        let fusion = new LineUp('a0',['10','20']);   //1g(05-12) 2g(12-)

        ford.lineUpList.push(f_series);
        ford.lineUpList.push(mustang);
        ford.lineUpList.push(mondeo);
        ford.lineUpList.push(escape);
        ford.lineUpList.push(explorer);
        ford.lineUpList.push(kuga);
        ford.lineUpList.push(taurus);
        ford.lineUpList.push(five_hundred);
        ford.lineUpList.push(focus);
        ford.lineUpList.push(fusion);
        
        var result = await insertItem(ford);

        res.json({message: result});
    });

    app.post('/porscheCreate',async(req,res) => {

        var porsche = new Maker('302q');

        let _911 = new LineUp('10',['10','20','30']);   //1g(05-12) 2g(12-18) 3g(19-)
        let macan = new LineUp('20',['10']);    //1g(14-)
        let boxster = new LineUp('30',['10','20','30']);    //2g(05-12) 3g(12-16) 4g(16-)
        let cayman = new LineUp('40',['10','20','30']);   //2g(05-12) 3g(12-16) 4g(17-)
        let cayenne = new LineUp('50',['10','20','30','40']);   //1g(02-06) 1.5g(07-10) 2g(11-17) 3g(17-)
        let panamera = new LineUp('60',['10','20']);    //1g(09-16) 2g(16-)

        porsche.lineUpList.push(_911);
        porsche.lineUpList.push(macan);
        porsche.lineUpList.push(boxster);
        porsche.lineUpList.push(cayman);
        porsche.lineUpList.push(cayenne);
        porsche.lineUpList.push(panamera);

        var result = await insertItem(porsche);

        res.json({message: result});
    });

    app.post('/volkswagenCreate',async(req,res) => {

        var volkswagen = new Maker('3024');

        let cc = new LineUp('10',['10']);   //1g(08-17)
        let eos = new LineUp('20',['10']);  //1g(06-14)
        let golf = new LineUp('30',['10','20','30','40']);  //4g(97-03) 5g(03-08) 6g(08-12) 7g(13-)
        let beetle = new LineUp('40',['10','20']);      //2g(97-11) 3g(11-19)
        let scirocco = new LineUp('50',['10']);     //3g(08-18)
        let arteon = new LineUp('55',['10']);   //1g(18-)
        let jetta = new LineUp('60',['10','20','30']);  //5g(05-11) 6g(11-17) 7g(18-)
        let passat = new LineUp('70',['10','20','30']); //6g(05-11) 7g(11-15) 8g(15-)
        let phaeton = new LineUp('80',['10']);  //1g(02-16)
        let polo = new LineUp('90',['10','20']);    //5g(09-17) 6g(18-)
        let touareg = new LineUp('a0',['10','20','30']);    //1g(02-10) 2g(10-18) 3g(18-)
        let tiguan = new LineUp('b0',['10','20']);  //1g(07-15) 2g(15-)
        
        volkswagen.lineUpList.push(cc);
        volkswagen.lineUpList.push(eos);
        volkswagen.lineUpList.push(golf);
        volkswagen.lineUpList.push(beetle);
        volkswagen.lineUpList.push(scirocco);
        volkswagen.lineUpList.push(arteon);
        volkswagen.lineUpList.push(jetta);
        volkswagen.lineUpList.push(passat);
        volkswagen.lineUpList.push(phaeton);
        volkswagen.lineUpList.push(polo);
        volkswagen.lineUpList.push(touareg);
        volkswagen.lineUpList.push(tiguan);

        var result = await insertItem(volkswagen);

        res.json({message: result});
    });

    app.post('/peugeotCreate',async(req,res) => {

        var peugeot = new Maker('302r');

        let _206 = new LineUp('10',['10']); //1g(98-12)
        let _207 = new LineUp('20',['10']); //1g(06-14)
        let _208 = new LineUp('30',['10']); //1g(12-19)
        let _307 = new LineUp('40',['10']); //1g(01-08)
        let _308 = new LineUp('50',['10','20']);    //1g(08-13) 2g(13-)
        let _407 = new LineUp('60',['10']); //1g(04-10)
        let _508 = new LineUp('70',['10','20']);    //1g(11-18) 2g(18-)
        let _607 = new LineUp('80',['10']); //1g(99-10)
        let _2008 = new LineUp('90',['10']);    //1g(13-)
        let _3008 = new LineUp('a0',['10','20']);   //1g(08-16) 2g(16-)
        let _5008 = new LineUp('a5',['10','20']);   //1g(09-16) 2g(17-)
        let rcz = new LineUp('b0',['10']);  //1g(09-15)

        peugeot.lineUpList.push(_206);
        peugeot.lineUpList.push(_207);
        peugeot.lineUpList.push(_208);
        peugeot.lineUpList.push(_307);
        peugeot.lineUpList.push(_308);
        peugeot.lineUpList.push(_407);
        peugeot.lineUpList.push(_508);
        peugeot.lineUpList.push(_607);
        peugeot.lineUpList.push(_2008);
        peugeot.lineUpList.push(_3008);
        peugeot.lineUpList.push(_5008);
        peugeot.lineUpList.push(rcz);
        
        var result = await insertItem(peugeot);

        res.json({message: result});
    });

    app.post('/hondaCreate',async(req,res) => {

        var honda = new Maker('302u');

        let cr_v = new LineUp('10',['10','20','30']);   //3g(07-11) 4g(11-16) 5g(17)
        let cr_z = new LineUp('20',['10']); //1g(10-16)
        let hr_v = new LineUp('30',['10']); //2g(14-)
        let legend = new LineUp('40',['10','20']);  //4g(04-12) 5g(14-)
        let civic = new LineUp('50',['10','20','30']);  //8g(05-11) 9g(11-15) 10g(15-)
        let accord = new LineUp('60',['10','20','30','40']);    //7g(02-07) 8g(08-12) 9g(12-17) 10g(18-)
        let odyssey = new LineUp('70',['10','20']); //4g(11-17) 5g(18-)
        let insight = new LineUp('80',['10']);  //2g(09-14)
        let crosstour = new LineUp('90',['10']);    //1g(10-15)
        let pilot = new LineUp('a0',['10','20']);   //2g(08-15) 3g(16-)
        
        honda.lineUpList.push(cr_v);
        honda.lineUpList.push(cr_z);
        honda.lineUpList.push(hr_v);
        honda.lineUpList.push(legend);
        honda.lineUpList.push(civic);
        honda.lineUpList.push(accord);
        honda.lineUpList.push(odyssey);
        honda.lineUpList.push(insight);
        honda.lineUpList.push(crosstour);
        honda.lineUpList.push(pilot);
        
        var result = await insertItem(honda);

        res.json({message: result});
    });

    

    app.post('/repairShopCreate', (req, res) => { // 자동차 정비 업체 정보 db 저장.
        getRepairShop().then(function (result){
            // var repairshop = new RepairShop();

            for(var i = 0; i<result.length; i++){
                console.log(result[i]);

                var repair = new RepairShop();
                
                repair.name = result[i].name;
                repair.rdnmadr = result[i].rdnmadr;
                repair.lnmadr = result[i].lnmadr;
                repair.lat = result[i].lat;
                repair.lng = result[i].lng;
                repair.phone = result[i].phone;
                repair.openTime = result[i].opentime;
                repair.closeTime = result[i].closetime;
                repair.save((err) => {
                    if(err){
                        console.error(err);
                        res.json({message: "생성실패..."});
                        return;
                    }
                    console.log(repair);
                });
            }
        });
    });

}