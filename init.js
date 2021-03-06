import "./db";
import app from "./app";
import dotenv from "dotenv";
import "./models/PartsMoaUser";
import "./models/Parts";
import partsMoaUser from "./models/PartsMoaUser";
import parts from "./models/Parts";
import RepairShop from "./models/RepairShop";
import LikeItems from "./models/LikeItems"
import router from "./router";
import schedule from "node-schedule";
import request from "request";
import client from "cheerio";
import convert, { xml2json } from "xml-js";
dotenv.config();

const PORT = process.env.PORT || 4000;

const handleListening = () => console.log(`✅ Listening on : http://localhost:${PORT}`);

router(app, partsMoaUser, parts, RepairShop, LikeItems);

app.listen(PORT, handleListening);

var options = {
    url: 'http://localhost:4000/likeItemDeleteAll',
    method: 'POST'
}
var options2 = {
    url: 'http://localhost:4000/partsReload',
    method: 'POST'
}
var options3 = {
    url: 'http://localhost:4000/repairShopReload',
    method: 'POST'
}

var hyundaiUrl = {
    url: 'http://localhost:4000/hyundaiCreate',
    method: 'POST'
}
var genesisUrl = {
    url: 'http://localhost:4000/genesisCreate',
    method: 'POST'
}
var kiaUrl = {
    url: 'http://localhost:4000/kiaCreate',
    method: 'POST'
}
var chevroletUrl = {
    url: 'http://localhost:4000/chevroletCreate',
    method: 'POST'
}
var renault_samsungUrl = {
    url: 'http://localhost:4000/renault_samsungCreate',
    method: 'POST'
}
var ssangyongUrl = {
    url: 'http://localhost:4000/ssangyongCreate',
    method: 'POST'
}
var bmwUrl = {
    url: 'http://localhost:4000/bmwCreate',
    method: 'POST'
}
var nissanUrl = {
    url: 'http://localhost:4000/nissanCreate',
    method: 'POST'
}
var landroverUrl = {
    url: 'http://localhost:4000/landroverCreate',
    method: 'POST'
}
var lexusUrl = {
    url: 'http://localhost:4000/lexusCreate',
    method: 'POST'
}
var lincolnUrl = {
    url: 'http://localhost:4000/lincolnCreate',
    method: 'POST'
}
var maseratiUrl = {
    url: 'http://localhost:4000/maseratiCreate',
    method: 'POST'
}
var miniUrl = {
    url: 'http://localhost:4000/miniCreate',
    method: 'POST'
}
var venzUrl = {
    url: 'http://localhost:4000/venzCreate',
    method: 'POST'
}
var bentleyUrl = {
    url: 'http://localhost:4000/bentleyCreate',
    method: 'POST'
}
var volvoUrl = {
    url: 'http://localhost:4000/volvoCreate',
    method: 'POST'
}
var citroenUrl = {
    url: 'http://localhost:4000/citroenCreate',
    method: 'POST'
}
var audiUrl = {
    url: 'http://localhost:4000/audiCreate',
    method: 'POST'
}
var infinitiUrl = {
    url: 'http://localhost:4000/infinitiCreate',
    method: 'POST'
}
var jaguarUrl = {
    url: 'http://localhost:4000/jaguarCreate',
    method: 'POST'
}
var jeepUrl = {
    url: 'http://localhost:4000/jeepCreate',
    method: 'POST'
}
var cadillacUrl = {
    url: 'http://localhost:4000/cadillacCreate',
    method: 'POST'
}
var toyotaUrl = {
    url: 'http://localhost:4000/toyotaCreate',
    method: 'POST'
}
var fordUrl = {
    url: 'http://localhost:4000/fordCreate',
    method: 'POST'
}
var porscheUrl = {
    url: 'http://localhost:4000/porscheCreate',
    method: 'POST'
}
var volkswagenUrl = {
    url: 'http://localhost:4000/volkswagenCreate',
    method: 'POST'
}
var peugeotUrl = {
    url: 'http://localhost:4000/peugeotCreate',
    method: 'POST'
}
var hondaUrl = {
    url: 'http://localhost:4000/hondaCreate',
    method: 'POST'
}

var repairShop = {
    url: 'http://localhost:4000/repairShopCreate',
    method: 'POST'
}
function repairShopInit(){
    request(options3, function(err, res, body){
        if(!err && res.statusCode==200){
            console.log(body);
        }
    });

    request(repairShop, function(err,res,body){
        if(!err && res.statusCode==200){
            console.log(body);
        }
    });
}

function partsItemInit(){

    request(options2, function(err, res, body){
        if(!err && res.statusCode==200){
            console.log(body);
        }
    });
    request(options, function(err, res, body){
        if(!err && res.statusCode==200){
            console.log(body);
        }
    })
    request(hyundaiUrl,function (error, res, body){ // 870
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(genesisUrl,function (error, res, body){ // 56
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(kiaUrl,function (error, res, body){ // 872
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(chevroletUrl,function (error, res, body){   // 376
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(renault_samsungUrl,function (error, res, body){ // 378
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(ssangyongUrl,function (error, res, body){   // 262
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(bmwUrl,function (error, res, body){     // 1225
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(nissanUrl,function (error, res, body){  //  130
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(landroverUrl,function (error, res, body){   // 311
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(lexusUrl,function (error, res, body){   // 337
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(lincolnUrl,function (error, res, body){ //  147
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(maseratiUrl,function (error, res, body){    //   100
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(miniUrl,function (error, res, body){    //   115
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });

    request(venzUrl,function (error, res, body){    //   1062
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(bentleyUrl,function (error, res, body){     //   24
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(volvoUrl,function (error, res, body){   //   256
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(citroenUrl,function (error, res, body){     //  25
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(audiUrl,function (error, res, body){    // 727
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(infinitiUrl,function (error, res, body){    // 163
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(jaguarUrl,function (error, res, body){  // 195
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(jeepUrl,function (error, res, body){    // 121
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(cadillacUrl,function (error, res, body){    // 147
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(toyotaUrl,function (error, res, body){  // 241
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(fordUrl,function (error, res, body){    // 328
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(porscheUrl,function (error, res, body){     // 168
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(volkswagenUrl,function (error, res, body){      // 604
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(peugeotUrl,function (error, res, body){     // 267
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
    request(hondaUrl,function (error, res, body){   // 242
        if(!error && res.statusCode == 200){
            console.log(body);
        }
    });
}
repairShopInit();
partsItemInit();


schedule.scheduleJob('* */6 * * *', () => {

    partsItemInit();

});