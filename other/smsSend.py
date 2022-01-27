import urllib.request
import urllib.parse
 
def sendSMS(apikey, numbers, sender, message):
    data =  urllib.parse.urlencode({
        'apikey': apikey,
        'numbers': numbers,
        'message' : message,
        'sender': sender
    })
    data = data.encode('utf-8')
    request = urllib.request.Request("https://api.textlocal.in/send/?")
    f = urllib.request.urlopen(request, data)
    fr = f.read()
    return(fr)
 
resp =  sendSMS('NjU2NDU2NGU0NDUxNjI3NDU2NTg0MjU4Njk0MTQyNDU=', '919035845781', 'Jims Autos', 'This is your message')
print (resp)