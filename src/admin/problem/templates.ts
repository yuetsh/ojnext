export const cTemplate = `//PREPEND BEGIN
#include <stdio.h>
//PREPEND END

//TEMPLATE BEGIN
int add(int a, int b) {
  // 请填空
  return ___________;
}
//TEMPLATE END

//APPEND BEGIN
int main() {
  printf("%d", add(1, 2));
  return 0;
}
//APPEND END`

export const cppTemplate = `//PREPEND BEGIN
#include <iostream>
//PREPEND END

//TEMPLATE BEGIN
int add(int a, int b) {
  // 请填空
  return ___________;
}
//TEMPLATE END

//APPEND BEGIN
int main() {
  std::cout << add(1, 2);
  return 0;
}
//APPEND END`

export const blankTemplate = `//PREPEND BEGIN
//PREPEND END

//TEMPLATE BEGIN
//TEMPLATE END

//APPEND BEGIN
//APPEND END`
