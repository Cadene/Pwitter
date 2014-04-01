$(function() {
	$("#username").keyup(function(){
		if(!isValid("#username",/^[a-z0-9_]{0,15}$/i)){
			return false;
		}
		fadeOut("#username");
	});
	$("#password").keyup(function(){
		if(!isValid("#password",/^[a-z0-9_]{0,30}$/i)){
			return false;
		}
		fadeOut("#password");
	});
	$("#form").submit(function(){
		if(canLogin()){
			username = $("#username").val();
			password = $("#password").val();
			url = "http://li328.lip6.fr:8280/CADENE_PANOU/users/login?username="+username+"&password="+password;
			alert(url);
			$.ajax({
			  type: "GET",
			  url: url,
			  success: function(msg){
				alert( "Data Saved: " + msg );
			  }
			});
		}
		return false;
	});

});

function canLogin(){
	valid = true;
	if(isEmpty("#username")){
		valid = false;
	} else if(!isValid("#username",/^[a-z0-9_]{4,15}$/i)){
		valid = false;
	} else {
		fadeOut("#username");
	}
	// password
	if(isEmpty("#password")){
		return false;
	} else if(!isValid("#password",/^[a-z0-9_]{5,30}$/i)){
		valid = false;
	} else {
		fadeOut("#password");
	}
	return valid;
}

function isEmpty(id){
	if($(id).val() == ""){
		$(id).css("border-color","#FF0000");
		$(id).next(".error").show().text("Le champ est vide.");
		return true;
	}
	return false;
}

function isValid(id,reg){
	if(!$(id).val().match(reg)){
		$(id).css("border-color","#FF0000");
		$(id).next(".error").show().text("Le champ n'est pas valide.");
		return false;
	}
	return true;
}

function fadeOut(id){
	$(id).next(".error").fadeOut();
}