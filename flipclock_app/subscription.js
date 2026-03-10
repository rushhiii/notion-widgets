let expire_hours = 241920

const targetDiv_trailer = document.getElementsByClassName("trailer_container")[0];
const yt_trailer = document.getElementsByClassName("yt_trailer")[0];
const close_button_trailer = document.getElementById("close_trailer");

close_button_trailer.onclick = function () {
    targetDiv_trailer.style.display = "none";
    yt_trailer.src = "";
};


// PLAN TOOGGLE
var plan_toggle = document.querySelector('.switch');
document.getElementById('buy_basic_lifetime').style.display = "none";
document.getElementById('buy_pro_lifetime').style.display = "none";

console.log(plan_toggle.checked)
// SALE
// document.getElementsByClassName('plan_title_strike')[0].style.display = "none";
// document.getElementsByClassName('plan_title_strike')[1].style.display = "none";


if (plan_toggle.checked) {
    document.querySelector('.monthly_plan').style.color = "gray";
    document.querySelector('.lifetime_plan').style.color = "black";
    document.querySelector('.header_title_change_with_plan').innerHTML = "Pay once, Use forever";

    // BASIC PLAN
    document.getElementsByClassName('dollar')[0].style.display = "none";
    document.getElementsByClassName('monthly_label')[0].style.display = "none";
    document.getElementsByClassName('monthly_money')[0].innerHTML = "BASIC";
    document.getElementsByClassName('plan_title')[0].innerHTML = "$9.99";
    document.getElementsByClassName('plan_title_strike')[0].style.display = "block";
    document.getElementById('buy_basic_lifetime').style.display = "block";
    document.getElementById('buy_basic').style.display = "none";
    // BASIC PLAN

    // PRO PLAN
    document.getElementsByClassName('dollar')[1].style.display = "none";
    document.getElementsByClassName('monthly_label')[1].style.display = "none";
    document.getElementsByClassName('monthly_money')[1].innerHTML = "PRO";
    document.getElementsByClassName('plan_title')[1].innerHTML = "$19.99";
    document.getElementsByClassName('plan_title_strike')[1].style.display = "block";
    document.getElementById('buy_pro_lifetime').style.display = "block";
    document.getElementById('buy_pro').style.display = "none";
    // PRO PLAN
}

plan_toggle.addEventListener('change', function(){
    if (this.checked){
        document.querySelector('.monthly_plan').style.color = "gray";
        document.querySelector('.lifetime_plan').style.color = "black";
        document.querySelector('.header_title_change_with_plan').innerHTML = "Pay once, Use forever";
        
        // BASIC PLAN
        document.getElementsByClassName('dollar')[0].style.display = "none";
        document.getElementsByClassName('monthly_label')[0].style.display = "none";
        document.getElementsByClassName('monthly_money')[0].innerHTML = "BASIC";
        document.getElementsByClassName('plan_title')[0].innerHTML = "$9.99";
        document.getElementsByClassName('plan_title_strike')[0].style.display = "block";
        document.getElementById('buy_basic_lifetime').style.display = "block";
        document.getElementById('buy_basic').style.display = "none";
        // BASIC PLAN

        // PRO PLAN
        document.getElementsByClassName('dollar')[1].style.display = "none";
        document.getElementsByClassName('monthly_label')[1].style.display = "none";
        document.getElementsByClassName('monthly_money')[1].innerHTML = "PRO";
        document.getElementsByClassName('plan_title')[1].innerHTML = "$39.99";
        document.getElementsByClassName('plan_title_strike')[1].style.display = "block";
        document.getElementById('buy_pro_lifetime').style.display = "block";
        document.getElementById('buy_pro').style.display = "none";
        // PRO PLAN
    }else{
        document.querySelector('.monthly_plan').style.color = "black";
        document.querySelector('.lifetime_plan').style.color = "gray";
        document.querySelector('.header_title_change_with_plan').innerHTML = "Get Upgraded";
        
        // BASIC PLAN
        document.getElementsByClassName('dollar')[0].style.display = "block";
        document.getElementsByClassName('monthly_label')[0].style.display = "block";
        document.getElementsByClassName('monthly_money')[0].innerHTML = "3.79";
        document.getElementsByClassName('plan_title')[0].innerHTML = "BASIC";
        document.getElementsByClassName('plan_title_strike')[0].style.display = "none";
        document.getElementById('buy_basic_lifetime').style.display = "none";
        document.getElementById('buy_basic').style.display = "block";
        // BASIC PLAN

        // PRO PLAN
        document.getElementsByClassName('dollar')[1].style.display = "block";
        document.getElementsByClassName('monthly_label')[1].style.display = "block";
        document.getElementsByClassName('monthly_money')[1].innerHTML = "4.79";
        document.getElementsByClassName('plan_title')[1].innerHTML = "PRO";
        document.getElementsByClassName('plan_title_strike')[1].style.display = "none";
        document.getElementById('buy_pro_lifetime').style.display = "none";
        document.getElementById('buy_pro').style.display = "block";
        // PRO PLAN
    }
});
// PLAN TOOGGLE





// PADDLE INLINE
// PADDLE BASIC MONTHLY
document.getElementById("buy_basic").addEventListener("click", function() {
    document.querySelector(".checkout-background").style.display = "block";
    document.querySelector(".checkout-container").style.display = "block";
    document.querySelector("#basic_plan").style.display = "block";
    document.querySelector("#basic_planp").style.display = "block";
    // document.querySelector('#plan_instruction_lifetime').style.display = "none";


    Paddle.Checkout.open({
        method: 'inline',

        // live 
        product: 782064,
        // live  

        allowQuantity: false,
        disableLogout: true,
        frameTarget: 'checkout-container',
        frameInitialHeight: 416,
        frameStyle: 'width: 60vw; position: relative; min-width:312px; background-color: #fff;',  

        // LIVE
        success: "https://flipclock.app/thanks.html#basic",

        // TESTING
        // success: "http://127.0.0.1:5501/thanks.html#basic",
    });
});

// PADDLE PRO MONTHLY
document.getElementById("buy_pro").addEventListener("click", function() {
    document.querySelector(".checkout-background").style.display = "block";
    document.querySelector(".checkout-container").style.display = "block";
    document.querySelector("#pro_plan").style.display = "block";
    document.querySelector("#pro_planp").style.display = "block";
    // document.querySelector('#plan_instruction_lifetime').style.display = "none";


    Paddle.Checkout.open({
        method: 'inline',

        // live 
        product: 783299,
        // live 

        allowQuantity: false,
        disableLogout: true,
        frameTarget: 'checkout-container',
        frameInitialHeight: 416,
        frameStyle: 'width: 60vw; position: relative; min-width:312px; background-color: #fff;',  

        // LIVE
        success: "https://flipclock.app/thanks.html#pro",

        // TESTING
        // success: "http://127.0.0.1:5501/thanks.html#pro",
    });
});




// PADDLE BASIC LIFETIME
document.getElementById("buy_basic_lifetime").addEventListener("click", function() {
    document.querySelector(".checkout-background").style.display = "block";
    document.querySelector(".checkout-container").style.display = "block";
    document.querySelector("#basic_plan").style.display = "block";
    document.querySelector("#basic_planp_lifetime").style.display = "block";
    document.querySelector('#plan_instruction').style.display = "none";
    // document.querySelector('#plan_instruction_lifetime').style.display = "block";


    Paddle.Checkout.open({
        method: 'inline',

        // live 
        product: 786350,
        // live  

        allowQuantity: false,
        disableLogout: true,
        frameTarget: 'checkout-container',
        frameInitialHeight: 416,
        frameStyle: 'width: 60vw; position: relative; min-width:312px; background-color: #fff;',  

        // LIVE
        success: "https://flipclock.app/thanks.html#basic_lifetime",

        // TESTING
        // success: "http://127.0.0.1:5501/thanks.html#basic_lifetime",
    });
});

// PADDLE PRO LIFETIME
document.getElementById("buy_pro_lifetime").addEventListener("click", function() {
    document.querySelector(".checkout-background").style.display = "block";
    document.querySelector(".checkout-container").style.display = "block";
    document.querySelector("#pro_plan").style.display = "block";
    document.querySelector("#pro_planp_lifetime").style.display = "block";
    document.querySelector('#plan_instruction').style.display = "none";
    // document.querySelector('#plan_instruction_lifetime').style.display = "block";


    Paddle.Checkout.open({
        method: 'inline',

        // live 
        product: 786351,
        // live 

        allowQuantity: false,
        disableLogout: true,
        frameTarget: 'checkout-container',
        frameInitialHeight: 416,
        frameStyle: 'width: 60vw; position: relative; min-width:312px; background-color: #fff;',  

        // LIVE
        success: "https://flipclock.app/thanks.html#pro_lifetime",

        // TESTING
        // success: "http://127.0.0.1:5501/thanks.html#pro_lifetime",
    });
});


// // PADDLE BUY BASIC OVERLAY
// function openBasicCheckout() {
//     Paddle.Checkout.open({ 
//         product: 782064,
//         allowQuantity: "false",
//         country: "US",

//         // CHANGED FOR TESTING ----------------------------
//         // success: "http://127.0.0.1:5501/thanks.html#basic",
//         // CHANGED FOR TESTING ----------------------------
        
//         // LIVE
//         success: "https://flipclock.app/thanks.html#basic",
//     });
// }
// document.getElementById('buy_basic').addEventListener('click', openBasicCheckout, false);


// // PADDLE BUY PRO OVERLAY
// function openProCheckout() {
//     Paddle.Checkout.open({ 
//         product: 31555,
//         allowQuantity: "false",
//         country: "US",

//         // CHANGED FOR TESTING ----------------------------
//         // success: "http://127.0.0.1:5501/thanks.html#pro",
//         // CHANGED FOR TESTING ----------------------------

//         // LIVE
//         success: "https://flipclock.app/thanks.html#pro",
//     });
    
// }
// document.getElementById('buy_pro').addEventListener('click', openProCheckout, false);