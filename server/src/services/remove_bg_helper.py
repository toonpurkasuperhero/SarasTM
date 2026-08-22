# server/src/services/remove_bg_helper.py
import sys
from rembg import remove, new_session

def main():
    if len(sys.argv) < 3:
        print("Error: Missing arguments. Usage: remove_bg_helper.py <input_path> <output_path>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        session = new_session("u2net_cloth_seg")
        with open(input_path, 'rb') as f:
            img_data = f.read()
            
        output_data = remove(img_data, session=session, cloth_category="full")
        
        with open(output_path, 'wb') as f:
            f.write(output_data)
            
        print("Success")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
