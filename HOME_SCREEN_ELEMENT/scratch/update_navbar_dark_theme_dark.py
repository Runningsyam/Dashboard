def replace_navbar_styles_with_dark():
    file_path = "styles.css"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Locate the old block we appended
    old_block_marker = "/* Keep bottom navigation bar and top status bar light-gray in dark theme with high contrast text/icons */"
    
    # We find where this marker starts and replace everything from there to the end
    idx = content.find(old_block_marker)
    if idx == -1:
        print("Marker not found, will append to the end.")
        new_content = content
    else:
        new_content = content[:idx]
        print("Found old navbar block, replacing it...")

    new_dark_theme_navbar_styles = """/* Keep bottom navigation bar and top status bar dark-gray in dark theme but make text and icons white */
#dashboard.dark-theme .bottom-bar {
  background-color: #16171a !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

#dashboard.dark-theme .bottom-bar .back-home-btn {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

#dashboard.dark-theme .bottom-bar .back-home-btn:hover {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
}

#dashboard.dark-theme .bottom-bar .back-home-btn img {
  filter: brightness(0) invert(1) !important;
  opacity: 0.95 !important;
}

#dashboard.dark-theme .bottom-bar .temp-val {
  color: #ffffff !important; /* White temperature values */
}

#dashboard.dark-theme .bottom-bar .temp-btn {
  color: #ffffff !important;
}

#dashboard.dark-theme .bottom-bar .temp-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

#dashboard.dark-theme .bottom-bar .climate-control {
  background-color: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

#dashboard.dark-theme .bottom-bar .icon-btn img,
#dashboard.dark-theme .bottom-bar .fan-icon-btn img {
  opacity: 0.95 !important;
  filter: brightness(0) invert(1) !important; /* Convert dark gray icons to white */
}

#dashboard.dark-theme .bottom-bar .autopilot-btn img {
  opacity: 0.95 !important;
  filter: brightness(0) invert(1) !important; /* Convert autopilot icon to white by default */
}

#dashboard.dark-theme .bottom-bar .icon-btn:hover,
#dashboard.dark-theme .bottom-bar .fan-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

#dashboard.dark-theme .bottom-bar .autopilot-btn.active img {
  opacity: 1 !important;
  filter: drop-shadow(0 0 4px #29b6f6) sepia(100%) hue-rotate(190deg) saturate(500%) !important; /* Restore active blue highlight */
}

/* Also sync top bar text contrast in dark theme */
#dashboard.dark-theme .top-bar {
  background-color: #16171a !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

#dashboard.dark-theme .topbar-clock {
  color: #ffffff !important; /* White clock */
}

#dashboard.dark-theme .topbar-icon {
  color: #ffffff !important; /* White status icons */
  opacity: 0.9 !important;
}

#dashboard.dark-theme .topbar-icon.wifi-icon-btn.active {
  color: #29b6f6 !important; /* Cyan-blue active wifi */
  opacity: 1 !important;
}

#dashboard.dark-theme .topbar-center-msg {
  color: rgba(255, 255, 255, 0.7) !important; /* White center text */
}

#dashboard.dark-theme .topbar-profile-circle {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}
"""

    new_content += new_dark_theme_navbar_styles
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("styles.css updated with dark navigation and top bars and white icons in dark theme!")

if __name__ == "__main__":
    replace_navbar_styles_with_dark()
