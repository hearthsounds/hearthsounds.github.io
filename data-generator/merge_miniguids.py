import json, random
import sys

"""
Latest all_cards.json and mini_guids.json can be found at 
https://github.com/rissole/daily-card-discussion-gen

They are named allcards.json and hh_ids.json respectively.

This file is needed because the Mashape Hearthstone card data API doesn't 
include the mini-GUID in their data sets, but to access card data from
Hearthhead we require it.
"""
with open('all_cards.json') as f:
    with open('mini_guids.json') as f2:
        all_cards = json.load(f)
        mini_guids = json.load(f2)
        all_cards_with_guids = {mini_guids[card['cardId']]: card for set in all_cards.values() for card in set if 'HERO' not in card['cardId']}
        with open('allcards_guids.json', 'w') as g:
            json.dump(all_cards_with_guids, g)