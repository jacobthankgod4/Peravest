const form = document.querySelector("#form");

const pass = form.querySelector("#pass");

const pass1 = form.querySelector("#pass1");

const pass2 = form.querySelector("#pass2");
// const showBtn = form.querySelector(".showBtn");
// const showBtn1 = form.querySelector(".showBtn1");
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


		const valid = element.parentElement;
		const errorDisplay = valid.querySelector('.errorMessage');
  
		errorDisplay.innerText = message;
		element.classList.add('error');
		element.classList.remove('success');
		errorDisplay.style.display='block';

  
  }
  
  const validate__success = element => {
  
  

		const valid = element.parentElement;
		const errorDisplay = valid.querySelector('.errorMessage');
  
		errorDisplay.innerText = "";
		element.classList.add('success');
		element.classList.remove('error');
		errorDisplay.style.display='none';

  
  }
  
const Validate = () => {

    const pass00 = pass.value.trim();
	const pass11 = pass1.value.trim();
	const pass22 = pass2.value.trim();

	

	const isValidPassword = name => {
		const reg__ex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#\\\^\)\(\[\]\/])[A-Za-z\d@$!%*?&#\\\^\)\(\[\]\/]{8,}$/;
		return reg__ex.test(String(name));
	}

	const isValidConfirmPassword = (name, name2) => {
		if (name==name2) {
            return true;
        }		
	}

    if (pass00==="") {
		validate__error(pass, 'field cant be empty');

        var fourth = "false";
	} else if(!isValidPassword(pass00)){
		validate__error(pass, 'Password must contain an uppercase and a lowercase letter, a number, a special character and must be more then 8' );

        var fourth = "false";
	}else{
		validate__success(pass);

        var fourth = "true";
	}


	if (pass11==="") {
		validate__error(pass1, 'field cant be empty');

        var fifth = "false";
	} else if(!isValidPassword(pass11)){
		validate__error(pass1, 'Password must contain an uppercase and a lowercase letter, a number and must be more then 6' );

        var fifth = "false";
	}else{
		validate__success(pass1);

        var fifth = "true";
	}

	if (pass22==="") {
		validate__error(pass2, 'field cant be empty');

        var sixth = "false";
	} else if(!isValidConfirmPassword(pass22, pass11)){
		validate__error(pass2, 'confirm password does not match original password' );

        var sixth = "false";
	}else{
		validate__success(pass2);

        var sixth = "true";
	}

    if (fourth=="true"  && fifth=="true"  && sixth=="true") {

		console.log("hellojjjj");

		let xhr = new XMLHttpRequest();
		xhr.open("POST", "includes/user/processor/pass.data.config.php", true);
		xhr.onload = () => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					let data = xhr.response;
                    console.log(data);
                    
					Tab.classList.add(data);

					if (stab=document.querySelector(".hi2")) {
						Swal.fire({
							icon: 'success',
							title: 'Hurray',
							text: 'you have successfully edited your password',  
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
					}else if(tab=document.querySelector(".hello1")) {
						Swal.fire({
							icon: 'error',
							title:'Oops',
							text: 'the old password you provided id incorrect',  
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
							text: 'unable to registere your school...please try again later.',  
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

		
		
}
