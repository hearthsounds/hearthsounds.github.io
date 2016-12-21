import os
import json

cards = []
DIR = 'card-data'

for filename in os.listdir(DIR):
  with open(DIR+'/'+filename) as f:
    card = json.load(f)
    cards.append({'name': card['name'], 'sound': card['sounds'], 'img': card['img']})

with open('output.json', 'w') as f:
  json.dump(cards, f)