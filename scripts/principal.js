
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
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	
	runtime.addEventListener("tick", () => Tick(runtime));
	
	const words = ["banana", "maca", "carambola", "maracuja", "damasco", "roma", "limao", "laranja"];
	const wordsMainChoice = [];
	let isOk = false;
	let attempt = 0;
	const maxAttempt = 1000;
    const x = 8;
	const y = 8;
	let board = [];
    
	let letters = getUniqueCharacters(words)
	console.log(letters)
	const symbols = getSymbol(letters)
	while (!isOk && attempt < maxAttempt) {
	  attempt++;

	  const mainWord = escolherPalavraAleatoria(words, wordsMainChoice);
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
		
		  let wordAttempt = [];
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
		for(let j=0; j < board.length; j++){
			runtime.callFunction("createGrid", x +  board[j].posX, y + board[j].posY, board[j].string.length, board[j].string)
		}
		
	  }
	  else{
	  	board = [];
	  }

	  console.log(board)
	  
	  for(let i = 1; i < runtime.objects.Sprite.getAllInstances().length ; i++){
	   
	    const letterBox = runtime.objects.Sprite.getAllInstances()[i]
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
    let symbolsIndex = Array.from({ length: 25 }, (_, i) => i);
	let symbolsChar = [];
	for( let i = 0; i < letters.length; i++){
		const index = symbolsIndex[Math.floor(Math.random() * symbolsIndex.length)]
	    symbolsIndex = symbolsIndex.filter(item => item != index)
		symbolsChar.push({letter:letters[i], symbols:index})
		
	}
	
	return symbolsChar
}
