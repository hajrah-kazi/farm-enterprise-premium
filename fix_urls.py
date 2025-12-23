import os

root_dir = r"c:\Users\uniqu\OneDrive\Desktop\Internship\farm-enterprise-premium\frontend\src"

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".js"):
            file_path = os.path.join(subdir, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content.replace("http://localhost:5000/api", "/api")
            
            if content != new_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated: {file_path}")
