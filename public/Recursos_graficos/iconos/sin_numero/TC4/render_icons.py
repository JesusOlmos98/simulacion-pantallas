#
#
#

file1 = open('TC4_ICON.h',  'r')
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
