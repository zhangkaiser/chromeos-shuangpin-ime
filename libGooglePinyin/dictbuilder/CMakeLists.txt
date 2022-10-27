cmake_minimum_required(VERSION 3.10)

project(GooglePinyin)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(PUBLIC_HEADERS 
    ../dictbuilder.h
    ../dictdef.h
    ../dictlist.h
    ../dicttrie.h
    ../lpicache.h
    ../matrixsearch.h
    ../mystdlib.h
    ../ngram.h
    ../searchutility.h
    ../spellingtable.h
    ../spellingtrie.h
    ../splparser.h
    ../sync.h
    ../userdict.h
    ../utf16char.h
    ../utf16reader.h
)

set(PINYIN_SOURCES
    ../dictbuilder.cpp
    ../dictlist.cpp
    ../dicttrie.cpp
    ../lpicache.cpp
    ../matrixsearch.cpp
    ../mystdlib.cpp
    ../ngram.cpp
    ../searchutility.cpp
    ../spellingtable.cpp
    ../spellingtrie.cpp
    ../splparser.cpp
    ../sync.cpp
    ../userdict.cpp
    ../utf16char.cpp
    ../utf16reader.cpp
)

set(EXECUTABLE_NAME builder)

add_executable(${EXECUTABLE_NAME} ${PINYIN_SOURCES} ./pinyin_dictbuilder.cpp ${PUBLIC_HEADERS})

