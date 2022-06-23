cmake_minimum_required(VERSION 3.10)

project(GooglePinyin)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(PUBLIC_HEADERS 
    ./atomdictbase.h
    ./dictbuilder.h
    ./dictdef.h
    ./dictlist.h
    ./dicttrie.h
    ./lpicache.h
    ./matrixsearch.h
    ./mystdlib.h
    ./ngram.h
    ./pinyinime.h
    ./searchutility.h
    ./spellingtable.h
    ./spellingtrie.h
    ./splparser.h
    ./sync.h
    ./userdict.h
    ./utf16char.h
    ./utf16reader.h
)

set(PINYIN_SOURCES
    ./dictbuilder.cpp
    ./dictlist.cpp
    ./dicttrie.cpp
    ./lpicache.cpp
    ./matrixsearch.cpp
    ./mystdlib.cpp
    ./ngram.cpp
    ./pinyinime.cpp
    ./searchutility.cpp
    ./spellingtable.cpp
    ./spellingtrie.cpp
    ./splparser.cpp
    ./sync.cpp
    ./userdict.cpp
    ./utf16char.cpp
    ./utf16reader.cpp
)

set(STATIC_LIB ${PROJECT_NAME})
add_library(${STATIC_LIB} STATIC ${PUBLIC_HEADERS} ${PINYIN_SOURCES})

set_target_properties(${STATIC_LIB} PROPERTIES OUTPUT_NAME ${STATIC_LIB})