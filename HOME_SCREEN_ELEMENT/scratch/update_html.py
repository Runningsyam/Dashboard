import re

def update_html():
    file_path = "index.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove the old navigation bar at the bottom
    # We locate the old nav block using regex and remove it.
    old_nav_pattern = r'<!-- RIGHT SIDEBAR NAVIGATION: Scrollable Tab List -->\s*<nav class="settings-sidebar scrollable-tabs" id="settings-sidebar">.*?</nav>'
    content, count = re.subn(old_nav_pattern, "", content, flags=re.DOTALL)
    print(f"Removed old nav: {count} matches")

    # 2. Insert the new navigation bar at the top of settings-modal
    new_nav = """<!-- LEFT SIDEBAR NAVIGATION: Scrollable Tab List -->
      <nav class="settings-sidebar scrollable-tabs" id="settings-sidebar">
        <!-- Shortcuts -->
        <button class="settings-tab active" onclick="switchSettingsTabNew(event, 'shortcut')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><circle cx="8" cy="9" r="2" fill="currentColor"></circle><circle cx="16" cy="15" r="2" fill="currentColor"></circle></svg>
          <span>Shortcuts</span>
        </button>
        <!-- Vehicle Controls -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'control')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="8" rx="2"></rect><circle cx="7" cy="19" r="2"></circle><circle cx="17" cy="19" r="2"></circle><path d="M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4"></path></svg>
          <span>Vehicle Controls</span>
        </button>
        <!-- Driving -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'driving')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <circle cx="12" cy="12" r="2.5"></circle>
            <line x1="12" y1="14.5" x2="12" y2="21"></line>
            <line x1="9.5" y1="12" x2="3" y2="12"></line>
            <line x1="14.5" y1="12" x2="21" y2="12"></line>
          </svg>
          <span>Driving</span>
        </button>
        <!-- Lights -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'light')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="21" x2="14" y2="21"></line></svg>
          <span>Lights</span>
        </button>
        <!-- Driver Assist -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'assist')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="2" x2="4" y2="22"></line>
            <line x1="20" y1="2" x2="20" y2="22"></line>
            <rect x="8" y="9" width="8" height="7" rx="1"></rect>
            <rect x="7" y="10" width="1" height="4" rx="0.5"></rect>
            <rect x="16" y="10" width="1" height="4" rx="0.5"></rect>
            <path d="M9 11h6v-1a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1z"></path>
          </svg>
          <span>Driver Assist</span>
        </button>
        <!-- Voice Assistant -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'voice')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="7"></circle>
            <circle cx="16" cy="16" r="4.5"></circle>
          </svg>
          <span>Voice Assistant</span>
        </button>
        <!-- Display -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'display')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span>Display</span>
        </button>
        <!-- Sound Settings -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'connect')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span>Sound Settings</span>
        </button>
        <!-- My Vehicle -->
        <button class="settings-tab" onclick="switchSettingsTabNew(event, 'myvehicle')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>My Vehicle</span>
        </button>
      </nav>

      <!-- LEFT AREA: Car Graphic & Options Controls -->
      <div class="settings-main-area">"""

    target_modal_header = r'<!-- Vehicle Settings Modal -->\s*<div class="modal-window settings-modal" id="settings-modal">\s*<!-- LEFT AREA: Car Graphic & Options Controls -->\s*<div class="settings-main-area">'
    content, count = re.subn(target_modal_header, '<!-- Vehicle Settings Modal -->\n    <div class="modal-window settings-modal" id="settings-modal">\n      \n      ' + new_nav, content, flags=re.DOTALL)
    print(f"Inserted new nav layout: {count} matches")

    # 3. Replace image references
    content = content.replace('src="./car top corner view.png"', 'src="./car_top_corner_view_transparent.png"')
    content = content.replace('src="./settings-car.png"', 'src="./settings-car_transparent.png"')
    print("Replaced transparent image paths")

    # 4. Add edge blend class to Display tab image
    content = content.replace(
        'src="./car central panel.png" alt="Vehicle Central Panel View" class="settings-car-image"',
        'src="./car central panel.png" alt="Vehicle Central Panel View" class="settings-car-image blend-image-edges"'
    )
    print("Added edge blend class to Display tab")

    # 5. Replace "My Vehicle" option panel headers with "Juice" branding
    old_myvehicle_header = """            <h3 class="panel-title">My Vehicle</h3>
            
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Software Version</span>
                <span class="setting-desc">Current OS configuration</span>
              </div>
              <strong style="color: var(--text-dark); font-size: 14px;">v12.2026.5 (Standard)</strong>
            </div>"""
            
    new_myvehicle_header = """            <div class="brand-version-container">
              <div class="brand-signature">Juice</div>
              <div class="brand-version-line">Current version : Juice Auto t 1.2.3</div>
              <div class="brand-version-line">Isa Map Version : N.J6A9887002</div>
            </div>"""
            
    content = content.replace(old_myvehicle_header, new_myvehicle_header)
    print("Updated My Vehicle branding and version details")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("index.html written successfully!")

if __name__ == "__main__":
    update_html()
