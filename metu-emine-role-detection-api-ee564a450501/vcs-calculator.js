var fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
	pageSegmenter = require('./page-segmenter'),
    Horseman = require('node-horseman');

const { start } = require('repl');
var jsonData= require("C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\ourLinks.json");
var rootScore=0;
const urlArray=[];
var startTime=Date.now();
var depthh;


if(jsonData["Depth"]==1){
 depth1URL();
 depthh=1;
}
else{
    depth2URL();
    depthh=2;
}

 function depth1URL(){
    for(const key in jsonData){
        if(urlArray[0]!=key && key !== "Depth"){
            urlArray[0]=key;
        }
        for(const nestedKey in jsonData[key]){
            if(nestedKey != "score"){
                urlArray.push(nestedKey);
            }
    }
 }
}
function depth2URL(){
    for(const key in jsonData){

        if(urlArray[0]!=key && key !== "Depth"){
            urlArray[0]=key;
        }
        for(const nestedKey in jsonData[key]){
            if(nestedKey != "score"){
            // console.log("Displaying nestkey1",parseInt(nestedKey));
                urlArray.push(nestedKey);
                //console.log("Displaying Depth 1",nestedKey);
            }
            for(const nestedKey2 in jsonData[key][nestedKey]){
                if(nestedKey2 != "score"){
                // console.log("Displaying nestkey2",nestedKey2);
                    urlArray.push(nestedKey2);
                }
            }
        }
    }
}

console.log(urlArray);



urlArray.forEach(function(url){
	process(url);
});

function getFileName(url){
	return url.replace('https://', '').replace('http://', '').replace(/\./g, '_');
}

function process(url){
	//console.log(url);



	var width = 1920,
        height = 1080,
        agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
        tlc, wordCount, imageCount, errorMessage;

    if(agent){
        agent
    }

    var horseman = new Horseman({phantomPath: config.phantomjsPath});

    horseman
        .userAgent(agent)
        .viewport(width, height)
		.on('resourceError', function(err) {
			//console.log(err);
		})
		.on('error', function(err) {
			//console.log('Error ' + url + ' ' + err);
		})
        .open(url)
		.then(function (result) {
			if(result !== 'success'){
				return horseman.close();
			}
		})
		.wait(20000)
		.catch((error) => {
			console.log(url + ' ' + error);
			return horseman.close();
		})
		.then(function () {

		})
        .on('consoleMessage', function( msg ){
            console.log(msg);
        })
		.screenshot('images\\' + getFileName(url) + '.png')
        .injectJs('vicram.js')
        .injectJs('page-renderer.js')
        .evaluate(function () {
            console.log('Evaluating');
            return calculateVicramScore(document);
        })
        .then(function (vicramResponse) {
            errorMessage = vicramResponse.err;
            tlc = vicramResponse.tlc;
            imageCount = vicramResponse.imageCount;
            wordCount = vicramResponse.wordCount;
        })
        .evaluate(function () {
            return traverseDOMTree(document, true, null, 0);
        })
        .then(function (nodeTree) {
            var blockTree = null,
                pageWidth = 0,
                pageHeight = 0,
                fontColor = null,
                fontSize = null;

            if(nodeTree){
                pageWidth = nodeTree.attributes.width;
                pageHeight = nodeTree.attributes.height;
                fontColor = nodeTree.attributes.fontColor;
                fontSize = nodeTree.attributes.fontSize;
                blockTree = pageSegmenter.segment(nodeTree, width, height);
            }

            if(errorMessage){
                return console.log(url + ' ' + errorMessage);
            }

           // return console.log(url + ' ' + calculateVcs(tlc, wordCount, imageCount));
             //console.log(url + ' ' + scoresDict[url]);
            //console.log(JSON.stringify(scoresDict));
        })
        .then(function(){
         //  console.log("***" + "tlc: " + tlc + "wordCount: "+wordCount+"imageCount: "+imageCount);
            for(const key in jsonData){
                if(url==key && rootScore == 0){
                    jsonData[key].score = calculateVcs(tlc, wordCount, imageCount);
                    rootScore=1;
                }
                else{
                    for(const nestedKey in jsonData[key]){
                        if(nestedKey === "score"){
                            continue;
                        }
                        if(depthh==1)
                            jsonData[key][url] = calculateVcs(tlc, wordCount, imageCount);
                        else{
                            jsonData[key][url].score = calculateVcs(tlc, wordCount, imageCount);
                        }
                        for(const nestedKey2 in jsonData[key][nestedKey]){
                                if(depthh==1)
                                    break;
                                if(nestedKey2 === "score")              
                                    continue;
                                else{
                                    jsonData[key][nestedKey][url] = calculateVcs(tlc, wordCount, imageCount);
                                }
                              }
                        }
                    }
                   // console.log(jsonData);
                    var jsonDict = JSON.stringify(jsonData,null, 3);
                    jsonDictFile(jsonDict);
                }

        })
        .close();
}

function scoreCalculator(url,tlc,wordCount,imageCount){


    //console.log(jsonData);
//         scoresDict[url] = calculateVcs(tlc, wordCount, imageCount);

   /* for(var key in scoresDict) {
        console.log(key + " : " + scoresDict[key]);}
*/
}


function jsonDictFile(jsonDict){
    const fs = require('fs');
    fs.writeFileSync('C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\static\\ProjectFile.json', jsonDict);
}

function calculateVcs(block, wordCount, imageCount){
	var vcs = (1.743 + 0.097 * (block) + 0.053 * (wordCount) + 0.003 * (imageCount)) / 10;

	if(vcs > 10){
		return 10.0;
	}

	return vcs.toFixed(2);
}