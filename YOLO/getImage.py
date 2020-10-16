#Getting images from the COCO dataset

from pycocotools.coco import COCO
import requests

# instantiate COCO specifying the annotations json path
coco = COCO('...path_to_annotations/instances_train2014.json')
# Specify a list of category names of interest
catIds = coco.getCatIds(catNms=['person', 'car'])
# Get the corresponding image ids and images using loadImgs
imgIds = coco.getImgIds(catIds=catIds)
images = coco.loadImgs(imgIds)

# Save the images into a local folder
for im in images:
    img_data = requests.get(im['coco_url']).content
    with open('...path_saved_ims/coco_person/' + im['file_name'], 'wb') as handler:
        handler.write(img_data)
        
#link: https://stackoverflow.com/questions/51100191/how-can-i-download-a-specific-part-of-coco-dataset