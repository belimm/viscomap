# viscomap



ViscoMap Project Installation Manual 

 

Introduction 

 

This document provided to serve as installation infrastructure, and to provide guidelines on general rules governing the contents and working mechanism. Objective of this manual, information about the libraries we used throughout the project, their versions and their functioning will be given. 

 

Installation Manual 

 

Web Crawler Tool 	 

 

Another special algorithm we have used in this project is the web crawler algorithm. A crawler, sometimes known as a spider, bot, or agent, is software that that crawls the internet for gathering useful information. In our project, useful information is another web pages that can we go from a web page. There are many algorithms while doing crawling operation. We have used Breadth First Search Algorithm while we are doing crawling the web pages. In order to integrate crawler to your project you need to install essential libraries such as: 

BeautifulSoup		v.4.10.0	pip install beautifulsoup4 

Requests		v.2.11.1	pip install request 

urllib.request		v.1.26.8	pip install urllib3 

json			v.2.1.0		built-in module 

 

If you want to use web crawler tool in your projects, you need to call “runCrawler” function with a URL and depth values like “def runCrawler(input_url, depth):”. After calling the function, the tool creates a json file called as “ourLinks.json” with crawled URL addresses as in the image below. In this case our input url: “https://www.youtube.com” and depth = 1. 

 

metin içeren bir resim

Açıklama otomatik olarak oluşturuldu 

 

Complexity Calculation Tool 

 

It is a tool that is calculating visual complexity score of a web page based on common aspects of an HTML Object Model (DOM). It is working by traversing the DOM tree of a webpage and counting the words, images and Top Left Corners (TLC) of the page then computes the complexity score between 0-10 by using this equation:  

vcs = (1.743 + 0.097 * (block) + 0.053 * (wordCount) + 0.003 * (imageCount)) / 10;  

A node can be counted as TLC when it is presented as a block with visible border, has headings, and is a table used for data or for layout. Also, a node can be counted as a TLC only once. 

To install NodeJS dependencies, use npm with following command: 

npm install 

It will download all modules. Then, start the application with: 

npm start 

 

In “metu-emine-role-detection-api-ee564a450501/config.json”, to use the tool properly you need to install phantomjs according to your operating system with:  

https://phantomjs.org/download.html 

And indicate the path of phantomjs module in “metu-emine-role-detection-api-ee564a450501/config.json” with: 

 

"phantomjsPath": "C:\\Users \\required_modules\\phantomjs-2.1.1-windows\\bin\\phantomjs.exe", 

"port": 8081 

Also, you need to configure the path according to your computer in viscomap/metu-emine-role-detection-api-ee564a450501/vcs-calculator.js / module. 

var jsonData= require("C:\\Users\\viscomap\\ourLinks.json"); 

 

MAIN 

 

All the components of the project have been integrated to the vcs.py module and the project is working on it. The vcs.py module, created using python's flask library, is responsible for running different parts of the project with different methods in it. You need to install these libraries for them to work properly: 

python		v.3.9.9 

Flask		v.2.0.2		pip install Flask 

Pyrebase	v.3.0.27	pip install Pyrebase 

Urllib.parse	v.1.26.8	pip install urllib3 

Flask_login	v.0.5.0		pip install Flask-Login 

 

For the firebase settings, you need to set the Realtime database config settings in your own firebase project. This is our firebase config settings: 

metin içeren bir resim

Açıklama otomatik olarak oluşturuldu 

There is module like “configuration.py”. In this module, you can change the project folder path according to your computer. In this way, all the local paths in VCS.py changes automatically.  

 