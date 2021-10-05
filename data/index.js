
var difficulty = 6;
var send_dif = 6;

var party = false;

var apple_index = 0;
var space_index = 0;

var current_direction = 4;

var commands = ["Yanındakine yiyecek bir şey ısmarla", "Sevdiğin kişiye mesaj at", "Yanındaki ile birlikte tiktok çek",
"5 squat yap", "Telefonundaki en garip fotoyu göster", "Rehberindeki bir kişiye patlıcan emojisi gönder",
"Ellerini kullanmadan muz ye", "Yanındakine 'dirty' bir şey söyle", "Aklına gelen ilk kelimeyi bağır",
"Sınıfta göbek at", "Bu hafta en sevindiğin anını anlat", "En sevdiğin şarkıyı seslendir", "Bir sihir numarası yap",
"Bize bir sırrını anlat", "5 şınav çek", "Burada bulunan biri ile hafta içi bir yere git",
"Ailenden sakladığın bir sırrını söyle", "Hayatında hiç fal baktırdın mı? Evetse ne olduğunu söyle",
"Yanındaki ne yapacağını söyleyecek", "Bize bir sıçış hikayeni anlat", "Bir fantezini söyle",
"Bugüne kadar kaç sevgilin oldu?", "Yanındakini gıdıkla", "Arama geçmişini göster",
 "En son internetten kimi stalkladın?", "Biri ile konuşmak istemediğinde en sık kullandığın bahane nedir?",
 "Bugün doğum günü olmayan bir arkadaşına doğum günün kutlu olsun mesajı at.", "Aklında gelen ilk kişinin adını söyle",
 "Rastgele etraftan birine hiç komik olmayan bir espri yap", "Pizzacıyı arayıp hamburger siparişi ver"]

function setDif(index_dif, dif_button){
    if(index_dif > difficulty){
        return "Unauthorized"
    }
    for(i = 0; i < document.getElementsByClassName("mainFormBig").length; i++){
        document.getElementsByClassName("mainFormBig")[i].style.backgroundColor = "white";
        document.getElementsByClassName("mainFormBig")[i].style.color = "gray";
    }

    difficulty = index_dif;
    localStorage.setItem("lastDif", index_dif)
    dif_button.style.backgroundColor = "#4CAF50";
    if(send_dif == 3){
        send_dif = difficulty;
    }
    dif_button.style.color = "white";
}

function setParty(dif_button){
    party = true;
    difficulty = 3;

    for(i = 0; i < document.getElementsByClassName("mainFormBig").length; i++){
        document.getElementsByClassName("button-17")[i].style.backgroundColor = "white";
        document.getElementsByClassName("button-17")[i].style.color = "gray";
    }
    dif_button.style.backgroundColor = "#4CAF50";
    dif_button.style.color = "white";
}

function setName(){
    if(localStorage.getItem("playerName")){
        document.getElementById("Name").value = localStorage.getItem("playerName");
    }
}
function setNameNew(){
    localStorage.setItem("playerName", document.getElementById("Name").value)
}

function getLeaderBoard(){
    setName()
    fetch('/viewScores').then(function (response) {
        return response.text();
    }).then(function (html) {
        document.getElementsByClassName("textBoxLead")[0].innerHTML += html;
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
}

function mobileUse(){
    if(window.innerWidth < 1400){
        document.getElementsByClassName("player")[0].style.left = "10%";
        document.getElementsByClassName("player")[0].style.top = "10%";

        document.getElementsByClassName("leaderboard")[0].hidden = true;

        document.getElementById("mainContainer").style.height = "450px";
        document.getElementById("mainContainer").style.top = "50px";
        document.getElementById("mainContainer").style.width = "800px";

        document.getElementById("Name").value = "Mobile User Guest";

    }
}

function main(){
    getLeaderBoard()
    mobileUse()
    var modal = document.getElementById("myModal");

    var btn = document.getElementById("myBtn");


    btn.onclick = function() {
      modal.innerHTML = '<div class="modal-content"> <span class="close" style="opacity: 0">&times;</span> <iframe src="https://sosyalke.herokuapp.com/mainPage/no_cat/social_snake" style="width: 100%; height: 100%;" frameborder="0"></iframe> </div>'
      modal.style.display = "block";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    if(localStorage.getItem("lastDif")){
        difficulty = 6;
    }
    var player = document.getElementsByClassName("player");
    var x_pos = 288;
    var y_pos = 195;
    var prev_direction = 0;
    var food = document.getElementById("food");
    var point = 1;
    var end_game = false;

    var container = document.getElementById("mainContainer")
    var containerHeight = parseInt(container.style.height.replace("px", ""));
    var containerWidth = parseInt(container.style.width.replace("px", ""));

    spawn_food();
    function game_over(){
        end_game = true;

        if(party && point < 30){
            var rand = Date.now() % (commands.length)

            alert(commands[rand])
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/saveScore', true)
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var dict_levels = {
            1: "easy",
            3: "medium",
            4: "hard",
            6: "extreme",
            7: "no space - extreme"
            }
            if(space_index == 0 && send_dif == difficulty){
                send_dif = 7;
            }
            xhr.send("name=" + document.getElementById("Name").value + "&score=" + point + "&category=" + dict_levels[send_dif])

        document.getElementById("game_over_text").style.visibility = "visible";
        return;
    }
    function spawn_new(){
        player[player.length - 1].insertAdjacentHTML("afterend", "<div class='player'></div>");
        player = document.getElementsByClassName("player");
    }
    function check_collision(x_pos, y_pos){
        if(x_pos + 50 > containerWidth){
            game_over()
        }
        if(x_pos < 0){
            game_over()
        }
        if(y_pos < 0){
            game_over()
        }
        if(y_pos + 50 > containerHeight){
            game_over()
        }
        var x_food_pos = parseInt(food.style.left.replace("px", ""));
        var y_food_pos = parseInt(food.style.top.replace("px", ""));

        if(x_pos + 50 > x_food_pos && x_pos < x_food_pos + 50 && y_pos + 50 > y_food_pos && y_pos < y_food_pos + 50){
            point += 1;
            spawn_new();
            spawn_food()
        }
    }

    function spawn_food(){
        x_cor = Math.floor(Math.random() *  containerWidth - 50) - 100;
        y_cor = Math.floor(Math.random() *  containerHeight - 50) - 100;

        food.style.left = x_cor + 100 + "px";
        food.style.top = y_cor + 100 + "px";

        var fruit_index = Math.random();
        if (fruit_index < 0.5)
          fruit_index = 0
        else
          fruit_index= 1
        food.src = "fruit" + fruit_index + ".png"

    }

    document.getElementById("food").addEventListener("touchstart", function(){
        spawn_food()
        current_direction = 4;
    })
    

    function input_direction(e) {
        if(e.code == "ArrowDown" && current_direction != 3){
            current_direction = 1;
            apple_index = 0;
        }
        else if(e.code == "ArrowRight" && current_direction != 2){
            current_direction = 0;
            apple_index = 0;
        }
        else if(e.code == "ArrowLeft" && current_direction != 0){
            current_direction = 2;
            apple_index = 0;
        }
        else if(e.code == "ArrowUp" && current_direction != 1){
            current_direction = 3;
            apple_index = 0;
        }
        else if(e.code == "KeyE"){
            apple_index += 1;
            if(apple_index > 10){
                point = 0;
            }
            spawn_food();
        }
        else if(e.code == "Enter"){
            window.location.reload()
        }
        else if(e.code == "Space"){
        space_index += 1;
            if(current_direction != 4){
                prev_direction = current_direction;
                current_direction = 4;
            }
            else{
                current_direction = prev_direction;
            }
        }
    }
    document.addEventListener('keydown', input_direction);

    document.addEventListener('touchstart', function(e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;

      if(clientX < 200){
            return;
      }
      var boundaryIndex = 5;
      if(clientX > window.innerWidth / 2 && clientY > window.innerHeight / 2 - (window.innerHeight / boundaryIndex) && clientY < window.innerHeight / 2 + (window.innerHeight / boundaryIndex)){
            current_direction = 0;
      }
      else if(clientX < window.innerWidth / 2 && clientY > window.innerHeight / 2 - (window.innerHeight / boundaryIndex) && clientY < window.innerHeight / 2 + (window.innerHeight / boundaryIndex)){
            current_direction = 2;
      }else if(clientY < window.innerHeight / 2){
            current_direction = 3;
      }else if(clientY > window.innerHeight / 2){
            current_direction = 1;
      }
    }, false);

    function update_pos(player_index, x_pos, y_pos, player){
        if(current_direction == 0){
            player[player_index].style.left = x_pos + (2.5 * player_index) + "px";
            player[player_index].style.top = y_pos + "px";
        }
        else if(current_direction == 2){
            player[player_index].style.left = x_pos - (2.5 * player_index) + "px";
            player[player_index].style.top = y_pos + "px";
        }
        else if(current_direction == 3){
            player[player_index].style.left = x_pos + "px";
            player[player_index].style.top = y_pos - (2.5 * player_index) + "px";
        }
        else if(current_direction == 1){
            player[player_index].style.left = x_pos + "px";
            player[player_index].style.top = y_pos + (2.5 * player_index) + "px";
        }
        else{
            player[player_index].style.left = x_pos + "px";
            player[player_index].style.top = y_pos + (5 * player_index) + "px";
        }

    }

    function move(){
        if(end_game){
            return;
        }

        player = document.getElementsByClassName("player");
        
        document.getElementById("point_counter").innerHTML = "Point: " + point
        if(current_direction == 0){
            x_pos += point / 7 + difficulty;
        }
        if(current_direction == 1){
            y_pos += point / 7 + difficulty;
        }
        if(current_direction == 2){
            x_pos -= point / 7 + difficulty;
        }
        if(current_direction == 3){
            y_pos -= point / 7 + difficulty;
        }

        for(i = 0; i < player.length; i++){
            update_pos(i, x_pos, y_pos, player);
        }

        check_collision(x_pos, y_pos)
        setTimeout(move, 1);
    }
    setTimeout(move, 20);
}

window.addEventListener('DOMContentLoaded', (event) => {
    main();
});

window.addEventListener("load",function() {
    setTimeout(function(){
        // This hides the address bar:
        window.scrollTo(0, 1);
    }, 0);
});
