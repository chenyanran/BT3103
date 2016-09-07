PlayersList = new Mongo.Collection('players');
SnakesList = new Mongo.Collection('snames');
LaddersList = new Mongo.Collection('ladders');

LaddersList.insert({ from: 3, to: 39 });
LaddersList.insert({ from: 10, to: 12 });
LaddersList.insert({ from: 27, to: 53 });
LaddersList.insert({ from: 56, to: 84 });
LaddersList.insert({ from: 61, to: 99 });
LaddersList.insert({ from: 72, to: 90 });


SnakesList.insert({ from: 97, to: 75 });
SnakesList.insert({ from: 66, to: 52 });
SnakesList.insert({ from: 63, to: 60 });
SnakesList.insert({ from: 47, to: 24 });
SnakesList.insert({ from: 31, to: 4 });
SnakesList.insert({ from: 16, to: 13 });


if(Meteor.isClient){
	Template.leaderboard.helpers({
    'player': function(){
        return PlayersList.find({}, { sort: {name: 1} });
    },

    'selectedClass': function(){
    var playerId = this._id;
    var selectedPlayer = Session.get('selectedPlayer');
    if(playerId == selectedPlayer){
        return "selected"
    	}
	},

	'selectedPlayer': function(){
    var selectedPlayer = Session.get('selectedPlayer');
    return PlayersList.findOne({ _id: selectedPlayer });
	}

});

	Template.leaderboard.events({
    'click .player': function(){
    	var playerId = this._id;
    	Session.set('selectedPlayer', playerId);
	},

	'click .remove': function(){
    	var selectedPlayer = Session.get('selectedPlayer');
    	PlayersList.remove({ _id: selectedPlayer });
	},

	'click .roll': function(){
    	var currentActivePlayer = PlayersList.findOne({ status: "Active" });
    	var currentActiveOrder = currentActivePlayer.order;
    	var currentActiveId = currentActivePlayer._id;
    	var diceNumber = Math.floor((Math.random() * 6) + 1);
    	console.log("Dice number this time:" + diceNumber);
    	document.getElementById("insert").innerHTML = diceNumber;
    	var newScore = currentActivePlayer.score + diceNumber;
    	if (newScore>99){
    		window.alert("Congrats to " + currentActivePlayer.name +"! Your score has reached 100!");
    		PlayersList.update({ _id: currentActiveId }, { $set: {score: 100 }});
    	}
    	else{
    	if (SnakesList.findOne({ from: newScore })){
    		var temp = SnakesList.findOne({ from: newScore });
    		window.alert("Ooops, Snake from " + temp.from + " to " + temp.to +"!");
    		newScore = temp.to;
    	}
    	else if (LaddersList.findOne({ from: newScore })){
    		var temp = LaddersList.findOne({ from: newScore });
    		window.alert("Wow, Ladder from " + temp.from + " to " + temp.to +"!");
    		newScore = temp.to;
    	}
    	if (PlayersList.findOne({ score: newScore })){
    		var temp = PlayersList.findOne({ score: newScore });
    		window.alert("Ooops, crash with " + temp.name + "! You have to return to 0!");
    		PlayersList.update({ _id: currentActiveId }, { $set: {score: 0 }}); 
    	}
    	else{
    		PlayersList.update({ _id: currentActiveId }, { $set: {score: newScore }});
    	}
    	}   	   	
    	PlayersList.update({ _id: currentActiveId }, { $set: {status: "Inactive" }});
    	var newActiveOrder = (currentActiveOrder + 1);
    	if (newActiveOrder>4){
    		newActiveOrder = newActiveOrder%4;
    	}
    	var newActivePlayer = PlayersList.findOne({ order: newActiveOrder });
    	var newActiveId = newActivePlayer._id;
    	PlayersList.update({ _id: newActiveId }, { $set: {status: "Active" }});
	},
});

	Template.addPlayerForm.events({
    'submit form': function(){
    	event.preventDefault();
        var playerNameVar = event.target.playerName.value;
        var totalNumber = PlayersList.find().count();
        if (totalNumber<1){
        	PlayersList.insert({
        		order: totalNumber+1,
        		status: "Active",
        		name: playerNameVar,
        		score: 0
    		});
        }
        else if (totalNumber<4){
        	PlayersList.insert({
        		order: totalNumber+1,
        		status: "Inactive",
        		name: playerNameVar,
        		score: 0
    		});
        }
        else {
        	window.alert("There are already 4 players!");
        }
    	event.target.playerName.value = "";
    }
});

}

if(Meteor.isServer){

}