
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	// CHAMADA DA API

	//let parts = window.Namespace.message.split(",");
	//let isSecOrChap = parts[1] === "section";
	//let chapterID = isSecOrChap ? "" : parts[2];
	//let sectionID = isSecOrChap ? parts[2] : "";
	//runtime.globalVars.idJogador = parts[0];
	
	let isSecOrChap = "section";
	let sectionID = "c3c980a3-e832-4fbd-b964-42faa9a4145c";
	let chapterID = "a34bcf82-1dd7-40a6-9d12-cca35c2aa035";
	runtime.globalVars.idJogador = "54e81458-80c1-708e-ca0c-ede29fa92a8d"; // Id do jogador sendo salvo na variável global da folha de eventos
	
	//window.Namespace.idSecao = sectionID;
	//window.Namespace.isSecOrChap = isSecOrChap;
	//window.Namespace.idChapter = chapterID;
	
		// BLOCO 1: NOME DA SEÇÃO/CAPÍTULO
		try {
			var xhr = new XMLHttpRequest();
			if (isSecOrChap == "section") {	
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/section/name/${sectionID}`, false);
			}
			else {
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/chapter/name/${chapterID}`, false);
			}
			xhr.send(null);
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				//console.log('nome da seção:', data);
				runtime.globalVars.nomeSecao = JSON.stringify(data);
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}

		// BLOCO 2: QUESTÕES DA SEÇÃO/CAPÍTULO
		try {
			var xhr = new XMLHttpRequest();
			if (isSecOrChap == "section") {	
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/section/questions/${sectionID}`, false);
			}
			else {
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/chapter/questions/${chapterID}`, false);
			}
			xhr.send(null);
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				console.log('questões:', data);
				//runtime.globalVars.rawData = JSON.stringify(data);
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
		
	//runtime.globalVars.complete = true;
	
	runtime.addEventListener("tick", () => Tick(runtime));
	
	// LOGICA DE GERAÇÃO DA MALHA
	
	const words = ["banana", "maca", "carambola", "maracuja", "damasco", "roma", "limao", "laranja", "goiaba", "graviola", "abacate"];
	const wordsMainChoice = [];
	let isOk = false;
	let attempt = 0;
	const maxAttempt = 1000;
    const x = 5;
	const y = 3;
	let board = [];
    
	const letters = getUniqueCharacters(words)
	console.log(letters)
	const symbols = getSymbol(letters)
	while (!isOk && attempt < maxAttempt) {
	  attempt++;

	  const mainWord = escolherPalavraAleatoria(words, wordsMainChoice);
	  
	  // aux
	  runtime.globalVars.first_word = mainWord;
	  
	  console.log("palavra principal escolhida: ", mainWord);
	  
	  if (!mainWord) {
		console.log("Nenhuma palavra disponível para escolher como palavra principal.");
		break;
	  }
	  
	  wordsMainChoice.push(mainWord);

	  const wordsChoice = [];
	  const copyWord = words.filter(item => item !== mainWord);
      console.log(copyWord)
	  let valid = true; // Indica se a palavra principal foi completamente processada
	  for (let i = 0; i < mainWord.length; i++) {
	  
		const letter = mainWord[i];
		
		let otherword = escolherPalavraAleatoria(copyWord, wordsChoice);
        console.log("Proxima palavra escolhida: ", otherword)
		
		if (otherword && otherword.indexOf(letter) !== -1) {
		  board.push({ string: otherword, posX: -otherword.indexOf(letter), posY: i });
		  wordsChoice.push(otherword);
		} else {
		
		  const wordAttempt = [];
		  let found = false;
          console.log("Nao consegui inserir a palavra, tentar outras")
		  while (!found && wordAttempt.length < copyWord.length) {
			wordAttempt.push(otherword);
			otherword = escolherPalavraAleatoria(copyWord, [...wordsChoice, ...wordAttempt]);
            console.log("nova proxima palavra escolhida: ", otherword)
			if (otherword && otherword.indexOf(letter) !== -1) {
			  board.push({ string: otherword, posX:-otherword.indexOf(letter), posY: i });
			  wordsChoice.push(otherword);
			  found = true;
			}
		  }

		  if (!found) {
			console.log("Nenhuma palavra contém a letra:", letter);
			valid = false;
			break;
		  }
		}
	  }

	  if (valid) {
		isOk = true; // Palavra principal processada com sucesso
		
		// parte em que to testando e me estressando horrores
		let coordinates = []; // Array para armazenar todas as coordenadas

		for (let j = 0; j < board.length; j++) {
		  // (len, posX)
		  coordinates.push([board[j].string.length, board[j].posX]);
		}
		
		// Encontrar a menor e a maior coordenada X, considerando os tamanhos
		const minX = coordinates.reduce((min, curr) => Math.min(min, curr[1]), coordinates[0][1]);
		const maxX = coordinates.reduce((max, curr) => Math.max(max, curr[1] + curr[0] - 1), coordinates[0][1] + coordinates[0][0] - 1);

		// Quantidade de células no eixo x
		const gridWidth = maxX - minX + 1;

		console.log("Coordenadas:", coordinates);
		console.log("Quantidade de células para a esquerda:", minX);
		console.log("Quantidade de células para a direita:", maxX);
		console.log("Células totais:", gridWidth);
		
		runtime.globalVars.minX = 1025; // só falta resolver essa dESGRAÇA
		// o grande problema eh que só tá centralizando em relação às células da palavra principal
		// como fazer toda a malha se mover para direita/esquerda dinamicamente?
		
		// Chamada da malha final
		for (let j = 0; j < board.length; j++) {
		  runtime.callFunction(
			"createGrid",
			x + board[j].posX,
			y + board[j].posY,
			board[j].string.length,
			board[j].string
		  );
		}
		
	  }
	  else {
	  	board = [];
	  }

	  console.log(board)
	  
	  for(let i = 1; i < runtime.objects.celula.getAllInstances().length ; i++){
	   
	    const letterBox = runtime.objects.celula.getAllInstances()[i]
		if(!letterBox.instVars.isMain){
			console.log(letterBox.instVars.letter)
			let foundItem = symbols.find(item => item.letter === letterBox.instVars.letter);
			console.log("indice simbolo: ", foundItem)
			runtime.callFunction("createSymbol", letterBox.x, letterBox.y, foundItem.symbols)
		}
		
	  }
	}
}

function Tick(runtime)
{
	// Code to run every tick
	
	
}

function escolherPalavraAleatoria(lista, wordChoice) {
  const wordList = lista.filter(item => !wordChoice.includes(item));
  if (wordList.length === 0) return null;
  const indiceAleatorio = Math.floor(Math.random() * wordList.length);
  return wordList[indiceAleatorio];
}

function getUniqueCharacters(words) {
  const uniqueCharacters = new Set();
  
  words.forEach(word => {
    word.split("").forEach(char => {
      uniqueCharacters.add(char);
    });
  });

  return Array.from(uniqueCharacters);
}

function getSymbol(letters){
    let symbolsIndex = Array.from({ length: 27 }, (_, i) => i);
	let symbolsChar = [];
	for( let i = 0; i < letters.length; i++){
		const index = symbolsIndex[Math.floor(Math.random() * symbolsIndex.length)]
	    symbolsIndex = symbolsIndex.filter(item => item != index)
		symbolsChar.push({letter:letters[i], symbols:index})
		
	}
	
	return symbolsChar
}
