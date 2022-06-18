var fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
	pageSegmenter = require('./page-segmenter'),
    Horseman = require('node-horseman');

var jsonData= require("C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\ourLinks.json");

const urlArray=[];
for(const key in jsonData){
    if(urlArray[0]!=key){
        urlArray[0]=key;
    }
    for(const nestedKey in jsonData[key]){
        if(nestedKey != "score"){
            urlArray.push(nestedKey);
            //console.log("Displaying Depth 1",nestedKey);
        }
        for(const nestedKey2 in jsonData[key][nestedKey]){
            if(nestedKey2 != "score"){
                //console.log("Displaying Depth 2",nestedKey2);
                urlArray.push(nestedKey2);
            }
        }
    }

console.log(urlArray);

    if(jsonData[key] == 'score'){
        console.log("yandÄ±k");
    }

}

urlArray.forEach(function(url){
	process(url);
});

function getFileName(url){
	return url.replace('https://', '').replace('http://', '').replace(/\./g, '_');
}

function process(url){
	console.log(url);



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
		.wait(5000)
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

            //return console.log(url + ' ' + calculateVcs(tlc, wordCount, imageCount));
             //console.log(url + ' ' + scoresDict[url]);
            //console.log(JSON.stringify(scoresDict));
            for(const key in jsonData){
                if(url==key)
                    jsonData[key].score = calculateVcs(tlc, wordCount, imageCount);
                else{
                    for(const nestedKey in jsonData[key]){
                        if(nestedKey === "score"){
                            jsonData[nestedKey]++;
                            //console.log(jsonData[nestedKey]);
                        }
                       if(nestedKey == url)
                            jsonData[key][nestedKey].score = calculateVcs(tlc, wordCount, imageCount);
                        else{
                            for(const nestedKey2 in jsonData[key][nestedKey]){
                                //console.log("Nested Key 2:", nestedKey2);
                                //console.log("Url: ", url, "NestedKey2: ", nestedKey2);
                                if(nestedKey2 === "score")
                                    //jsonData[nestedKey][nestedKey2];
                                    continue;
                                else if(nestedKey2 == url){
                                       jsonData[key][nestedKey][nestedKey2] = calculateVcs(tlc, wordCount, imageCount);
                                       // console.log("Nested Key 2:", jsonData[key][nestedKey][nestedKey2] );
                                }
                              }
                        }
                    }
                }

            }
            console.log(jsonData);
//            scoresDict[url] = calculateVcs(tlc, wordCount, imageCount);
            var jsonDict = JSON.stringify(jsonData,null, 3);
            jsonDictFile(jsonDict);
           /* for(var key in scoresDict) {
                console.log(key + " : " + scoresDict[key]);}
   */
        })

        .close();
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