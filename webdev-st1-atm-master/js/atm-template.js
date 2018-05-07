const ATM = {
	is_auth: false, 
	current_user: false, // 
	current_type: false, //
	current_log: {log: "", count: 0},
	log: "",
	 
	// all cash of ATM
	cash: 2000,
	// all available users
	users: [
		{number: "0000", pin: "000", debet: 0, type: "admin", name: "Admin"}, // EXTENDED
		{number: "0025", pin: "123", debet: 675, type: "user", name: "Oleksii"},
		{number: "0026", pin: "222", debet: 1000, type: "user", name: "Aleksandr"},
		{number: "7777", pin: "777", debet: 100000, type: "user", name: "Yura"},
		{number: "8888", pin: "888", debet: 100001, type: "user", name: "Nastya"}
	],
	// authorization
	auth: function(number, pin) {
		if(this.is_auth){
			console.log("вы должны разлогиниться! зачем вы пробуете логинитесь повторно"); // удалить перед сдаче
			return;
		}
		for(let i = 0; i < this.users.length; i++){
			if(this.users[i].number === number){
				if(this.users[i].pin === pin){
					this.is_auth = true;
					this.current_user = i;
					this.current_type = this.users[i].type;
					console.log(`Добрый день ${this.users[i].name}, вы успешно залогинились.`);
					let log = `${this.users[i].name}, успешно залогинилcя.`;
					this.logs(log);
					return;
				} 
			}
		}    
		console.log("Не верный логин или пароль");
	},
	// check current debet  проверить баланас  +++++++++++++++++   можно сдавать 
	check: function() {
		if ( !this.checkIsAuth() ){
			return;
		}
			console.log(`На вашем балнсе: ${this.users[this.current_user].debet}`);
			this.log = `${this.users[this.current_user].name}, проверил свой баланс.`;
			this.logs(this.log);
	},

	// get cash - available for user only     снять деньги с банкомата +++++++ можно сдавать 
	getCash: function(amount) {
		if( !this.checkIsAuth() ){
			return;
		}
		if ( !this.checkMoney(amount) ) {
			return;
		}
 		if(amount > this.users[this.current_user].debet){
 			console.log(`У вас не хватает денег для снятий, у Вас на балансе: ${this.users[this.current_user].debet}`);
 			this.log = `${this.users[this.current_user].name}, не смог снять деньги, сумма больше чем на баланся.`;
			this.logs(this.log);
 			return;
 		}
 		if(amount > this.cash){
 			console.log(`В банкомате нету столько, вы можете снять: ${this.cash}`);
 			this.log = `${this.users[this.current_user].name}, не смог снять деньги, сумма больше чем в банкомате.`;
			this.logs(this.log);
 			return;
 		}
 			console.log(`получите ваши деньги: ${amount} гривень,`);
 			this.users[this.current_user].debet -= parseInt(amount);
 			this.cash -= parseInt(amount);
 			this.log = `${this.users[this.current_user].name}, снял ${amount} грн.`;
			this.logs(this.log);
	},

	// положить деньги на баланс пользователя
	loadCash: function(amount){
		if ( !this.checkIsAuth() ){
			return;
		} 
		if ( !this.checkMoney(amount) ) {
			return;
		}
 			this.users[this.current_user].debet += parseInt(amount);
 			console.log(`Вы успешло положили: ${amount} гривен, Пожалуйста проверте свой баланс :)`);
 			this.log = `${this.users[this.current_user].name}, положил ${amount} грн.`;
			this.logs(this.log);
	},

	// load cash to ATM - available for admin only - EXTENDED  добавить деньги в ATM только для админа
	load_cash: function(addition) { //!this.current_type != "admin"
 		if ( this.current_type != "admin" ){ 
 			console.log("Только администратор может пользоваться данной функцией");// 
 			this.log = "Пытались воспользоваться функциями администратора, положить деньги.";
			this.logs(this.log);
 			return;
 		}
 		if ( !this.checkMoney(addition) ) {
			console.log("введите корректную сумму"); // удалить перед сдачей
			return;
		 }
 			this.cash += parseInt(addition);
 			console.log(`Поздравляю вы положили на счет: ${addition} грн. В банкомате ${this.cash} грн`);

 			this.log = `${this.users[this.current_user].name}, Администратор, положил в банкомат: ${addition} грн.`;
			this.logs(this.log);
	},

	// get report about cash actions - available for admin only - EXTENDED она только показует 
	getReport: function() {
		if ( this.current_type != "admin" ){
			console.log("Только администратор может пользоваться данной функцией")
			this.log = `Пытались воспользоваться функциями администратора, Посмотреть логи.`;
			this.logs(this.log);
			return;
		}
		this.log = `${this.users[this.current_user].name}, посмотрел логи ;).`;
		this.logs(this.log);
 		console.log(this.current_log.log);
	},

	// log out
	logout: function() {
		if ( this.current_type === "admin"){
			console.log(`вы разлогинились. Хорошего Вам дня ${this.users[this.current_user].name} ;-)`);
			this.log = `${this.users[this.current_user].name}, Разлогинился.`;
			this.logs(this.log);
			this.is_auth = false;
			this.current_user = false;
			this.current_type = false;
			return;
		}
		if ( !this.checkIsAuth() ){
			return;
		}
			console.log(`вы разлогинились. Хорошего Вам дня ${this.users[this.current_user].name} ;-)`);
			this.log = `${this.users[this.current_user].name}, Разлогинился;).`;
			this.logs(this.log);
			this.is_auth = false;
			this.current_user = false;
			this.current_type = false;
	},

	checkIsAuth: function() { 
		if( !this.is_auth ) {   // аутификация
			console.log("Вы не залогинились, вы не можете работать с банкоматом !!!");
			this.log = `Не авторизированный пользователь, пытался воспользоваться функциями банкомата.`;
			this.logs(this.log);
			return false;
		} 
		if ( this.current_type != "user" ) { // если не пользователь 
			console.log(this.current_type);
			console.log("Вы залогинились как Администратор, Вы не можете работать с банкоматом  как пользователь!!!");
			this.log = `Администратор, пытался воспользоваться функциями пользователя.`;
			this.logs(this.log);
			return false;
		}
		return true;
	},

	checkMoney: function(money){
		if ( typeof(money) === "number" && money > 0  ) {
			console.log("good"); // удалить перед сдачей
			return true;
		} 
			console.log("bad"); // удалить перед сдачей
			this.log = `${this.users[this.current_user].name}, сумма указанна не верно.`;
			this.logs(this.log);
			return false;
	},
		// функция для записи в базу логов
	logs: function(log){
		let d = new Date();
		this.current_log.log += `${d.toUTCString()} - ${this.current_type}: ${log} \n`;
	}
};
