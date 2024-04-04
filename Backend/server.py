from flask import Flask, request, jsonify
import json
import mysql.connector
from game import Game
from flask_socketio import SocketIO, emit

app = Flask(__name__)

socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

sessions = {}
games = {}

@socketio.on('handleConnection')
def handleConnection(data):
    print("####################################")
    sid = request.sid
    print("sid ", data, sid)

    sessions[data] = sid

@socketio.on('handleInvite')
def handleInvite(data):
    print(f"O usuruario {data['user']} esta convidando o usuario {data['data']}")
    emit("handleInvite",data['user'],room = sessions.get(data['data']))

@socketio.on('handleRefuse')
def handleRefuse(data):
    print(f"O usuruario {data['user']} recusou o convite {data['data']}")
    emit("handleRefuse",data['user'],room = sessions.get(data['data']))

@socketio.on('cancelInvite')
def cancelInvite(data):
    print(f"O usuruario {data['user']} cancelou o convite feito a {data['data']}")
    emit("cancelInvite",data['user'],room = sessions.get(data['data']))

@socketio.on('acceptedInvite')
def acceptedInvite(data):
    print(f"O usuruario {data['user']} aceitou o convite de {data['data']}")
    emit("acceptedInvite",data['user'],room = sessions.get(data['data']))

@socketio.on('createGame')
def createGame(data):
    print("jogo criado", data)
    chave = (data['user'], data['friend'])
    games[chave] = Game(data['user'], data['friend'])

@socketio.on('action')
def action(data):
    print("data recebida", data)
    g = games[tuple(data['game'])]
    ret = g.take_action(data['user'], data['type'], data['word'])

    print("ret", ret)

    send = {'ret': ret, 'turns': g.players_turns}

    if ret != None:
        send = {'ret': ret, 'words': g.words}
        del games[tuple(data['game'])]

    emit("action",send,room = sessions.get(data['game'][0]))
    emit("action",send,room = sessions.get(data['game'][1]))

@socketio.on('getStatus')
def getStatus(data):
    g = games.get(tuple(data['game']))
    
    ret = None
    if g != None:
        ret = g.players_turns

    emit("responseStatus",ret,room = sessions.get(data['user']))


@app.route("/acceptPendingFriends", methods = ["POST"])
def acceptPendingFriend():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="cirilo",
        database="db_letreco"
    )

    mycursor = mydb.cursor()

    data = request.json

    query = "DELETE FROM Links WHERE id_user = %s AND id_friend = %s"
    mycursor.execute(query, (data['user'], data['friend']))
    mycursor.execute(query, (data['friend'], data['user']))
    mydb.commit()

    query = "INSERT INTO Links (id_user, id_friend, pending) VALUES (%s, %s, %s)"
    mycursor.execute(query, (data['user'], data['friend'], 0))
    mycursor.execute(query, (data['friend'], data['user'], 0))
    mydb.commit()

    mydb.disconnect()
    return jsonify(response = "OK")


@app.route("/getFriends", methods = ["POST"])
def getFriends():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="cirilo",
        database="db_letreco"
    )

    mycursor = mydb.cursor()

    data = request.json

    query = "SELECT * FROM Links WHERE pending = 0 AND id_user = %s"
    mycursor.execute(query, (data['user'],))
    sql_response = mycursor.fetchall()

    ret = []
    for i in sql_response:
        ret.append(i[1])

    print("ret", ret)

    mydb.disconnect()
    return jsonify(friends = ret) 


@app.route("/getPendingFriends", methods = ["POST"])
def getPendingFriends():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="cirilo",
        database="db_letreco"
    )

    mycursor = mydb.cursor()

    data = request.json

    query = "SELECT * FROM Links WHERE pending = 1 AND id_friend = %s"
    mycursor.execute(query, (data['user'],))
    sql_response = mycursor.fetchall()

    ret = []
    for i in sql_response:
        ret.append(i[0])

    mydb.disconnect()
    return jsonify(pendingFriends = ret)    

@app.route("/addFriend", methods = ["POST"])
def addFriend():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="cirilo",
        database="db_letreco"
    )

    mycursor = mydb.cursor()

    data = request.json

    query = "SELECT * FROM Links WHERE id_user = %s AND id_friend = %s AND id_user != id_friend"
    mycursor.execute(query,(data['id_user'], data['id_friend']))
    sql_response = mycursor.fetchall()

    if sql_response == []:
        query = "INSERT INTO Links (id_user, id_friend, pending) VALUES (%s, %s, %s)"
        mycursor.execute(query, (data['id_user'], data['id_friend'], 1))
        mydb.commit()

    mydb.disconnect()
    return jsonify(res = "OK")

@app.route("/login", methods = ["POST"])
def login():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="cirilo",
        database="db_letreco"
    )

    mycursor = mydb.cursor()
    data = str(request.json)

    query = "SELECT * FROM Users WHERE email = '" + data + "'"
    mycursor.execute(query)
    sql_response = mycursor.fetchall()
    
    if sql_response == []:
        query = "SELECT * FROM ids"
        mycursor.execute(query)
        sql_response = mycursor.fetchall()

        [(id,)] = sql_response
        
        query = "INSERT INTO Users (email, id) VALUES (%s, %s)"
        mycursor.execute(query, (data,id))
        mydb.commit()

        query = "UPDATE ids SET cnt = cnt + 1"
        mycursor.execute(query)
        mydb.commit()

    query = "SELECT id FROM Users WHERE email = '" + data + "'"
    mycursor.execute(query)
    sql_response = mycursor.fetchall()
    [(sql_response,)] = sql_response

    mydb.disconnect()
    return jsonify(id = sql_response)

if __name__ == "__main__":
    # app.run(debug=True)
    socketio.run(app, host="192.168.15.8", debug=True)

