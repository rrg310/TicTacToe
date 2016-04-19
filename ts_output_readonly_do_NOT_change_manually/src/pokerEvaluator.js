var hands = ["4 of a Kind", "Straight Flush", "Straight", "Flush", "High Card",
    "1 Pair", "2 Pair", "Royal Flush", "3 of a Kind", "Full House", "-Invalid-"];
var handRanks = [8, 9, 5, 6, 1, 2, 3, 10, 4, 7, 0];
var pokerEvaluator;
(function (pokerEvaluator) {
    function rankHand(str) {
        //takes a string of per person hands and returns the rank as a number
        var index = 10; //index into handRanks
        var winCardIndexes, i, e;
        if (str.match(/((?:\s*)(10|[2-9]|[J|Q|K|A])[s|c|h|d](?:\s*)){5,7}/g) !== null) {
            var cardStr = str.replace(/A/g, "14").replace(/K/g, "13").replace(/Q/g, "12")
                .replace(/J/g, "11").replace(/s|c|h|d/g, ",");
            var cardsAsString = cardStr.replace(/\s/g, '').slice(0, -1).split(",");
            var cards = void 0;
            for (i = 0; i < cards.length; i++) {
                cards[i] = +cardsAsString[i];
            }
            var suits = str.match(/s|c|h|d/g);
            console.log("Cards initialsed: " + cards);
            console.log("Suits Initialised: " + suits);
        }
    }
    pokerEvaluator.rankHand = rankHand;
})(pokerEvaluator || (pokerEvaluator = {}));
//# sourceMappingURL=pokerEvaluator.js.map