from os import listdir
from os import remove
from os.path import isfile, join

onlyfiles = [f for f in listdir("coco_person2") if isfile(join("coco_person2", f))]

ind = 0
while ind < len(onlyfiles) - 1:
    name1 = onlyfiles[ind].split('.')[0]
    name2 = onlyfiles[ind + 1].split('.')[0]
    if name1 == name2:
        ind += 2
        continue
    remove("coco_person2/" + onlyfiles[ind])
    print("Removed ", onlyfiles[ind])
    ind += 1
