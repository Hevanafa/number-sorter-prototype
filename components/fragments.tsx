import React from "react";
import {
	StyleSheet,
	View,
	Text,
	Button,
	Modal
} from "react-native";

import App from "../App";
import Boton from "./Boton";

function scoreFragment(this: App) {
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

function accuracyFragment(this: App) {
	const { totalCorrect, totalWrong } = this.state,
		totalChance = totalCorrect + totalWrong,
		percentage = Math.round(totalCorrect / (totalChance || 1) * 10000) / 100;

	return (
		<Text style={styles.score}>
			{percentage + "%"} ({totalCorrect} | {totalWrong})
		</Text>
	)
}

function chanceFragment(this: App) {
	return (
		<Text style={styles.score}>
			❤ {this.state.chancesLeft}
		</Text>
	);
}

function numberAryFragment(this: App) {
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

function controllerFragment(this: App) {
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

function howToPlayFragment(this: App) {
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

function gameOverModalFragment(this: App) {
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

export {
	accuracyFragment,
	chanceFragment,
	controllerFragment,
	gameOverModalFragment,
	howToPlayFragment,
	numberAryFragment,
	scoreFragment
};
