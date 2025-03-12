// Namespace da questão, para poder acessar em outro script
window.Namespace = window.Namespace || {};
window.Namespace.reload = false;
window.Namespace.saveJSON;

window.Namespace.session ={};
window.Namespace.session.rawData = "";

async function main(){
	// Função que verifica se deve recarregar o jogo salvo
	window.Namespace.questionsOnly = [];
	window.Namespace.erros = [];
	window.Namespace.acertos = [];
	window.Namespace.message = "idJogadorPC,chapter,25ba2c14-a291-4f90-a444-414252245737";
	window.Namespace.nameSection;
	window.Namespace.nameChapter;
	
	const parts = window.Namespace.message.split(",");
	const isSection = parts[1] === "section";
	const chapterID = isSection ? "" : parts[2];
	const sectionID = isSection ? parts[2] : "";
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
				console.log('Data fetched successfully:', data);
				
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
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/section/questions/${sectionID}`, false);
			}
			else {
				xhr.open("GET", `https://kfdnohrf5a.execute-api.us-east-1.amazonaws.com/dev/chapter/questions/${chapterID}`, false);
			}
			xhr.send(null);
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				console.log('Data fetched successfully:', data);
				window.Namespace.rawData = data;
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
				console.log('Data fetched successfully:', data);
				if (isSection) {
					window.Namespace.nameSection = data;
				}
				else {
					window.Namespace.nameChapter = data;
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
				console.log('Data fetched successfully:', data);
				window.Namespace.session = data.session;
				window.Namespace.session.rawData = window.Namespace.session.rawData;
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
		callName()
	}
	else{
		restoreData()
	}
	
	
}

main();
