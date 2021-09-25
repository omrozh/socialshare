
var difficulty = 3;
var send_dif = 3;

var apple_index = 0;
var space_index = 0;

var current_direction = 4;

function setDif(index_dif, dif_button){
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

        document.getElementById("mainContainer").style.height = "500px";
        document.getElementById("mainContainer").style.width = "800px";
    }
}

function main(){
    getLeaderBoard()
    mobileUse()
    if(localStorage.getItem("lastDif")){
        difficulty = parseInt(localStorage.getItem("lastDif"));
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

        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/saveScore', true)
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var dict_levels = {
            1: "easy",
            3: "medium",
            4: "hard",
            5: "extreme",
            6: "no space - extreme"
            }
            if(space_index == 0 && send_dif == 5){
                send_dif = 6;
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

    }
    

    function input_direction(e) {
        if(e.code == "ArrowDown" && current_direction != 3){
            current_direction = 1;
        }
        else if(e.code == "ArrowRight" && current_direction != 2){
            current_direction = 0;
        }
        else if(e.code == "ArrowLeft" && current_direction != 0){
            current_direction = 2;
        }
        else if(e.code == "ArrowUp" && current_direction != 1){
            current_direction = 3;
        }
        else if(e.code == "KeyE"){
            apple_index += 1;
            if(apple_index > 50){
                point = 0;
            }
            spawn_food();
        }
        else if(e.code == "Enter"){
            window.location.reload()
        }
        else if(e.code == "Space"){
            if(current_direction != 4){
                space_index += 1;
                prev_direction = current_direction;
                current_direction = 4;
            }
            else if(current_direction == 5){
                alert("Zorluk Seç")
            }
            else{
                current_direction = prev_direction;
            }
        }
    }
    document.addEventListener('keydown', input_direction);

    function update_pos(player_index, x_pos, y_pos, player){
        if(current_direction == 0){
            player[player_index].style.left = x_pos - (5 * player_index) + "px";
            player[player_index].style.top = y_pos + "px";
        }
        else if(current_direction == 2){
            player[player_index].style.left = x_pos + (5 * player_index) + "px";
            player[player_index].style.top = y_pos + "px";
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
            x_pos += point / 10 + difficulty;
        }
        if(current_direction == 1){
            y_pos += point / 10 + difficulty;
        }
        if(current_direction == 2){
            x_pos -= point / 10 + difficulty;
        }
        if(current_direction == 3){
            y_pos -= point / 10 + difficulty;
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
