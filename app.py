import flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin

app = flask.Flask(__name__)

app.config["SECRET_KEY"] = "InfinityCorporation"
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://qftmofzjbfryth:cf04f93c34d0c36a68c991637ef24f0247bc3cb" \
                                        "92e5655d863421712b47cd0c3@ec2-54-195-246-55.eu-west-1.compute.amazonaws.com" \
                                        ":5432/d3hk4ichdip6ol"

db = SQLAlchemy(app)
CORS(app, support_credentials=True)


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    score = db.Column(db.Integer)
    category = db.Column(db.String)


@app.before_request
def ban():
    pass


@app.route("/saveScore", methods=["POST", "GET"])
@cross_origin(supports_credentials=True)
def saveScore():
    if flask.request.url_root != "https://www.socialsnake.ml" or flask.request.url_root != "http://www.socialsnake.ml":
        return flask.request.url_root
    all_people = []
    for i in Score.query.all():
        all_people.append(i.name)
    if flask.request.environ.get('HTTP_X_REAL_IP', flask.request.remote_addr) in all_people:
        return "You are a known cheater thus you are banned from playing the Social Snake " + \
               flask.request.environ.get('HTTP_X_REAL_IP', flask.request.remote_addr)

    if flask.request.method == "POST":
        values = flask.request.values
        if int(values["score"]) > 145:
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

    top_ten_scores = sorted(all_scores)[-10:]

    final_top_ten = []

    for i in top_ten_scores:
        final_top_ten.append(Score.query.filter_by(score=int(i))[-1])

    final_top_ten.reverse()
    final_dict_list = []

    for i in final_top_ten:
        final_dict_list.append({"name": i.name, "score": str(i.score), "category": i.category})
    return flask.render_template("main.html", final_top_ten=final_dict_list)


@app.route("/")
def index():
    return flask.render_template("index.html")


@app.route("/<filename>")
def appleReturn(filename):
    return flask.send_file("data/" + filename)

