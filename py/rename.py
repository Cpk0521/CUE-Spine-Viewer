import os

folder = '../Assets/icons'

arr = os.listdir(folder)

for image in arr:
    new_name = image.split('_')[-1]
    os.rename(f'{folder}/{image}', f'{folder}/{new_name}')
    