from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json

url = 'https://pro-api.coinmarketcap.com/v1/tools/price-conversion'
parameters = {
    'amount':'50',
    'symbol': 'EUR',
    'convert':'BTC'
}
headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY':'fa18b2e1-adbb-4d52-8173-db21b646d7f1',
}

session = Session()
session.headers.update(headers)

try:
    response = session.get(url, params=parameters)
    data = json.loads(response.text)['data']['quote']['BTC'] #se puede sacar el precio si entras en el json, poniendo despues de ['data']['quote']['BTC']
    print(data)
except (ConnectionError, Timeout, TooManyRedirects) as e:
    print(e)
