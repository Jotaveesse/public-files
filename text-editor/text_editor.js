window.onload=function(){setup();
selectMenuSetup();};

function setup(){
	var tabs=Array.from(document.getElementsByClassName("tab_content"));
	var replaceTab=document.getElementById("replace_text_tab");
	var compareTab=document.getElementById("compare_text_tab");
	var convertRadixTab=document.getElementById("convert_radix_tab");
	
	var replaceTabButton=document.getElementById("replace_tab_button");
	var compareTabButton=document.getElementById("compare_tab_button");
	var convertRadixTabButton=document.getElementById("convert_radix_tab_button");
	
	//abre a tab correta dependendo do valor do hash da url
	if (location.hash=="#compare"){
		compareTab.style.display="block";
		compareTabButton.classList.add("selected");
	}
	else if (location.hash=="#convert"){
		convertRadixTab.style.display="block";
		convertRadixTabButton.classList.add("selected");
	}
	else{
		replaceTab.style.display="block";
		replaceTabButton.classList.add("selected");
	}
	
	var chosenFromBase=parseInt(document.getElementById("convert_from_select").value);
	var baseFromElem=document.getElementById("base_from");
		
	baseFromElem.parentElement.style.display=(chosenFromBase==-1)?"":"none";
	
	var chosenToBase=parseInt(document.getElementById("convert_to_select").value);
	var baseToElem=document.getElementById("base_to");
		
	baseToElem.parentElement.style.display=(chosenToBase==-1)?"":"none";
	
	//seleciona todo o texto das caixas de texto de comparação quando o usuario clica 3 vezes
	Array.from(document.getElementsByClassName("output_text")).forEach((elem)=>{
	  elem.addEventListener('click', function (evt) {
		if (evt.detail === 3) {
			selectText(evt.target);
		}
	  });
	});
	
	//quando clica no botao de replace text da tab
	replaceTabButton.addEventListener("click",function(ev)
	{
		var button=ev.target;
		selectTab(button,replaceTab);
		location.hash="replace";
		
	});
	
	//quando usuario clica no botao de compare text da tab
	compareTabButton.addEventListener("click",function(ev)
	{
		var button=ev.target;
		selectTab(button,compareTab);
		location.hash="compare";
		
	});
	
	//quando usuario clica no botao de convert radix da tab
	convertRadixTabButton.addEventListener("click",function(ev)
	{
		var button=ev.target;
		selectTab(button,convertRadixTab);
		location.hash="convert";
		
	});
	
	//quando o usuario clica no botao de replace text
	document.getElementById("replace_button").addEventListener("click",function()
	{
		var selectedText=replaceTab.getElementsByClassName("selected_text")[0].value;
		var newText=replaceTab.getElementsByClassName("new_text")[0].value;
		var originalText=replaceTab.getElementsByClassName("original_text")[0].value;
		var outputText=replaceTab.getElementsByClassName("output_text")[0].value;
		
		var titleInfo=document.getElementById("total_matches");
		
		var replacingAll=document.getElementById("replace_all").checked;
		var caseSensitive=document.getElementById("replace_case_sensitive").checked;
		var sequentialReplace=document.getElementById("replace_sequential").checked;
		
		var searchText="";
		var matchCount=0;
		
		//caso esteja considerando a diferença de maiuscula e minuscula
		if (caseSensitive){
			searchText=selectedText;
		}
		else{
			searchText = new RegExp(selectedText, "ig");
		}
		
		//caso seja uma edicao sequencial
		if(sequentialReplace && outputText!=""){
			modifiedText=outputText;
		}
		else{
			modifiedText=originalText;
		}
		
		matchCount=modifiedText.split(searchText).length-1;
		
		if(replacingAll){
			modifiedText=modifiedText.replaceAll(searchText,newText);
		}
		else
			modifiedText=modifiedText.replace(searchText,newText);
		
		titleInfo.innerHTML=matchCount + (matchCount==1?" match":" matches");
		replaceTab.getElementsByClassName("output_text")[0].value=modifiedText;
	});
	
	//quando clica no botao de compare text
	document.getElementById("compare_button").addEventListener("click",function()
	{
		var caseSensitive=document.getElementById("compare_case_sensitive").checked;
		var compareOption=document.querySelector('input[name="compare_option"]:checked').value;
		
		var totalRemovedTitle=document.getElementById("total_removed");
		var totalAddedTitle=document.getElementById("total_added");
		var text1=compareTab.getElementsByClassName("original_text")[0].value;
		var text2=compareTab.getElementsByClassName("compare_text")[0].value;
		
		//pega a comparação com base nos dois texto inseridos
		var comparison=JsDiff[compareOption](text1, text2,{ignoreCase:!caseSensitive});
		
		var textData=textFromComponents(comparison, text1, text2);
		
		var totalRemoved=textData.removedCount;
		var totalAdded=textData.addedCount;;
		
		if(compareOption.includes("Words")){
			totalRemoved-=textData.removedWhite;
			totalAdded-=textData.addedWhite;
		}
		
		totalRemovedTitle.innerHTML=totalRemoved+" "+compareOption.slice(4,9).toLowerCase()+" removed";
		totalAddedTitle.innerHTML=totalAdded+" "+compareOption.slice(4,9).toLowerCase()+" added";
		document.getElementById("output1").innerHTML=textData.removedText;
		document.getElementById("output2").innerHTML=textData.addedText;
		
	});
	
	//quando o usuario clica no botao de convert radix
	document.getElementById("convert_radix_button").addEventListener("click",function()
	{
		var originalText=convertRadixTab.getElementsByClassName("original_text")[0].value;
		var outputText=convertRadixTab.getElementsByClassName("output_text")[0].value;
		
		var titleInfo=document.getElementById("total_radix_matches");
		
		var chosenFromBase=parseInt(document.getElementById("convert_from_select").value);
		var chosenToBase=parseInt(document.getElementById("convert_to_select").value);
		var chosenFromLength=document.getElementById("radix_from_length").value;
		var chosenToLength=document.getElementById("radix_to_length").value;
		var chosenBaseFrom=document.getElementById("base_from").value;
		var chosenBaseTo=document.getElementById("base_to").value;
		
		if(chosenFromBase==-1){
			chosenFromBase=chosenBaseFrom;
		}
		
		if(chosenToBase==-1){
			chosenToBase=chosenBaseTo;
		}
		
		var [modifiedText,matchCount]=convertTextRadix(originalText,chosenFromBase,chosenToBase,chosenFromLength,chosenToLength);

		titleInfo.innerHTML=matchCount+(matchCount==1?" match":" matches");
		convertRadixTab.getElementsByClassName("output_text")[0].value=modifiedText;
	});
	
	//quando o usuario clica no botao de all lengths
	document.getElementById("all_radix_lengths").addEventListener("click",function()
	{
		var radixFromLength=document.getElementById("radix_from_length");
		
		if(this.checked){
			radixFromLength.parentElement.style.display="none";
		}
		else{
			radixFromLength.parentElement.style.display="";
		}
	});
	
	//quando o usuario clica no botao de all lengths
	document.getElementById("min_radix_size").addEventListener("click",function()
	{
		var radixToLength=document.getElementById("radix_to_length");
		
		if(this.checked){
			radixToLength.parentElement.style.display="none";
		}
		else{
			radixToLength.parentElement.style.display="";
		}
	});
	
	document.getElementById("convert_from_select").parentElement.addEventListener("click",function(){
		var chosenFromBase=parseInt(document.getElementById("convert_from_select").value);
		var baseFromElem=document.getElementById("base_from");
		
		baseFromElem.parentElement.style.display=(chosenFromBase==-1)?"":"none";
	});
	
	document.getElementById("convert_to_select").parentElement.addEventListener("click",function(){
		var chosenToBase=parseInt(document.getElementById("convert_to_select").value);
		var baseToElem=document.getElementById("base_to");
		
		baseToElem.parentElement.style.display=(chosenToBase==-1)?"":"none";
	});
}

function selectTab(button, tab){
	var tabs=Array.from(document.getElementsByClassName("tab_content"));
	var tab_buttons=Array.from(document.getElementsByClassName("tab_button"));
	
	//esconde todas as tabs
	tabs.forEach((elem) =>{
			elem.style.display="none";
		});
	//remove a classe "selected" de todos os botoes das tabs
	tab_buttons.forEach((elem) =>{
			elem.classList.remove("selected");
		});
	
	//adiciona a classe "selected" ao botao escolhido e deixa a tab escolhida visivel
	button.classList.add("selected");
	tab.style.display="block";
}

function textFromComponents(comparison, firstText, secondText){
	var textData={
		removedText:"",
		addedText:"",
		removedCount:0,
		addedCount:0,
		removedWhite:0,
		addedWhite:0
	};
	
	
	comparison.forEach((section)=>{
		secLen=section.value.length;
		
		//se essa secçao foi marcada como removida
		if(section.removed){
			//pega os valores correspondentes da fatia do texto 
			//original para evitar que todas as letras fiquem minusculas
			textData.removedText+="<removed>"+firstText.slice(0,secLen)+"</removed>";
			firstText=firstText.slice(secLen);
			textData.removedCount+=section.count;
			textData.removedWhite+=(section.value.split(/\s/g).length-1);
		}
		else if(section.added){
			textData.addedCount+=section.count;
			textData.addedWhite+=(section.value.split(/\s/g).length-1);
			textData.addedText+="<added>"+secondText.slice(0,secLen)+"</added>";
			secondText=secondText.slice(secLen);
		} 
		else{
			textData.removedText+=firstText.slice(0,secLen);
			textData.addedText+=secondText.slice(0,secLen);
			firstText=firstText.slice(secLen);
			secondText=secondText.slice(secLen);
		} 
	});

	textData.removedText=textData.removedText.replaceAll(/(\n)/g,"<br>");
	textData.addedText=textData.addedText.replaceAll(/(\n)/g,"<br>");
	
	return textData;
}

function selectText(node) {

    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

function simpleCompare(text1, text2){
	let finalText="";
	let wasPrevSame=true;
	let caseSensitivity=document.getElementById("compare_case_sensitive").checked;
	
	Array.from(text1).forEach( (letter, index) => {
		var sameLetters=false;
		if (caseSensitivity){
			sameLetters=text2[index]==letter;
		}
		else{
			if(text2[index]!=null)
				sameLetters=text2[index].toLowerCase()==letter.toLowerCase();
			else
				sameLetters=false;
			
			console.log(text2[index]+" "+letter+" "+sameLetters)
		}
		
		if(sameLetters){
			if(wasPrevSame)
				finalText+=letter;
			else
				finalText+="</span>"+letter;
			wasPrevSame=true;
		}

		else{
			if(wasPrevSame)
				finalText+="<span>"+letter;
			else
				finalText+=letter;
			wasPrevSame=false;
		}
	});
	
	return finalText.replaceAll("\n","<br>");
}

function lineCompare(text1, text2){
	let finalText="";
	let wasPrevSame=true;
	let caseSensitivity=document.getElementById("compare_case_sensitive").checked;
	
	splitText1=text1.split("\n");
	splitText2=text2.split("\n");
	
	splitText1.forEach((subs, splitIndex) => {
		wasPrevSame=true;
		Array.from(subs).forEach( (letter, letterIndex) => {
			var sameLetters=false;
			
			if (caseSensitivity){
				if(splitText2[splitIndex]!=null&&splitText2[splitIndex][letterIndex]!=null)
					sameLetters=splitText2[splitIndex][letterIndex]==letter;
				else
					sameLetters=false;
			}
			else{
				if(splitText2[splitIndex]!=null&&splitText2[splitIndex][letterIndex]!=null)
					sameLetters=splitText2[splitIndex][letterIndex].toLowerCase()==letter.toLowerCase();
				else
					sameLetters=false;
			}
			
			if (sameLetters){
				if(wasPrevSame)
					finalText+=letter;
				else
					finalText+="</span>"+letter;
				wasPrevSame=true;
			}
			else{
				if(wasPrevSame)
					finalText+="<span>"+letter;
				else
					finalText+=letter;
				wasPrevSame=false;
			}
		});
		if(wasPrevSame)
			finalText+="\n";
		else
			finalText+="</span>"+"\n";
	});
	
	return finalText.replaceAll("\n","<br>");
}

function wordCompare(text1, text2){
	let finalText="";
	let wasPrevSame=true;
	let caseSensitivity=document.getElementById("compare_case_sensitive").checked;
	
	splitText1=text1.split("\n");
	splitText2=text2.split("\n");
	
	splitText2.forEach((line,i)=>{splitText2[i]=line.split(" ");});
	
	splitText1.forEach((line, lineIndex) => {
		line.split(" ").forEach((word, wordIndex) => {
			
			wasPrevSame=true;
			
				var sameLetters=false;
				
				if (caseSensitivity){
					if(splitText2[lineIndex]!=null&&splitText2[lineIndex][wordIndex]!=null)
						sameLetters=splitText2[lineIndex][wordIndex]==word;
					else
						sameLetters=false;
				}
				else{
					if(splitText2[lineIndex]!=null&&splitText2[lineIndex][wordIndex]!=null)
						sameLetters=splitText2[lineIndex][wordIndex].toLowerCase()==word.toLowerCase();
					else
						sameLetters=false;
				}
				
				if (sameLetters){
					if(wasPrevSame)
						finalText+=word;
					else
						finalText+="</span>"+word;
					wasPrevSame=true;
				}
				else{
					if(wasPrevSame)
						finalText+="<span>"+word;
					else
						finalText+=word;
					wasPrevSame=false;
				}
			if(wasPrevSame)
				finalText+=" ";
			else
				finalText+="</span>"+" ";
		});
		if(wasPrevSame)
			finalText+="\n";
		else
			finalText+="</span>"+"\n";
	});
	
	return finalText.replaceAll("\n","<br>");
}

const DECODE_VALUES="0123456789abcdefghijklmnopqrstuvwxyz";

function convertTextRadix(text,fromBase,toBase,fromLength,toLength){
	var totalMatches=0;
	var minRadixSize=document.getElementById("min_radix_size").checked;

	if(fromBase<2||fromBase>36||toBase<2||toBase>36)
		return [text,0];
	
	var [modifiedText,convertedStrings]=separateBase(text,fromBase ,fromLength);

	totalMatches=convertedStrings.length;
	
	convertedStrings=convertedStrings.map(str=>convertRadix(str,fromBase,toBase));
	
	if(!minRadixSize)
		convertedStrings=convertedStrings.map(str=>setStringToLength(str,toLength));
	
	for(var i=0;i<totalMatches;i++){
		modifiedText[i]=modifiedText[i]+convertedStrings[i];
	}
	
	modifiedText=modifiedText.join("");
	
	return [modifiedText,totalMatches];
}

function separateBase(str,base,length) {
	var radixCaseSensitive=document.getElementById("radix_case_sensitive").checked;
	var allRadixLengths=document.getElementById("all_radix_lengths").checked;
	
	if(allRadixLengths)
		var patt = "["+DECODE_VALUES.slice(0,base)+"]+";
	else
		var patt = "["+DECODE_VALUES.slice(0,base)+"]{"+length+"}";
	
	if(radixCaseSensitive)
		var reg = new RegExp(patt, "g");
	else
		var reg = new RegExp(patt, "gi");
	
    var remStr = str.match(reg);
    var modStr = str.split(reg);

    if (remStr==null)
		remStr=[];
	
    return [modStr,remStr];
}

function convertRadix(text,fromBase,toBase){
	var decValue=parseInt(text,fromBase);
	var result=decValue.toString(toBase);
	return result;
}

function setStringToLength(text,length){
	var textLength=text.length;
	
	if(textLength<length){
		for(var i=0;i<length-textLength;i++){
			text="0"+text;
		}
	}
	else if(textLength>length){
		text=text.slice(textLength-length,textLength);
	}
	
	return text;
}