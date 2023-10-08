const lengthSlider = document.querySelector(".pass-length input"),
options = document.querySelectorAll(".option input"),
copyIcon = document.querySelector(".input-box span"),
passwordInput = document.querySelector(".input-box input"),
passIndicator = document.querySelector(".pass-indicator"),
generateBtn = document.querySelector(".generate-btn");
const characters = { 
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "^!$%&|[](){}:;.,*+-#@<>~"
}
const generatePassword = () => {
    let staticPassword = "",
    randomPassword = "",
    excludeDuplicate = false,
    passLength = lengthSlider.value;
    options.forEach(option => { 
        if(option.checked) { 
            if(option.id !== "exc-duplicate" && option.id !== "spaces") {
                staticPassword += characters[option.id];
            } // else if(option.id === "spaces") { 
            //     staticPassword += `  ${staticPassword}  `;
            //} 
            else { 
                excludeDuplicate = true;
            }
        }
    });
    for (let i = 0; i < passLength; i++) {
        let randomChar = staticPassword[Math.floor(Math.random() * staticPassword.length)];
        if(excludeDuplicate) { 
            !randomPassword.includes(randomChar) || randomChar == " " ? randomPassword += randomChar : i--;
        } else { 
            randomPassword += randomChar;
        }
    }
    passwordInput.value = randomPassword; 
}
const upadatePassIndicator = () => {
    passIndicator.id = lengthSlider.value <= 8 ? "weak" : lengthSlider.value <= 16 ? "medium" : "strong";
}
const updateSlider = () => {
    document.querySelector(".pass-length span").innerText = lengthSlider.value;
    generatePassword();
    upadatePassIndicator();
}
updateSlider();

const close = document.getElementById('close')

close.addEventListener('click', (e) => {
    e.preventDefault()
    document.querySelector('.modal-card').style.visibility = 'hidden'
})

const copyPassword = () => {

    navigator.clipboard.writeText(passwordInput.value); 
    
    copyIcon.innerText = "check";
    copyIcon.style.color = "#4285F4"
    setTimeout(() => { 
        copyIcon.innerText = "copy_all";
        copyIcon.style.color = "#707070";
        document.querySelector('.modal-card').style.visibility = 'visible'
    }, 1500);
}
copyIcon.addEventListener("click", copyPassword);
lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);


var db;
var request = indexedDB.open("password", 1);

request.onerror = function(event) {
    console.log("Erreur lors de l'ouverture de la base de données : " + event.target.errorCode);
};

request.onsuccess = function(event) {
    db = event.target.result; 
    console.log("Base de données ouverte avec succès");
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    var store = db.createObjectStore("utilisateurs", { keyPath: "id", autoIncrement: true });
    store.createIndex("nom", "nom", { unique: false });
    store.createIndex("motDePasse", "motDePasse", { unique: false });
    console.log("Base de données mise à jour avec succès");
};

function ajouterSite(nom, motDePasse) {
    var transaction = db.transaction(["utilisateurs"], "readwrite");
    var store = transaction.objectStore("utilisateurs");
    var utilisateur = {
        nom: nom,
        motDePasse: motDePasse
    };
    var request = store.add(utilisateur);
    request.onsuccess = function(event) {
        console.log("Utilisateur ajouté avec succès");
    };
    request.onerror = function(event) {
        console.log("Erreur lors de l'ajout de l'utilisateur : " + event.target.errorCode);
    };
}

save = document.getElementById('save')
sitename = document.getElementById('AppSaveName')
save.addEventListener('click', (e) => {
    e.preventDefault()
    document.querySelector('.modal-card').style.visibility = 'hidden' 
    ajouterSite(sitename.value,  passwordInput.value);
    sitename.value = ""
    document.querySelector('.placehold').innerHTML = ""
})

function obtenirTousLesSites(callback) {
    var transaction = db.transaction(["utilisateurs"], "readonly");
    var store = transaction.objectStore("utilisateurs");
    var request = store.openCursor();

    var nomsEtMotsDePasse = [];

    request.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var utilisateur = cursor.value;
            nomsEtMotsDePasse.push({ nom: utilisateur.nom, motDePasse: utilisateur.motDePasse });
            cursor.continue();
        } else {
            callback(nomsEtMotsDePasse);
        }
    };
}

allMDP = document.querySelector('.mesMots')
allMDP.addEventListener('click', (e) => {
    obtenirTousLesSites(function(sites) {
        const parent = document.querySelector('.placehold')
        parent.innerHTML = ""
        sites.forEach(site => {
            const content = `
            <div class="pass">
                <div>
                <p id="nameint">${site.nom}</p> 
                </div>
                <div>
                    <input id="tinput" type="text" 
                    id="generatePassword" style="padding-left: 5px" value=${new String(site.motDePasse)}/>
                </div>
            </div>`
            parent.innerHTML += content
        });
    });
})