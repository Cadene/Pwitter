/** OBJECTS DECLARATIONS **/

/* Object Static Environnement */
	
state = {}; //new Object;
state.users = []; //new Array();
state.myProfil = {}; //TODO new myProfil
state.currentUser_id = null; //TODO new CurrentUser
state.pwittsFind = {}; //TODO new PwittsFind(...);

/* Object User */

function User(id, email, firstName, lastName, isFriend)
{
	this.id = id;
	this.email = email;
	this.firstName = firstName;
	this.lastName = lastName;
	this.isFriend = false;
	if(isFriend !== undefined){
		this.isFriend = isFriend;
	}

	if(state === undefined){
		state = {};
	}
	if(state.users === undefined){
		state.users = [];
	}
	state.users[id] = this;
}

User.prototype.changeFriendship = function()
{
	this.isFriend = !this.isFriend;
};

/* Object Pwitt */

function Pwitt(id, user, content, date, score)
{
	this.id = id;
	this.user = user;
	this.content = content;
	this.date = date;
	if(score !== undefined)
		this.score = score; //undefined
}

Pwitt.prototype.getHtml = function()
{
	var html = "<div id=\"Pwitt_" + this.id + "\">\n"
		+ "<h2>" + this.user.firstName + " " + this.user.lastName + "<small> :: " + this.user.email + " :: " + formatDate(this.date) + "</small></h2>\n"
		+ "<p>" + this.content + "</p>\n"
		+ "</div>";
	return html;
};

/* Object PwittsFind */

function PwittsFind(pwitts, user_id, date, words, doFriends)
{
	this.pwitts = pwitts;
	
	this.words = words;
	if(words === undefined){
		this.words = "";
	}

	this.doFriends = doFriends;
	if(doFriends === undefined){
		this.doFriends = false;
	}

	this.user_id = user_id;

	this.date = date;
	if(date === undefined){
		this.date = new Date();
	}

	state.pwittsFind = this;	
}

PwittsFind.prototype.getHtml = function()
{
	var s = "<div class=\"maincol\">\n";
	for(var i=this.pwitts.length-1; i>=0; i--){
		s += this.pwitts[i].getHtml()+"\n";
	}
	s += "</div>\n<div class=\"maincol_bottom\"></div";
	return s;
};

PwittsFind.reviver = function(key,value)
{
	if(key == ''){
		return new PwittsFind(
			value.pwitts, value.user_id,  value.date, value.words, value.doFriends
		);
	}
	if(key == 'pwitts'){
		var tab = [value.length];
		for(var i=0;i<value.length;i++){
			tab[i] = new Pwitt(
				value[i].id,
				value[i].user,
				value[i].content,
				value[i].date,
				value[i].score
			);
		}
		console.log(tab);
		return tab;
	}
	if(key == 'user'){
		return new User(value.id, value.email, value.firstName, value.lastName, value.isFriend);
	}
	if(key == 'date'){
		return new Date(value*1000);
	}
	return value;
};

PwittsFind.ajax = function()
{
	$.ajax({
		type:"GET",
		url:"http://li328.lip6.fr:8280/CADENE_PANOU/pwitts/find",
		//data:"session="+state.session+"&content="+content,
		datatype:"json",
		success: function(response){
			PwittsFind.onSuccess(response);
		},
		error: function(error){
			throwError(error);
		}
	});
};

PwittsFind.onSuccess = function(response)
{
	var obj = JSON.parse(response,PwittsFind.reviver);
	if(obj.error !== undefined){
		return throwError(obj.error);
	}
	state.pwittsFind = obj;
	console.log(obj);
	$("#pwitts").prepend(obj.getHtml());
};

/* Object PwittSend */

function PwittSend(){};

PwittSend.ajax = function(content)
{
	$.ajax({
		type:"GET",
		url:"http://li328.lip6.fr:8280/CADENE_PANOU/pwitt/send",
		data:"session="+state.myProfil.session+"&content="+content,
		datatype:"json",
		success: function(response){
			PwittSend.onSuccess(response,content);
		},
		error: function(error){
			throwError(error);
		}
	});
};
//TODO need reviver
PwittSend.onSuccess = function(response,content)
{
	var obj = JSON.parse(response);
	if(obj.error !== undefined){
		return throwError(obj.error);
	}
	
	var html = "<div>" +content+ "</div>";
	
	$("form").prepend(html);
};


/* Object FriendAdd */

function FriendAdd(){};

FriendAdd.ajax = function(friend_id)
{
	$.ajax({
		type:"GET",
		url:"http://li328.lip6.fr:8280/CADENE_PANOU/friend/add",
		data:"session="+state.session+"&friend_id="+friend_id,
		datatype:"json",
		success: FriendAdd.onSuccess(response,friend_id),
		error: function(error){
			throwError(error);
		}
	});
};

FriendAdd.onSuccess = function(response,friend_id)
{
	if(response.error !== undefined){
		return throwError(error);
	}
		
	var user = state.users[id];
	user.modifyFriendship();
	var pwitts = state.pwittsFind.pwitts;
	for(var i in pwitts){
		// TODO
		if(pwitts[i].user.id == friend_id){
			$("#pwitt_"+pwitts[i].id).replacewith(pwitts[i].getHTML());
		}
	}
	
};


/* Object FriendRemove */

function FriendRemove(){
	
}

FriendRemove.ajax = function(friend_id)
{
	$.ajax({
		type:"GET",
		url:"http://li328.lip6.fr:8280/CADENE_PANOU/friend/remove",
		data:"session="+state.session+"&friend_id="+friend_id,
		datatype:"json",
		success: FriendRemove.onSuccess(response,friend_id),
		error: function(error){
			throwError(error);
		}
	});
};

// TODO
FriendRemove.onSuccess = function()
{
	if(response.error !== undefined){
		return throwError(error);
	}
	var user = state.users[id];
	user.modifyFriendship();
	var pwitts = state.pwittsFind.pwitts;
	for(var i in pwitts){
		// TODO
		if(pwitts[i].user.id == friend_id){
			$("#pwitt_"+pwitts[i].id).replacewith(pwitts[i].getHTML());
		}
	}
};

/* Object UserLogout */

function UserLogout(){};

UserLogout.ajax = function()
{
	$.ajax({
		type:"GET",
		url:"http://li328.lip6.fr:8280/CADENE_PANOU/user/logout",
		data:"session="+state.session,
		datatype:"json",
		success: UserLogout.onSuccess(response),
		error: function(error){
			throwError(error);
		}
	});
};


UserLogout.onSuccess = function(response){
	state.actif = undefined;
};


/* Object MyProfil */

function MyProfil(id,session){
	this.id = id;
	this.session = session;
}

MyProfil.ajax = function (session){
	$.ajax({
		type:"GET",
		url:"http://li328.lip6.fr:8280/CADENE_PANOU/user/get",
		data:"session="+session,
		datatype:"json",
		success: function(response){
			MyProfil.onSuccess(response,session);
		},
		error: function(error){
			throwError(error);
		}
	});
};

MyProfil.onSuccess = function(response,session)
{
	var obj = JSON.parse(response,this.reviver);
	if(response.error !== undefined){
		return throwError(error);
	}
	
	var user = obj.user;
	state.myProfil = new MyProfil(user.id, session);
	state.currentUser_id = user.id;
	state.users[user.id] = user;
	
	var html = "<div id=\"user_infos\">" +
			"<div>Bienvenue "+ user.firstName +" "+ user.lastName +"</div>" +
			"</div>";
	
	$("#user_infos").replaceWith(html);
};


MyProfil.reviver = function(key,value)
{
	if(key == 'user'){
		return new User(
			value.id, value.email, value.firstName, value.lastName
		);
	}
	
	return value;
};

	
/** FUNCTIONS **/

//TODO améliorer
function throwError(error) {
	var box = "<div id=\"error\">["+error.code+"] "+error.msg+"</div>";
	$("form").prepend(box);
	return true;
}



function getQueryString(key, default_) {
    if (default_ === null) default_="";
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if(qs === null) return default_; else return qs[1];
}

function formatDate(date){
	diff = dateDiff(date, new Date());
	if(diff.day !== 0)
		return diff.day + " day(s)";
	if(diff.hour !== 0)
		return diff.hour + " hour(s)";
	if(diff.min !== 0)
		return diff.min + " min(s)";
	return diff.sec + " sec(s)";
}

function dateDiff(date1, date2){
    var diff = {};                          // Initialisation du retour
    var tmp = date2.valueOf() - date1.valueOf();
 
    tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60;                    // Extraction du nombre de secondes
 
    tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
    diff.min = tmp % 60;                    // Extraction du nombre de minutes
 
    tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
    diff.hour = tmp % 24;                   // Extraction du nombre d'heures
     
    tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
    diff.day = tmp;
     
    return diff;
}


