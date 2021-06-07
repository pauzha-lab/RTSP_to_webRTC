let total_streams = 0;

getopts = (args, opts) => {
	const result = opts.default || {};
	args.replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		function ($0, $1, $2, $3) { result[$1] = $3; });

	return result;
};

let args = getopts(location.search,
	{
		default:
		{
			ws_uri: 'ws://' + location.hostname + ':8888/kurento',
			ice_servers: undefined
		}
	});

if (args.ice_servers) {
	console.log("Use ICE servers: " + args.ice_servers);
	kurentoUtils.WebRtcPeer.prototype.server.iceServers = JSON.parse(args.ice_servers);
} else {
	console.log("Use freeice")
}



const create_new_element = (id) => {
	const _html =  `
	<div class="col-md-6 stream-ctnr" id="strm_ctnr_${id}">
		<div class="row">
			<div class="">
				<h3>Remote stream - ${id}</h3>
				<video id="videoOutput_${id}" autoplay width="480px" height="360px" poster="./img/loadingGif.gif"></video>
				</br>
				Set source URL: <input style="width:350px;" id="address_${id}" type="text">
				</br></br>
			</div>
		</div>
		<div class="row">
			<div class="ctrls-btns">
				<button id="start_${id}" href="#" class="btn btn-outline-success">
					<span class="glyphicon glyphicon-play"></span>
					Start
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#54E3A5" class="bi bi-play" viewBox="0 0 16 16">
						<path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
					</svg>
				</button>
				<button id="stop_${id}" href="#" class="btn btn-outline-danger">
					<span class="glyphicon glyphicon-stop"></span> 
					Stop
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#C31C2E" class="bi bi-stop" viewBox="0 0 16 16">
						<path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5zM5 4.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5H5z"/>
					</svg>
				</button>
				<button id="close_${id}" href="#" class="btn btn-outline-danger">
					<span class="glyphicon glyphicon-stop"></span> 
					Close Stream
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#C31C2E" class="bi bi-x" viewBox="0 0 16 16">
						<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
					</svg>
				</button>
				<button id="showConsole_${id}" href="#" class="btn btn-outline-dark">
					console
				</button>
			</div>
		</div>
		<div class="row">
			<div class="">
				<div class="console" id="console_${id}"></div>
			</div>
		</div>
	</div> `;
	document.getElementById("container").insertAdjacentHTML("beforeend", _html);
	const app = new rtcp2webrtc({
		videoElement	: document.getElementById(`videoOutput_${id}`),
		startButton		: document.getElementById(`start_${id}`),
		endButton		: document.getElementById(`stop_${id}`),
		consoleElm		: document.getElementById(`console_${id}`),
		addressElem		: document.getElementById(`address_${id}`),
		consoleToggle	: document.getElementById(`showConsole_${id}`)
	});

	document.getElementById(`close_${id}`).onclick = () => {
		app.stop();
		document.getElementById(`strm_ctnr_${id}`).outerHTML = "";
		total_streams -= 1;
	}
}



class rtcp2webrtc {
	constructor({ videoElement, addressElem, startButton, endButton, consoleElm, consoleToggle }) {
		this.startButton = startButton;
		this.endButton = endButton;
		this.videoElement = videoElement;
		this.address = addressElem;
		this.webRtcPeer;
		this.pipeline;

		this.console = new Console(consoleElm, console);

		this.startButton.onclick = (e) => {
			this.start();
		};

		this.endButton.onclick = (e) => {
			this.stop();
		};

		this.console_visible = false;

		consoleToggle.onclick = () => {
			if (this.console_visible) {
				consoleElm.style.display = "none";
				this.console_visible = false
			} else {
				consoleElm.style.display = "block";
				this.console_visible = true
			}
		}

	}

	start = () => {
		if (!this.address.value) {
			window.alert("You must set the video source URL first");
			return;
		}
		this.address.disabled = true;
		this.showSpinner(this.videoElement);
		const options = {
			remoteVideo: this.videoElement
		};
		this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
			(error) => {
				if (error) {
					return this.console.error(error);
				}
				this.webRtcPeer.generateOffer(this.onOffer);
				this.webRtcPeer.peerConnection.addEventListener('iceconnectionstatechange', (event) => {
					if (this.webRtcPeer && this.webRtcPeer.peerConnection) {
						this.console.log("oniceconnectionstatechange -> " + this.webRtcPeer.peerConnection.iceConnectionState);
						this.console.log('icegatheringstate -> ' + this.webRtcPeer.peerConnection.iceGatheringState);
					}
				});
			}
		);
	}

	stop = () => {
		this.address.disabled = false;
		if (this.webRtcPeer) {
			this.webRtcPeer.dispose();
			this.webRtcPeer = null;
		}
		if (this.pipeline) {
			this.pipeline.release();
			this.pipeline = null;
		}
		this.hideSpinner(this.videoElement);
	}

	onOffer = (error, sdpOffer) => {
		if (error) return this.onError(error);

		kurentoClient(args.ws_uri, (error, kurentoClient) => {
			if (error) return onError(error);

			kurentoClient.create("MediaPipeline",  (error, p) => {
				if (error) return onError(error);

				this.pipeline = p;

				this.pipeline.create("PlayerEndpoint", { uri: this.address.value }, (error, player) => {
					if (error) return this.onError(error);

					this.pipeline.create("WebRtcEndpoint", (error, webRtcEndpoint) => {
						if (error) return this.onError(error);

						this.setIceCandidateCallbacks(webRtcEndpoint, this.webRtcPeer, this.onError);

						webRtcEndpoint.processOffer(sdpOffer, (error, sdpAnswer) => {
							if (error) return this.onError(error);

							webRtcEndpoint.gatherCandidates(this.onError);

							this.webRtcPeer.processAnswer(sdpAnswer);
						});

						player.connect(webRtcEndpoint, (error) => {
							if (error) return this.onError(error);

							this.console.log("PlayerEndpoint-->WebRtcEndpoint connection established");

							player.play((error) => {
								if (error) return this.onError(error);

								this.console.log("Player playing ...");
							});
						});
					});
				});
			});
		});
	}

	setIceCandidateCallbacks = (webRtcEndpoint, webRtcPeer, onError) => {
		webRtcPeer.on('icecandidate', (candidate) => {
			this.console.log("Local icecandidate " + JSON.stringify(candidate));
	
			candidate = kurentoClient.register.complexTypes.IceCandidate(candidate);
	
			webRtcEndpoint.addIceCandidate(candidate, onError);
	
		});
		webRtcEndpoint.on('OnIceCandidate', (event) => {
			const candidate = event.candidate;
	
			this.console.log("Remote icecandidate " + JSON.stringify(candidate));
	
			webRtcPeer.addIceCandidate(candidate, onError);
		});
	}

	onError(error) {
		if (error) {
			this.console.error(error);
			this.stop();
		}
	}

	showSpinner() {
		for (var i = 0; i < arguments.length; i++) {
			arguments[i].poster = 'img/transparent-1px.png';
			arguments[i].style.background = "center transparent url('img/spinner.gif') no-repeat";
		}
	}

	hideSpinner() {
		for (var i = 0; i < arguments.length; i++) {
			arguments[i].src = '';
			arguments[i].poster = 'img/loadingGif.gif';
			arguments[i].style.background = '';
		}
	}

}

window.onload = () => {

	const addNewStream = document.getElementById("newStream");

	addNewStream.onclick = () => {
		total_streams += 1;
		create_new_element(total_streams);
	}
}

/**
 * Lightbox utility (to display media pipeline image in a modal dialog)
 */
$(document).delegate('*[data-toggle="lightbox"]', 'click', function (event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});
