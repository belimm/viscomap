import requests
from bs4 import BeautifulSoup
from collections import deque
import json

visited = set(["https://odtuclass2021f.metu.edu.tr"])
dq = deque([["https://odtuclass2021f.metu.edu.tr", "", 0]])
max_depth = 2
depthList = []
hrefList = []

while dq:
    base, path, depth = dq.popleft()
    #                         ^^^^ removing "left" makes this a DFS (stack)
    if depth < max_depth:
        try:
            soup = BeautifulSoup(requests.get(base + path).text, "html.parser")

            for link in soup.find_all("a"):
                href = link.get("href")

                if href not in visited and href.startswith("http"):
                    visited.add(href)
                    print("  " * depth + f"at depth {depth}: {href}")

                    if href.startswith("http"):
                        hrefList.append(href)
                        depthList.append(depth)
                        dq.append([href, "", depth + 1])
                    else:
                        dq.append([base, href, depth + 1])
        except:
            pass

