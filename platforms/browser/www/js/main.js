function cl(val) {
    console.log(val);
}

var suit;
var mult = 0;
var bid;
var vul;
var made;
var ot; // over/under tricks made
var bpp; // over/under base penalty points
var tpp; // total penalty points

var ppt; // points per trick
var ntb; // NT bonus
var ttp; // total trick points

var ctt; // contract type
var gtb; // game type bonus
var sb; // slam bonus
var dblb; // doubling bonus

/* ============================================================================
|
| Functions to get contract details from inputs using jQuery.
| All values have been returned as public variables
|
============================================================================ */

function getBid() {
    if (!$('input[name="bid"]').is(':checked')) {
        return undefined;
    } else {
        return parseInt($('input[name="bid"]:checked').val());
    }
}

function getSuit() {
    return $('input[name="suit"]:checked').val();
}

function getMultiplier() {
    return $('input[name="mult"]:checked').val();
}

function getVul() {

    return $('input[name="vul"]:checked').val();

    // if (x === 'v') {
    //     return true;
    // } else {
    //     return false;
    // }
}

function getMade() {
    if (!$('input[name="made"]').is(':checked')) {
        return undefined;
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


/* http://www.bridgeguys.com/Conventions/ScoreDuplicateBridge.html */


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
    ttp = totalTrickPoints(ppt, bid, ntb);

    /* Functions for scoring */
    ctt = setContractType();
    gtb = setGameTypeBonus(ctt);
    sb = setSlamBonus(bid);
    dblb = setDoublingBonus(mult);
    setSubTotal(); // original contract bid with no over/under tricks

    /* Game over and Penalties */
    bpp = setBasePenalty(vul);
    ot = setExtraTricks(bid, made); // total ammount of over tricks
    tpp = setPenalty(ot, bpp);
    grandTotal = gameOver(ot, tpp);



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

    cl(
        "Total Trick Score: " + ttp + '\n' +
        "Bonus - Doubling: " + dblb + '\n' +
        "Bonus - Game Type: " + gtb + '\n' +
        "Bonus - Slam: " + sb + '\n' +
        "Sub Total Score: " + subTotal + '\n' +
        "Grand Total: " + grandTotal + '\n'
    );

    cl(
        "Base Penality (bpp) : " + bpp + '\n' +
        "Over/Under Tricks (ot) : " + ot + '\n' +
        "Total Penality Points (tpp): " + tpp + '\n'
    )

}


/* ============================================================================
|
| Contract and Scoring functions.
|
============================================================================ */

function setPPT(suit) {

    /* 
    | Set points per trick including multiplier (totalPPT)
    */

    if (suit === 'diamonds' || suit === 'clubs') {
        return 20 * mult;
    } else if (suit === 'nt' || suit === 'hearts' || suit === 'spades') {
        return 30 * mult;
    } else {
        return 0;
    }

}

function setNTB(suit) {

    /* 
    | Set 'nt' bonus for the first trick (10 points * multiplier)
    */

    if (suit === 'nt') {
        return 10 * mult;
    } else {
        return 0;
    }
}

function totalTrickPoints(ppt, bid, ntb) {
    /* 
    | Total score for tricks including multipliers and NTB (if bid), no bonuses!
    */

    return ppt * (bid - 6) + ntb; // the -6 is due to no points awarded for the first 6 tricks
}

function setContractType() {

    /* 
    | Set contract type (bonus)
    |
    | If the contract score exceeds 100 (including multipliers) then the contract
    | type is 'game' awarding 300 bonus points (or 500 points if vulnerable), if the
    | contract is less than less than 100 points 'part score' is achieved awarding
    | 50 bonus points.
    |
    | Contract bonuses are subject to multipliers
    */

    if (ttp <= 99) {
        return "Part Score";
    } else {
        return "Game";
    }

}

function setDoublingBonus(mult) {

    /* 
    | Doubling bonus (dblb) for doubling and re-doubling. This is a straight up bonus of 50 and 100. 
    */

    if (mult === 4) {
        return 100;
    } else if (mult === 2) {
        return 50;
    } else {
        return 0;
    }

}

function setGameTypeBonus(ctt) {

    /* 
    | Game type bonus (gtb) points for making 'GAME' or 'PART-SCORE' 
    |
    | For making PART-SCORE:   	        50
    | For making GAME, not vulnerable: 	300
    | For making GAME, vulnerable: 	    500
    |
    */

    if (ctt === "Game") {
        if (vul) {
            return 500; // bonus + 200 for vulnarable
        } else {
            return 300;
        }
    } else {
        return 50;
    }
}

function setSlamBonus(bid) {

    /* 
    | Slam bonus (sb) for bidding and taking 12 or 13 tricks 
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

    if (ttp === 0 || suit === undefined) {
        subTotal = 0;
    } else {
        subTotal = gtb + dblb + ttp + sb;
    }

}



/* ============================================================================
|
| Results and end of game functions.
|
============================================================================ */

function setExtraTricks(made, bid) {
    /* When positive the game is won and '+Extra tricks' are awarded bonus points, 
    where negative them game is lost and '-Extra tricks' are subject to penalties */
    return bid - made;
}

function setBasePenalty(vul) {
    /* Work out the base penalties for first 'V' = 50 'NV' = 100 x the multiplier
    Will return positive value which will work for bot over and under tricks */
    return (vul) ? 100 * mult : 50 * mult;
}

function setPenalty(ot, bpp) {

    /*         
        if single base x undertricks
        if double && - NV {-base - ((ot + 1) * base * 2)}
        if double && -2 or -3 && NV {-base - ((ot + 1) * base * 2)}
        if double && <-4 && NV {-base - ((ot + 1) * base * 3) - 200} -200 is adjustment for tricks 2 and 3
        if double && V {-base - ((ot + 1) * base * 1.5)}
        if re-double score * 2 both 'V' and 'NV'
    */

    if (ot === -1 || ot < -1 && mult === 1) { // single 'V' and 'NV'
        return ot * bpp;
    } else if (ot === -2 || ot === -3) {
        if (!vul) {
            return (ot + 1) * bpp * 2 - bpp;
        } else {
            return (ot + 1) * bpp * 1.5 - bpp;
        }
    } else if (ot <= -4) {
        if (!vul) {
            return (ot + 1) * bpp * 3 + bpp; // not sure why this is opposite but it works!
        } else {
            return (ot + 1) * bpp * 1.5 - bpp;
        }
    } else if (ot >= 0 && mult === 1) {
        return ot * ppt;
    } else {
        return ot * bpp;

    }

}

function gameOver(ot, tpp) {

    let t;

    if (ot >= 0) {
        //game won
        t = tpp + subTotal;

    } else {
        // game lost
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
        document.getElementById('gameOver').innerHTML = "<div>Actual Score: " + grandTotal + "</div>";
    } else {
        document.getElementById('gameOver').innerHTML = "<div>Actual Score: 0</div>";

    }
}


function displaySubTotal() {

    /* 
    | Display the potential game score with out over or under tricks
    */

    if (contractReady) {
        document.getElementById('subTotal').innerHTML = "<div>Contract Score: " + subTotal + "</div>";
    } else {
        document.getElementById('subTotal').innerHTML = "<div>Contract Score: 0</div>";
    }
}