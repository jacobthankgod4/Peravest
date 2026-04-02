const form = document.querySelector("#form");

const subscribers = form.querySelector("#subscribers");

const Tab = document.querySelector(".errMessage")





form.onsubmit = (e) => {

	 e.preventDefault();

	Validate();

	// console.log("hello");
}
// showBtn.onclick = () =>{
// 	if (password.type=='password') {
// 		password.type='text';
// 		// showBtn.innerText = 'Hide';
//         showBtn.classList.remove("fa-eye-slash");
//         showBtn.classList.add("fa-eye");
// 	} else {
// 		password.type='password';
// 		showBtn.classList.remove("fa-eye");
//         showBtn.classList.add("fa-eye-slash");
// 	}
// }

// showBtn1.onclick = () =>{
// 	if (confirm__password.type=='password') {
// 		confirm__password.type='text';
// 		showBtn1.classList.remove("fa-eye-slash");
//         showBtn1.classList.add("fa-eye");
// 	} else {
// 		confirm__password.type='password';
// 		showBtn1.classList.remove("fa-eye");
//         showBtn1.classList.add("fa-eye-slash");
// 	}
// }

const validate__error =(element, message) => {

  if (element==bed || element==bath || element==type || element==_status) {
      const valid = element.parentElement;
      const valid1 = valid.parentElement;
      const errorDisplay = valid1.querySelector('.errorMessage');

      errorDisplay.innerText = message;
      element.classList.add('error');
      element.classList.remove('success');
      errorDisplay.style.display='block';
  } else {
      const valid = element.parentElement;
      const errorDisplay = valid.querySelector('.errorMessage');

      errorDisplay.innerText = message;
      element.classList.add('error');
      element.classList.remove('success');
      errorDisplay.style.display='block';
  }

}

const validate__success = element => {


  if (element==bed || element==bath || element==type || element==_status) {
      const valid = element.parentElement;
      const valid1 = valid.parentElement;
      const errorDisplay = valid1.querySelector('.errorMessage');

      errorDisplay.innerText = "";
      element.classList.add('success');
      element.classList.remove('error');
      errorDisplay.style.display='none';
  } else {
      const valid = element.parentElement;
      const errorDisplay = valid.querySelector('.errorMessage');

      errorDisplay.innerText = "";
      element.classList.add('success');
      element.classList.remove('error');
      errorDisplay.style.display='none';
  }

}

const Validate = () => {
	

		console.log("hellojjjj");

		let xhr = new XMLHttpRequest();
		xhr.open("POST", "includes/view/processor/subscribers.data.config.php", true);
		xhr.onload = () => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					let data = xhr.response;
                    console.log(data);
                    
					Tab.classList.add(data);

                    Tab.innerHTML = data;

                    Tab.classList.remove('alert-danger');
                    Tab.classList.add('alert-success');    
                    Tab.style.display='block';
					

					if (stab=document.querySelector(".successful")) {
						Swal.fire({
							icon: 'success',
							title: 'Hurray',
							text: 'you have successfully subscribed to our newsletter',  
							showClass: {
							  popup: 'animate__animated animate__fadeInDown'
							},
							hideClass: {
							  popup: 'animate__animated animate__fadeOutUp'
							}
						  })
					} else if(tab=document.querySelector(".hello0")) {
						Swal.fire({
							icon: 'error',
							title:'Oops',
							text: 'please check your form for error',  
							showClass: {
							  popup: 'animate__animated animate__fadeInDown'
							},
							hideClass: {
							  popup: 'animate__animated animate__fadeOutUp'
							}
						  })
					}else if(tab=document.querySelector(".subscription-error")) {
						Swal.fire({
							icon: 'error',
							title:'Oops',
							text: 'email has already been registered',  
							showClass: {
							  popup: 'animate__animated animate__fadeInDown'
							},
							hideClass: {
							  popup: 'animate__animated animate__fadeOutUp'
							}
						  })
					}else if(tab=document.querySelector(".hello2")) {
						Swal.fire({
							icon: 'error',
							title:'Oops',
							text: 'unable to registere your property...please try again later.',  
							showClass: {
							  popup: 'animate__animated animate__fadeInDown'
							},
							hideClass: {
							  popup: 'animate__animated animate__fadeOutUp'
							}
						  })
					}
				
				}
			}
		}	
		let formData = new FormData(form);
		xhr.send(formData);

		}


		

