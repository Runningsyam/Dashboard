def resize_columns():
    file_path = "styles.css"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find and replace grid-template-columns: 1.6fr 1fr;
    old_rule_1 = "grid-template-columns: 1.6fr 1fr;"
    new_rule_1 = "grid-template-columns: 1fr 1.5fr !important;"
    
    # We replace any occurrences of 1.6fr 1fr in active settings panels
    content = content.replace(old_rule_1, new_rule_1)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("styles.css columns resized successfully!")

if __name__ == "__main__":
    resize_columns()
