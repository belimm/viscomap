const searchHist = () => {
    const searchWrapper = document.querySelector(".search-input");
    const inputBox = searchWrapper.querySelector("input");
    const suggBox = searchWrapper.querySelector(".autocom-box");

    inputBox.onkeyup = logKey;

    function logKey(e) {
        let userData = e.target.value;
        let emptyArray = [];
        if(userData){
            emptyArray = suggestions.filter((data) => {
                return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
            });
            emptyArray = emptyArray.map((data) => {
                return data = '<li>'+ data +'</li>';
            });
            console.log(emptyArray);
            searchWrapper.classList.add("active");
            showSuggestions(emptyArray);
            let allList = suggBox.querySelectorAll("li");
            for( let i = 0; i < allList.length; i++){
                allList[i].setAttribute("onClick", "select(this)");
            }
        }else{
            searchWrapper.classList.remove("active");
        }
        
    }
    function select(element){
        let selectUserData = element.textContent;
        inputBox.value = selectUserData;
        searchWrapper.classList.remove("active");
    }

    function showSuggestions(list){
        let listData;
        if(!list.length){
            userValue = inputBox.value;
            searchWrapper.classList.remove("active");
        }else{
            listData = list.join('');
        }
        suggBox.innerHTML = listData;
    }
   
}

const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        navLinks.forEach((link, index) => {
            if(link.style.animation){
                link.style.animation = '';
            }
            else{
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`;
            }
        });
        burger.classList.toggle('toggle');
    });

   
}

searchHist();
navSlide();

