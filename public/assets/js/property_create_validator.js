const form = document.querySelector("#form");

const title = form.querySelector("#title");
const _status = form.querySelector("#_status");
const type = form.querySelector("#type");
const price = form.querySelector("#price");
const area = form.querySelector("#area");
const bed = form.querySelector("#bed");
const bath = form.querySelector("#bath");
const address = form.querySelector("#address");
const city = form.querySelector("#city");
const state = form.querySelector("#state");
const zip_code = form.querySelector("#zip_code");
const description = form.querySelector("#description");
const year = form.querySelector("#year");
const showBtn1 = form.querySelector(".showBtn1");
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




const title1 = title.value.trim();
const _status1 = _status.value.trim();
const type1 = type.value.trim();
const price1 = price.value.trim();
const area1 = area.value.trim();
const bed1 = bed.value.trim();
const bath1 = bath.value.trim();
const address1 = address.value.trim();
const city1 = city.value.trim();
const state1 = state.value.trim();
const zip_code1 = zip_code.value.trim();
const description1 = description.value.trim();
const year1 = year.value.trim();


  const isValidName = name => {
		const reg__ex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/i;
		return reg__ex.test(String(name))
	}

  const isValidAddress = name => {
		const reg__ex = /^[a-zA-Z0-9\s,.'-]{3,100}$/i;
		return reg__ex.test(String(name))
	}

  const isValidDescription = name => {
		const reg__ex = /^[a-zA-Z0-9\s.,!?()'":;_-]*$/i;
		return reg__ex.test(String(name))
	}

    if ( title1==="") {
		validate__error(title, 'field cant be empty');

        var first = "false";
	} else if(!isValidDescription(title1)){
		validate__error(title, 'name can only contain letters' );

        var first = "false";
	} else{
		validate__success(title);

        var first = "true";
	}

	if ( _status1==="") {
		validate__error(_status, 'field cant be empty');

        var second = "false";
	}else{
		validate__success(_status);

        var second = "true";
	}

	if ( type1==="") {
		validate__error(type, 'field cant be empty');

        var third = "false";
	}else{
		validate__success(type);

        var third = "true";
	}
    

	if ( bed1==="") {
		validate__error(bed, 'field cant be empty');

        var fourth = "false";
	}else{
		validate__success(bed);

        var fourth = "true";
	}

	if ( bath1==="") {
		validate__error(bath, 'field cant be empty');

        var fifth = "false";
	}else{
		validate__success(bath);

        var fifth = "true";
	}

	if ( address1==="") {
		validate__error(address, 'field cant be empty');

        var sixth = "false";
	} else if(!isValidAddress(address1)){
		validate__error(address, 'name can only contain letters' );

        var sixth = "false";
	}else{
		validate__success(address);

        var sixth = "true";
	}
	if ( city1==="") {
		validate__error(city, 'field cant be empty');

        var seventh = "false";
	} else if(!isValidName(city1)){
		validate__error(city, 'name can only contain letters' );

        var seventh = "false";
	}else{
		validate__success(city);

        var seventh = "true";
	}
	if ( state1==="") {
		validate__error(state, 'field cant be empty');

        var eigth = "false";
	} else if(!isValidName(state1)){
		validate__error(state, 'name can only contain letters' );

        var eigth = "false";
	}else{
		validate__success(state);

        var eigth = "true";
	}

	
  if ( description1==="") {
		validate__error(description, 'field cant be empty');

        var tenth = "false";
	} else{
		validate__success(description);

        var tenth = "true";
	}

  if (first=="false" || second=="false" || third=="false" || fourth=="false"  || fifth=="false"  || sixth=="false" || seventh=="false" || eigth=="false" || tenth=="true") {

    Tab.innerText = 'check your form inputs for errors';        
    Tab.style.display='block';

  }else{
    Tab.innerText = '';
    Tab.classList.remove('alert-danger');
    Tab.classList.add('alert-success');    
    Tab.style.display='block';
  }
	

  if (first=="true" && second=="true" && third=="true" && fourth=="true"  && fifth=="true"  && sixth=="true" && seventh=="true" && eigth=="true"  && tenth=="true") {
		console.log("hellojjjj");

		let xhr = new XMLHttpRequest();
		xhr.open("POST", "includes/admin/edit.data.config.php", true);
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
							text: 'you have successfully added a new property',  
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
							text: 'property has already been registered',  
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

  }

		

a