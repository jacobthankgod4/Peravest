const errDisplay = document.querySelector(".errDisplay");

 const loginBtn = document.querySelector(".loginBtn");

const form = document.querySelector("#form");

form.onsubmit = (e) => {
	e.preventDefault();
}

loginBtn.onclick = () => {

	let xhr = new XMLHttpRequest();
	xhr.open("POST", "includes/auth/login.data.config.php", true);
	xhr.onload = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				let data = xhr.response;
				console.log(data);

				if (data!="Incorrect Password" && data!="Username or Password Incorrect") {
					
					window.location.href = data;

				}else{		
					
					errDisplay.innerHTML = data;

					errDisplay.style.display='block';

				}
				
				
			}
		}
	}	
	let formData = new FormData(form);
	xhr.send(formData);
}