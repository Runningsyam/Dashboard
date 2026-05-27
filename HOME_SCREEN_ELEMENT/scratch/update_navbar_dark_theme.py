def append_navbar_dark_theme_styles():
    file_path = "styles.css"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    dark_theme_navbar_styles = """
/* Keep bottom navigation bar and top status bar light-gray in dark theme with high contrast text/icons */
#dashboard.dark-theme .bottom-bar {
  background-color: #eaebed !important;
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
}

#dashboard.dark-theme .bottom-bar .back-home-btn {
  color: #5f6368 !important;
  background-color: rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

#dashboard.dark-theme .bottom-bar .back-home-btn:hover {
  background-color: rgba(0, 0, 0, 0.08) !important;
  color: var(--text-dark) !important;
}

#dashboard.dark-theme .bottom-bar .temp-val {
  color: #1f2022 !important; /* Force dark color for temperature values */
}

#dashboard.dark-theme .bottom-bar .temp-btn {
  color: #666 !important;
}

#dashboard.dark-theme .bottom-bar .temp-btn:hover {
  background-color: rgba(0, 0, 0, 0.08) !important;
  color: #1f2022 !important;
}

#dashboard.dark-theme .bottom-bar .climate-control {
  background-color: rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
}

#dashboard.dark-theme .bottom-bar .icon-btn img,
#dashboard.dark-theme .bottom-bar .fan-icon-btn img,
#dashboard.dark-theme .bottom-bar .autopilot-btn img {
  opacity: 0.65 !important;
  filter: none !important; /* Ensure icons remain dark gray */
}

#dashboard.dark-theme .bottom-bar .icon-btn:hover,
#dashboard.dark-theme .bottom-bar .fan-icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

#dashboard.dark-theme .bottom-bar .autopilot-btn.active img {
  opacity: 1 !important;
  filter: drop-shadow(0 0 4px #1a73e8) sepia(100%) hue-rotate(190deg) saturate(500%) !important;
}

/* Also sync top bar text contrast in dark theme */
#dashboard.dark-theme .top-bar {
  background-color: #eaebed !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

#dashboard.dark-theme .topbar-clock {
  color: #1f2022 !important; /* Force clock dark */
}

#dashboard.dark-theme .topbar-icon {
  color: #5f6368 !important; /* Force status icons dark */
}

#dashboard.dark-theme .topbar-icon.wifi-icon-btn.active {
  color: #1a73e8 !important; /* Keep wifi active blue visible */
}

#dashboard.dark-theme .topbar-center-msg {
  color: #666 !important; /* Force notification text dark */
}

#dashboard.dark-theme .topbar-profile-circle {
  color: #5f6368 !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}
"""

    content += dark_theme_navbar_styles
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("styles.css updated with light bottom/top bars in dark theme overrides!")

if __name__ == "__main__":
    append_navbar_dark_theme_styles()
