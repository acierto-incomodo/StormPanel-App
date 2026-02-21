import os

# Configuración de las URLs
OLD_URL = "http://stormpanel.mooo.com:23333"
NEW_URL = "http://myjoncraft.mooo.com:23333"
ROOT_DIR = "."  # Directorio actual

def replace_links(filepath):
    try:
        # Intentamos leer el archivo como UTF-8
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Si encontramos el enlace antiguo, lo reemplazamos
        if OLD_URL in content:
            new_content = content.replace(OLD_URL, NEW_URL)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Enlace actualizado en: {filepath}")
            
    except (UnicodeDecodeError, PermissionError):
        # Ignoramos archivos que no sean de texto o no tengamos permisos
        pass
    except Exception as e:
        print(f"Error leyendo {filepath}: {e}")

def main():
    print("Iniciando reemplazo de enlaces...")
    # Recorremos todos los directorios y archivos
    for subdir, dirs, files in os.walk(ROOT_DIR):
        # Opcional: Ignorar carpeta .git para optimizar
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            # Evitamos que el script se lea a sí mismo
            if file == "update_links.py":
                continue
                
            filepath = os.path.join(subdir, file)
            replace_links(filepath)
            
    print("Proceso finalizado.")

if __name__ == "__main__":
    main()
