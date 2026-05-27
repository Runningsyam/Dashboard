import os
from PIL import Image

def make_background_transparent(img_path, out_path, tolerance=30):
    if not os.path.exists(img_path):
        print(f"File {img_path} not found.")
        return
    
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    width, height = img.size
    
    # Create a mask for pixels to turn transparent
    # We will do a flood fill from the corners to avoid touching the car in the middle
    visited = set()
    to_visit = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    
    # Add borders to seed list
    for x in range(width):
        to_visit.append((x, 0))
        to_visit.append((x, height - 1))
    for y in range(height):
        to_visit.append((0, y))
        to_visit.append((width - 1, y))
        
    pixels = img.load()
    
    # We define background color as the corner color (usually white/light gray)
    bg_color = pixels[0, 0]
    
    def color_dist(c1, c2):
        return ((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2 + (c1[2] - c2[2])**2)**0.5

    transparent_mask = Image.new("L", (width, height), 255)
    mask_pixels = transparent_mask.load()
    
    queue = list(set(to_visit))
    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        curr_color = pixels[x, y]
        # If color is close to background color or is very light (high RGB)
        if color_dist(curr_color, bg_color) < tolerance or (curr_color[0] > 230 and curr_color[1] > 230 and curr_color[2] > 230):
            mask_pixels[x, y] = 0
            
            # Check neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    queue.append((nx, ny))
                    
    # Apply mask
    new_data = []
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            m = mask_pixels[x, y]
            if m == 0:
                new_data.append((r, g, b, 0)) # transparent
            else:
                new_data.append((r, g, b, a))
                
    img.putdata(new_data)
    img.save(out_path, "PNG")
    print(f"Saved transparent image to {out_path}")

if __name__ == "__main__":
    # Make background transparent for settings-car.png
    make_background_transparent("settings-car.png", "settings-car_transparent.png", tolerance=40)
    # Make background transparent for car top corner view.png
    make_background_transparent("car top corner view.png", "car_top_corner_view_transparent.png", tolerance=35)
