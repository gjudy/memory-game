// Initialize variables
const symbols = ["fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bolt", "fa-cube", "fa-leaf", "fa-bicycle", "fa-bomb"];
const allSymbols = [...symbols, ...symbols];
let timeStart = null;
let timer = null;
let moves = 0;
let matches = 0;

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function generateCards() {
	shuffle(allSymbols);

	const fragment = document.createDocumentFragment();

	for (let i = 0; i < 16; i++) {
		const newCard = document.createElement('li');
		newCard.className = 'card';

		const newIcon = document.createElement('i');
		newIcon.className = 'fa';

		newCard.appendChild(newIcon);
		fragment.appendChild(newCard);
	}

	deck.appendChild(fragment);
}

function clearArray(array) {
	while (array.length > 0) {
		array.pop();
	}
}

function updateMoves() {
	document.getElementsByClassName('moves')[0].textContent = moves;
}

function reset() {
	matches = 0;

	moves = 0;
	updateMoves();

	clearArray(cardIndices);

	// Reset timer
	clearInterval(timer);

	timeStart = null;
	timer = null;

	const timeDisplay = document.getElementsByClassName('timer')[0];
	timeDisplay.textContent = 0;

	// Reset star rating
	const stars = document.getElementsByClassName('stars')[0];

	for (const star of stars.querySelectorAll('i')) {
		star.className = 'fa fa-star';
	}

	// Clear modal message
	const modalMessage = document.getElementsByClassName('modal__message')[0];

	while (modalMessage.children.length > 1) {
		modalMessage.children[1].remove();
	}

	// Reset cards
	while (deck.firstChild) {
		deck.firstChild.remove();
	}

	generateCards();
}

function toggleModal() {
	const modal = document.getElementsByClassName('modal')[0];
	modal.classList.toggle('modal--hide');
}

// Listen for card clicks
const deck = document.getElementsByClassName('deck')[0];
const cardIndices = [];

deck.addEventListener('click', function(event) {
	const cardClicked = event.target.closest('.card');
	const cardIndex = [...this.children].indexOf(cardClicked);

	function toggleCard(card, index) {
		card.querySelector('i').classList.toggle(allSymbols[index]);
		card.classList.toggle('open');
		card.classList.toggle('show');
	}

	function updateTimer() {
		const timeEnd = Date.now();
		const timeTotal = (timeEnd - timeStart) / 1000;

		const timeDisplay = document.getElementsByClassName('timer')[0];

		timeDisplay.textContent = Math.floor(timeTotal);
	}

	function populateModal() {
		updateTimer();
		clearInterval(timer);

		const timeEnd = Date.now();
		const timeTotal = (timeEnd - timeStart) / 1000;

		for (let i = 0; i < 3; i++) {
			const newParagraph = document.createElement('p');
			modalMessage.appendChild(newParagraph);
		}

		const newButton = document.createElement('button');
		newButton.className = 'replay';
		newButton.textContent = 'Replay?';

		const stars = document.getElementsByClassName('stars')[0];
		const duplicateStars = stars.cloneNode(true);

		modalMessage.querySelectorAll('p')[0].textContent = 'Way to go! You matched all the pairs!';
		modalMessage.querySelectorAll('p')[1].textContent = `It took you ${moves} moves and a total of ${Math.floor(timeTotal)} seconds.`;
		modalMessage.querySelectorAll('p')[2].textContent = 'Star rating: ';
		modalMessage.querySelectorAll('p')[2].appendChild(duplicateStars);
		modalMessage.appendChild(newButton);
	}

	// Check for valid moves; apply to unflipped cards and only if there are fewer than 2 flipped cards
	if (event.target.className == 'card' && cardIndices.length < 2) {
		timeStart = timeStart || Date.now();
		timer = timer || setInterval(updateTimer, 1000);

		// Deduct a star when player reaches 14 and 20 moves
		if (moves === 14 || moves === 20) {
			const stars = document.getElementsByClassName('stars')[0].getElementsByClassName('fa-star');

			stars[2] ? (stars[2].className = 'fa fa-star-o') : (stars[1].className = 'fa fa-star-o');
		}

		cardIndices.push(cardIndex);

		toggleCard(cardClicked, cardIndex);

		// Check if there are 2 matching flipped cards after the most recent valid move
		if (allSymbols[cardIndices[0]] === allSymbols[cardIndices[1]]) {
			moves += 1;
			updateMoves();

			// Display cards as matched
			for (const n of cardIndices) {
				const card = deck.children[n];

				const newIcon = document.createElement('i');
				newIcon.className = 'fa ' + allSymbols[cardIndex];
				card.appendChild(newIcon);

				card.classList.add('match');
				card.classList.remove('open');
				card.classList.remove('show');
			}

			clearArray(cardIndices);

			matches += 1;

			if (matches === 8) {
				populateModal();
				toggleModal();
			}
		} else if (cardIndices.length === 2) {
			moves += 1;
			updateMoves();

			setTimeout(function() {
				for (const n of cardIndices) {
					const card = deck.children[n];

					toggleCard(card, n);
				}

				clearArray(cardIndices);
			}, 1000);
		}
		
	}
});

// Listen for restart click
const arrow = document.getElementsByClassName('restart')[0];
arrow.addEventListener('click', reset);

// Listen for clicks within the win modal
const modalMessage = document.getElementsByClassName('modal__message')[0];

modalMessage.addEventListener('click', function(event) {
	if ((event.target.className === 'modal__close') || (event.target.parentNode.className === 'modal__close')) {
		toggleModal();
		event.preventDefault();
	}

	if (event.target.className === 'replay') {
		toggleModal();
		reset();
		event.preventDefault();
	}
});

// Prepare game on page load
generateCards();
