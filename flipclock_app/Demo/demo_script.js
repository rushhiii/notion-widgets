document.querySelector('#pro_subscription').style.display = "block";
document.querySelector('#upgrade').style.display = "none";

const menu = document.getElementById('menu_toggle');
const hiddenDiv = document.getElementsByClassName('menu2')[0];
const themesContainer = document.getElementsByClassName('themes_container')[0];
const subscriptionToggle1 = document.getElementsByClassName('subscription')[0];
const subscriptionToggle2 = document.getElementsByClassName('subscription')[1];
const fullSc = document.querySelector('.full');

// FULL SCREEN
fullSc.onclick = function DoFullscreen (event) {
    if (document.fullscreenElement) {
    document.exitFullscreen()
        .then(() => console.log("Document Exited from Full screen mode"))
        .catch((err) => console.error(err))
    } else {
    document.documentElement.requestFullscreen();
    }
}

// DIFF MENU FOR MOBILE AND DESKTOP
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    menu.onclick = function ToggleThing (event) {
        if (hiddenDiv.style.display == 'none') {
            hiddenDiv.style.display = 'flex'
            document.querySelector('.tutorial_hand').style.display = "none";
            document.querySelector('.tutorial_hand2').style.display = "block";
        } else {
            hiddenDiv.style.display = 'none'
            document.querySelector('.tutorial_hand2').style.display = "none";
        }
    }
    
    subscriptionToggle1.onclick = function ToggleThing (event) {
        if (themesContainer.style.display == 'none') {
            themesContainer.style.display = 'flex'
        } else {
            themesContainer.style.display = 'none'
        }
    }
    
    subscriptionToggle2.onclick = function ToggleThing (event) {
        if (themesContainer.style.display == 'none') {
            themesContainer.style.display = 'flex'
        } else {
            themesContainer.style.display = 'none'
        }
    }
}
else{    
    // Show hidden DIV on hover
    menu.addEventListener('mouseover', function handleMouseOver() {
        hiddenDiv.style.display = 'flex';
        document.querySelector('.tutorial_hand').style.display = "none";
        document.querySelector('.tutorial_hand2').style.display = "block";
    });
    hiddenDiv.addEventListener('mouseover', function handleMouseOver() {
        hiddenDiv.style.display = 'flex';
    });
    themesContainer.addEventListener('mouseout', function handleMouseOut() {
        themesContainer.style.display = 'none';
        hiddenDiv.style.display = 'none';
    });
    hiddenDiv.addEventListener('mouseout', function handleMouseOut() {
        hiddenDiv.style.display = 'none';
        document.querySelector('.tutorial_hand2').style.display = "none";
    })
    subscriptionToggle1.addEventListener('mouseover', function handleMouseOver() {
        themesContainer.style.display = 'flex';
    });
    subscriptionToggle2.addEventListener('mouseover', function handleMouseOver() {
        themesContainer.style.display = 'flex';
    });
    themesContainer.addEventListener('mouseover', function handleMouseOver() {
        themesContainer.style.display = 'flex';
    });
}

// LIGHT MODE / DARK MODE / THEMES
// remove localStorage THEME on reload
window.onbeforeunload = function() {
    localStorage.removeItem('current_theme');
}

const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }    

    // THEME 1
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme1") {
        document.body.style.setProperty('--background', '#0F140F');
        document.body.style.setProperty('--holder', '#1A1F1A');
        document.body.style.setProperty('--text', '#C4EBC1');
    } 
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme1') {
        document.body.style.setProperty('--background', '#E8FFE8');
        document.body.style.setProperty('--holder', '#D6F5D6');
        document.body.style.setProperty('--text', '#546654');
    }

    // THEME 2
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme2") {
        document.body.style.setProperty('--background', '#131315');
        document.body.style.setProperty('--holder', '#1B1C20');
        document.body.style.setProperty('--text', '#C5C8F8');
    }
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme2') {
        document.body.style.setProperty('--background', '#EFF2FF');
        document.body.style.setProperty('--holder', '#E4E7FE');
        document.body.style.setProperty('--text', '#222843');
    }

    // THEME 3
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme3") {
        document.body.style.setProperty('--background', '#1B1616');
        document.body.style.setProperty('--holder', '#271E1E');
        document.body.style.setProperty('--text', '#EF6666');
    }
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme3') {
        document.body.style.setProperty('--background', '#FFF4F4');
        document.body.style.setProperty('--holder', '#FFEDED');
        document.body.style.setProperty('--text', '#FF8F8F');
    }

    // THEME 4
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme4") {
        document.body.style.setProperty('--background', '#16120B');
        document.body.style.setProperty('--holder', '#221E17');
        document.body.style.setProperty('--text', '#FFAC45');
    }
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme4') {
        document.body.style.setProperty('--background', '#FFF7EC');
        document.body.style.setProperty('--holder', '#FFEED6');
        document.body.style.setProperty('--text', '#FDC97B');
    }

    // THEME 5
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme5") {
        document.body.style.setProperty('--background', '#131519');
        document.body.style.setProperty('--holder', '#1A1E23');
        document.body.style.setProperty('--text', '#CCE1FF');
    }
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme5') {
        document.body.style.setProperty('--background', '#F5F9FF');
        document.body.style.setProperty('--holder', '#E4EFFF');
        document.body.style.setProperty('--text', '#2C3440');
    }

    // THEME 6
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme6") {
        document.body.style.setProperty('--background', '#0D0F11');
        document.body.style.setProperty('--holder', '#14161A');
        document.body.style.setProperty('--text', '#FFD458');
    }
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme6') {
        document.body.style.setProperty('--background', '#FFFDF4');
        document.body.style.setProperty('--holder', '#FFF8E1');
        document.body.style.setProperty('--text', '#FFDB57');
    }

    // THEME 7
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme7") {
        document.body.style.setProperty('--background', '#1A171C');
        document.body.style.setProperty('--holder', '#221D23');
        document.body.style.setProperty('--text', '#E3CEEC');
    }
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme7') {
        document.body.style.setProperty('--background', '#FCF5FF');
        document.body.style.setProperty('--holder', '#F8E8FF');
        document.body.style.setProperty('--text', '#574260');
    }

    // THEME 8
    if (document.documentElement.getAttribute('data-theme') == 'dark' && localStorage.getItem("current_theme") == "theme8") {
        document.body.style.setProperty('--background', '#181B19');
        document.body.style.setProperty('--holder', '#1E2320');
        document.body.style.setProperty('--text', '#BEEBD2');
    }
    if (document.documentElement.getAttribute('data-theme') == 'light' && localStorage.getItem('current_theme') == 'theme8') {
        document.body.style.setProperty('--background', '#F5FFFA');
        document.body.style.setProperty('--holder', '#E6F8EE');
        document.body.style.setProperty('--text', '#5F8873');
    }
}
toggleSwitch.addEventListener('change', switchTheme, false);


// THEME 1
document.querySelector(".theme1").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme1");
    document.body.style.setProperty('--background', '#0F140F');
    document.body.style.setProperty('--holder', '#1A1F1A');
    document.body.style.setProperty('--text', '#C4EBC1');
});

// THEME 2
document.querySelector(".theme2").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme2");
    document.body.style.setProperty('--background', '#131315');
    document.body.style.setProperty('--holder', '#1B1C20');
    document.body.style.setProperty('--text', '#C5C8F8');
});

// THEME 3
document.querySelector(".theme3").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme3");
    document.body.style.setProperty('--background', '#1B1616');
    document.body.style.setProperty('--holder', '#271E1E');
    document.body.style.setProperty('--text', '#EF6666');
});

// THEME 4
document.querySelector(".theme4").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme4");
    document.body.style.setProperty('--background', '#16120B');
    document.body.style.setProperty('--holder', '#221E17');
    document.body.style.setProperty('--text', '#FFAC45');
});

// THEME 5
document.querySelector(".theme5").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme5");
    document.body.style.setProperty('--background', '#131519');
    document.body.style.setProperty('--holder', '#1A1E23');
    document.body.style.setProperty('--text', '#CCE1FF');
});

// THEME 6
document.querySelector(".theme6").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme6");
    document.body.style.setProperty('--background', '#0D0F11');
    document.body.style.setProperty('--holder', '#14161A');
    document.body.style.setProperty('--text', '#FFD458');
});

// THEME 7
document.querySelector(".theme7").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme7");
    document.body.style.setProperty('--background', '#1A171C');
    document.body.style.setProperty('--holder', '#221D23');
    document.body.style.setProperty('--text', '#E3CEEC');
});

// THEME 8
document.querySelector(".theme8").addEventListener("click", function() {
    localStorage.setItem("current_theme", "theme8");
    document.body.style.setProperty('--background', '#181B19');
    document.body.style.setProperty('--holder', '#1E2320');
    document.body.style.setProperty('--text', '#BEEBD2');
});