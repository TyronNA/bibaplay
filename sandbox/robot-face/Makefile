# Mặt robot cho OLED 128x64. Dùng chung bản LVGL đã clone ở ../sensor-panel (không clone lại).
# `make -j8` rồi `./face`, hoặc `make sheet` để ra ảnh tất cả cảm xúc.
CC      ?= cc
LVGL    := ../sensor-panel/lvgl
FACE    := ../../firmware/boards/ares-bread
CFLAGS  := -O2 -I. -I$(FACE) -I$(LVGL)/include -I$(LVGL) $(shell sdl2-config --cflags) -I$(shell sdl2-config --prefix)/include -w
LDLIBS  := $(shell sdl2-config --libs) -lm
LV_SRC  := $(shell find $(LVGL)/src -name '*.c')
OBJS    := $(patsubst $(LVGL)/%.c,build/lvgl/%.o,$(LV_SRC)) build/face.o build/robot_face.o

face: $(OBJS)
	$(CC) -o $@ $^ $(LDLIBS)

build/lvgl/%.o: $(LVGL)/%.c lv_conf.h
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@
build/face.o: face.c $(FACE)/robot_face.h lv_conf.h
	@mkdir -p build
	$(CC) $(CFLAGS) -c $< -o $@
build/robot_face.o: $(FACE)/robot_face.c $(FACE)/robot_face.h lv_conf.h
	@mkdir -p build
	$(CC) $(CFLAGS) -c $< -o $@

sheet: face
	./face --sheet build/sheet.bmp && sips -s format png build/sheet.bmp --out sheet.png >/dev/null

clean:
	rm -rf build face sheet.png
.PHONY: sheet clean
