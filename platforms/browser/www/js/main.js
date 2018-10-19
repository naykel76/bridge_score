function cl(val) {
    console.log(val);
}
var xxx = "Waiting for input";
var zzz = "Waiting for input";
var suit;
var mult;
var bid;
var vul;
var made;
var overUnder; // over/under tricks made
var bpp; // over/under base penalty points
var tpp; // total penalty points

var ppt; // points per trick
var ntb; // NT bonus
var totalTrickPoints; // total trick points

var ctt; // contract type
var contractBonus; // game type bonus
var slamBonus; // slam bonus
var dblBonus; // doubling bonus

/* ============================================================================
|
| Functions to get contract details from inputs using jQuery.
| All values have been returned as public variables
|
============================================================================ */

function getBid() {
    if (!$('input[name="bid"]').is(':checked')) {
        return 0;
    } else {
        return parseInt($('input[name="bid"]:checked').val());
    }
}

function getSuit() {
    return $('input[name="suit"]:checked').val();
}

function getMultiplier() {
    return parseInt($('input[name="mult"]:checked').val());
}

function getVul() {

    let x = $('input[name="vul"]:checked').val();

    if (x === "V") { // return boolean
        return true;
    } else {
        return false;
    }
}

function getMade() {
    if (!$('input[name="made"]').is(':checked')) {
        return undefined; // used for easy identification
    } else {
        return parseInt($('input[name="made"]:checked').val());
    }
}

/* Check to see if all fields have been selected */
function validateContract(bid, mult, suit, vul) {
    if (bid === 0 || mult === undefined || suit === undefined || vul === undefined) {
        contractReady = false;
    } else {
        contractReady = true;
    }
}

/* ============================================================================
|
| Main function to trigger all
|
============================================================================ */


/* https://www.bridgeguys.com/Conventions/ScoreDuplicateBridge.html */


function setContractDetails() {
    /* Get value from inputs */
    bid = getBid();
    suit = getSuit();
    mult = getMultiplier();
    vul = getVul();
    made = getMade();

    /* set values based on inputs */
    ppt = setPPT(suit);
    ntb = setNTB(suit);
    totalTrickPoints = setTotalTrickPoints(ppt, bid, ntb);

    /* Functions for scoring */
    ctt = setContractType(totalTrickPoints);
    contractBonus = setContractBonus(ctt);
    slamBonus = setSlamBonus(bid);
    dblBonus = setContractDblBonus(mult);
    setSubTotal(); // original contract bid with no over/under tricks

    /* Game over and Penalties */
    overUnder = setOverUnderTricks(made, bid); // total ammount of over tricks
    bpp = setOverUnderBase(overUnder, vul, mult, made, suit, ppt);
    tpp = setPenalty(overUnder, bpp);
    grandTotal = gameOver(overUnder, tpp);



    validateContract(bid, mult, suit, vul)
    /* Display information on page */
    displaySubTotal();
    displayGameOver();

    debug();
}

/* display information in console */
function debug() {

    console.clear();

    cl(
        "Ready To Go: " + contractReady + '\n' +
        "Tricks Bid: " + bid + '\n' +
        "Tricks Made: " + made + '\n' +
        "Suit: " + suit + '\n' +
        "Multiplier: " + mult + '\n' +
        "Vul: " + vul + '\n'
    );

    cl(
        "Points Per Trick: " + ppt + '\n' +
        "NT Bonus: " + ntb + '\n' +
        "Contract Type: " + ctt + '\n'
    );

    /* scoring breakdown */
    cl(
        "Total Trick Points: " + totalTrickPoints + '\n' +
        "Doubling Bonus: " + dblBonus + '\n' +
        "Contract Bonus: " + contractBonus + '\n' +
        "Slam Bonus: " + slamBonus + '\n' +
        "Sub Total Score: " + subTotal + '\n' +
        "Grand Total: " + grandTotal + '\n'
    );

    cl(
        "Base Penality (bpp) : " + bpp + '\n' +
        "Over/Under Tricks (ot) : " + overUnder + '\n' +
        // "TESTING XXX : " + xxx + '\n' +
        // "TESTING ZZZ: " + zzz + '\n' +
        "Total Penality Points (tpp): " + tpp + '\n'
    )

}

/* ============================================================================
|
| Contract and Scoring functions.
|
============================================================================ */
/* 
|
| total trick points (multipliers are taken care on when setting PPT and NTB)
| totalTrickPoints = (bid * ppt) + ntb (NOTE: 'V' and 'NV' does not alter PPT)
| 
| 
*/

function setPPT(suit) {

    /* 
    | Set base points per trick *** including multiplier *** 
    |
    */

    // if the multiplier is not set temporarly set to 1, so 'points per trick' can be displayed if selected first 
    let m = mult;

    if (m === undefined) {
        m = 1;
    }

    if (suit === 'diamonds' || suit === 'clubs') {
        return 20 * m;
    } else if (suit === 'nt' || suit === 'hearts' || suit === 'spades') {
        return 30 * m;
    } else {
        return 0;
    }
}

function setNTB(suit) {

    /* 
    | Set 'nt' bonus for the first trick (10 points * multiplier)
    */

    // if the multiplier is not set temporarly set to 1, so 'points per trick' can be displayed if selected first 
    let m = mult;

    if (m === undefined) {
        m = 1;
    }

    if (suit === 'nt') {
        return 10 * m;
    } else {
        return 0;
    }
}

function setTotalTrickPoints(ppt, bid, ntb) {

    /* 
    | Total score for tricks including multipliers and NTB (if bid), no bonuses!
    */

    if (bid === 0 || ppt === 0) { // prevent contract type displaying early
        return 0;
    } else {
        return ppt * (bid - 6) + ntb; // the -6 is due to no points awarded for the first 6 tricks
    }

}

function setContractType(totalTrickPoints) {

    /* 
    | Set contract type (bonus)
    |
    | If the trick score exceeds 100 (including multipliers) then the contract
    | type is 'game' awarding 300 bonus points (or 500 points if vulnerable), if the
    | contract is less than less than 100 points 'part score' is achieved awarding
    | 50 bonus points.
    |
    */
    let t = totalTrickPoints;

    if (t === undefined) {
        return undefined;
    }
    if (t <= 99) {
        return "PART-SCORE";
    } else {
        return "GAME";
    }

}

function setContractDblBonus(mult) {

    /* 
    | Doubling bonus (dblBonus) for doubling or re-doubling the contract. 
    | This is a straight up bonus of 50 or 100 and is not subject to the multipliers. 
    */

    if (mult == 4) { // returns string
        return 100;
    } else if (mult == 2) {
        return 50;
    } else {
        return 0;
    }

}

function setContractBonus(ctt) {

    /* 
    | Game type bonus (contractBonus) points for making 'GAME' or 'PART-SCORE' 
    |
    | For making PART-SCORE:   	        50
    | For making GAME, not vulnerable: 	300
    | For making GAME, vulnerable: 	    500
    |
    */

    if (ctt === "GAME") {
        if (vul) {
            return 500; // bonus + 200 for vulnarable
        } else {
            return 300;
        }
    } else if (ctt === "PART-SCORE") {
        return 50;
    } else {
        return 0;
    }
}

function setSlamBonus(bid) {

    /* 
    | Slam bonus (slamBonus) for bidding and taking 12 or 13 tricks 
    |
    | Small slam (12 tricks) bid and made   - not vulnerable 500
    |                                           - vulnerable 750
    | Grand slam (13 tricks) bid and made   - not vulnerable 1000
    |                                       - vulnerable 1500
    |
    | ** Slam bonuses are on top of all other bonuses **
    */

    let x;

    if (bid === 13) {
        x = 1000;
    } else if (bid === 12) {
        x = 500;
    } else {
        x = 0;
    }

    if (vul) {
        x = x + x * 0.5; // +50% for vulnarable
    }

    return x;
}


/* 
| Calculate the potential score if game is won and no extra tricks taken
*/

function setSubTotal() {

    if (totalTrickPoints === 0 || suit === undefined) {
        subTotal = 0;
    } else {
        subTotal = contractBonus + dblBonus + totalTrickPoints + slamBonus;
    }

}

/* ============================================================================
|
| Results and end of game functions.
|
============================================================================ */

function setOverUnderTricks(made, bid) {

    /* When positive the game is won and '+Extra tricks' are awarded bonus points, 
    where negative them game is lost and '-Extra tricks' are subject to penalties */

    if (made !== undefined && bid > 0) { // don't fire until bot tricks and made selected
        return made - bid;
    }
}

function setOverUnderBase(overUnder, vul, mult, made, suit, ppt) {

    /*
    | Work out the base penalty/bonus score base on the first trick and doubling status
    |   - Extra tricks with standard contract 'V' or 'NV' = standard trick points
    |   - Extra trick points doubled or redoubled 'V' = 50 'NV' = 100 x the multiplier
    |   - Losts game penalties 'V' = 50 'NV' = 100 x the multiplier
    |
    | Positive values are aways returned!
     */

    if (bid === 0 || suit === undefined || made === undefined) { // prevent firing until valid fields selected
        return 0;
    } else {
        if (overUnder >= 0 && mult === 1) { // standard game gets trick value
            return ppt;
        } else { // only fire when neg tricks or doubled contract
            return (vul) ? 100 * mult : 50 * mult;
        }
    }
}

function setPenalty(overUnder, bpp) {

    /*  
        if(under && mult >= 2)
            = -1
            = -2 || -3
            < -4

        if single base x undertricks
        if double && - NV {-base - ((ot + 1) * base * 2)}
        if double && -2 or -3 && NV {-base - ((ot + 1) * base * 2)}
        if double && <-4 && NV {-base - ((ot + 1) * base * 3) - 200} -200 is adjustment for tricks 2 and 3
        if double && V {-base - ((ot + 1) * base * 1.5)}
        if re-double score * 2 both 'V' and 'NV'
    */
    if (suit !== undefined) { // only fire when suit is selected 

        if (overUnder === -1 || overUnder < -1 && mult === 1) { // if lost or single multiplier
            return overUnder * bpp;
        } else if (overUnder === -2 || overUnder === -3) { // if lost by -2 or -3
            if (!vul) {
                return (overUnder + 1) * bpp * 2 - bpp;
            } else {
                return (overUnder + 1) * bpp * 1.5 - bpp;
            }
        } else if (overUnder <= -4) { // if lost by 4 or more
            if (!vul) {
                return (overUnder + 1) * bpp * 3 + bpp; // not sure why this is opposite but it works!
            } else {
                return (overUnder + 1) * bpp * 1.5 - bpp;
            }
        } else { // if game won
            return overUnder * bpp;
        }
    }

}

function gameOver(overUnder, tpp) {

    let t;

    if (overUnder >= 0) {
        //game won
        t = tpp + subTotal;
        gameStatus = "won";
    } else {
        // game lost
        gameStatus = "lost";
        t = tpp;
    }

    return t;
}

/* ============================================================================
|
| Display contract information and potential game score
|
============================================================================ */

function displayGameOver() {

    
    if (contractReady && made !== undefined) {
        if (gameStatus === "won") {
            bg = "";
            document.getElementById('gameOver').innerHTML = "<div class=' bx ui-corner-all success'><strong>Actual Score:</strong> " + grandTotal + "</div>";
        } else {
            document.getElementById('gameOver').innerHTML = "<div class=' bx ui-corner-all danger'><strong>Actual Score:</strong> " + grandTotal + "</div>";
        }
    } else {
        document.getElementById('gameOver').innerHTML = "<div></div>";
    }
}


function displaySubTotal() {

    /* 
    | Display the potential game score with out over or under tricks
    */

    if (contractReady) {
        // document.getElementById('subTotal').innerHTML = "<div>Contract Score: " + subTotal + "</div>";
        document.getElementById('subTotal').innerHTML = "<div class='bx ui-corner-all'><strong>Contract Score:</strong> " + subTotal + "</div>";
    } else {
        document.getElementById('subTotal').innerHTML = "<div></div>";
    }
}