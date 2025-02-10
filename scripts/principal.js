
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
	let attemptGame = 0;
	while(!isOkGame && attemptGame < 10000){
	    attemptGame++;
	    boardComplete = []
		questionsSelected = []
		let min = -10000;
		let max = -10000;
		const wordsChoiceComplete = []
		const wordsMainChoiceComplete = [];
		
		let multipleAnswer = []
		const firstQuestion = escolherPalavraAleatoria(data, attemptWord);
		let firstWord ;
		console.log(firstQuestion.resposta);
		
// 		questionsSelected.push(firstQuestion);
		
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
					console.log(multipleAnswer)
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
		
		let otherQuestion = firstQuestion;
		while(indexGoal.length != 0){
		   
			if(multipleAnswer != null){
			    const aux = []
				for(let j=0; j < firstWord.length; j++){
					const letter = firstWord[j];
                 
					if(multipleAnswer.length == 0){
					   multipleAnswer = null;
					   console.log("Questao de multiplas respostas: ",otherQuestion)
					   questionsSelected.push(otherQuestion);
					   for(const word of aux){
					   		boardComplete.push(word);
					   }
					   
					   break;		
					}

					for (let word of multipleAnswer) {
						word = normalizeWord(word);

						// Verifica todas as letras da palavra para encontrar uma que permita a junção
						for (let k = 0; k < word.length; k++) {
							const currentLetter = word[k];

							if (currentLetter === letter && indexGoal.includes(j) && !wordsChoiceComplete.includes(word)) {
								if (k > min) {
									min = k;
								}

								if ((word.length - (Math.abs(-k) + 1)) > max) {
									max = (word.length - (Math.abs(-k) + 1));
								}

								if (max + min < 16) {
									console.log("Próxima palavra escolhida: ", word);
									console.log(`A palavra ${word} cruzou com a vertical no índice ${j} com letra ${letter}`);
									aux.push({ string: word, posX: -k, posY: j , index:j});
									indexGoal = indexGoal.filter(item => item != j);
									wordsChoiceComplete.push(word);
									multipleAnswer = multipleAnswer.filter(item => normalizeWord(item) != word);
									break; // Sai do loop interno após encontrar uma letra que permite a junção
								}
							}
						}
					}

				}
				
				if(multipleAnswer != null){
					break;
				}
			}
			else{
				otherQuestion = escolherPalavraAleatoria(data, attemptWord);
				
				
				
				if(otherQuestion.resposta.length > 1){
				    multipleAnswer = otherQuestion.resposta;
					continue;
				}
				else{
				    const otherWord = normalizeWord(otherQuestion.resposta[0]) ;
					let match = false;
					for(const index of indexGoal){
					    const letter = firstWord[index]
					   // Verifica todas as letras da palavra para encontrar uma que permita a junção
						for (let k = 0; k < otherWord.length; k++) {
							const currentLetter = otherWord[k];

							if (currentLetter === letter && !wordsChoiceComplete.includes(otherWord)) {
								if (k > min) {
									min = k;
								}

								if ((otherWord.length - (Math.abs(-k) + 1)) > max) {
									max = (otherWord.length - (Math.abs(-k) + 1));
								}

								if ((max + min < 16)) {
									console.log(`A palavra ${otherWord} cruzou com a vertical no índice ${index} com letra ${letter}`);
									boardComplete.push({ string: otherWord, posX: -k, posY: index ,index:index});
									indexGoal = indexGoal.filter(item => item != index);
									wordsChoiceComplete.push(otherWord);
									match = true;

									console.log("Questão de resposta única: ", otherQuestion);
									questionsSelected.push(otherQuestion);
									break; // Sai do loop interno após encontrar uma letra que permite a junção
								}
							}
						}
					
				}}
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
			
			boardComplete = boardComplete.filter(item => item !== undefined && item !== null);

			
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

			runtime.globalVars.minX = 643 + Math.abs(minX) * 54 + (16 - gridWidth) * 27; // 27 = tamCelula/2

			// Chamada da malha final
			for (let j = 0; j < boardComplete.length; j++) {
			  runtime.callFunction(
				"createGrid",
				x + boardComplete[j].posX,
				y + boardComplete[j].posY,
				boardComplete[j].string.length,
				boardComplete[j].string,
				boardComplete[j].index,
			  );
			}
			
			// Remover duplicatas das questões com base no 'id'
// 			questionsSelected = questionsSelected.filter(
// 				(value, index, self) =>
// 					index === self.findIndex((item) => item.id === value.id)
// 			);

			// Chamada das questões escolhidas
			for (let j = 0; j < questionsSelected.length; j++) {
			 console.log(questionsSelected[j])
			  runtime.callFunction(
				"createQuestion",
				questionsSelected[j].id, 
				questionsSelected[j].idSecao,
				questionsSelected[j].pergunta, 
				questionsSelected[j].resposta, 
				questionsSelected[j].categoria, 
				questionsSelected[j].dica,
				questionsSelected[j].imagePath || ""
			  );
			}

		  }
		  else {
			boardComplete = [];
		  }

		  console.log(boardComplete)
		  console.log(questionsSelected)

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

function Tick(runtime) {
    // Obtém todas as instâncias de celula e letra
    const celulas = runtime.objects.celula.getAllInstances();
    const letras = runtime.objects.Letra.getAllInstances();

    // Verifica se o número de células e letras é o mesmo
    if (celulas.length !== letras.length) {
        console.error("O número de células e letras não é o mesmo.");
        return null; // Retorna null se os tamanhos forem diferentes
    }

    // Cria um mapa para agrupar células e letras por idQuestao
    const grupos = new Map();

    // Agrupa as células e letras por idQuestao
    for (let i = 0; i < celulas.length; i++) {
        const celula = celulas[i];
        const letter = letras[i];
        const idQuestao = celula.instVars.idQuestao;

        // Se o grupo ainda não existe, cria um novo
        if (!grupos.has(idQuestao)) {
            grupos.set(idQuestao, { celulas: [], letras: [] });
        }

        // Adiciona a célula e a letra ao grupo correspondente
        grupos.get(idQuestao).celulas.push(celula);
        grupos.get(idQuestao).letras.push(letter);
		
    }
	console.log(grupos)
    // Verifica cada grupo
    for (const [idQuestao, grupo] of grupos) {
        let grupoValido = true;

        // Verifica se todas as células do grupo cumprem a condição
        for (let i = 0; i < grupo.celulas.length; i++) {
            const celula = grupo.celulas[i];
            const letter = grupo.letras[i];

            if (celula.instVars.letter.toUpperCase() !== letter.text) {
                grupoValido = false; // Se uma célula não cumprir, o grupo é inválido
                break;
            }
        }

        // Se o grupo for válido, retorna o idQuestao
        if (grupoValido) {
            console.log(`O grupo com idQuestao ${idQuestao} cumpre a condição.`);
//             return idQuestao;
             for (let i = 0; i < grupo.celulas.length; i++) {
			    const celula = grupo.celulas[i];
				celula.instVars.block = true
				
        	}

        }
    }

    // Se nenhum grupo cumprir a condição, retorna null
    console.log("Nenhum grupo cumpre a condição.");
    return null;
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
