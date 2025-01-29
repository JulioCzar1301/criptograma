
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
	const questionsChosen = []
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
	
	console.log(data)
	
	//Escolhe palavras para montar o criptograma
	
	let isOkGame = false;
	const attemptWord = [];
	
	let attempt = 0;
	const maxAttempt = 1000;
	const x = 5;
	const y = 3
    let valid = false;
	let symbols;
	let boardComplete = []
	
	let letters;
	let questionsSelected = [];
	while(!isOkGame){
	    
	    boardComplete = []
		let min = -10000;
		let max = -10000;
		const wordsChoiceComplete = []
		const wordsMainChoiceComplete = [];
		
		let multipleAnswer = []
		const firstQuestion = escolherPalavraAleatoria(data, attemptWord);
		let firstWord ;
		console.log(firstQuestion.resposta);
		
		questionsSelected.push(firstQuestion);
		
		if(firstQuestion.resposta.length == 1){
			if(!attemptWord.includes(firstQuestion.resposta)){
				attemptWord.push(firstQuestion.resposta);
				firstWord = normalizeWord(firstQuestion.resposta[0]);
				console.log("primeira palavra escolhida: ", firstWord)
			}
		}
		else{
			for(const word of firstQuestion.resposta){
				if(!attemptWord.includes(word)){
					attemptWord.push(word);
					firstWord = normalizeWord(word)
					multipleAnswer = firstQuestion.resposta.filter(item => normalizeWord(item) != firstWord)
					console.log("primeira palavra escolhida: ", firstWord)
					break;
				}
			}
		}
		
		if(firstWord== undefined){
			continue
		}
		
		if(attemptWord.length == data.length){
		   console.log("Ja foram avaliadas todas as palavras")
		   break;
		}
		
		
		console.log(firstWord, firstQuestion.resposta[0])
		let indexGoal = Array.from({ length: firstWord.length }, (_, i) => i);
		
		while(indexGoal.length != 0){
		   
			if(multipleAnswer != null){
				for(let j=0; j < firstWord.length; j++){
					const letter = firstWord[j];

					if(multipleAnswer.length == 0){
					   multipleAnswer = null;
					   break;		
					}

					for(let word of multipleAnswer){
					    word = normalizeWord(word)
						
						
						if(word.indexOf(letter) !== -1 && indexGoal.includes(j) && !wordsChoiceComplete.includes(word)){
							//verificar minimos e maximos da malha
							if(word.indexOf(letter) > min){
								min = word.indexOf(letter)
							}

							if((word.length  - (Math.abs(-word.indexOf(letter)) + 1)) > max){
								max = (word.length  - (Math.abs(-word.indexOf(letter)) + 1))
							}
								
							
						    if(max + min < 16){
								console.log("Proxima palavra escolhida: ", word)
								console.log(`A palavra ${word} cruzou com a vertical no indice ${j} com letra ${letter}`)
								boardComplete.push({ string: word, posX: -word.indexOf(letter), posY: j });
								indexGoal = indexGoal.filter(item => item != j)
								wordsChoiceComplete.push(word);
								multipleAnswer = multipleAnswer.filter(item => normalizeWord(item) != word)

								
							}	
						}
					}

				}
				
				if(multipleAnswer != null){
					break;
				}
			}
			else{
				const otherQuestion = escolherPalavraAleatoria(data, attemptWord);
				
				questionsSelected.push(otherQuestion);
				
				if(otherQuestion.resposta.length > 1){
				    multipleAnswer = otherQuestion.resposta;
					continue;
				}
				else{
				    const otherWord = normalizeWord(otherQuestion.resposta[0]) ;
					let match = false;
					for(const index of indexGoal){
					    const letter = firstWord[index]
					    if(otherWord.indexOf(letter) != -1 && !wordsChoiceComplete.includes(otherWord)){
							//verificar minimos e maximos da malha
							if(otherWord.indexOf(letter) > min){
								min = otherWord.indexOf(letter)
							}

							if((otherWord.length  - (Math.abs(-otherWord.indexOf(letter)) + 1)) > max){
								max = (otherWord.length  - (Math.abs(-otherWord.indexOf(letter)) + 1))
							}
								
						   if((max + min < 16)){
						   		console.log(`a palavra ${otherWord} cruzou com a vertical no indice ${index} com letra ${letter}`)
								boardComplete.push({ string: otherWord, posX: -otherWord.indexOf(letter), posY: index });
								indexGoal = indexGoal.filter(item => item != index)
								wordsChoiceComplete.push(otherWord);
								match = true;
	
						   }
							
						}
					}
					
				}
			}
		}
		
		if(boardComplete.length == firstWord.length){
			isOkGame = true;
			console.log(boardComplete)
			valid = true
			const words = boardComplete
			  .filter(item => item.string) // Filtra os objetos que possuem o atributo 'string'
			  .map(item => item.string);   // Mapeia apenas o valor do atributo 'string'

			console.log(words);
			console.log(questionsSelected)
			letters = getUniqueCharacters(words)
			symbols = getSymbol(letters)
			
		}
		else{
			questionsSelected = [];
		}


		
		
		
	}
	runtime.addEventListener("tick", () => Tick(runtime));
	
	// LOGICA DE GERAÇÃO DA MALHA

		  if (valid) {

			// parte em que to testando e me estressando horrores
			let coordinates = []; // Array para armazenar todas as coordenadas

			for (let j = 0; j < boardComplete.length; j++) {
			  // (len, posX)
			  coordinates.push([boardComplete[j].string.length, boardComplete[j].posX]);
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

			runtime.globalVars.minX = 640 + Math.abs(minX) * 54 + (16 - gridWidth) * 27; // 27 = tamCelula/2

			// Chamada da malha final
			for (let j = 0; j < boardComplete.length; j++) {
			  runtime.callFunction(
				"createGrid",
				x + boardComplete[j].posX,
				y + boardComplete[j].posY,
				boardComplete[j].string.length,
				boardComplete[j].string
			  );
			}

		  }
		  else {
			boardComplete = [];
		  }

		  console.log(boardComplete)

		  for(let i = 1; i < runtime.objects.celula.getAllInstances().length ; i++){

			const letterBox = runtime.objects.celula.getAllInstances()[i]
			if(!letterBox.instVars.isMain){
				let foundItem = symbols.find(item => item.letter === letterBox.instVars.letter);
				runtime.callFunction("createSymbol", letterBox.x, letterBox.y, foundItem.symbols)
			}

		  }
// 		}
// 			isOk = true

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

function normalizeWord(word) {
  return word
    .toLowerCase() // Converte para caixa baixa
    .normalize("NFD") // Decompõe caracteres com acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas de acentos
    .replace(/\s+/g, ""); // Remove todos os espaços
}
