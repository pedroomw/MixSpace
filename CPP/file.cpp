#include <iostream>
#include <windows.h>
#include <tchar.h>
#include <curl/curl.h>
#include <thread>

bool cambiosDetectados = false;

void monitorear() {
    LPCTSTR directorioMonitoreado = _TEXT("C:\\Users\\49552421\\Downloads\\Test");
    HANDLE handleDeCambios = FindFirstChangeNotification(
        directorioMonitoreado,
        FALSE,
        FILE_NOTIFY_CHANGE_LAST_WRITE
    );  

    DWORD resultado = ::WaitForSingleObject(
        handleDeCambios,
        INFINITE
    );

    if(resultado == WAIT_OBJECT_0){
        std::cout<<"Cambios encontrados \n";
        cambiosDetectados = true;
    };

    if(resultado == WAIT_FAILED){
        std::cout<<"El proceso de busqueda de cambios falló \n";
    };
}

void subirCambios() {
    CURL *curl;
    CURLcode res;

    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();

    if(curl) {
        curl_mime *mime = nullptr;
        curl_mimepart *part = nullptr;

        mime = curl_mime_init(curl);

        // 1. Añadir un archivo adjunto
        part = curl_mime_addpart(mime);
        curl_mime_name(part, "file"); // Nombre del campo en el formulario
        curl_mime_filedata(part, "documento.txt"); // Ruta del archivo local

        // 2. Añadir un campo de texto normal
        part = curl_mime_addpart(mime);
        curl_mime_name(part, "usuario");
        curl_mime_data(part, "JuanPerez", CURL_ZERO_TERMINATED);

        // Configurar la URL de destino
        curl_easy_setopt(curl, CURLOPT_URL, "https://tuservidor.com");
        
        // Asignar el cuerpo multipart a la solicitud
        curl_easy_setopt(curl, CURLOPT_MIMEPOST, mime);

        // Ejecutar la solicitud
        res = curl_easy_perform(curl);

        // Comprobar errores
        if(res != CURLE_OK) {
            std::cerr << "Error en la petición: " << curl_easy_strerror(res) << std::endl;
        } else {
            std::cout << "¡Petición enviada con éxito!" << std::endl;
        }

        // Limpiar recursos
        curl_easy_cleanup(curl);
        curl_mime_free(mime);
    }

    curl_global_cleanup();
    return 0;
}


int main(){
    std::thread t1(monitorear);
    t1.join();

    std::string guardarCambios = "0";

    if(cambiosDetectados == true){
        std::cout << "Cambios detectados. Escriba 1 para guardar los cambios \n";
        std::cin >> guardarCambios;
        if(guardarCambios == "1"){
            std::cout << "Guardando cambios...";
            std::thread t2(subirCambios)
        }
    } else {
        std::cout << "No hay cambios detectados \n";
    }
    return 0;
}