import requests
import json
from bs4 import BeautifulSoup
import sys
import re
import os

SOUND_OVERRIDES = {
  'The Lich King': 'VO_ICC_239_Male_Human_Play_01.ogg',
  'Primalfin Totem': None
}

def get_all_cards():
  cards_request = requests.get('http://hearthstone.services.zam.com/v1/card?page=1&pageSize=99999&type=MINION&collectible=true')
  card_data = cards_request.json()
  return card_data

def get_hearthpwn_cards():
  HEARTHPWN_CARDS_URL = 'http://www.hearthpwn.com/cards?display=1&filter-premium=1&filter-type=4&page=%s'
  last_first_card = None
  page_num = 1
  card_data = {}
  print('Fetching hearthpwn cards list...')
  while True:
    page = BeautifulSoup(requests.get(HEARTHPWN_CARDS_URL % (page_num,)).text, 'html.parser')
    card_listings = page.find_all('td', 'col-name')
    first_card_name = card_listings[0].find('a').text

    if (first_card_name == last_first_card):
      break
    else:
      last_first_card = first_card_name

    print('Fetched page %s...' % (page_num,))

    for c in card_listings:
      card_data[c.find('a').text] = c.find('a')['href']

    page_num += 1

  return card_data

def get_hearthpwn_sound(path):
  hearthpwn_card_url = 'http://www.hearthpwn.com' + path

  card_page = BeautifulSoup(requests.get(hearthpwn_card_url).text, 'html.parser')
  play_sound_element = card_page.find(id='soundPlay1')
  if not play_sound_element:
    return None
  sound = play_sound_element.get('src')
  if not sound:
    return None
  return sound.replace('http://media-Hearth.cursecdn.com/audio/card-sounds/sound/', '')

def extract_hearthsounds_data(card):
  global hearthpwn_urls
  sound = None
  img = next((media['url'] for media in card['media'] if media['type'] == 'CARD_IMAGE'), '')

  if card['name'] in SOUND_OVERRIDES:
    print('> Using sound override for card %s' % (card['name']))
    sound = SOUND_OVERRIDES[card['name']]
    if not sound:
      return None

  if not sound:
    print('Fetching hearthpwn play sound found for %s' % (card['name']))
    if card['name'] in hearthpwn_urls:
      sound = get_hearthpwn_sound(hearthpwn_urls[card['name']])

  if not sound:
    print('> Not there, falling back to hearthhead...')
    sound = next((media['url'] for media in card['media'] if media['type'] == 'PLAY_SOUND'), '')

  if not sound:
    print('> It\'s not there either :( it will be excluded.')
    return None

  if not img:
    print('No card image found for card %s, it will be excluded.' % (card['name']))
    return None
  return {
    'name': card['name'],
    'sound': sound.replace('/hs/sounds/enus/', ''),
    'img': img,
    'format': card['format']
  }

if len(sys.argv) > 1:
  first_card_index = next(i for i,v in enumerate(all_cards) if v['name'] == sys.argv[1])
  all_cards = all_cards[first_card_index:]
  print('Starting from card index %s (%s)' % (first_card_index, sys.argv[1]))

all_cards = get_all_cards()
hearthpwn_urls = get_hearthpwn_cards()

for card in all_cards:
  if card['set'] == 'LOOTAPALOOZA':
    continue
  card_data = extract_hearthsounds_data(card)
  if card_data is None:
    continue
  with open('temp-card-data/' + re.sub(r'[^a-zA-Z0-9]', '', card['name']).lower() + '.json', 'w') as f:
    f.write(json.dumps(card_data))
