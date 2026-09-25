# Build LVGL + UI bằng cc, không cần cmake. `make -j8` rồi `./panel` hoặc `make shot`.
CC      ?= cc
CFLAGS  := -O2 -I. -Ilvgl/include -Ilvgl $(shell sdl2-config --cflags) -I$(shell sdl2-config --prefix)/include -w
LDLIBS  := $(shell sdl2-config --libs) -lm -framework IOKit -framework CoreFoundation
LV_SRC  := $(shell find lvgl/src -name '*.c')
OBJS    := $(patsubst %.c,build/%.o,$(LV_SRC) main.c sensors_mac.c)

panel: $(OBJS)
	$(CC) -o $@ $^ $(LDLIBS)

build/main.o build/sensors_mac.o: sensors.h
build/%.o: %.c lv_conf.h
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

shot: panel
	./panel --shot build/shot.bmp && sips -s format png build/shot.bmp --out shot.png >/dev/null

clean:
	rm -rf build panel shot.png
.PHONY: shot clean
