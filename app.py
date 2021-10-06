import flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user
from collections import Counter

app = flask.Flask(__name__)

app.config["SECRET_KEY"] = "InfinityCorporation"
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://qftmofzjbfryth:cf04f93c34d0c36a68c991637ef24f0247bc3cb92e5655d" \
                                        "863421712b47cd0c3@ec2-54-195-246-55.eu-west-1.compute.amazonaws.com:5432/d3hk" \
                                        "4ichdip6ol"


db = SQLAlchemy(app)
CORS(app, support_credentials=True)

login_manager = LoginManager(app)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    urls = db.Column(db.String)
    apps = db.Column(db.String)


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    score = db.Column(db.Integer)
    category = db.Column(db.String)


@app.before_request
def ban():
    pass


@app.route("/saveScore", methods=["POST", "GET"])
def saveScore():
    all_people = []
    for i in Score.query.all():
        all_people.append(i.name)
    
    if flask.request.method == "POST":
        values = flask.request.values
        if int(values["score"]) > 150:
            db.session.add(Score(name=flask.request.environ.get('HTTP_X_REAL_IP', flask.request.remote_addr), score=1,
                                 category="cheat"))
            db.session.commit()
            return "Cheat"
        if values["category"] == "hard":
            new_score = Score(name=values["name"], score=int(values["score"]) * 3, category=values["category"])
        elif values["category"] == "extreme":
            new_score = Score(name=values["name"], score=int(values["score"]) * 5, category=values["category"])
        elif values["category"] == "no space - extreme":
            new_score = Score(name=values["name"], score=int(values["score"]) * 7, category=values["category"])
        else:
            new_score = Score(name=values["name"], score=int(values["score"]), category=values["category"])
        db.session.add(new_score)
        db.session.commit()
        return "Completed"


@app.route("/viewPlayers")
def viewPlayers():
    unique_players = []

    for i in Score.query.all():
        if i.name not in unique_players:
            unique_players.append(i.name)

    return flask.render_template("players.html", unique_players=unique_players)


@app.route("/viewScores", methods=["GET"])
def viewScores():
    all_scores = []
    all_objects = []
    all_names = []

    for i in Score.query.all():
        if i.name not in all_names:
            all_objects.append(i)
            all_names.append(i.name)
        else:
            for c in all_objects:
                if c.name == i.name and i.score > c.score:
                    all_objects.remove(c)
                    all_objects.append(i)

    for i in all_objects:
        all_scores.append(i.score)

    top_ten_scores = Score.query.order_by(Score.score).all()
    top_ten_scores.reverse()
    final_top_ten = top_ten_scores[:10]

    final_dict_list = []

    for i in final_top_ten:
        final_dict_list.append({"name": i.name, "score": str(i.score), "category": i.category})
    return flask.render_template("main.html", final_top_ten=final_dict_list)


@app.route("/", methods=["POST", "GET"])
def home():
    urls = []
    if current_user.is_authenticated:
        urls = current_user.urls.split("*-*")
    if flask.request.method == "POST":
        if current_user.is_authenticated:
            current_user.urls += flask.request.values["fav_url"] + "*-*"
            db.session.commit()
        else:
            all_users = []

            for i in User.query.all():
                all_users.append(i.username)

            if flask.request.values["username"] in all_users:
                user_query = User.query.filter_by(username=flask.request.values["username"]).first()
                if flask.request.values["password"] == user_query.password:
                    login_user(user_query, remember=True)
                    return flask.redirect("/")
            else:
                user = User(username=flask.request.values["username"],
                            password=flask.request.values["password"], apps="", urls="")
                db.session.add(user)
                db.session.commit()

                login_user(user)

                return flask.redirect("/")
    all_urls = []

    for i in User.query.all():
        all_urls.append(i.urls)

    counter = Counter(all_urls)

    final_url_list = []

    for i in counter.most_common(10):
        final_url_list.append(i[0].replace("*-*", "<br>"))

    return flask.render_template("home.html", logged_in=current_user.is_authenticated, urls=urls, url_list=final_url_list)


@app.route("/g=1")
def snake_index():
    return flask.render_template("index.html")


@app.route("/remove", methods=["POST", "GET"])
def remove():
    if flask.request.method == "POST":
        current_user.urls = current_user.urls.replace(flask.request.values["url"] + "*-*", "")
        print(flask.request.values["url"])
        db.session.commit()
        return "Complete"


@app.route("/<filename>")
def appleReturn(filename):
    return flask.send_file("data/" + filename)

