const allmenu  = document.querySelectorAll(".switch");
const footer  = document.querySelector("footer");

let switch_location = window.location.pathname;

console.log(switch_location);


for (let index = 0; index < allmenu.length; index++) {
    
    allmenu_new=allmenu[index];
    allmenu_new1 = allmenu_new.getAttribute("href");
    allmenu_new2="/"+allmenu_new1;
    if (allmenu_new2==switch_location) {
        console.log(allmenu_new2);

        console.log(switch_location);
        allmenu_new.classList.add("active");
    }    
    if (switch_location=="/") {
            if (allmenu_new1=="home") {
        allmenu_new.classList.add('active');
    }  
        // allmenu_new.classList.add('active');
    }  
}


