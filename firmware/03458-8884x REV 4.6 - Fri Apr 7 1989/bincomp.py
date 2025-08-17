import os

print("Combine tool for 6 FW ROMs into 1 512KB ROM, hardcoded filenames in code\r\n (C) 2016 xDevs.com https://xdevs.com/fix/hp3458a\r\n Output is generated into output_rev9.bin")
with open('03458-88840 DC 8920 REV 4.6 U-110.bin','rb') as a:
    with open('03458-88841 DC 8920 REV 4.6 U-111.bin','rb') as b:
        with open('03458-88842 DC 8920 REV 4.6 U-112.bin','rb') as c:
            with open('03458-88843 DC 8920 REV 4.6 U-113.bin','rb') as d:
                with open('03458-88844 DC 8920 REV 4.6 U-114.bin','rb') as e:
                    with open('03458-88845 DC 8920 REV 4.6 U-115.bin','rb') as f:
                        with open('output_rev46.bin','wb') as x:
                            for cnt in range(0, 65536):
                                x.write(b.read(1) + a.read(1))
                            for cnt in range(0, 65536):
                                x.write(d.read(1) + c.read(1))
                            for cnt in range(0, 65536):
                                x.write(f.read(1) + e.read(1))
