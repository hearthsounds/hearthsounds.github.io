import requests
import json
from bs4 import BeautifulSoup

def get_all_cards():
    cards_request = requests.get('http://hearthstone.services.zam.com/v1/card?page=1&pageSize=99999&type=MINION&collectible=true')
    card_data = cards_request.json()
    return card_data

def get_hearthpwn_sound(card):
  card_name_for_url = requests.utils.quote(card['name'])
  hearthpwn_search_url = 'http://www.hearthpwn.com/find?q=%s&limit=1' % (card_name_for_url,)
  search_response = requests.get(hearthpwn_search_url).json()
  if not search_response:
    return None
  hearthpwn_card_url = 'http://www.hearthpwn.com' + search_response[0]['Url']

  card_page = BeautifulSoup(requests.get(hearthpwn_card_url).text, 'html.parser')
  play_sound_element = card_page.find(id='soundPlay1')
  if not play_sound_element:
    return None
  sound = play_sound_element.get('src')
  if not sound:
    return None
  return sound.replace('http://media-Hearth.cursecdn.com/audio/card-sounds/sound/', '')

def extract_hearthsounds_data(card):
    sound = next((media['url'] for media in card['media'] if media['type'] == 'PLAY_SOUND'), '')
    img = next((media['url'] for media in card['media'] if media['type'] == 'CARD_IMAGE'), '')
    if not sound:
      print('No play sound found for card %s' % (card['name']))
      print('> Checking hearthpwn...')
      sound = get_hearthpwn_sound(card)
      if not sound:
        print('> It\'s not there either :(')
      else:
        print('> Found!')

    if not img:
      print('No card image found for card %s' % (card['name']))
    return {
      'name': card['name'],
      'sound': sound.replace('/hs/sounds/enus/', ''),
      'img': img
    }

with open('card-data.js', 'w') as f:
    card_data = map(extract_hearthsounds_data, get_all_cards())
    f.write('CARDS=' + json.dumps(card_data) + ';')