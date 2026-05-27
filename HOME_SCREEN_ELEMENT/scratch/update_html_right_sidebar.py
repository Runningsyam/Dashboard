import re

def move_sidebar_right():
    file_path = "index.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the nav block
    nav_pattern = r'(<!-- LEFT SIDEBAR NAVIGATION: Scrollable Tab List -->\s*<nav class="settings-sidebar scrollable-tabs" id="settings-sidebar">.*?</nav>)'
    match = re.search(nav_pattern, content, flags=re.DOTALL)
    if not match:
        print("Sidebar navigation block not found!")
        return
    
    nav_block = match.group(1)
    # Change the comment in the nav block
    new_nav_block = nav_block.replace("<!-- LEFT SIDEBAR NAVIGATION:", "<!-- RIGHT SIDEBAR NAVIGATION:")

    # Remove it from the current position
    content = content.replace(nav_block, "")

    # Now, find the end of the settings-modal container.
    # The settings modal structure ends with:
    #         </div> <!-- end of Tab 9: My Vehicle -->
    #       </div> <!-- end of settings-main-area -->
    #       <nav>...</nav> <!-- this is where we want to insert it -->
    #     </div> <!-- end of settings-modal -->
    # Let's find:
    #         </div>
    #       </div>
    #       
    #     </div>
    #     
    #     <!-- Volume HUD popup
    
    # Let's search for:
    #         </div>
    #       </div>
    #       
    #     </div>
    
    target_end_pattern = r'(</div>\s*<!--\s*Tab 9: My Vehicle\s*-->\s*</div>\s*</div>\s*</div>\s*</div>\s*<!--\s*Volume HUD)'
    # Wait, let's check the exact closing divs in the file around line 950-1020.
    # Let's write a robust search that finds the end of the options panel or the closing settings-main-area div.
    # The settings-main-area has:
    #       <div class="settings-main-area">
    #          ... all panel divs ...
    #       </div>
    
    # Let's find:
    #         </div> <!-- end of settings-tab-myvehicle -->
    #       </div> <!-- end of settings-main-area -->
    #       <!-- we place nav here -->
    #     </div> <!-- end of settings-modal -->
    
    # Let's view the end of index.html settings modal:
    # We can inspect the file around line 950.
    # Tab 9 ends at line 953.
    # Then line 955: </div> <!-- end of settings-main-area --> (wait, line 955 is </div>, line 956 is </div>)
    # Let's check:
    # Line 953: </div> <!-- settings-tab-myvehicle -->
    # Line 954: 
    # Line 955: </div> <!-- settings-main-area -->
    # Line 956: 
    # Line 957: </div> <!-- settings-modal -->
    
    # Let's replace the closing tag of settings-main-area:
    main_area_close = "<!-- Tab 9: My Vehicle -->\n        </div>\n        \n      </div>"
    if main_area_close in content:
        content = content.replace(main_area_close, main_area_close + "\n      \n      " + new_nav_block)
        print("Successfully relocated settings sidebar to the right side!")
    else:
        # Fallback: find </div>\n        \n      </div>\n      \n    </div>
        # and insert before the last </div>
        print("Target close tag not found exactly. Running fallback regex...")
        content = re.sub(
            r'(</div>\s*</div>\s*)(</div>\s*<!--\s*Volume HUD)',
            r'\1\n      ' + new_nav_block.replace('\\', '\\\\') + r'\n    \2',
            content,
            flags=re.DOTALL
        )
        print("Relocated via fallback regex.")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("index.html written successfully!")

if __name__ == "__main__":
    move_sidebar_right()
