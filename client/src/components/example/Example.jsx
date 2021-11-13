import React, { useState } from 'react';
import ss from 'socket.io-stream';
import socketClient from "socket.io-client";

const url =
  process.env.NODE_ENV === "production"
    ? `${window.location.hostname}:${window.location.port}`
    : `${window.location.hostname}:3001`;
const socket = socketClient(url);
// import { loadFile } from './utils';

export const Example = () => {
	const [ volumeLevel, setVolumeLevel ] = useState(100);
	const [ player, setPlayer ] = useState(null);
	const [ loading, setLoading ] = useState(false);
	const [ playState, setPlayState ] = useState('play');
	const [ duration, setDuration ] = useState(0);
	const [ audionState, setAudionState ] = useState({
		startedAt: null,
		loadingProcess: 0
	});

	const changeAudionState = (newState) => setAudionState({ ...audionState, ...newState });
	const onPlayBtnClick = () => {
		console.log('onPlayBtnClick')
		socket.emit('track', () => {});
   		ss(socket).on('track-stream', (stream, { stat }) => {
			console.log('on track-stream')
     		stream.on('data', (data) => {
       			// calculate loading process rate
       			const loadRate = (data.length * 100 ) / stat.size;
				console.log('loadRate', loadRate)
       			// onLoadProcess(loadRate);
       			// next step here
     		})
		})
	
		// try {
		// 	if(!player) {
		// 		setLoading(true);
		// 		const frequencyC = document.querySelector('.frequency-bars');
		// 		const sinewaveC = document.querySelector('.sinewave');
		// 		console.log('before getFile')
		// 		const newPlayer = await loadFile({
		// 			frequencyC,
		// 			sinewaveC
		// 		}, {
		// 			fillStyle: 'rgb(250, 250, 250)', // background
		// 			strokeStyle: 'rgb(251, 89, 17)', // line color
		// 			lineWidth: 1,
		// 			fftSize: 16384 // delization of bars from 1024 to 32768
		// 		}, { changeAudionState, setDuration });
		// 		console.log(newPlayer)
		// 		setLoading(false);
		// 		setPlayer(newPlayer);

		// 		return setPlayState('stop');
		// 	}

		// 	player.play(0);
		// 	// props.changeAudionState({ startedAt: Date.now() });

		// 	return setPlayState('stop');
		// } catch (e) {
		// 	setLoading(false);
		// 	console.log(e);
		// }
	}
	const onStopBtnClick = props => () => {
		const { player } = props;
		player && player.stop();
		props.setPlayState('play');
	}
	const onVolumeChange = props => ({ max }) => {
		const value = max / 100;
		const level = value > 0.5 ? value * 2 : value * -2;
		props.player.setVolume(level || -1);

		props.setVolumeLevel(max || 0)
	}
	const onProgressClick = props => (e) => {
		const { player, duration } = props;

		const rate = (e.clientX * 100) / e.target.offsetWidth;
		const playbackTime = (duration * rate) / 100;

		player && player.stop();
		player && player.play(playbackTime);

		props.setProgress(parseInt(rate, 10));
		props.changeAudionState({
			startedAt: Date.now() - playbackTime * 1000,
		});
	}

	return (
		<div>
			<div className='bars-wrapper'>
				<canvas className='frequency-bars' width='1024' height='100'></canvas>
				<canvas className='sinewave' width='1024' height='100'></canvas>
			</div>
			<div className='controls'>
				<button onClick={() => onPlayBtnClick()}>Play</button>
				<button>Stop</button>
				<input type='range'/>
			</div>
		</div>

	)
}
