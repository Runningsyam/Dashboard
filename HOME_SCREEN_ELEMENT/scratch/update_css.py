def update_css():
    file_path = "styles.css"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update font imports at the very beginning of the file
    old_import = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');"
    new_import = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Alex+Brush&display=swap');"
    content = content.replace(old_import, new_import)
    print("Replaced font import")

    # 2. Update .settings-sidebar.scrollable-tabs
    old_sidebar = """.settings-sidebar.scrollable-tabs {
  width: 280px !important; /* Increased by 60% for larger selection bar */
  background-color: #f1f3f4 !important;
  border-left: 1px solid rgba(0, 0, 0, 0.06);
  border-right: none !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  padding: 15px 0 !important;
  overflow-y: auto !important; /* SCROLLABLE! */
  box-sizing: border-box !important;
  scrollbar-width: none; /* Hide standard scrollbars */
}"""

    new_sidebar = """.settings-sidebar.scrollable-tabs {
  width: 280px !important; /* Selection bar width */
  background-color: #f1f3f4 !important;
  border-right: 1px solid rgba(0, 0, 0, 0.06) !important;
  border-left: none !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  padding: 24px 16px !important; /* Spacious padding for vertical gaps */
  gap: 20px !important; /* Increased gap as requested */
  overflow-y: auto !important;
  box-sizing: border-box !important;
  scrollbar-width: none;
}"""

    content = content.replace(old_sidebar, new_sidebar)
    print("Updated scrollable tabs sidebar styles")

    # 3. Update .settings-tab
    old_tab = """.settings-tab {
  background: none !important;
  border: none !important;
  text-align: left !important;
  padding: 18px 24px !important; /* Increased padding */
  font-size: 15px !important; /* Larger text for driving glanceability */
  font-weight: 600 !important;
  color: #5f6368 !important;
  cursor: pointer !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  align-items: center !important;
  gap: 16px !important; /* Increased spacing */
  border-right: 4px solid transparent !important; /* Visual indicator on right edge */
  border-left: none !important;
  width: 100% !important;
}"""

    new_tab = """.settings-tab {
  background: none !important;
  border: none !important;
  text-align: left !important;
  padding: 16px 20px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #5f6368 !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  border-radius: 8px !important; /* Rounded pill styling */
  border-right: 4px solid transparent !important;
  border-left: none !important;
  width: 100% !important;
  box-sizing: border-box !important;
}"""

    content = content.replace(old_tab, new_tab)
    print("Updated tab default styles")

    # 4. Update .settings-tab.active
    old_tab_active = """.settings-tab.active {
  color: #1a73e8 !important;
  background-color: #ffffff !important; /* Active tab is white background */
  border-right: 4px solid #1a73e8 !important; /* Blue vertical line on right edge */
  border-left: none !important;
  font-weight: 700 !important;
}"""

    new_tab_active = """.settings-tab.active {
  color: #1a73e8 !important;
  background-color: rgba(26, 115, 232, 0.08) !important; /* Soft transparent blue wash */
  border-right: 4px solid #1a73e8 !important; /* Blue vertical accent line on right edge */
  border-left: none !important;
  font-weight: 700 !important;
}"""

    content = content.replace(old_tab_active, new_tab_active)
    print("Updated active tab indicator styles")

    # 5. Add .blend-image-edges and brand signature styles to CSS
    additional_styles = """
/* HCI Edge Vignette blend class */
.blend-image-edges {
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%) !important;
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%) !important;
}

/* Juice brand signature section */
.brand-version-container {
  padding: 10px 0 25px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 25px;
}
.brand-signature {
  font-family: 'Alex Brush', 'Caveat', cursive, sans-serif;
  font-size: 64px;
  font-weight: 400;
  color: var(--text-dark);
  line-height: 1;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
.brand-version-line {
  font-size: 13.5px;
  color: #777;
  line-height: 1.6;
  font-weight: 500;
  font-family: var(--font-family);
}
"""
    content += additional_styles
    print("Added new CSS rules for edge blending and Juice signature")

    # 6. Update dark theme overrides
    old_dark_sidebar = """#dashboard.dark-theme .settings-sidebar.scrollable-tabs {
  background-color: #16171a !important;
  border-left-color: rgba(255, 255, 255, 0.08) !important;
}"""

    new_dark_sidebar = """#dashboard.dark-theme .settings-sidebar.scrollable-tabs {
  background-color: #16171a !important;
  border-right-color: rgba(255, 255, 255, 0.08) !important;
  border-left: none !important;
}"""
    content = content.replace(old_dark_sidebar, new_dark_sidebar)

    old_dark_active = """#dashboard.dark-theme .settings-tab.active {
  background-color: #1d1e22 !important;
  color: #29b6f6 !important;
  border-right-color: #29b6f6 !important;
}"""

    new_dark_active = """#dashboard.dark-theme .settings-tab.active {
  background-color: rgba(41, 182, 246, 0.15) !important;
  color: #29b6f6 !important;
  border-right-color: #29b6f6 !important;
}
#dashboard.dark-theme .brand-version-container {
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
}
#dashboard.dark-theme .brand-version-line {
  color: #9aa0a6 !important;
}"""
    content = content.replace(old_dark_active, new_dark_active)
    print("Synced dark theme overrides")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("styles.css written successfully!")

if __name__ == "__main__":
    update_css()
