const form = document.querySelector("#form");
const fname = form.querySelector("#fname");
const mail = form.querySelector("#mail");
// const pass1 = form.querySelector("#pass1");
const account = form.querySelector("#account");
const bank = form.querySelector("#bank");
const age = form.querySelector("#age");
const gender = form.querySelector("#gender");
// const pass2 = form.querySelector("#pass2");
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

    const fname1 = fname.value.trim();
    const mail1 = mail.value.trim();
    const account1 = account.value.trim();	
	const bank1 = bank.value.trim();	
	const age1 = age.value.trim();	
	const gender1 = gender.value.trim();	
	// const pass11 = pass1.value.trim();
	// const pass22 = pass2.value.trim();

	const isValidName = name => {
		const reg__ex = /^[A-Z\' .-]{2,45}$/i;
		return reg__ex.test(String(name))
	}

    const isValidNo = no => {
		const reg__ex = /^[0-9\' .-]{2,45}$/i;
		return reg__ex.test(String(no))
	}

	const isValidPassword = name => {
		const reg__ex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
		return reg__ex.test(String(name));
	}

	const isValidConfirmPassword = (name, name2) => {
		if (name==name2) {
            return true;
        }		
	}

    if (fname1==="") {
		validate__error(fname, 'field cant be empty');

        var first = "false";
	} else if(!isValidName(fname1)){
		validate__error(fname, 'name can only contain letters' );

        var second = "false";
	} else{
		validate__success(fname);

        var first = "true";
	}

	if (account1==="") {
		validate__error(account, 'field cant be empty');

        var second = "false";
	} else if(!isValidNo(account1)){
		validate__error(account, 'account can only contain number' );

        var second = "false";
	}else{
		validate__success(account);

        var second = "true";
	}

	if (mail1==="") {
		validate__error(mail, 'field cant be empty');

        var fourth = "false";
	}else{
		validate__success(mail);

        var fourth = "true";
	}

	if (bank1==="") {
		validate__error(bank, 'field cant be empty');

        var seventh = "false";
	}else{
		validate__success(bank);

        var seventh = "true";
	}

	if (gender1==="") {
		validate__error(gender, 'field cant be empty');

        var eigth = "false";
	}else{
		validate__success(gender);

        var eigth = "true";
	}

	if (age1==="") {
		validate__error(age, 'field cant be empty');

        var ninth = "false";
	}else{
		validate__success(age);

        var ninth = "true";
	}

	// if (pass11==="") {
	// 	validate__error(pass1, 'field cant be empty');

    //     var fifth = "false";
	// } else if(!isValidPassword(pass11)){
	// 	validate__error(pass1, 'Password must contain an uppercase and a lowercase letter, a number and must be more then 6' );

    //     var fifth = "false";
	// }else{
	// 	validate__success(pass1);

    //     var fifth = "true";
	// }

	// if (pass22==="") {
	// 	validate__error(pass2, 'field cant be empty');

    //     var sixth = "false";
	// } else if(!isValidConfirmPassword(pass22, pass11)){
	// 	validate__error(pass2, 'confirm password does not match original password' );

    //     var sixth = "false";
	// }else{
	// 	validate__success(pass2);

    //     var sixth = "true";
	// }

    if (first=="true" && second=="true" && fourth=="true"  && seventh=="true"  && eigth=="true"  && ninth=="true") {

		console.log("hellojjjj");

		let xhr = new XMLHttpRequest();
		xhr.open("POST", "includes/user/processor/profile.data.config.php", true);
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
							text: 'you have successfully edit your profile',  
							showClass: {
							  popup: 'animate__animated animate__fadeInDown'
							},
							hideClass: {
							  popup: 'animate__animated animate__fadeOutUp'
							}
						  })
						  
						  				setTimeout(function() {
				 			window.location.href = "profile"; // Redirect URL
					}, 2000);

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
							text: 'email has already been registered by another user',  
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
