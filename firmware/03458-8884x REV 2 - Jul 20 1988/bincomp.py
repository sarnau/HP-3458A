import os

print("Combine tool for 6 FW ROMs into 1 512KB ROM, hardcoded filenames in code\r\n (C) 2016 xDevs.com https://xdevs.com/fix/hp3458a\r\n Output is generated into output_rev9.bin")
with open('03458-88820_r2.bin','rb') as a:
    with open('03458-88821_r2.bin','rb') as b:
        with open('03458-88822_r2.bin','rb') as c:
            with open('03458-88823_r2.bin','rb') as d:
                with open('03458-88824_r2.bin','rb') as e:
                    with open('03458-88825_r2.bin','rb') as f:
                        with open('output_rev2.bin','wb') as x:
                            for cnt in range(0, 65536):
                                x.write(b.read(1) + a.read(1))
                            for cnt in range(0, 65536):
                                x.write(d.read(1) + c.read(1))
                            for cnt in range(0, 65536):
                                x.write(f.read(1) + e.read(1))
