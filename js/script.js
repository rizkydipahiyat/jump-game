// var character = document.getElementById("character");
var block = document.getElementById("block");
const characterElement = document.createElement("div");

var params = new URLSearchParams(window.location.search);

var viewer = (parseInt(params.get("viewer")) === 1 ? true : false) || false;

(function () {
	let playerId;
	let playerRef;
	let players = {};
	let playerElements = {};
	let counters = 0;

	let idJump = document.getElementById("idJump");

	// const character = document.querySelector("#character");
	var gameContainer = document.querySelector(".game");

	idJump.addEventListener("click", function () {
		if (playerElements[playerId].classList == "animate") {
			return;
		}

		players[playerId].isJump = true;

		playerElements[playerId].classList.add("animate");
		playerRef.set(players[playerId]);
		// hapus waktu 0.3s
		setTimeout(function () {
			playerElements[playerId].classList.remove("animate");
			players[playerId].isJump = false;
			playerRef.set(players[playerId]);
		}, 300);
	});

	function initGame() {
		const allPlayersRef = firebase.database().ref(`players`);
		// const allCountersRef = firebase.database().ref(`counters`);

		allPlayersRef.on("value", (snapshot) => {
			//Fires whenever a change occurs
			players = snapshot.val() || {};
			Object.keys(players).forEach((key) => {
				const characterState = players[key];
				if (!characterState.viewer) {
					let el = playerElements[key];
					// // Now update the DOM
					if (characterState.isJump) {
						el.classList.add("animate");
					} else {
						el.classList.remove("animate");
					}
				}
			});
		});

		allPlayersRef.on("child_added", (snapshot) => {
			const addedPlayer = snapshot.val();

			characterElement.style.cssText =
				"width: 50px; height: 50px;position: relative;top: 150px;";
			characterElement.setAttribute("id", "character");

			characterElement.innerHTML = `
					<img
						src="asset/img/mascot-prisma-removebg-preview.png"
						alt="maskot-gambar"
						class="maskot"
					/>
			`;
			block.innerHTML = `
				<img src="asset/img/image.png" alt="banteng-gambar" class="banteng" />
			`;

			playerElements[addedPlayer.id] = characterElement;
			// console.log(addedPlayer)
			if (!addedPlayer.viewer) {
				gameContainer.appendChild(characterElement);
				gameContainer.appendChild(block);
			}
		});

		allPlayersRef.on("child_removed", (snapshot) => {
			const removedKey = snapshot.val().id;
			gameContainer.removeChild(playerElements[removedKey]);
			delete playerElements[removedKey];
		});

		// allCountersRef.on("value", (snapshot) => {
		// 	counters = snapshot.val() || 0;
		// });

		// allCountersRef.on("child_added", (snapshot) => {
		// 	const counter = snapshot.val();
		// 	const key = getKeyString(counter.counters);
		// 	counters[key] = true;

		// 	counterElements[key] = counterElements;
		// })

		var checkDead = setInterval(function () {
			let characterTop = parseInt(
				window.getComputedStyle(characterElement).getPropertyValue("top")
			);
			let blockLeft = parseInt(
				window.getComputedStyle(block).getPropertyValue("left")
			);
			if (blockLeft < 50 && blockLeft > -20 && characterTop >= 130) {
				block.style.animation = "none";
				// alert("Game Over. score: " + Math.floor(counters / 100));
				counters = 0;
				block.style.animation = "block 1s infinite linear";
			} else {
				counters++;
				document.getElementById("scoreSpan").innerHTML = Math.floor(
					counters / 100
				);
			}
		}, 10);
	}

	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			//You're logged in!
			playerId = user.uid;
			playerRef = firebase.database().ref(`players/${playerId}`);

			playerRef.set({
				id: playerId,
				counters: 0,
				isJump: false,
				viewer,
			});
			//Remove me from Firebase when I diconnect
			playerRef.onDisconnect().remove();

			//Begin the game now that we are signed in
			initGame();
		} else {
			//You're logged out.
		}
	});

	firebase
		.auth()
		.signInAnonymously()
		.catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			// ...
			console.log(errorCode, errorMessage);
		});
})();
