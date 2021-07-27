import { Vibration } from "react-native";
import App from "../App";

const random = require("lodash.random") as (lower?: number, upper?: number, floating?: boolean) => number;

function startNewGame(this: App) {
	this.setState({
		isNewBestScore: false,

		score: 0,
		consecutiveCorrect: 0,
		totalCorrect: 0,
		totalWrong: 0,

		chancesLeft: 3,

		isLastNumberWrong: false,

		isGameOverVisible: false
	}, () => {
		this.generateNumberAry();
	});
}

function getNumberLimit(this: App) {
	const power = Math.ceil((this.state.totalCorrect + 1) / 25);
	return 10 ** (power < 9 ? power : 9);
}

function nextRandomNumber(this: App) {
	const typ = random(-1, 1);
	return random(1, this.getNumberLimit()) * typ;
}

// Only called when starting a new game
function generateNumberAry(this: App) {
	const numberAry = [...new Array(25)].map(_ =>
		this.nextRandomNumber()
	);

	this.setState({ numberAry });
}

// Called in the middle of the gameplay
function continueNumberAry(this: App) {
	const { numberAry } = this.state;

	for (var a = numberAry.length; a < 25; a++)
		numberAry.unshift(this.nextRandomNumber());

	this.setState({ numberAry });
}

function attemptAnswer(this: App, symbol: string) {
	const { numberAry } = this.state;
	let {
		chancesLeft,
		consecutiveCorrect,
		isLastNumberWrong,
		score,
		totalCorrect,
		totalWrong
	} = this.state;

	const lastNum = numberAry.slice(-1)[0];

	if ((symbol === "-" && lastNum < 0) ||
		(symbol === "+" && lastNum > 0) ||
		(symbol === "0" && lastNum === 0)) {
		consecutiveCorrect++;
		totalCorrect++;
		score += 4 + consecutiveCorrect;
		isLastNumberWrong = false;

		numberAry.pop();

		if (totalCorrect % 25 == 0 && chancesLeft < 3) {
			chancesLeft++;
			Vibration.vibrate(75);
		} else Vibration.vibrate(25);
	} else {
		consecutiveCorrect = 0;

		if (!isLastNumberWrong) {
			totalWrong++;
			chancesLeft--;
			isLastNumberWrong = true;
		}
		
		Vibration.vibrate(300);

		if (chancesLeft <= 0)
			this.showGameOverDialog();
	}

	if (numberAry.length <= 10)
		this.continueNumberAry();

	this.setState({
		chancesLeft,
		consecutiveCorrect,
		isLastNumberWrong,
		totalCorrect,
		totalWrong,
		numberAry,
		score
	});
}

function handleMinus(this: App) {
	this.attemptAnswer("-");
}

function handlePlus(this: App) {
	this.attemptAnswer("+");
}

function handleZero(this: App) {
	this.attemptAnswer("0");
}

function showGameOverDialog(this: App) {
	let {
		bestScore,
		isNewBestScore,
		score
	} = this.state;

	if (score > bestScore) {
		bestScore = score;
		isNewBestScore = true;
	}

	this.setState({
		bestScore,
		isNewBestScore,
		isGameOverVisible: true
	}, () => {
		this.saveBestScore();
	});
}

export {
	continueNumberAry,
	generateNumberAry,
	getNumberLimit,
	nextRandomNumber,
	startNewGame,
	attemptAnswer,
	handleMinus,
	handlePlus,
	handleZero,
	showGameOverDialog
}
