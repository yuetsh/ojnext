遇到以下情况：

## 输入两个整数，用空格隔开。比如：10 20

写法如下：

```py
n = input().split()

a = int(n[0])
b = int(n[1])
```


## 要是小数。比如：2.33 5.18

写法如下：

```py
n = input().split()

a = float(n[0])
b = float(n[1])
```