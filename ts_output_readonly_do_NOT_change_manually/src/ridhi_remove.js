var PokerEvaluator = require("poker-evaluator");
var evaluator;
(function (evaluator) {
    function evalHand() {
        console.log(PokerEvaluator.evalHand(["As", "Ks", "Qs", "Js", "Ts", "3c", "5h"]));
    }
    evaluator.evalHand = evalHand;
})(evaluator || (evaluator = {}));
//# sourceMappingURL=ridhi_remove.js.map