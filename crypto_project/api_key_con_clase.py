from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json
from config import API_KEY
from crypto_project import app

class CMC():
    def __init__(self, token):
        self.apiurl = 'https://pro-api.coinmarketcap.com'
        headers = {'Accepts': 'application/json', 'X-CMC_PRO_API_KEY': app.config.get('API_KEY')}

        self.session = Session()
        self.session.headers.update(headers)
        
    def priceConversion(self, amount, symbol, convert):
        url = self.apiurl + '/v1/tools/price-conversion'
        parameters = {
            'amount': amount,
            'symbol': symbol,
            'convert': convert
            }

        try:
            response = self.session.get(url, params=parameters)
            data = json.loads(response.text)['data'] #se puede sacar el precio si entras en el json, poniendo despues de ['data']['quote']['BTC']
            print(data)
        except (ConnectionError, Timeout, TooManyRedirects) as e:
            print(e)
        
        return data
        
    def eurosConversion(self, amount, symbol):
        url = self.apiurl + '/v1/tools/price-conversion'
        parameters = {
            'amount': amount,
            'symbol': symbol,
            'convert': "EUR"
            }

        try:
            response = self.session.get(url, params=parameters)
            data = json.loads(response.text)['data']['quote']['EUR']['price'] #me da el valor de EUR directamente. 

        except (ConnectionError, Timeout, TooManyRedirects) as e:
            print(e)
        
        return data


cmc = CMC(app.config.get('API_KEY'))




