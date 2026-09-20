class Algorithm{
	constructor(entities=[]){
		this.entities=entities;
		this.generation=0;
	}
	
	scoreRank(){
		var sorted=this.entities.sort(function(entity1,entity2){
			return entity1.score<entity2.score?1:-1;
		});
		return sorted;
	}
	
	doSelection(){
		var rank=this.scoreRank();
		var lastIndex=rank.length-1;
		var totalReplaced=0;
		
		for(let i=0;i<rank.length;i++){
			var willReproduce=Math.random()>(i/(lastIndex));

			if(willReproduce){
				rank[lastIndex-totalReplaced].pasteWeightsFrom(rank[i]);
				rank[lastIndex-totalReplaced].modifyWeights(0.08*i/(1+this.generation/15));
				rank[i].modifyWeights(0.03*i/(1+this.generation/10));
				totalReplaced++;
			}
			if(i+totalReplaced>=lastIndex)
				break;
		}
		
		this.generation++;
	}
	
	getScoreAverage(){
		var average=0;
		this.entities.forEach(entity=>{
			average+=entity.score;
		});
		
		average/=this.entities.length;
		
		return average;
	}
	
	resetScores(){
		this.entities.forEach(entity=>{
			entity.score=0;
		});
	}
}


class Entity{
	constructor(actions=[]){
		this.actions=actions;
		this.score=0;
	}
	
	pasteWeightsFrom(entity){
		this.actions.forEach((action,i)=>{
			action.weights=[...entity.actions[i].weights];
		});
	}
	
	modifyWeights(scale=0){
		this.actions.forEach((action,i)=>{
			action.modifyWeights(scale);
		});
	}
}


class Action{
	constructor(inputs,weights=[]){
		this.inputs=inputs;
		this.weights=weights;
		
		if(weights.length==0)
			for(let i=0;i<inputs.length;i++)
				this.weights.push(0);
		this.randomizeWeights();
	}
		
	getOutput(){
		var output=0;
		
		this.inputs.forEach((inp,i)=>{
			output+=inp.value*this.weights[i];
		});
		
		return output;
	}
	
	getBool(){
		return this.getOutput()>=0;
	}
	
	randomizeWeights(){
		for(let i=0;i<this.weights.length;i++)
			this.weights[i]=(Math.random()*((-1)**Math.round(Math.random()*10+1)));
	}
	
	modifyWeights(scale=0){
		for(let i=0;i<this.weights.length;i++){
			this.weights[i]+=scale*(Math.random()*((-1)**Math.round(Math.random()*10+1)));
			
			if(this.weights[i]>1)
				this.weights[i]=1;
			if(this.weights[i]<-1)
				this.weights[i]=-1;
		}
	}
}
class Input{
	constructor(value=0){
		this.value=value;
	}
}