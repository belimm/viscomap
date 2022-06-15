from urllib.request import urljoin
from bs4 import BeautifulSoup
import requests
from urllib.request import urlparse
import json

links_intern = set()
links_extern = set()


def level_crawler(input_url):
    crawledList = set()

    temp_urls = set()
    current_url_domain = urlparse(input_url).netloc

    # Creates beautiful soup object to extract html tags
    try:
        beautiful_soup_object = BeautifulSoup(
            requests.get(input_url, timeout=10).content, "lxml")
    except:
        pass

    # Access all anchor tags from input
    # url page and divide them into internal
    # and external categories
    for anchor in beautiful_soup_object.findAll("a"):
        href = anchor.attrs.get("href")
        if (href != "" or href != None):
            href = urljoin(input_url, href)
            href_parsed = urlparse(href)
            href = href_parsed.scheme
            href += "://"
            href += href_parsed.netloc
            href += href_parsed.path
            final_parsed_href = urlparse(href)
            is_valid = bool(final_parsed_href.scheme) and bool(
                final_parsed_href.netloc)
            if is_valid:
                if current_url_domain not in href and href not in links_extern:
                    # print("Extern - {}".format(href))
                    links_extern.add(href)
                if current_url_domain in href and href not in links_intern:
                    # print("Intern - {}".format(href))
                    links_intern.add(href)
                    temp_urls.add(href)

    return links_intern


def create_list(input_url, depth):
    crawledSet = set()
    crawledList = []

    if (depth == 0):
        crawledList.append(input_url)

        return crawledList
    elif (depth == 1):
        crawledSet = level_crawler(input_url)

        for i in crawledSet:
            tempCrawlElem = []
            tempCrawlElem.append(input_url)
            tempCrawlElem.append(i)
            crawledList.append(tempCrawlElem)
    elif (depth == 2):

        queue = []
        queue.append(input_url)

        for j in range(depth):

            for count in range(len(queue)):

                url = queue.pop(0)
                urls = level_crawler(url)

                for i in urls:
                    tempCrawlElem = []
                    tempCrawlElem.append(input_url)
                    if (input_url != url):
                        tempCrawlElem.append(url)
                    if (i != url):
                        tempCrawlElem.append(i)

                    if (len(tempCrawlElem) == 3):
                        crawledList.append(tempCrawlElem)
                    queue.append(i)

                for i in urls:
                    queue.append(i)
    elif depth == 3:
        print("Invalid depth")
        return []
    else:
        return []

    return crawledList


def nestedDictionary(crawledList, depth):
    crawledDict = {}

    if (depth == 0):
        crawledDict[crawledList[0]] = {}
        return crawledDict

    elif (depth == 1):
        crawledDict[crawledList[0][0]] = {}
        crawledDict[crawledList[0][0]]["score"] = 0

        for eachElem in crawledList:
            crawledDict[crawledList[0][0]][eachElem[1]] = 0
        return crawledDict

    elif (depth == 2):
        crawledDict[crawledList[0][0]] = {}
        crawledDict[crawledList[0][0]]["score"] = 0

        for eachElem in crawledList:
            if (crawledDict[crawledList[0][0]].get(eachElem[1]) == None):
                crawledDict[crawledList[0][0]][eachElem[1]] = {}
            crawledDict[crawledList[0][0]][eachElem[1]]["score"] = 0.1
            crawledDict[crawledList[0][0]][eachElem[1]][eachElem[2]] = 0

        return crawledDict


def runCrawler(input_url, depth):


    crawledList = create_list(input_url, depth)

    print(crawledList)


    nestedDict = nestedDictionary(crawledList, depth)
    details = json.dumps(nestedDict, indent=5)
    print(nestedDict)
    with open('ourLinks.json', 'w') as outfile:
        json.dump(nestedDict, outfile, indent=5)

        # if(depth!=0):
        #     crawledList = list(set(tuple(row) for row in crawledList))
        #     crawledList = [list(i) for i in crawledList]

        # if(depth==0):
        #     df = pd.DataFrame(crawledList,columns=['d0'])
        # elif(depth==1):
        #     df = pd.DataFrame(crawledList,columns=['d0','d1'])
        # elif(depth==2):
        #     df = pd.DataFrame(crawledList,columns=['d0','d1','d2'])

        # nestedDictionary(crawledList=crawledList,depth=depth)