from bs4 import BeautifulSoup
import requests
import urllib.request as UR
import json
import random



# Method for crawling a url at next level
def level_crawler(input_url):

    current_url_domain = UR.urlparse(input_url).netloc
    temp_urls = set()
    crawledList = []
    links_extern = set()
    links_intern = set()
    # Creates beautiful soup object to extract html tags
    
    beautiful_soup_object = BeautifulSoup(
        requests.get(input_url).content, "lxml")
    
    
    # Access all anchor tags from input
    # url page and divide them into internal
    # and external categories
    for anchor in beautiful_soup_object.findAll("a"):
        href = anchor.attrs.get("href")
        if (href != "" or href != None):
            href = UR.urljoin(input_url, href)
            href_parsed = UR.urlparse(href)
            href = href_parsed.scheme
            href += "://"
            href += href_parsed.netloc
            href += href_parsed.path
            final_parsed_href = UR.urlparse(href)
            is_valid = bool(final_parsed_href.scheme) and bool(
                final_parsed_href.netloc)
            if is_valid:
                if current_url_domain not in href and href not in links_extern:
                    #print("Extern - {}".format(href))
                    links_extern.add(href)
                if current_url_domain in href and href not in links_intern:
                    #print("Intern - {}".format(href))
                    links_intern.add(href)
                    #temp_urls.add(href)
                    crawledList.append(href)
    return crawledList

def addKeyToDict(takenList):
    dict = {}



    for (counter,eachElem) in enumerate(takenList):
        if dict.get(eachElem) == None:
            dict[eachElem] = counter

    return dict



def crawl(main_url, depth):
    links_intern = set()
    input_url = main_url
    #depth = 1
    depth = int(depth)
    crawledList = list()

    # Set for storing urls with different domain
    links_extern = set()

    if (depth == 0):
        print("Intern - {}".format(input_url))
        crawledList.append(input_url)

    elif (depth == 1):
        crawledList = level_crawler(input_url)


    else:
        # We have used a BFS approach
        # considering the structure as
        # a tree. It uses a queue based
        # approach to traverse
        # links upto a particular depth.
        queue = []
        queue.append(input_url)
        for j in range(depth):
            for count in range(len(queue)):
                url = queue.pop(0)
                urls = level_crawler(url)
                for i in urls:
                    queue.append(i)




    JSONFormatofCrawledList = addKeyToDict(crawledList)

    #print(JSONFormatofCrawledList)



    
    ourLinks = open("C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\metu-emine-role-detection-api-ee564a450501\\ourLinks.json","w")
    json.dump(crawledList,ourLinks,indent=4)
    ourLinks.close()

# Set for storing urls with same domain
