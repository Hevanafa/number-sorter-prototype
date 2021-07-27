import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
	GestureResponderEvent,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Vibration,
	Modal,
	Button
} from "react-native";

// third party components
// import Dialog, { DialogButton, DialogContent, DialogFooter, DialogTitle, SlideAnimation } from "react-native-popup-dialog";
import Toast from "react-native-toast-message";

const random = require("lodash.random") as (lower?: number, upper?: number, floating?: boolean) => number;

interface IProps {
	background?: string,
	onPress?: (e?: any) => void,
	text: string
}
class Boton extends React.Component<IProps> {
	render() {
		return (
			<TouchableOpacity
				style={{
					backgroundColor: this.props.background,
					height: 50,
					margin: 10,
					flex: 1
				}}
				onPress={this.props.onPress}>
				<Text style={{
					fontSize: 30,
					color: "white",
					height: 50,
					textAlign: "center",
					textAlignVertical: "center"
				}}>
					{this.props.text}
				</Text>
			</TouchableOpacity>
		);
	}
}

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

	startNewGame() {
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

	get numberLimit() {
		const power = Math.ceil((this.state.totalCorrect + 1) / 25);
		return 10 ** (power < 9 ? power : 9);
	}

	nextRandomNumber = () => {
		const typ = random(-1, 1);
		return random(1, this.numberLimit) * typ;
	}

	// Only called when starting a new game
	generateNumberAry() {
		const numberAry = [...new Array(25)].map(_ =>
			this.nextRandomNumber()
		);

		this.setState({ numberAry });
	}

	// Called in the middle of the gameplay
	continueNumberAry() {
		const { numberAry } = this.state;

		for (var a = numberAry.length; a < 25; a++)
			numberAry.unshift(this.nextRandomNumber());

		this.setState({ numberAry });
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

	attemptAnswer(symbol: string) {
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
				Vibration.vibrate([75]);
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

	showGameOverDialog() {
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

	readonly bestScoreKey = "@App:bestScore";
	async saveBestScore() {
		try {
			await AsyncStorage.setItem(
				this.bestScoreKey,
				this.state.bestScore + ""
			);
		} catch (error) {
			Toast.show({
				type: "error",
				text1: error + ""
			});
		}
	}

	async loadBestScore() {
		try {
			let bestScoreRaw = await AsyncStorage.getItem(
				this.bestScoreKey
			);

			if (!bestScoreRaw) return;

			const bestScore = Number(bestScoreRaw);
			this.setState({ bestScore });
		} catch (error) {
			Toast.show({
				type: "error",
				text1: error + ""
			});
		}
	}

	handleMinus() {
		this.attemptAnswer("-");
	}

	handlePlus() {
		this.attemptAnswer("+");
	}

	handleZero() {
		this.attemptAnswer("0");
	}

	scoreFragment = () => {
		const {
			bestScore,
			consecutiveCorrect,
			score
		} = this.state;

		return (
			<>
				<Text style={styles.score}>
					{consecutiveCorrect ? `(+${consecutiveCorrect}) ` : ""}
					Score: {(score + "").padStart(6, "0")}
				</Text>

				{
					bestScore > 0
						? (
							<Text style={styles.score}>
								Best: {(bestScore + "").padStart(6, "0")}
							</Text>
						) : null
				}
			</>
		);
	}

	accuracyFragment = () => {
		const { totalCorrect, totalWrong } = this.state,
			totalChance = totalCorrect + totalWrong,
			percentage = Math.round(totalCorrect / (totalChance || 1) * 10000) / 100;

		return (
			<Text style={styles.score}>
				{percentage + "%"} ({totalCorrect} | {totalWrong})
			</Text>
		)
	}

	chanceFragment = () => {
		return (
			<Text style={styles.score}>
				❤ {this.state.chancesLeft}
			</Text>
		);
	}

	numberAryFragment = () => {
		const {
			isLastNumberWrong,
			numberAry,
			totalCorrect
		} = this.state;

		return (
			numberAry.slice(-10).map((item, idx) =>
				<Text
					key={`num_${idx}`}
					style={[
						idx < 9
							? styles.numberAry
							: styles.numberAryLast
							,
						// Extra life indicator
						(totalCorrect + 10 - idx) % 25 == 0 &&
							totalCorrect > 1
							? styles.extraLife
							: undefined,
						// Wrong answer
						idx === 9 && isLastNumberWrong
						? styles.numberAryLastWrong
						: undefined]}>
					{item}
				</Text>
			)
		);
	}

	controllerFragment = () => {
		return (
			<View style={{
				flexDirection: "column",
				justifyContent: "space-around",
				position: "relative",
				marginTop: 20,
				height: 140
			}}>
				{/* The two flex Views here have to be contained in
					another view with a fixed height so that they
					won't stack on top of each other */}
				<View style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "space-between",
					height: 70,
					position: "relative"
				}}>
					<Boton
						background="#957DAD"
						onPress={this.handleMinus.bind(this)}
						text="-"
					/>
					<Boton
						background="#D291BC"
						onPress={this.handlePlus.bind(this)}
						text="+"
					/>
				</View>

				<View style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "space-between",
					height: 70,
					position: "relative"
				}}>
					<View style={{
						flex: 2
					}} />

					<Boton
						background="grey"
						onPress={this.handleZero.bind(this)}
						text="0"
					/>

					<View style={{
						flex: 2
					}} />
				</View>
			</View>
		);
	}

	howToPlayFragment = () => {
		return (
			<View style={{
				flex: 1,
				marginTop: 20
			}}>
				<Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
					How to play
				</Text>
				<Text style={{ color: "white", textAlign: "center" }}>
					Sort the numbers depending on whether the number is positive, negative, or zero.
				</Text>
			</View>
		);
	}

	// gameOverDialogFragment() {
	// 	return (
	// 		<Dialog
	// 			visible={this.state.isGameOverVisible}
	// 			dialogAnimation={new SlideAnimation({
	// 				slideFrom: "bottom"
	// 			})}
	// 			dialogTitle={<DialogTitle title="Game Over" />}
	// 			footer={
	// 				<DialogFooter>
	// 					<DialogButton
	// 						text="Restart"
	// 						onPress={() => { this.startNewGame(); }}
	// 					/>
	// 				</DialogFooter>
	// 			}>
	// 			<DialogContent>
	// 				<Text>
	// 					{`Your score: ${this.state.score}` + (this.state.isNewBestScore ? " (New best!)" : "")}
	// 				</Text>

	// 				{/* <Boton
	// 						background="white"
	// 						onPress={this.noop.bind(this)}
	// 						text="Restart"
	// 					/> */}
	// 			</DialogContent>
	// 		</Dialog>
	// 	);
	// }

	gameOverDialogFragment2() {
		const {
			isGameOverVisible,
			isNewBestScore,
			score
		} = this.state;

		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={isGameOverVisible}>
				<View
					style={modalStyles.modal}>
					<Text style={modalStyles.title}>
						Game Over
					</Text>
					<Text style={modalStyles.bodyText}>
						{
							`Your score: ${score}` +
							(isNewBestScore ? " (New best!)" : "")
						}
					</Text>

					<Button
						color="cornflowerblue"
						onPress={() => { this.startNewGame(); }}
						title="Restart"
					/>
				</View>
			</Modal>
		)
	}

	render() {
		return (
			<View style={styles.mainContainer}>
				{this.scoreFragment()}
				{this.accuracyFragment()}
				{this.chanceFragment()}
				{this.numberAryFragment()}
				{this.controllerFragment()}
				{this.howToPlayFragment()}

				{/* {this.gameOverDialogFragment()} */}
				{this.gameOverDialogFragment2()}

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
	},
	numberAry: {
		color: "white",
		fontSize: 18,
		textAlign: "center"
	},
	numberAryLast: {
		color: "white",
		fontSize: 24,
		textAlign: "center",
		backgroundColor: "#333",
		fontWeight: "bold"
	},
	numberAryLastWrong: {
		backgroundColor: "#633"
	},
	extraLife: {
		color: "lime"
	},
	score: {
		color: "pink",
		fontSize: 18,
		textAlign: "right"
	},
});

const modalStyles = StyleSheet.create({
	modal: {
		backgroundColor: "#444",
		borderRadius: 20,
		alignItems: "center",
		padding: 20,
		margin: 20,
		marginTop: "auto",
		marginBottom: "auto",

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.30,
		shadowRadius: 4.65,

		elevation: 8,
	},
	title: { color: "white", fontSize: 20 },
	bodyText: { color: "white" }
});