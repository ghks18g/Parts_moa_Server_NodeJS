import client from "cheerio";
import e from "express";
import request from "request";

const PAGE_START = 1;
let PAGE_CURRENT = PAGE_START
let PAGE_END;

let ulList = [];

String.prototype.replaceAll = function(src, des){
    return this.split(src).join(des);
}
export function getPage(url) {
    return new Promise(resolve => {
        request(url, function(err,res,body){
            const $ = client.load(body);
            const endPageUrl = $("nav.pg_wrap span.pg").find('a.pg_page.pg_end').attr('href');
            
            try {
                var result = endPageUrl.split("page=");
                // console.log(result[1]);
                resolve(result[1]);
            }catch(exeption) {
            //    console.log(exeption);
               if(result == null){
            //    console.log("this url not have page");
                resolve(-1);
            }
            }
                 
        });
    });
}

export function getData(source_url,page) {
    
    var url ="";
    if(page == -1) {
        url = source_url;
    }else{
        url = source_url+page;
    }
    var item = [];
    return new Promise(resolve => {
                request(url, function(err, res, body){
                    const $ = client.load(body);
                    // console.log(`---------------${url}----------------`);
                    const $bodyList = $("ul.sct_10").children("li.sct_li");
                    
                    $bodyList.each(function(i, element){
                        let g_img = $(this).find('div.sct_img a img').attr('src');
                        let g_url = $(this).find('div.sct_img a').attr('href');
                        let g_txt = $(this).find('div.sct_txt a').text().replaceAll("\n","");
                        let g_price = $(this).find('div.sct_cost').text().replaceAll("\n","");
                        
                        item[i] = {
                            img: g_img,
                            url: g_url,
                            txt: g_txt,
                            price: g_price
                        };

                    });
                    resolve(item);
                });
            
        });
}

export function getRepairShop(){
    
    let repair_info_api_key="c8ylZBiYVOXRJ%2FNp8dnxbl5xazjAWmJniKC%2BRjns8FBxFgK2dcMOZ31LBk7mE82TVySKZQ2cWTGkDtDC5doMEg%3D%3D";
    let testUrl=`http://api.data.go.kr/openapi/tn_pubr_public_auto_maintenance_company_api?serviceKey=${repair_info_api_key}&pageNo=0&numOfRows=35000&type=xml`;
    var list = [];

    return new Promise(resolve => {
        request(testUrl,function(err,res,body){
            const $ = client.load(body);
            $('item').each(function(idx){
                let name = $(this).find('inspofcNm').text();
                let rdnmadr = $(this).find('rdnmadr').text();
                let lnmadr = $(this).find('lnmadr').text();
                let lat = $(this).find('latitude').text();
                let lng = $(this).find('longitude').text();
                let phone = $(this).find('phoneNumber').text();
                let openTime = $(this).find('operOpenHm').text();
                let closeTime = $(this).find('operCloseHm').text();
                if(rdnmadr=='') rdnmadr ="----";
                if(lnmadr=='') lnmadr ="----";
                if(lat=='') lat ="----";
                if(lng=='') lng ="----";
                if(phone=='') phone ="----";
                if(openTime=='') openTime ="----";
                if(closeTime=='') closeTime ="----";
                
                list[idx] = {
                    name: name,
                    rdnmadr: rdnmadr,
                    lnmadr: lnmadr,
                    lat: lat,
                    lng: lng,
                    phone: phone,
                    opentime: openTime,
                    closetime: closeTime
                };
            });
            resolve(list);
          });
    });
}