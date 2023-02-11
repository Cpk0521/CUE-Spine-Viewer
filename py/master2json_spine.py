import json
import os

class Costume:

    def __init__(self, no, heroineId, costumeId, costumeName):
        self.no = no
        self.heroineId = heroineId
        self.costumeId = costumeId
        self.costumeName = costumeName
    
    def outtext(self):
        return "%s, %s, %s, %s" % (self.no, self.heroineId, self.costumeId, self.costumeName)

    def outtext2(self):
        return "%02d_%03d, %s" % (self.heroineId, self.costumeId, self.costumeName)

# ----------------

CharactorManager = []
with open('CharactorList.json', 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)
    CharactorManager = data['Charactor']

# ----------------

costlist = []
with open('HeroineCostumeMaster.json', 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)
    for c in data['<ModelList>k__BackingField']:
        costlist.append(Costume(c['id'], c['heroineId'], c['costumeId'], c['costumeName']))

costlist.sort(key = lambda x:(x.heroineId, x.costumeId), reverse = False)

# ----------------

# chars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 15, 16, 101, 102, 103]

jsondata = {'Master':[]}


for char in CharactorManager:
    charname = char['Name']
    jsontitle = '%03d' % (char['id'])

    l2d = {'id': char['id'], 'name':char['Name'], 'Spine':[]}

    for model in range(1,20):
        # filepath = 'live2d/%03d/%03d_%03d/%03d.model3.json' % (char['id'], char['id'], model, char['id'])
        filepath = 'spine/common/%03d/common_%03d_%03d/root.json' % (char['id'], char['id'], model)
        iconspath = 'icons/%02d%03d.png' % (char['id'], model)
        if os.path.exists(f'../Assets/{filepath}'):
            
            c = list(filter(lambda x: (x.heroineId == char['id'] and x.costumeId == model), costlist))
            if c:
                c_name = c[0].costumeName 
            else:
                c_name = "不明"

            if not os.path.exists(f'../Assets/{iconspath}'):
                iconspath = ''
                
            # append_data = { 'costumeId':model, 'costumeName': c_name , 'path': filepath, 'icons' : iconspath}
            l2d['Spine'].append({ 'costumeId':model, 'costumeName': c_name , 'path': filepath, 'icons' : iconspath})

    jsondata['Master'].append(l2d)            

with open('./spineMaster.json', 'w', encoding='utf-8') as outfile:
    json.dump(jsondata, outfile, indent=4, ensure_ascii=False)
