import React from "react";
import {
	GestureResponderEvent,
	StyleSheet,
	View,
} from "react-native";

// third party components
import Toast from "react-native-toast-message";
import { accuracyFragment, chanceFragment, controllerFragment, gameOverModalFragment, howToPlayFragment, numberAryFragment, scoreFragment } from "./components/fragments";
import { loadBestScore, saveBestScore } from "./modules/bestScore";
import { attemptAnswer, continueNumberAry, generateNumberAry, getNumberLimit, handleMinus, handlePlus, handleZero, nextRandomNumber, showGameOverDialog, startNewGame } from "./modules/gameMethods";

interface IGameState {
	numberAry: number[];

	score: number;
	bestScore: number;
	isNewBestScore: boolean;

	consecutiveCorrect: number;
	totalCorrect: number;
	totalWrong: number;
	chancesLeft: number;
	isLastNumberWrong: boolean;

	isGameOverVisible: boolean;
}
export default class App extends React.Component<{}, IGameState> {
	constructor(props: any) {
		super(props);

		this.state = {
			numberAry: [],
			score: 0,
			bestScore: 0,
			isNewBestScore: false,
			consecutiveCorrect: 0,
			totalCorrect: 0,
			totalWrong: 0,
			chancesLeft: 0,

			isLastNumberWrong: false,

			isGameOverVisible: false
		};
	}

	componentDidMount() {
		this.startNewGame();

		window.setTimeout(() => {
			this.loadBestScore();
		}, 500);
	}

	noop() { }

	showMinusToast(e: GestureResponderEvent) {
		Toast.show({
			type: "info",
			text1: "Minus"
		});
	}

	showPlusToast(e: GestureResponderEvent) {
		Toast.show({
			type: "info",
			text1: "Plus"
		});
	}

	// gameMethods.ts
	continueNumberAry = continueNumberAry;
	generateNumberAry = generateNumberAry;
	getNumberLimit = getNumberLimit;
	nextRandomNumber = nextRandomNumber;
	startNewGame = startNewGame;
	attemptAnswer = attemptAnswer;
	handleMinus = handleMinus;
	handlePlus = handlePlus;
	handleZero = handleZero;
	showGameOverDialog = showGameOverDialog;
	
	readonly bestScoreKey = "@App:bestScore";
	// bestScore.ts
	loadBestScore = loadBestScore;
	saveBestScore = saveBestScore;
	
	// fragments.tsx
	accuracyFragment = accuracyFragment;
	chanceFragment = chanceFragment;
	controllerFragment = controllerFragment;
	gameOverModalFragment = gameOverModalFragment;
	howToPlayFragment = howToPlayFragment;
	numberAryFragment = numberAryFragment;
	scoreFragment = scoreFragment;

	render() {
		return (
			<View style={styles.mainContainer}>
				{this.scoreFragment()}
				{this.accuracyFragment()}
				{this.chanceFragment()}
				{this.numberAryFragment()}
				{this.controllerFragment()}
				{this.howToPlayFragment()}

				{this.gameOverModalFragment()}

				<Toast ref={ref => Toast.setRef(ref)} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	mainContainer: {
		backgroundColor: "#222",
		height: "100%",
		padding: 20
	}
});
