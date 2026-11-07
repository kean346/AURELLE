from pathlib import Path
from PIL import Image

for i in range(6):
    path = Path(f'public/media/raw-product-{i}.png')
    image = Image.open(path)
    bounds = image.getbbox()
    if bounds is None:
        raise RuntimeError(f'Product {i} did not render; refusing to overwrite the asset')
    image.crop(bounds).save(f'public/media/product-{i}.png')
    path.unlink()
