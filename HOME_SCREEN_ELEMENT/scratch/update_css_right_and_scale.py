def update_css_right_and_scale():
    file_path = "styles.css"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Restore right sidebar position border-left configuration
    old_sidebar = """.settings-sidebar.scrollable-tabs {
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

    new_sidebar = """.settings-sidebar.scrollable-tabs {
  width: 280px !important; /* Selection bar width */
  background-color: #f1f3f4 !important;
  border-left: 1px solid rgba(0, 0, 0, 0.06) !important; /* separating border on left side */
  border-right: none !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  padding: 24px 16px !important;
  gap: 20px !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
  scrollbar-width: none;
}"""

    content = content.replace(old_sidebar, new_sidebar)
    print("Repositioned sidebar border to left")

    # 2. Limit settings car image height to prevent clipping
    old_container = """.settings-car-container {
  position: relative;
  width: 100%;
  max-width: 550px;
  display: flex;
  justify-content: center;
  align-items: center;
}"""

    new_container = """.settings-car-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 550px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}"""

    content = content.replace(old_container, new_container)

    old_car_img = """.settings-car-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}"""

    new_car_img = """.settings-car-image {
  width: 100%;
  height: auto;
  max-width: 100%;
  max-height: 80% !important; /* Scale down to prevent bottom navigation bar overlap / crop */
  object-fit: contain;
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}"""

    content = content.replace(old_car_img, new_car_img)
    print("Applied height limit to car images")

    # 3. Scale up panel title
    old_panel_title = """.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 25px;
  letter-spacing: -0.3px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 12px;
}"""

    new_panel_title = """.panel-title {
  font-size: 28px !important; /* 40% larger (20 * 1.4 = 28) */
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 25px;
  letter-spacing: -0.3px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 12px;
}"""

    content = content.replace(old_panel_title, new_panel_title)

    # 4. Scale option texts (title, desc)
    old_setting_title = """.setting-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}"""

    new_setting_title = """.setting-title {
  font-size: 20px !important; /* 40% larger (14 * 1.4 = 19.6 -> 20) */
  font-weight: 600;
  color: var(--text-dark);
}"""

    content = content.replace(old_setting_title, new_setting_title)

    old_setting_desc = """.setting-desc {
  font-size: 11px;
  color: #777;
}"""

    new_setting_desc = """.setting-desc {
  font-size: 15.4px !important; /* 40% larger (11 * 1.4 = 15.4) */
  color: #777;
}"""

    content = content.replace(old_setting_desc, new_setting_desc)

    # 5. Scale toggle-switch (44x24 to 62x34, thumb 18 to 26, gap, transform 20 to 28)
    old_toggle_switch = """.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}"""

    new_toggle_switch = """.toggle-switch {
  position: relative;
  display: inline-block;
  width: 62px !important; /* 40% larger (44 * 1.4 = 61.6) */
  height: 34px !important; /* 40% larger (24 * 1.4 = 33.6) */
}"""

    content = content.replace(old_toggle_switch, new_toggle_switch)

    old_slider_round = """.slider-round {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 24px;
}"""

    new_slider_round = """.slider-round {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 34px !important; /* Rounded to match height */
}"""

    content = content.replace(old_slider_round, new_slider_round)

    old_slider_before = """.slider-round:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}"""

    new_slider_before = """.slider-round:before {
  position: absolute;
  content: "";
  height: 26px !important; /* 40% larger (18 * 1.4 = 25.2 -> 26) */
  width: 26px !important;
  left: 4px !important;
  bottom: 4px !important;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}"""

    content = content.replace(old_slider_before, new_slider_before)

    old_slider_checked = """input:checked + .slider-round:before {
  transform: translateX(20px);
}"""

    new_slider_checked = """input:checked + .slider-round:before {
  transform: translateX(28px) !important; /* Offset = width (62) - thumb (26) - left (4) - right (4) = 28 */
}"""

    content = content.replace(old_slider_checked, new_slider_checked)

    # 6. Scale control selector (Comfort/Standard/Sport)
    old_selector = """.control-selector {
  display: flex;
  background-color: #f0f2f5;
  padding: 3px;
  border-radius: 20px;
}"""

    new_selector = """.control-selector {
  display: flex;
  background-color: #f0f2f5;
  padding: 4px !important;
  border-radius: 28px !important;
}"""

    content = content.replace(old_selector, new_selector)

    old_option = """.selector-option {
  background: none;
  border: none;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  border-radius: 17px;
  cursor: pointer;
  transition: all 0.2s;
}"""

    new_option = """.selector-option {
  background: none;
  border: none;
  padding: 10px 24px !important;
  font-size: 17px !important; /* 40% larger (12 * 1.4 = 16.8 -> 17) */
  font-weight: 600;
  color: #666;
  border-radius: 24px !important;
  cursor: pointer;
  transition: all 0.2s;
}"""

    content = content.replace(old_option, new_option)

    # 7. Scale selector pills
    old_pill = """.selector-pill {
  display: flex;
  background-color: #f1f3f4;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 20px;
  gap: 4px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  width: 100%;
}"""

    new_pill = """.selector-pill {
  display: flex;
  background-color: #f1f3f4;
  padding: 6px !important;
  border-radius: 14px !important;
  margin-bottom: 20px;
  gap: 6px !important;
  border: 1px solid rgba(0, 0, 0, 0.02);
  width: 100%;
}"""

    content = content.replace(old_pill, new_pill)

    old_pill_option = """.pill-option {
  flex: 1;
  background: none;
  border: none;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #5f6368;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}"""

    new_pill_option = """.pill-option {
  flex: 1;
  background: none;
  border: none;
  padding: 14px 20px !important;
  font-size: 18px !important; /* 40% larger (13 * 1.4 = 18.2 -> 18) */
  font-weight: 600;
  color: #5f6368;
  border-radius: 10px !important;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px !important;
}"""

    content = content.replace(old_pill_option, new_pill_option)

    # 8. Scale control action btn
    old_action_btn = """.control-action-btn {
  background-color: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(26, 115, 232, 0.15);
}"""

    new_action_btn = """.control-action-btn {
  background-color: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 8px !important;
  padding: 12px 25px !important;
  font-size: 18.2px !important; /* 40% larger (13 * 1.4 = 18.2) */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(26, 115, 232, 0.15);
}"""

    content = content.replace(old_action_btn, new_action_btn)

    # 9. Scale driving mode card
    old_mode_card = """.mode-card {
  flex: 1;
  background-color: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}"""

    new_mode_card = """.mode-card {
  flex: 1;
  background-color: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px !important;
  padding: 22px !important;
  font-size: 20px !important; /* 40% larger (14 * 1.4 = 19.6 -> 20) */
  font-weight: 700;
  color: var(--text-dark);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}"""

    content = content.replace(old_mode_card, new_mode_card)

    # 10. Scale action card btn
    old_action_card = """.action-card-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
  width: 100%;
  text-align: left;
}"""

    new_action_card = """.action-card-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px !important;
  padding: 20px 25px !important;
  font-size: 18px !important; /* 40% larger (13 * 1.4 = 18.2 -> 18) */
  font-weight: 700;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px !important;
  width: 100%;
  text-align: left;
}"""

    content = content.replace(old_action_card, new_action_card)

    # 11. Scale power off card btn
    old_power_card = """.power-off-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #d32f2f;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 25px;
  width: 100%;
  box-sizing: border-box;
}"""

    new_power_card = """.power-off-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px !important;
  background-color: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px !important;
  padding: 20px !important;
  font-size: 20px !important; /* 40% larger (14 * 1.4 = 19.6 -> 20) */
  font-weight: 700;
  color: #d32f2f;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 35px !important;
  width: 100%;
  box-sizing: border-box;
}"""

    content = content.replace(old_power_card, new_power_card)

    # 12. Scale slider label row
    old_slider_label = """.slider-label-row {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #777;
  padding: 0 4px;
}"""

    new_slider_label = """.slider-label-row {
  display: flex;
  justify-content: space-between;
  margin-top: 8px !important;
  font-size: 15.4px !important; /* 40% larger (11 * 1.4 = 15.4) */
  font-weight: 600;
  color: #777;
  padding: 0 6px !important;
}"""

    content = content.replace(old_slider_label, new_slider_label)

    # 13. Scale tire pressures calibration controls
    old_tire_grid = """.tire-adjuster-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 15px;
}"""

    new_tire_grid = """.tire-adjuster-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px !important;
  margin-top: 20px !important;
}"""

    content = content.replace(old_tire_grid, new_tire_grid)

    old_tire_card = """.tire-control-card {
  background-color: #f8f9fa;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}"""

    new_tire_card = """.tire-control-card {
  background-color: #f8f9fa;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px !important;
  padding: 18px !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}"""

    content = content.replace(old_tire_card, new_tire_card)

    old_tire_label = """.tire-label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
}"""

    new_tire_label = """.tire-label {
  font-size: 16.8px !important; /* 40% larger (12 * 1.4 = 16.8) */
  font-weight: 600;
  color: #555;
}"""

    content = content.replace(old_tire_label, new_tire_label)

    old_tire_display = """.tire-val-display {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin-top: 2px;
}"""

    new_tire_display = """.tire-val-display {
  font-size: 25.2px !important; /* 40% larger (18 * 1.4 = 25.2) */
  font-weight: 700;
  color: var(--text-dark);
  margin-top: 4px !important;
}"""

    content = content.replace(old_tire_display, new_tire_display)

    old_tire_adjust_btn = """.tire-adjust-btn {
  background-color: white;
  border: 1px solid #ccc;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}"""

    new_tire_adjust_btn = """.tire-adjust-btn {
  background-color: white;
  border: 1px solid #ccc;
  width: 40px !important; /* 40% larger (28 * 1.4 = 39.2 -> 40) */
  height: 40px !important;
  border-radius: 6px !important;
  cursor: pointer;
  font-weight: bold;
  font-size: 20px !important; /* 40% larger (14 * 1.4 = 19.6 -> 20) */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}"""

    content = content.replace(old_tire_adjust_btn, new_tire_adjust_btn)

    # 14. Update dark theme border
    old_dark_sidebar = """#dashboard.dark-theme .settings-sidebar.scrollable-tabs {
  background-color: #16171a !important;
  border-right-color: rgba(255, 255, 255, 0.08) !important;
  border-left: none !important;
}"""

    new_dark_sidebar = """#dashboard.dark-theme .settings-sidebar.scrollable-tabs {
  background-color: #16171a !important;
  border-left-color: rgba(255, 255, 255, 0.08) !important;
  border-right: none !important;
}"""
    content = content.replace(old_dark_sidebar, new_dark_sidebar)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("styles.css written successfully with 40% scaled options and right sidebar alignment!")

if __name__ == "__main__":
    update_css_right_and_scale()
