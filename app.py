import flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin

app = flask.Flask(__name__)

app.config["SECRET_KEY"] = "InfinityCorporation"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"

db = SQLAlchemy(app)
CORS(app, support_credentials=True)


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    score = db.Column(db.Integer)
    category = db.Column(db.String)


@app.route("/saveScore", methods=["POST", "GET"])
@cross_origin(supports_credentials=True)
def saveScore():
    if flask.request.method == "POST":
        values = flask.request.values
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


@app.route("/viewScores", methods=["GET"])
def viewScores():
    all_scores = []

    unique_scores = []

    for i in Score.query.all():
        all_scores.append(i.score)

    top_ten_scores = sorted(all_scores)[-10:]

    final_top_ten = []

    for i in top_ten_scores:
        final_top_ten.append(Score.query.filter_by(score=int(i)).first())

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

