window.Namespace = window.Namespace || {};

// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
let questionSave = []
let boardSave = [];
let saveExample = ""
let goal = [];
let firstRun = true;
let fitTime = true;

let coinSave ;

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

	// Envia mensagem de pronto
	// window.parent?.postMessage('construct-ready', '*');

	// Aguarda mensagem ou usa valor padrão após timeout
	// waitForMessage();
	//window.Namespace.message = "04380458-d071-70c2-622c-bf703e64af98,chapter,25ba2c14-a291-4f90-a444-414252245737";

async function OnBeforeProjectStart(runtime)
{
	// Processamento da mensagem
	let parts = window.Namespace.message.split(",");
	let isSecOrChap = parts[1] === "section";
	let chapterID = isSecOrChap ? "" : parts[2];
	let sectionID = isSecOrChap ? parts[2] : "";
	//runtime.globalVars.idJogador = parts[0];
	
	saveExample = window.Namespace.session.rawData;
	
	window.Namespace.sectionOrChapter = chapterID;
// 	runtime.callFunction("resetSave")
	const questionsChosen = []
	let boardComplete = []
	let questionsSelected = [];
	let valid = false;
	//palavra central completa
	let mainComplete;
	const x = 5;
	const y = 3
	let symbols;
	let letters;
	
	//runtime.globalVars.idJogador = "54e81458-80c1-708e-ca0c-ede29fa92a8d"; // Id do jogador sendo salvo na variável global da folha de eventos
	
	//window.Namespace.idSecao = sectionID;
	//window.Namespace.isSecOrChap = isSecOrChap;
	//window.Namespace.idChapter = chapterID;
	//caso do save
	//saveExample = ""
	if(saveExample != ""){
		const save = JSON.parse(saveExample)
		
		valid = true
		boardComplete = save.words.words
		questionsSelected = save.questions
		symbols = save.words.symbols
		boardSave = save.words
		//console.log(boardSave)
		questionSave = save.questions
		runtime.globalVars.nomeSecao = save.nameSection
		mainComplete = save.words.wordMainComplete;
		
		coinSave = save.coin
       
		window.Namespace.time = save.time
		window.Namespace.board = save.words
		runtime.globalVars.symbols = JSON.stringify(symbols)
		
		if(save.tipContentUsed){
			runtime.objects.dicaSpot2.getFirstInstance().instVars.isBuyed = true;
		}
		if(save.tipLetterRandom != ""){
			runtime.objects.dicaSpot1.getFirstInstance().instVars.isBuyed = true;
		}

		if(save.tipLetterSelected != ""){
			runtime.objects.dicaSpot0.getFirstInstance().instVars.isBuyed = true;
		}

		window.Namespace.tipContentUsed = save.tipContentUsed;
		window.Namespace.tipLetterRandom = save.tipLetterRandom;
		window.Namespace.tipLetterSelected = save.tipLetterSelected;
		
		
	}
	else{
		var data = window.Namespace.rawData
		runtime.globalVars.nomeSecao = window.Namespace.nameSectionOrChapter
		runtime.globalVars.moedas = window.Namespace.moedas
		//runtime.globalVars.complete = true;
	
		////console.log(data)

		//Escolhe palavras para montar o criptograma

		let isOkGame = false;
		


		let attempt = 0;
		const maxAttempt = 1000;
		
		let attemptGame = 0;


		while(!isOkGame && attemptGame < 1000000){
			const attemptWord = [];
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
			//console.log(firstQuestion.resposta);

	// 		questionsSelected.push(firstQuestion);

			if(firstQuestion.resposta.length == 1){
				if(!attemptWord.includes(firstQuestion.resposta)){
					attemptWord.push(firstQuestion.resposta);
					firstWord = normalizeWord(firstQuestion.resposta[0]);
					//console.log("primeira palavra escolhida: ", firstWord)
				}
			}
			else{
				for(const word of firstQuestion.resposta){
					if(!attemptWord.includes(word)){
						attemptWord.push(word);
						firstWord = normalizeWord(word)
						multipleAnswer = firstQuestion.resposta.filter(item => normalizeWord(item) != firstWord)
						//console.log(multipleAnswer)
						//console.log("primeira palavra escolhida: ", firstWord)
						break;
					}
				}
			}

			if(firstWord== undefined){
				continue
			}

			if(attemptWord.length == data.length){
			   //console.log("Ja foram avaliadas todas as palavras")
			   break;
			}

			let indexGoal = Array.from({ length: firstWord.length }, (_, i) => i);

			runtime.globalVars.first_word = firstWord

			let otherQuestion = firstQuestion;
			wordsChoiceComplete.push(firstWord)

			while(indexGoal.length != 0){

				if(multipleAnswer != null){
					const aux = []
					for(let j=0; j < firstWord.length; j++){
						const letter = firstWord[j];

						if(multipleAnswer.length == 0){
						   multipleAnswer = null;
						   //console.log("Questao de multiplas respostas: ",otherQuestion)
						   questionsSelected.push({question:otherQuestion, index:j});
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

									if (max + min < 15) {
										//console.log("Próxima palavra escolhida: ", word);
										//console.log(`A palavra ${word} cruzou com a vertical no índice ${j} com letra ${letter}`);
										aux.push({ string: word, posX: -k, posY: j , index:j, complete: false});
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

									if ((max + min < 15)) {
										//console.log(`A palavra ${otherWord} cruzou com a vertical no índice ${index} com letra ${letter}`);
										boardComplete.push({ string: otherWord, posX: -k, posY: index ,index:index, complete: false});
										indexGoal = indexGoal.filter(item => item != index);
										wordsChoiceComplete.push(otherWord);
										match = true;

										//console.log("Questão de resposta única: ", otherQuestion);
										questionsSelected.push({question:otherQuestion, index:index});
										break; // Sai do loop interno após encontrar uma letra que permite a junção
									}
								}
							}

					}}
				}
			}

			if(boardComplete.length == firstWord.length){
				isOkGame = true;
				//console.log(boardComplete)
				valid = true
				const words = boardComplete
				  .filter(item => item.string) // Filtra os objetos que possuem o atributo 'string'
				  .map(item => item.string);   // Mapeia apenas o valor do atributo 'string'


                const coordenatesMainWord = boardComplete
					.filter(item => item.posX !== undefined && item.posX !== null) // Mantém 0 e -0
					.map(item => Math.abs(item.posX));

 
			    //console.log(coordenatesMainWord)
                //console.log(boardComplete)
				//console.log(words);
				//console.log(questionsSelected)
				letters = getUniqueCharacters(words,coordenatesMainWord)
				symbols = getSymbol(letters)

				boardComplete = boardComplete.filter(item => item !== undefined && item !== null);
				questionsSelected.sort((a, b) => a.index - b.index);

				runtime.globalVars.symbols = JSON.stringify(symbols);
				

			}
			else{
				questionsSelected = [];
			}





		}
	}
	
	 if (valid) {

			// parte em que to testando e me estressando horrores
			let coordinates = []; // Array para armazenar todas as coordenadas

			for (let j = 0; j < boardComplete.length; j++) {
			  // (len, posX)
			  coordinates.push([boardComplete[j].string.length, boardComplete[j].posX]);
			}

			// Encontrar a menor e a maior coordenada X, considerando os tamanhos
			const minX = coordinates.reduce((min, curr) => Math.min(min, curr[1]), coordinates[0][1]) - 2;
			const maxX = coordinates.reduce((max, curr) => Math.max(max, curr[1] + curr[0] - 1), coordinates[0][1] + coordinates[0][0] - 1);

			// Quantidade de células no eixo x
			const gridWidth = maxX - minX + 2;

			//console.log("Coordenadas:", coordinates);
			//console.log("Quantidade de células para a esquerda:", minX);
			//console.log("Quantidade de células para a direita:", maxX);
			//console.log("Células totais:", gridWidth);

			runtime.globalVars.minX = 660 + Math.abs(minX) * 54 + (16 - gridWidth) * 27; // 27 = tamCelula/2

			boardComplete.sort((a, b) => a.index - b.index);
        

	        boardSave = {words:[...boardComplete], wordMainComplete:mainComplete, symbols: symbols}
			window.Namespace.board = boardSave;
			//console.log(boardSave)
			// Chamada da malha final
			if (saveExample != "" && boardComplete.length > 6){
				for (let j = 0; j < boardComplete.length; j++) {
					runtime.callFunction(
						"createGrid",
						x + boardComplete[j].posX,
						y + boardComplete[j].posY - 1,
						boardComplete[j].string.length,
						boardComplete[j].string,
						boardComplete[j].index,
						boardComplete[j].complete,
						mainComplete,
						window.Namespace.tipLetterRandom,
						window.Namespace.tipLetterSelected,
					);
					
					runtime.globalVars.words = runtime.globalVars.words + boardComplete[j].string + ","; 
				}
			} else {
				for (let j = 0; j < boardComplete.length; j++) {
						runtime.callFunction(
							"createGrid",
							x + boardComplete[j].posX,
							y + boardComplete[j].posY,
							boardComplete[j].string.length,
							boardComplete[j].string,
							boardComplete[j].index,
							boardComplete[j].complete,
							mainComplete,
							window.Namespace.tipLetterRandom,
							window.Namespace.tipLetterSelected,
						);
						
						runtime.globalVars.words = runtime.globalVars.words + boardComplete[j].string + ","; 
					}
			}

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
            grupos.set(-1, { celulas: []});
			// Agrupa as células e letras por idQuestao
			for (let i = 1; i < celulas.length; i++) {
				const celula = celulas[i];
				const idQuestao = celula.instVars.idQuestao;

				// Se o grupo ainda não existe, cria um novo
				if (!grupos.has(idQuestao)) {
					grupos.set(idQuestao, { celulas: []});
				}
                
				if(celula.instVars.isMain){
					// Adiciona a célula e a letra ao grupo correspondente
					grupos.get(-1).celulas.push(celula);
				}
				
				grupos.get(idQuestao).celulas.push(celula);

			}
			
			// Organiza as células com índice -1 de acordo com o idQuestao
			grupos.get(-1).celulas.sort((a, b) => {
				const idQuestaoA = a.instVars.idQuestao;
				const idQuestaoB = b.instVars.idQuestao;
				return idQuestaoA - idQuestaoB;
			});
            
			
			// Verifica cada grupo
			for (const [idQuestao, grupo] of grupos) {
				
				if(idQuestao != -1){
					
					for (let i = 0; i < grupo.celulas.length; i++) {
						const celula = grupo.celulas[i];

						if(i != 0 && i < grupo.celulas.length - 1){
							const celulaAnt = grupo.celulas[i - 1]
							const celulaPos = grupo.celulas[i + 1]
							celula.instVars.anterior = celulaAnt.uid
							celula.instVars.posterior = celulaPos.uid
						}
						else if(i == grupo.celulas.length - 1){
							const celulaAnt = grupo.celulas[i - 1]
							const celulaPos = grupo.celulas[0]
							celula.instVars.anterior = celulaAnt.uid
							celula.instVars.posterior = celulaPos.uid
						}
						else{
							const celulaAnt = grupo.celulas[grupo.celulas.length - 1]
							const celulaPos = grupo.celulas[i + 1]
							celula.instVars.anterior = celulaAnt.uid 
							celula.instVars.posterior = celulaPos.uid 
						}

					}
				}
				else{
					for (let i = 0; i < grupo.celulas.length; i++) {
						const celula = grupo.celulas[i];

						if(i != 0 && i < grupo.celulas.length - 1){
							const celulaAnt = grupo.celulas[i - 1]
							const celulaPos = grupo.celulas[i + 1]
							celula.instVars.anteriorMain = celulaAnt.uid 
							celula.instVars.posteriorMain = celulaPos.uid 
						}
						else if(i == grupo.celulas.length - 1){
							const celulaAnt = grupo.celulas[i - 1]
							const celulaPos = grupo.celulas[0]
							celula.instVars.anteriorMain = celulaAnt.uid 
							celula.instVars.posteriorMain = celulaPos.uid 
						}
						else{
							const celulaAnt = grupo.celulas[grupo.celulas.length - 1]
							const celulaPos = grupo.celulas[i + 1]
							celula.instVars.anteriorMain = celulaAnt.uid 
							celula.instVars.posteriorMain = celulaPos.uid 
						}

					}
				}
			}
			
			// Remover duplicatas das questões com base no 'id'
// 			questionsSelected = questionsSelected.filter(
// 				(value, index, self) =>
// 					index === self.findIndex((item) => item.id === value.id)
// 			);

			// Chamada das questões escolhidas
			
			
			for (let j = 0; j < questionsSelected.length; j++) {
			  if(questionsSelected[j].question.imagePath){
			  	 runtime.globalVars.existImage = true;
			  }
			  runtime.callFunction(
				"createQuestion",
				questionsSelected[j].question.id, 
				questionsSelected[j].question.idSecao,
				questionsSelected[j].question.pergunta, 
				questionsSelected[j].question.resposta, 
				questionsSelected[j].question.categoria, 
				questionsSelected[j].question.dica,
				questionsSelected[j].question.imagePath || "",
				questionsSelected[j].question.dificuldade
			  );
			}
			
			questionSave = [...questionsSelected]
            window.Namespace.question = questionSave;
		  }
		  else {
			boardComplete = [];
		  }
          
		  runtime.callFunction("scrol",);
		  //console.log(boardComplete)
		  //console.log(questionsSelected)

		  for(let i = 1; i < runtime.objects.celula.getAllInstances().length ; i++){

			const letterBox = runtime.objects.celula.getAllInstances()[i]
			if(!letterBox.instVars.isMain){
				let foundItem = symbols.find(item => item.letter === letterBox.instVars.letter);
				runtime.callFunction("createSymbol", letterBox.x, letterBox.y, foundItem.symbols)
			}

		  }
		
	runtime.addEventListener("tick", () => Tick(runtime));
}

//grupos validos


function Tick(runtime) {
    if(saveExample != "" && fitTime){
		runtime.globalVars.TempoGasto = window.Namespace.time;
		runtime.globalVars.moedas = coinSave;
		fitTime = false;
	}
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
    grupos.set(-1, { celulas: [], letras: [] });
	
    // Agrupa as células e letras por idQuestao
    for (let i = 0; i < celulas.length; i++) {
        const celula = celulas[i];
        const letter = letras[i];
        const idQuestao = celula.instVars.idQuestao;

        // Se o grupo ainda não existe, cria um novo
        if (!grupos.has(idQuestao)) {
            grupos.set(idQuestao, { celulas: [], letras: [] });
        }
		
		if(celula.instVars.isMain){
			// Adiciona a célula e a letra ao grupo correspondente
			grupos.get(-1).celulas.push(celula);
			grupos.get(-1).letras.push(letter);
		}

        // Adiciona a célula e a letra ao grupo correspondente
        grupos.get(idQuestao).celulas.push(celula);
        grupos.get(idQuestao).letras.push(letter);
		
    }
	
    // Verifica cada grupo

    for (const [idQuestao, grupo] of grupos) {
        let grupoValido = true;
        let filledCells = 0;
		if(goal.includes(idQuestao)){
			continue;
		}

		////console.log("Ids avaliados: ", idQuestao)
		
        // Verifica se todas as células do grupo cumprem a condição
        for (let i = 0; i < grupo.celulas.length; i++) {
            const celula = grupo.celulas[i];
            const letter = grupo.letras[i];
// 		    //console.log(letter.text == "")
			if(letter.text != ""){
				filledCells++;
			}
            
            if (celula.instVars.letter.toUpperCase() !== letter.text) {
                grupoValido = false; // Se uma célula não cumprir, o grupo é inválido
//                 break;
            }
        }
		

        // Se o grupo for válido, retorna o idQuestao
        if (grupoValido) {
		     let question;
            //console.log(idQuestao)
			let word = ''
            for (let i = 0; i < grupo.celulas.length; i++) {
			    const celula = grupo.celulas[i];
				const letter = grupo.letras[i]
				word +=  letter.text
				celula.instVars.block = true;
				letter.instVars.block = true;
				question = celula.instVars.idQuestao;
        	}
			
			
			if(saveExample != "" && firstRun){
				for(let i = 0; i < runtime.objects.Lacuna.getAllInstances().length;i++){
					const lacuna = runtime.objects.Lacuna.getAllInstances()[i]
					lacuna.instVars.isSelected = false
					
					if(idQuestao != -1 && lacuna.instVars.indice == idQuestao + 1 ){
						runtime.globalVars.idPerguntaSelec = lacuna.instVars.idQuestao
						lacuna.instVars.isSelected = true;
						
						
					}
					else if(idQuestao == -1 && lacuna.instVars.indice == 0){
						runtime.globalVars.idPerguntaSelec = lacuna.instVars.idQuestao
						lacuna.instVars.isSelected = true;
						
						
					}
					
				}
				
				//console.log(idQuestao)
				goal.push(idQuestao)
				//console.log(goal)
				runtime.callFunction("marcarAcerto", word)
			}
			else{
				runtime.callFunction("marcarAcerto")
				runtime.callFunction("goal", idQuestao)
				goal.push(idQuestao)

				if(idQuestao == -1){
					boardSave.wordMainComplete = true;
				}
				else{
					//console.log(boardSave.words)
					boardSave.words[idQuestao].complete = true;
				}
                
				//Salvar malha
				window.Namespace.board = boardSave;
				window.Namespace.question = questionSave;
				//console.log(boardSave)
				 const save = { words: boardSave, 
				 questions: questionSave, 
				 nameSection: runtime.globalVars.nomeSecao, 
				 time: runtime.globalVars.TempoGasto, 
				 tipContentUsed: window.Namespace.tipContentUsed,
			     tipLetterRandom: window.Namespace.tipLetterRandom,
			     tipLetterSelected: window.Namespace.tipLetterSelected,
				 coin: runtime.globalVars.moedas}

				 window.Namespace.session.rawData = JSON.stringify(save)
				 runtime.callFunction("save");
			}
			
        }
		
		if(!grupoValido && filledCells == grupo.celulas.length){
			runtime.callFunction("marcaTentativa")
			runtime.globalVars.tentativasGeral++;
		}
    }

    // Se nenhum grupo cumprir a condição, retorna null
//     //console.log("Nenhum grupo cumpre a condição.");
	firstRun = false
    return null;
	
}

function escolherPalavraAleatoria(lista, wordChoice) {
  const wordList = lista.filter(item => !wordChoice.includes(item));
  if (wordList.length === 0) return null;
  const indiceAleatorio = Math.floor(Math.random() * wordList.length);
  return wordList[indiceAleatorio];
}

function getSymbol(letters){
    let symbolsIndex = Array.from({ length: 26 }, (_, i) => i);
	let symbolsChar = [];
	for( let i = 0; i < letters.length; i++){
		const index = symbolsIndex[Math.floor(Math.random() * symbolsIndex.length)]
	    symbolsIndex = symbolsIndex.filter(item => item != index)
		symbolsChar.push({letter:letters[i], symbols:index})
		
	}
	
	return symbolsChar
}

function getUniqueCharacters(words, coordinateMainWord) {
  const wordsWithoutMain = []
  const uniqueCharacters = new Set();
  
  //retirar caracters da palavra principal
  for(let i=0; i < words.length; i++){
    const palavra = words[i];
	let novaPalavra = palavra.split("");
	let aux = [];
	for(let j=0; j < novaPalavra.length; j++){
        if(j != coordinateMainWord[i]){
		   aux.push(novaPalavra[j])
		}
	}
    novaPalavra = aux
	
	novaPalavra = novaPalavra.join("");
    //console.log(novaPalavra)
	wordsWithoutMain.push(novaPalavra)
  }
  wordsWithoutMain.forEach(word => {
    word.split("").forEach(char => {
      uniqueCharacters.add(char);
    });
  });

  return Array.from(uniqueCharacters);
}


function normalizeWord(word) {
  return word
    .toLowerCase() // Converte para caixa baixa
    .normalize("NFD") // Decompõe caracteres com acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas de acentos
    .replace(/\s+/g, ""); // Remove todos os espaços
}