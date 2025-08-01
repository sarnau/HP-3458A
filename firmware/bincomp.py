import os

print("Combine tool for 6 FW ROMs into 1 512KB ROM, hardcoded filenames in code\r\n (C) 2016 xDevs.com https://xdevs.com/fix/hp3458a\r\n Output is generated into output_rev9.bin")
with open('03458_88890_061108_rev9_u110.bin','rb') as a:
    with open('03458_88891_061108_rev9_u111.bin','rb') as b:
        with open('03458_88892_061108_rev9_u112.bin','rb') as c:
            with open('03458_88893_061108_rev9_u113.bin','rb') as d:
                with open('03458_88894_061108_rev9_u114.bin','rb') as e:
                    with open('03458_88895_061108_rev9_u115.bin','rb') as f:
                        with open('output_rev9.bin','wb') as x:
                            for cnt in range(0, 65536):
                                x.write(b.read(1) + a.read(1))
                            for cnt in range(0, 65536):
                                x.write(d.read(1) + c.read(1))
                            for cnt in range(0, 65536):
                                x.write(f.read(1) + e.read(1))
