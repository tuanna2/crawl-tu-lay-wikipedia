const axios = require('axios');
const cheerio = require("cheerio");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/crawl', {  useUnifiedTopology: true , useNewUrlParser: true });

const Schema = mongoose.Schema;
const TuLaySchema = new Schema({
    alphabet: String,
    word: String,
    description: String
})
const TuLay = mongoose.model("TuLay", TuLaySchema);
TuLay.deleteMany({}, err => err ? console.log(err): console.log("removed model TuLay"));

let url = "https://vi.wiktionary.org/wiki/Th%E1%BB%83_lo%E1%BA%A1i:T%E1%BB%AB_l%C3%A1y_ti%E1%BA%BFng_Vi%E1%BB%87t";
const crawled = [];
const request = url => {
    return new Promise((resolve, reject) => {
        axios.get(url)
        .then(res => resolve(res.data))
        .catch(err => reject(err));
    })
}
const excute = async url => {
    const data = await request(url);
    const $ = cheerio.load(data, { decodeEntities: false });
    $("#mw-pages .mw-category-group").each((i, e) => {
        const alphabet = $(e).find("h3").html();
        $(e).find("ul > li > a").each((i, ee)=> crawled.push({alphabet, word: $(ee).attr("title"), description: "https://vi.wiktionary.org" + $(ee).attr("href")}))
    })
    const nextPage = $('#mw-pages a').last();
    if(nextPage.html() !== "Trang sau"){
        url = "";
    }
    else{
        url ="https://vi.wiktionary.org" + nextPage.attr("href");
    }
    crawler(url);
}
function crawler(url){
    if(url !== ""){
        excute(url);
    }
    else{
        TuLay.create(crawled, function(err, res){
            err ? console.log(err) : console.log(res)
        })
    }
    console.log(url);
    console.log(crawled.length);
}

crawler(url);
