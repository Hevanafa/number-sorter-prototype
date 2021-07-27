import React from "react";
import {
	TouchableOpacity,
	Text
} from "react-native";

interface IProps {
	background?: string,
	onPress?: (e?: any) => void,
	text: string
}
export default class Boton extends React.Component<IProps> {
	render() {
		const {
			background,
			onPress,
			text
		} = this.props;

		return (
			<TouchableOpacity
				style={{
					backgroundColor: background,
					height: 50,
					margin: 10,
					flex: 1
				}}
				onPress={onPress}>
				<Text style={{
					fontSize: 30,
					color: "white",
					height: 50,
					textAlign: "center",
					textAlignVertical: "center"
				}}>
					{text}
				</Text>
			</TouchableOpacity>
		);
	}
}
