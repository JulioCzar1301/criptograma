// Namespace da questão, para poder acessar em outro script
window.Namespace = window.Namespace || {};
window.Namespace.nameSectionOrChapter = []
window.Namespace.moedas = []

function waitForMessage() {
    return new Promise((resolve) => {
        window.addEventListener('message', (event) => {
            // Verifica a origem da mensagem para garantir segurança
            // if (event.origin !== 'https://your-react-app-domain.com') {
            //   return;
            // }

            // Acessa a mensagem recebida
            const message = event.data;
            ////console.log('Mensagem recebida no Construct:', message);
            
            // Armazena a mensagem em uma variável no namespace global
            window.Namespace.message = message;

            resolve();  // Resolve a Promise quando a mensagem for recebida
        });
    });
}

window.Namespace.reload = false;
window.Namespace.saveJSON;
window.Namespace.time = 0;
window.Namespace.session = {};
window.Namespace.session.rawData = "";
window.Namespace.tipContentUsed = false;
window.Namespace.tipLetterRandom = "";
window.Namespace.tipLetterSelected = "";

async function main(){
   	//await waitForMessage()
	//console.log(window.Namespace.message)
	// Função que verifica se deve recarregar o jogo salvo
	window.Namespace.questionsOnly = [];
	window.Namespace.erros = [];
	window.Namespace.acertos = [];
	window.parent?.postMessage('construct-ready', '*');
	//waitForMessage();
	window.Namespace.message = "948824b8-3051-7039-4c64-153b0f6c8dc8,chapter,25ba2c14-a291-4f90-a444-414252245737";
	window.Namespace.nameSection;
	window.Namespace.nameChapter;
	window.Namespace.moedas;
	
	const parts = window.Namespace.message.split(",");
	const isSection = parts[1] === "section";
	const chapterID = isSection ? "" : parts[2];
	const sectionID = isSection ? parts[2] : "";
    const idUser = parts[0]

	let nameSection;
	let nameChapter;
	
	// Função que verifica se deve recarregar o jogo salvo
	function getReloadStatus() {
		let jogador = window.Namespace.message.split(',')[0];
		try {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", `https://ereik07xl4.execute-api.us-east-1.amazonaws.com/dev/session/${jogador}`, false);
			xhr.send(null);
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				//console.log('Data fetched successfully:', data);
				
				if (data.state == 4) {
					if (isSection) {
						if (sectionID == data.section) {
							window.Namespace.reload = true;
						}
					}
					else {
						if (chapterID == data.chapter) {
							window.Namespace.reload = true;
						}
					}	
				} else {
					window.Namespace.reload = false;
				}
				
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	}
	
	// Função que puxa as questões do capítulo ou seção que for solicitado
	function initialize() {
		try {
			var xhr = new XMLHttpRequest();
			if (isSection) {	
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/question/nivelUser/${idUser}?idSection=${sectionID}`, false);
				
			}
			else {
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/question/nivelUser/${idUser}?idChapter=${chapterID}`, false);
			}
			xhr.send(null);
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				console.log('Data fetched successfully:', data);
                var dataFiltered = []
				for(const question of data.questoes){
					console.log(question)
					let flag = true
					let answersOfQuestion = []
					for(const answer of question.resposta){
						if(answersOfQuestion.includes(answer)){
							flag = false;
							break;
						}

						answersOfQuestion.push(answer)

						if(/.*\d.*/.test(answer)){
							flag = false;
							break;
						}
					}

					if(flag){
						dataFiltered.push(question);
					}
				}
			    //FILTRO QUESTÕES
				window.Namespace.rawData = dataFiltered;
                // console.log(dataFiltered)
				
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	}

	function getCoin() {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", `https://ereik07xl4.execute-api.us-east-1.amazonaws.com/dev/coins/${idUser}`, false);
        xhr.send(null);
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          window.Namespace.moedas = data.coins;
          //console.log("Saldo: ", data.coins)
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
}

    // Função que puxa o nome da seção ou capítulo
	function callName(){
		try {
			var xhr = new XMLHttpRequest();
			if (isSection) {	
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/section/name/${sectionID}`, false);
			}
			else {
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/chapter/name/${chapterID}`, false);
			}
			xhr.send(null);
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				//console.log('Data fetched successfully:', data);
				if (isSection) {
					window.Namespace.nameSectionOrChapter = data;
					window.Namespace.nameSection = data
				}
				else {
					window.Namespace.nameSectionOrChapter = data;
					window.Namespace.nameChapter = data
				}
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	}
	// Função que restaura a sessão do usuário
	function restoreData(){
		let jogador = window.Namespace.message.split(',')[0];
		try {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", `https://ereik07xl4.execute-api.us-east-1.amazonaws.com/dev/session/${jogador}`, false);
			xhr.send(null);
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				//console.log('Data fetched successfully:', data);
				window.Namespace.session = data.session;
				window.Namespace.session.rawData = window.Namespace.session.rawData;
				window.Namespace.time = window.Namespace.session.rawData.time
				
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	}
	
	getReloadStatus();
	if (!window.Namespace.reload) {
		initialize()
		getCoin()
		callName()
	}
	else{
		restoreData()
	}
	
	
}

main();