const numberFormatMassege = "Вводите в строку только числа";

function firstTask() { 
	let firstNumber = +document.getElementById("ft_firstNumber").value;
	let secondNumber = +document.getElementById("ft_secondNumber").value;
	const resultFirstTast = document.getElementById("ft_result");
	if (!firstNumber && firstNumber != 0   || !secondNumber && secondNumber != 0 ){
		resultFirstTast.innerText = numberFormatMassege;
		return;
	}
	if (firstNumber > secondNumber){
		[secondNumber, firstNumber] = [firstNumber, secondNumber];
	}
	let result = 0;
	for (let i = firstNumber; i <= secondNumber; i++){
		result += i;
	}
	resultFirstTast.innerText = result;
}

function secondTask() {
	let firstNumber = +document.getElementById('st_firstNumber').value;
	let secondNumber = +document.getElementById('st_secondNumber').value;
	const resultSecondTask = document.getElementById('st_result');
	if (!firstNumber && firstNumber != 0   || !secondNumber && secondNumber != 0 ){
		resultSecondTask.innerText = numberFormatMassege;
		return;
	}
	if (firstNumber > secondNumber){
		[secondNumber, firstNumber] = [firstNumber, secondNumber];
	}
	let result = 0;
	for (let i = firstNumber; i <= secondNumber; i++){
		let removeMinus = Math.abs(i); 
		let check = removeMinus % 10;
		if(check === 2 || check === 3 || check === 7){
			result += i;
		}
	}
	resultSecondTask.innerText = result;
}

function thirdTask(){
	const container = document.getElementById("thirdTaskList");
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	const firstNumber = +document.getElementById("tt_firstNumber").value;
	if (!firstNumber && firstNumber != 0) {
		container.innerText = numberFormatMassege;
		return;
	}
	const errorMesseg = "введите число меньше от 1 до 300!!!";
	if (firstNumber > 300 || firstNumber <= 0){
		container.innerText = errorMesseg;
		return;
	}
	const ul = document.createElement("ul");
	container.appendChild(ul);
	let star = "";

	for (let i = 1; i <= firstNumber; i++){
		const li = document.createElement("li");     /*<<<<-- в данной ситуации, если вынести её из цыкла сломает задачку -----*/
		id  = "myLi" + i;
		li.setAttribute('id', id);
		ul.appendChild(li);
		for (let k = i - 1; k < i; k++){
			star += "*" 
		}	
		const liContent = document.getElementById('myLi' + i);
		liContent.innerText = star; 
	}
}

function fourthTask(){
	let firstNumber = +document.getElementById('getUserSeconds').value;
	if (firstNumber <= 0 || !firstNumber){
		document.getElementById("fourTaskResult").innerText = numberFormatMassege;
		return;
	}
	let hour = 0, minutes = 0;
	const secondPerHour = 3600;
	if (firstNumber >= secondPerHour){
		hour = firstNumber / secondPerHour;
		hour =  Math.trunc(hour);
		firstNumber = firstNumber - (secondPerHour * hour);
	}
	const secondPerMinutes = 60;
	if (firstNumber >= secondPerMinutes){
		minutes = firstNumber / secondPerMinutes
		minutes =  Math.trunc(minutes);
		firstNumber = firstNumber - (secondPerMinutes * minutes);
	}
		const result = hour.toString().padStart(2, '0')  + ':' + minutes.toString().padStart(2, '0') + ':' + firstNumber.toString().padStart(2, '0');
		document.getElementById('timeResult').value = result;
}

function fifthTask(){ 
	const year = +document.getElementById('fifth_task_year').value;
	const elemForRess = document.getElementById('fiftTResult');
	elemForRess.value = "";

	if (year != 0 && !year) {
		elemForRess.value = numberFormatMassege; 
		return;
	}
	const removeUnnecessary = year % 100;
	const number = removeUnnecessary.toString();
	const numberLenght = number.length;
	let result = "";
	if (year === 0){
		result = `${year} лет`;
		elemForRess.value = result;
		return;
	}
	if (number[numberLenght - 1] == 1){
		if (number[numberLenght - 2] == 1){
			result = `${year} лет`;
			elemForRess.value = result;
			return;
		}else{
			result = `${year} год`;
			elemForRess.value = result;
			return;
		}
	}
	if (number[numberLenght - 1] == 2 || number[numberLenght -1] == 3 || number[numberLenght -1] == 4){
		if (removeUnnecessary >= 11 && removeUnnecessary < 20){
			result = `${year} лет`;
			elemForRess.value = result;
			return;
		} else {
			result = `${year} года`;
			elemForRess.value = result;
			return;
		}
	} else {
		result = `${year} лет`;
		elemForRess.value = result;
		return;
	}
	if (number[numberLenght - 1] == 0){
		result = `${year} лет`;;
		elemForRess.value = result;
	}
}

function sixthTask(){ 
	let date1 = new Date(document.getElementById('sixTaskFirstNumber').value);
	let date2 = new Date(document.getElementById('sixTaskSecondNumber').value);
	const resultSixTask = document.getElementById("sixTaskResultP");
	if (date1 === "Invalid Date" || date2 === "Invalid Date"){
		resultSixTask.innerText = "Ooops... Invalid Date";
		return;
	}
	if (date2 > date1){
		[date1, date2] = [date2, date1];
	}
    let year = date1.getYear() - date2.getYear();
    let month = date1.getMonth() - date2.getMonth();
    let date = date1.getDate() - date2.getDate();
    let hours = date1.getHours() - date2.getHours();
    let minutes = date1.getMinutes() - date2.getMinutes();
    let seconds = date1.getSeconds() - date2.getSeconds();
	
	if (seconds < 0){
		minutes = minutes - 1;
		seconds = 60 + seconds; 
	}
	if (minutes < 0){
		hours = hours - 1;
		minutes = 60 + minutes; 
	}
	if (hours < 0){
		date = date - 1;
		hours = 24 + hours; 
	}
	if (date < 0){
		month = month - 1;
		date = new Date(date1.getYear(), date1.getMonth() + 1, 0).getDate() + date; 
	}
	if (month < 0){
		year = year - 1;
		month = 12 + month; 
	}
	const result = ` ${year} года, ${month} месяц ${date} дней ${hours} часов, ${minutes} минут ${seconds} секунд`;
	resultSixTask.innerText = result;
}

function sixTaskVersion2(){
	let firstNumber = document.getElementById('sixTaskFirstNumber2').value;
	let secondNumber = document.getElementById('sixTaskSecondNumber2').value;
    let date1 = Date.parse(firstNumber);
    let date2 = Date.parse(secondNumber);
    const resulrSixTaskV2 = document.getElementById("sixTaskResultP2");
	if (date1 === "Invalid Date" || date2 === "Invalid Date"){
		resulrSixTaskV2.innerText = "Ooops... Invalid Date";
		return;
	}
	if (date2 > date1){
		[date1, date2] = [date2, date1];
		[firstNumber, secondNumber] = [secondNumber, firstNumber];
	}
	const z = new Date(date1 - date2);
	const epoch = new Date("1970-01-01 00:00:00");
	const yearRessult = z.getYear() - epoch.getYear();
	const monthRessult = z.getMonth() - epoch.getMonth();
	const daysRessult = z.getDate() - epoch.getDate();
	// ********************************** //
		const d1 = new Date();
		const timeSecond = d1.setTime(Date.parse(firstNumber));
		const d2 = new Date();
		const timeFirst = d2.setTime(Date.parse(secondNumber));

		const differenceBetweenTwoDate = Math.abs(timeSecond - timeFirst);
		const MILESECONDS_IN_YEAR = 31536000000;
		const MILESECONDS_IN_MOUTH = 2592000000;
		const MILESECONDS_IN_DAY = 86400000;
		const MILESECONDS_IN_HOUR = 3600000;
		const MILESECONDS_IN_MINUTES = 60000;
		const MILESECONDS = 1000;
		const hourRessult = Math.floor((((differenceBetweenTwoDate % MILESECONDS_IN_YEAR) % MILESECONDS_IN_MOUTH) % MILESECONDS_IN_DAY) / MILESECONDS_IN_HOUR);
		const minutesRussult = Math.floor(((((differenceBetweenTwoDate % MILESECONDS_IN_YEAR) % MILESECONDS_IN_MOUTH) % MILESECONDS_IN_DAY) % MILESECONDS_IN_HOUR) / MILESECONDS_IN_MINUTES);
		const secondsRessult = Math.floor((((((differenceBetweenTwoDate % MILESECONDS_IN_YEAR) % MILESECONDS_IN_MOUTH) % MILESECONDS_IN_DAY) % MILESECONDS_IN_HOUR) % MILESECONDS_IN_MINUTES) / MILESECONDS);
		// ***************************************** //
	const result = `${yearRessult} года, ${monthRessult} месяц, ${daysRessult} дней, ${hourRessult} часов, ${minutesRussult} минут, ${secondsRessult} секунд `;
	resulrSixTaskV2.innerText = result;
}

function sevenTask(){
	const date = document.getElementById("seven_task_data").value + "";
	const imgZodiac  = document.getElementById('zodiacSign');
	const ckeckValidationDate = checkDateSevenTask(date);
	const resultSevenTask = document.getElementById('resultErorrSevenTask');

	if ( ckeckValidationDate === false ) {
		const errorMesseg = "Invalid Date";
		imgZodiac.src = "#";
		resultSevenTask.innerText = errorMesseg;
		return;
	}
	const d = new Date(date);
	const day = d.getDate();
	const m = new Date(date);
	const mounths = m.getMonth() + 1;
	
	if (mounths === 1 && day >= 20 || mounths === 2 && day <= 18){  
		imgZodiac.src="img/водолей.png";
	}
	else if (mounths === 2 && day >= 19 || mounths === 3 && day <= 20){
		imgZodiac.src="img/рыбы.png";
	} 
	else if (mounths === 3 && day >= 21 || mounths === 4 && day <= 19){
		imgZodiac.src="img/Оввен.png";
	} 
	else if (mounths === 4 && day >= 20 || mounths === 5 && day <= 20){
		imgZodiac.src="img/телец.png";
	}
	else if (mounths === 5 && day >= 21 || mounths === 6 && day <= 21){
		imgZodiac.src="img/близнецы.png";
	}
	else if (mounths === 6 && day >= 22 || mounths === 7 && day <= 22){
		imgZodiac.src="img/рак.png";
	}
	else if (mounths === 7 && day >= 23 || mounths === 8 && day <= 22){
		imgZodiac.src="img/Лев.png";
	}
	else if (mounths === 8 && day >= 23 || mounths === 9 && day <= 22){
		imgZodiac.src="img/дева.png";
	}
	else if (mounths === 9 && day >= 23 || mounths === 10 && day <= 22){
		imgZodiac.src="img/весы.png";
	}
	else if (mounths === 10 && day >= 23 || mounths === 11 && day <= 21){
		imgZodiac.src="img/скорпион.png";
	}
	else if (mounths === 11 && day >= 22 || mounths === 12 && day <= 21){
		imgZodiac.src="img/стрелец.png";
	}
	else if (mounths === 12 && day >= 22 || mounths === 1 && day <= 19){
		imgZodiac.src="img/козерог.png";
	} 
	resultSevenTask.innerText = "";
}

function checkDateSevenTask(date){
	const checkValidation = date.split('-');
	const arr = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (arr[checkValidation[0] ] < checkValidation[2]){
		document.getElementById('resultErorrSevenTask').innerText = `в этом месяце максимальное количество дней ${arr[dateAndMounths[1] - 1]}`;
		return false;
	}
	checkValidation[1] -= 1;
		const d = new Date(checkValidation[0], checkValidation[1], checkValidation[2]);
	if ((d.getFullYear() == checkValidation[0]) && (d.getMonth() == checkValidation[1]) && (d.getDate() == checkValidation[2])) {
		return;
	} else {
		return false;
	}
}

function eightTast(){
	const getValuefirst = +document.getElementById('eightTaskGetValue').value;
	const getValueSecond = +document.getElementById('eightTaskGetSecondValue').value;
	if (getValuefirst > 50 || getValuefirst <= 0 || getValueSecond > 50 || getValueSecond <= 0 || !getValuefirst || !getValueSecond){
		document.getElementById('eightTaskMessege').innerText = "числа от 1 до 50!!!";
		return;
	}
	const container = document.getElementById('eight_task_div');
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	for (let i = 1; i <= getValuefirst; i++){		
		const ul = document.createElement("ul");              /*каждый новый ряд доски  если убрать сломает*/
		container.appendChild(ul);
		const attrUl = 'E_Ul' + i;
		ul.setAttribute('id', attrUl);
		const getAttr = document.getElementById(attrUl);
		for (let k = 1; k <= getValueSecond; k++) {
			const li = document.createElement("li");
			getAttr.appendChild(li);
		}	
	}
	document.getElementById('eightTaskMessege').innerText = "";
}

function nineTask(){
	const entrance = +document.getElementById("entrance").value;
	const flats = +document.getElementById("flats").value;
	const numberOfFloors = +document.getElementById("numberOfFloors").value;
	const apartmentNumber = +document.getElementById("apartmentNumber").value;

	const numberOfFlats = entrance * flats * numberOfFloors;
	const outputRessult = document.getElementById('nineTaskResults');

	if (!entrance || !flats || !numberOfFloors || !apartmentNumber) {
		outputRessult.innerText = numberFormatMassege;
		return;
	}
	if (apartmentNumber > numberOfFlats || apartmentNumber <= 0) {
		const errorMesseg = "такой квартиры не существует";
		outputRessult.innerText = errorMesseg;
		return;
	}
	let countUnder = 1;
	let countFlors = 1;
	const flightOfStairs =  numberOfFloors * flats;
	for (let i = 1; i < apartmentNumber; i++){
		if (i % flats === 0){
			countFlors++;
		}
		if (i % flightOfStairs === 0){ 
			countUnder++;
			countFlors -= numberOfFloors;
		}
	}
	const result = `подьезд № ${countUnder} этаж № ${countFlors}`;
	outputRessult.innerText = result;
}

function tenTask() { 
	const firstNumber = document.getElementById('tenTaskGetNumber').value;

	const arr = firstNumber.toString().replace(/[^0-9]/g, "").split('');
	const result = arr.reduce(function(acc, item){
		return acc + parseInt(item);
	}, 0);

	document.getElementById("ten_result").innerText = result;
}

function elevenTask(){
	const clear = document.getElementById('elevenTaskTextarea');
	clear.innerText = "";
	const container = document.getElementById('link-item-ul');
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	const a = document.getElementById('elevenTaskTextarea');
	const ul = document.getElementById("link-item-ul");
	const link = a.value
	.split(/[\s,]/)
	.filter(link => link)
	.map(link => link.replace(/https?\:\/\//gi,''))
	.sort()
	.reduce(function(acc, link){ 
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.href = `//${link}`;
		a.innerText = link;
		li.appendChild(a);
		return ul.appendChild(li);
	});
}

