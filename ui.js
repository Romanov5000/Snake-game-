'use strict';
const React = require('react');
const { useState, useEffect, useContext } = require('react');
const importJsx = require('import-jsx');
const { Text, Box } = require('ink');
const useInterval = require('./useInterval');
const { default: StdinContext } = require('ink/build/components/StdinContext');
const DiedScreen = importJsx('./DiedScreen')


const FIELD_SIZE = 16;
const FIELD_ROW = [...new Array(FIELD_SIZE).keys()];

const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ARROW_LEFT = '\u001B[D';
const ARROW_RIGHT = '\u001B[C';

let foodItem = {
	x: Math.floor(Math.random() * FIELD_SIZE),
	y: Math.floor(Math.random() * FIELD_SIZE),
}

const DIRECTION = {
	RIGHT: { x: 1, y: 0 },
	LEFT: { x: -1, y: 0 },
	TOP: { x: 0, y: -1 },
	BOTTOM: { x: 0, y: 1 },
}

function getItem(x, y, snakeSegents) {
	if (foodItem.x === x && foodItem.y === y) {
		return <Text color="red"> ■ </Text>
	}
	for (const segment of snakeSegents) {
		if (segment.x === x && segment.y === y) {
			return <Text color="green"> ■ </Text>
		}
	}
}

function limitByField(x) {
	if (x >= FIELD_SIZE) {
		return 0;
	}
	if (x < 0) {
		return FIELD_SIZE - 1;
	}
	return x;
}

function newSnakePosition(segments, direction) {
	const [head] = segments;
	const newHead = {
		x: limitByField(head.x + direction.x),
		y: limitByField(head.y + direction.y),
	};
	if (SnakeEatFood(newHead, foodItem)) {
		foodItem = {
			x: Math.floor(Math.random() * FIELD_SIZE),
			y: Math.floor(Math.random() * FIELD_SIZE),
		};
		return [newHead, ...segments];
	}
	return [newHead, ...segments.slice(0, -1)]
}

function SnakeEatFood(head, foodItem) {
	return head.x === foodItem.x && head.y === foodItem.y
}

const App = () => {

	const [snakeSegents, setSnakeSegments] = useState([
		{ x: 8, y: 8 },
		{ x: 8, y: 7 },
		{ x: 8, y: 6 },
	]);

	const [direction, setDirection] = useState(DIRECTION.LEFT);
	const { stdin, setRawMode } = useContext(StdinContext);

	useEffect(() => {
		setRawMode(true);
		stdin.on('data', data => {
			const value = data.toString();
			if (value == ARROW_UP) {
				setDirection(DIRECTION.TOP);
			}
			if (value == ARROW_DOWN) {
				setDirection(DIRECTION.BOTTOM);
			}
			if (value == ARROW_LEFT) {
				setDirection(DIRECTION.LEFT);
			}
			if (value == ARROW_RIGHT) {
				setDirection(DIRECTION.RIGHT);
			}
		});
	}, []);

	const [head, ...tail] = snakeSegents;

	const intersectWithItself = tail.some(
		segment => segment.x === head.x && segment.y === head.y
	)

	useInterval(() => {
		setSnakeSegments(segments => newSnakePosition(segments, direction))
	}, intersectWithItself ? null : 80);

	return (
		<Box flexDirection='column' alignItems='center'>
			<Text>
				<Text color="green">Snake</Text> game
		</Text>
			{intersectWithItself ? (
				<DiedScreen size={FIELD_SIZE} />) :
				(<Box flexDirection='column'>
					{FIELD_ROW.map(y => (
						<Box key={y}>
							{FIELD_ROW.map(x => (
								<Box key={x} >{getItem(x, y, snakeSegents) || <Text> . </Text>}</Box>
							))}
						</Box>
					))}
				</Box>)
			}

		</Box>
	);
}

module.exports = App;



