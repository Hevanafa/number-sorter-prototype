import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import App from "../App";

async function saveBestScore(this: App) {
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

async function loadBestScore(this: App) {
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

export {
	loadBestScore,
	saveBestScore
}
