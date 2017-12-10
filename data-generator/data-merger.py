# Merges json data in temp-card-data parts into card-data.js

import os
import json

FOLDER_NAME = 'temp-card-data'
all_cards = []

for filename in os.listdir(FOLDER_NAME):
  # if this is a .part file, ignore it
  if len(filename.split('.')) > 2:
    continue

  # find this card's .part files, and merge their data
  card_name = filename.split('.')[0]
  files_for_card = [name for name in os.listdir(FOLDER_NAME) if name.startswith(card_name + '.')]
  merged = {}
  for filename in files_for_card:
    merged.update(json.loads(open(FOLDER_NAME + '/' + filename).read()))

  all_cards.append(merged)

with open('card-data.js', 'w') as f:
  f.write('CARDS=' + json.dumps(all_cards) + ';');