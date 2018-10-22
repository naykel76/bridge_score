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

/* 
| THESE FUNCTIONS HAVE BEEN WRITTEN TO RETURN UNDEFINED WHEN NO VALUE IS SELECTED
| TO USE FOR VALIDATION TRIGGERS
| */

function getBid() {

    let x;
    if (!$('input[name="bid"]').is(':checked')) {
        x = undefined;
    } else {
        x = parseInt($('input[name="bid"]:checked').val());
    }

    if (x !== undefined) {
        $("#score-bid").html(x - 6);
    }

    bid = x;
}

function getMult() {

    // let x = parseInt($('input[name="mult"]:checked').val());
    let x = (!$('input[name="mult"]:checked').val()) ? undefined : parseInt($('input[name="mult"]:checked').val());
    let m;


    if (x === 1) {
        m = "Standard";
    } else if (x === 2) {
        m = "Doubled";
    } else if (x === 4) {
        m = "Redoubled";
    } else {
        m = "";
    }

    $("#score-mult").html(m);

    mult = x;
}

function getVul() {

    /* this has been written a bit wierd becuase I want undefined in place of false when no value selected */

    let x = $('input[name="vul"]:checked').val();

    if (x === "V") { // return boolean
        $("#score-vul").html("Vulnerable");
        vul = true;
    } else {
        $("#score-vul").html("Not-Vulnerable");
        vul = false;
    }


}

function getMade() {

    let x = $('input[name="made"]:checked').val();
    $("#score-made").html(x);
    made = x;

}

/* reset all fields */
function reset() {
    window.location.reload(true);
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

    /* set values based on inputs */
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

    // debug();
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
        "TESTING ZZZ: " + zzz + '\n' +
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

/* 
| function to get suit from inputs and set the points per trick  
*/

function refreshDetails() {
    getMult();
    setSuitPPT();
    getBid();
    getVul();
    getMade();
}

function setSuitPPT() {

    /* get details from input, set vaules back to page and set variable */
    let x = $('input[name="suit"]:checked').val();
    $("#score-suit").html(x);
    suit = x;

    let m = (mult === undefined) ? 1 : mult;

    let y;

    if (suit === 'Diamonds' || suit === 'Clubs') {
        y = 20 * m;
    } else if (suit === 'NT' || suit === 'Hearts' || suit === 'Spades') {
        y = 30 * m;
    } else {
        y = 0;
    }

    $('#score-ppt').html(y);
    ppt = y;
}

function setNTB(suit) {

    /* 
    | Set 'nt' bonus for the first trick (10 points * multiplier)
    */

    // if the multiplier is not set temporarly set to 1, so 'points per trick' can be displayed if selected first 
    let m = mult;
    let x;

    if (m === undefined) {
        m = 1;
    }

    if (suit === 'NT') {
        x = 10 * m;
    } else {
        x = 0;
    }

    $('#score-ntb').html(x);
    return x;
}

function setTotalTrickPoints(ppt, bid, ntb) {

    /* 
    | Total score for tricks including multipliers and NTB (if bid), no bonuses!
    */

    let x;

    if (bid === undefined || ppt === undefined) { // prevent contract type displaying early
        x = 0;
    } else {
        x = ppt * (bid - 6) + ntb; // the -6 is due to no points awarded for the first 6 tricks
    }

    $('#score-ttp').html(x);
    return x;
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
    let x;

    if (t === 0) {
        x = "";
    } else if (t <= 99) {
        x = "Part-Score";
    } else {
        x = "Game";
    }

    $('#score-ct').html(x);
    return x;
}

function setContractDblBonus(mult) {

    /* 
    | Doubling bonus (dblBonus) for doubling or re-doubling the contract. 
    | This is a straight up bonus of 50 or 100 and is not subject to the multipliers. 
    */
    let x;
    if (mult == 4) { // returns string
        x = 100;
    } else if (mult == 2) {
        x = 50;
    } else {
        x = 0;
    }

    $('#score-dblb').html(x);
    return x;
}

function setContractBonus(ctt) {

    /* 
    | Game type bonus (contractBonus) points for making 'GAME' or 'PART-SCORE' 
    |
    | For making PART-SCORE:   	        50
    | For making GAME, not vulnerable: 	300
    | For making GAME, vulnerable: 	    500
    |
    | NOT SUBJECT TO MULT
    */

    let x;

    if (ctt === "Game") {
        if (vul) {
            x = 500; // bonus + 200 for vulnarable
        } else {
            x = 300;
        }
    } else if (ctt === "Part-Score") {
        x = 50;
    } else {
        x = 0;
    }

    $('#score-ctb').html(x);
    return x;

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

    $('#score-sb').html(x);
    return x;
}


/* 
| Calculate the potential score if game is won and no extra tricks taken
*/

function setSubTotal() {

    let x;
    if (totalTrickPoints === 0 || suit === undefined) {
        x = 0;
    } else {
        x = contractBonus + dblBonus + totalTrickPoints + slamBonus;
    }
    $('#score-cts').html(x)
    subTotal = x;
}

/* ============================================================================
|
| Results and end of game functions.
|
============================================================================ */

function setOverUnderTricks(made, bid) {

    /* When positive the game is won and '+Extra tricks' are awarded bonus points, 
    where negative them game is lost and '-Extra tricks' are subject to penalties */

    let x;
    if (made !== undefined && bid > 0) { // don't fire until bot tricks and made selected
        x = made - bid;
    }

    $('#score-out').html(x)
    return x;
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

    let x;
    if (suit !== undefined) { // only fire when suit is selected 

        if (overUnder === -1 || overUnder < -1 && mult === 1) { // if lost or single multiplier
            x = overUnder * bpp;
        } else if (overUnder === -2 || overUnder === -3) { // if lost by -2 or -3
            if (!vul) {
                x = (overUnder + 1) * bpp * 2 - bpp;
            } else {
                x = (overUnder + 1) * bpp * 1.5 - bpp;
            }
        } else if (overUnder <= -4) { // if lost by 4 or more
            if (!vul) {
                x = (overUnder + 1) * bpp * 3 + bpp; // not sure why this is opposite but it works!
            } else {
                x = (overUnder + 1) * bpp * 1.5 - bpp;
            }
        } else { // if game won
            x = overUnder * bpp;
        }
    }

    return x;

}

function gameOver(overUnder, tpp) {

    let x;

    if (overUnder >= 0) {
        //game won
        x = tpp + subTotal;
        gameStatus = "won";
    } else {
        // game lost
        gameStatus = "lost";
        x = tpp;
    }

    $('#score-gt').html(x);
    return x;
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
        document.getElementById('gameOver').innerHTML = "<div class='bx ui-corner-all'>Actual Score:</div>";
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
        document.getElementById('subTotal').innerHTML = "<div class='bx ui-corner-all'>Contract Score: </div>";
    }
}