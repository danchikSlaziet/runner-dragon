const url = 'https://maximcoffeegame.ru/bot/api.php?';

let user1 = {
	botSubscription: undefined, // false,
	acceptedRules: undefined, //false,
	id: undefined, // 0
	firstName: undefined, // '',
	lastName: undefined, // '',
	username: undefined, // '',
	gameMaxPoint: undefined, // 0,
	gameMaxPointDay: undefined, // 0,
	gameLastPoint: undefined, // 0
	chatInstance: undefined // 0
}

let user2 = {
	id: undefined, // 0,
	firstName: undefined, // '',
	lastName: undefined, // '',
	username: undefined, // '',
	gameMaxPoint: undefined // 0,
}

let bot = {
	name: 'Кофейный Дракон',
	title: 'Играй в «Кофейный дракон», соревнуйся с друзьями, набирай баллы и получай шанс выиграть годовой запас кофе.',
	text1: 'Я сыграл в игру «Кофейный дракон» от Maxim. Мой результат – ',
	text2: ' баллов.',
	text2_VK: ' Заходи и получи шанс выиграть приз!',
	url_telegram: 'https://t.me/maximcoffee_bot',
	url_site: 'https://maximcoffeegame.ru/',
	url_game: 'https://maximcoffeegame.ru/game/',
	url_legal: 'https://maximcoffeegame.ru/rules/legal.pdf',
	url_soglasie: 'https://maximcoffeegame.ru/rules/soglasie.pdf',
	url_social_ok: 'https://connect.ok.ru/offer?url=',
	url_social_vk: 'https://vk.com/share.php?url=',
	url_social_poster: 'https://coffemaximgame.ru/post3.png'
}


window.MCUser = { user1, user2, bot}


window.MCUser.bot.url_game = '';
var audioWin1 = new Audio(window.MCUser.bot.url_game+'sound/win.mp3');
var audioPriz1 = new Audio(window.MCUser.bot.url_game+'sound/priz.mp3');
var audioPriz2 = new Audio(window.MCUser.bot.url_game+'sound/priz.mp3');
var audioLooser1 = new Audio(window.MCUser.bot.url_game+'sound/looser.mp3');
var audioPriz_count = 0;



function audioWin(){
	audioWin1.play();
	setTimeout(function(){audioWin1.load()},1000);
}

function audioLooser(){
	audioLooser1.play();
	setTimeout(function(){audioLooser1.load()},500);
}

// двойные звуки призов
function audioPriz(){
	if (audioPriz_count==0){
		audioPriz1.play();
		audioPriz_count=1;
		//audioPriz2.currentTime = 0.001;
		//audioPriz2.pause();
		audioPriz2.load();
	} else {
		audioPriz2.play();
		audioPriz_count=0;
		//audioPriz1.currentTime = 0.001;
		//audioPriz1.pause();
		audioPriz1.load();
	}
}


// получаем данные о пользователе из параметров в хеше
function getParam(){
	let hash = new URLSearchParams(document.location.search);
	if (hash.size!=0){
		let dat = hash.get("data");
		//console.log(dat);
		let param = new URLSearchParams(decodeURIComponent(atob(dat)));
		window.MCUser.user1.id = param.get("id");
		window.MCUser.user1.firstName = param.get("first_name");
		window.MCUser.user1.lastName = param.get("last_name");
		window.MCUser.user1.chatInstance = param.get("chat_instance");
		//let s = window.TelegramGameProxy.initParams;
	} else{
		// тестовый игрок
		window.MCUser.user1.id = 123;
		window.MCUser.user1.firstName = "Ты";
		window.MCUser.user1.lastName = "набрал";
		window.MCUser.user1.chatInstance = 222;
		window.MCUser.user1.acceptedRules = false;
		window.MCUser.user1.botSubscription = false;
	}
}


function startGame(){
	getParam();
	api_startGame(window.MCUser.user1.id);
	document.getElementById("loader").style.display = 'none';
	document.getElementById("gameBlock1").style.display = 'block';
}

// Передаем на сервер при запуске игры событие входа в игру
// Получаем от сервера данные по пользователю о принятии правил + данные о подписке на бота
// Запрос: /api/?action=startGame&user={userId}
// Результат: json: {'success': true/false, 'rules': true/false, 'subscribe': true/false}

function api_startGame(userId){
	let q = url + 'action=startGame&user=' + userId;

	fetch(q)
		.then((resp) => resp.json()).then(function(data) {
		    //console.log('пользователь: '+userId+' подписка: '+data.subscribe+' правила: '+data.rules);
			window.MCUser.user1.botSubscription = data.subscribe;
			window.MCUser.user1.acceptedRules = data.rules;

			if (data.rules == false) {

			}

		    
		})
		.catch(er => console.log('Ошибка отправки данных\n' + er));
}



// Передаем на сервер данные о принятии правил (если пользователь ранее не принимал правила)
// Запрос: /api/?action=acceptRules&user={userId}
// Результат: json: {'success': true/false}

function api_acceptRules(userId){
	let q = url + 'action=acceptRules&user=' + userId;

	fetch(q)
		.then((resp) => resp.json()).then(function(data) {
		    //console.log(data.success);
		})
		.catch(er => console.log('Ошибка отправки данных\n' + er));

}


// Передаем на сервер данные о баллах по окончании игры
// Запрос: /api/?action=setPoints&points={points}&user={userId}&chat_instance={chat_instance_id}
// Результат: json: {'success': true/false}

function api_setPoints(points, userId, chat_instance){
	let q = url + 'action=setPoints&points=' + points + '&user=' + userId + '&chat_instance=' + chat_instance;

	fetch(q)
		.then((resp) => resp.json()).then(function(data) {
		    //console.log(data.success);
		})
		.catch(er => console.log('Ошибка отправки данных\n' + er));
}


// Получение данных по баллам второго игрока при окончании игры (если играет не один). Есть ли данные если не подписан на бота?
// Запрос: /api/?action=getPoints&typePoints=max/maxDay/lastGame&user={userId}
// Результат: json: {'success': true/false, 'points': {points}}

function api_getPoints(typePoints, userId){
	let q = url + 'action=getPoints&typePoints=' + typePoints + '&user=' + userId;

	fetch(q)
		.then((resp) => resp.json()).then(function(data) {
			if (typePoints=='max') { window.MCUser.user1.gameMaxPoint = data.points; }
			if (typePoints=='maxDay') { window.MCUser.user1.gameMaxPointDay = data.points; }
			if (typePoints=='lastGame') { window.MCUser.user1.gameLastPoint = data.points; }
		    //console.log(data.points);
		})
		.catch(er => console.log('Ошибка отправки данных\n' + er));
}


// Получение данных по сопернику и его очки
// Запрос: /api/?action=action=getPointsRival&chat_instance=222&user=123
// {"success":true,"points":"90","first_name":"First456","last_name":"Last456"}

function api_getPointsRival(userId, chat_instance){
	let q = url + 'action=getPointsRival&chat_instance=' + chat_instance + '&user=' + userId;

	//console.log(q);

	fetch(q)
		.then((resp) => resp.json()).then(function(data) {
			if (data.success == true) {
				//console.log(data.first_name+' '+data.last_name+' '+data.points);
				window.MCUser.user2.firstName = data.first_name;
				window.MCUser.user2.lastName = data.last_name;
				window.MCUser.user2.gameMaxPoint = data.points;
			}
		})
		.catch(er => console.log('Ошибка отправки данных\n' + er));
}


function click_goToTelegramBot() {
	let url = window.MCUser.bot.url_telegram;
 	window.location = url;
 	//Telegram.WebApp.openTelegramLink(window.MCUser.bot.url_telegram);
}

function share_VK(){
  	ym(95511895,'reachGoal','share_VK');
  	let url = window.MCUser.bot.url_social_vk
  		+ 	window.MCUser.bot.url_site 
  		+	'&title=' + encodeURIComponent(window.MCUser.bot.text1 + window.MCUser.user1.gameLastPoint + window.MCUser.bot.text2 + window.MCUser.bot.text2_VK);
//  	+ '&image=' + window.MCUser.bot.url_social_poster
  		+ '&noparse=0&no_vk_links=0';
  	window.location = url;
}

function share_OK(){
  	ym(95511895,'reachGoal','share_OK');
  	let url = window.MCUser.bot.url_social_ok 
  		+ 	window.MCUser.bot.url_site
  		+	'&title=' + encodeURIComponent(window.MCUser.bot.text1 + window.MCUser.user1.gameLastPoint + window.MCUser.bot.text2);
//  	+ '&imageUrl=' + window.MCUser.bot.url_social_poster;
  	window.location = url;
}

function click_legal(){
  	window.location = window.MCUser.bot.url_legal;
}

function click_soglasie(){
  	window.location = window.MCUser.bot.url_soglasie;
}


function base64_decode(c){0<=c.indexOf("=")&&(c=c.substr(0,c.indexOf("=")));for(var k=0,d=0,b,l,e,g,f=0,a,h,m="";k<c.length;++k){l="="==c.charAt(k)?0:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(c.charAt(k));d=(d+6)%8;if(6!=d){b+=l>>d;if(0==f)g=!0,h=0,e=1,128>b&&(e=0,h=b&64,g=!1);else if(128!=(b&192))return!1;for(a=32;g&&0<a;a>>=1)b&a?++e:g=!1;g||(a=6+6*f-e,6<a&&(a=6),a&&(h+=b%(1<<a)<<6*(e-f)));f==e?(m+=String.fromCharCode(h),f=0):++f}b=d?l%(1<<d)<<8-d:0}return m}















