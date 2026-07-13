#include <iostream>
#include <windows.h>
#include <tchar.h>
#include <thread>
#include "libcurl"

bool cambiosDetectados = false;

void monitorear() {
    LPCTSTR directorioMonitoreado = _TEXT("C:\\Users\\nicom\\Test");
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

int main(){
    std::thread t1(monitorear);
    t1.join();

    std::string guardarCambios = "0";

    if(cambiosDetectados == true){
        std::cout << "Cambios detectados. Escriba 1 para guardar los cambios \n";
        std::cin >> guardarCambios;
        if(guardarCambios == 1){

        } else{
            return 
        }
    } else {
        std::cout << "No hay cambios detectados \n";
    }
    return 0;
}