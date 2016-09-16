import requests
import json
from bs4 import BeautifulSoup


def load_card_sounds(card_guid):
    t = requests.get('http://www.hearthhead.com/card=' + card_guid)
    t = t.text
    soup = BeautifulSoup(t, 'html.parser')
    sounds = soup.find(id="sounds")
    if sounds:
        sound_src = sounds.find_all('source')
        sound_url = sound_src[0].get('src')
        return sound_url
    return None

with open('data.json') as f:
    data = json.load(f)
    count = 0
    for card_guid in data:
        count += 1
        if data[card_guid]['cardId'].startswith('KAR') or data[card_guid]['type'] != 'Minion':
            continue
        sound_url = load_card_sounds(card_guid)
        if sound_url:
            data[card_guid]['sounds'] = sound_url
            with open('card-data/data_' + card_guid + '.json', 'w') as g:
                json.dump(data[card_guid], g)
            print('[%s/%s] %s downloaded successfully' % (count, len(data.keys()), data[card_guid]['name']))
        else:
            print('This card had no sound ' + data[card_guid]['name'])

        





