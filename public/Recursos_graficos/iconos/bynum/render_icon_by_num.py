#
#
#
import glob, os
import matplotlib.pyplot as plt
            
n_icon = input("Numero de icono:")
cnt_iconos = 0
fig, axs = plt.subplots(15,10)
cnt_plots = 0

if n_icon == "0":
    print("drawing all icons")
    
    for entry in os.scandir("."):
        if entry.is_dir():
            try:
                #os.chdir( entry.name )
                for file in glob.glob(entry.name+"/*.c"):

                    file1 = open(file,  'r')


                    lines = file1.readlines()
                    file1.close()
                    
                    estado = 0
                    cnt_col = 0
                    str_fila = ""
                    data = []
                    cnt_filas = 0

                    for line in lines:
                        if ("D4D_DECLARE_IMG_HEADER" in line) and (estado==0):
                            # Nueva declaracion de icono encontrada
                            campos = line.split(",")
                            #print( campos )
                            anchura = int(campos[1])
                            altura = int(campos[2])
                            estado = 1
                    
                        if estado == 1:
                            # Ya tenemos las dimensiones, esperamos al /* Data */
                            if "/* Data */" in line:
                                # La siguiente linea ya sn los datos
                                estado = 2
                                cnt_col = 0
                 
                        if estado == 2:
                            
                            if ", 0x" in line:
                                # Estamos en linea de datos
                                bytes = line.split(",")
                                for byte in bytes:
                                    if len(byte) > 3:
                                        int_byte = int(byte,  16)
                                        #print(int_byte)
                                        for i in range(8):
                                            if (int_byte & 0x80) == 0:
                                                data.append(0)
                                            else:
                                                data.append(1)

                                            cnt_col += 1
                                            int_byte <<= 1
                                            if cnt_col == anchura:
                                                cnt_col = 0


                    print("icono num:"+entry.name+",tamanyo:"+str(anchura)+"x"+str(altura))
                    array = []
                    for i in range(altura):
                        array.append( data[i*anchura:(i+1)*anchura] )


                    f = int(cnt_plots / 10)
                    c = cnt_plots % 10
                    axs[ f, c].imshow(array)
                    cnt_plots += 1
                    estado = 0
                    
                    #plt.imshow(array)
                    
                    
                   
            except:
                print("Error accessing dir"+entry.name)

    plt.show()
    
else:
    file1 = ""
    for entry in os.scandir("."):
        if entry.name.startswith(n_icon+'_') and entry.is_dir():
            os.chdir( entry.name )
            for file in glob.glob("*.c"):
                file1 = open(file,  'r')

    if file1 == "":
        print("No se ha añadido ese icono para pantallas monocromo")
        exit()
        
    lines = file1.readlines()
    estado = 0
    cnt_col = 0
    str_fila = ""

    for line in lines:
        if "D4D_DECLARE_IMG_HEADER" in line:
            # Nueva declaracion de icono encontrada
            campos = line.split(",")
            #print( campos )
            anchura = int(campos[1])
            altura = int(campos[2])
            print( line )
            estado = 1
        
        if estado == 1:
            # Ya tenemos las dimensiones, esperamos al /* Data */
            if "/* Data */" in line:
                # La siguiente linea ya sn los datos
                estado = 2
                cnt_col = 0
                
        
        if estado == 2:
            if ", 0x" in line:
                # Estamos en linea de datos
                bytes = line.split(",")
                for byte in bytes:
                    if len(byte) > 3:
                        int_byte = int(byte,  16)
                        #print(int_byte)
                        for i in range(8):
                            if (int_byte & 0x80) == 0:
                                str_fila += "░"
                            else:
                                str_fila += "▓"
                            cnt_col += 1
                            int_byte <<= 1
                            if cnt_col == anchura:
                                print(str_fila)
                                str_fila = ""
                                cnt_col = 0
                                
    file1.close()
