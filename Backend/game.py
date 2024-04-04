from openai import OpenAI
import random

class Game():
    def __init__(self, player_1, player_2):

        self.players = {0: player_1, 1: player_2}
        self.players_turns = {
            player_1: {"actions": []}, 
            player_2: {"actions": []}, 
        }
        self.turn = random.choice([0,1])
        self.words = self.__get_words()
        self.round = 0
        self.winner = None

        print(f"Palavras escolhidas: {self.words[0]}, {self.words[1]}.")
    
    def __get_words(self):
        message = None

        with open('treated_words.txt', 'r') as f:
            read = f.readlines()

        cnt = 0
        while True:
            r1 = random.randint(0,len(read) - 1)
            r2 = random.randint(0,len(read) - 1)

            message = [read[r1][:-1], read[r2][:-1]]

            cnt += 1
            completion = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Forneça a resposta apenas com a letra S para sim ou a letra N para Não"},
                    {"role": "user", "content": f"as palavras {message[0]} e {message[1]} existem na lingua portuguesa?"}
                ]
            )

            gptr = completion.choices[0].message.content

            print(f"As palavras {message[0]} e {message[1]} existem?: {gptr}")

            if gptr == 'N':
                if cnt == 5:
                    break

                continue 

            for idx, w in enumerate(message):
                message[idx] = w.upper()
            
            break
        
        print("cnt", cnt)

        return message
    
    def take_action(self, player, type, word):
        print(f"Vez do player: {self.players[self.turn]}")

        if self.players[self.turn] != player:
             print("Não é o seu turno!")
             return None
        
        ret = None
        if type == "my_word":
            ret = self.__try_my_word(word)
        else:
            ret = self.__try_other_word(word)

        self.round += 1

        if self.round == 12:
            return self.__end_game()
        
        self.turn += 1
        self.turn %= 2

        return ret
    
    def __check_word(self, attempt, word):
        a = list(attempt)
        b = list(word)

        ret = {}

        for idx, s in enumerate(a):
            if s == b[idx]:
                ret[idx] = [s, "correct"]
            elif s in b:
                ret[idx] = [s, "partial"]
            else:
                ret[idx] = [s, "wrong"]

        flag = True
        for k, v in ret.items():
            if v[1] != "correct":
                flag = False
                break

        print(f"Checando: {attempt} com {word}")

        return {"action": ret, "winner": flag}

    def __try_my_word(self, word):
        action = self.__check_word(word, self.words[self.turn])
        self.players_turns[self.players[self.turn]]["actions"].append(action["action"])

        if action["winner"] == True:
            self.winner = self.turn
            return self.__end_game()
        
        return None

    def __try_other_word(self, word):
        res = True
        action = self.__check_word(word, self.words[(self.turn + 1) % 2])

        if action["winner"] == True:
            self.winner = self.turn
            return self.__end_game()
        else:
            self.winner = (self.turn + 1) % 2
            return self.__end_game()
    
    def __end_game(self):
        if self.winner != None:
            return {"result": self.players[self.winner]}
        return {"result": None}

# p1 = 1 
# p2 = 2

# g = Game(p1,p2)

# cnt = 0
# while True:
#     print("Escolha a palavra:")
#     word = str(input())
#     print("Escolha o tipo da ação:")
#     tipo = str(input())

#     p = None
#     if cnt == 0:
#         p = p1
#     else:
#         p = p2

#     result = g.take_action(p,tipo,word)

#     print(f"resultado: {result}")
#     print(f"actions:{g.players_turns}")

#     if result != None:
#         print(f"Ganhador {result['result']}")
#         break

#     cnt += 1
#     cnt %= 2

