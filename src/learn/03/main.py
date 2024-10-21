# 两个文字，用空格隔开，比如：C语言 Python
a, b = input().split()

# 三个整数，用空格隔开，比如：1 3 5
n = input().split()
x = int(n[0])
y = int(n[1])
z = int(n[2])

# 四个小数，用空格隔开，比如：1.2 1.4 5.3 0.3
n = input().split()
a = float(n[0])
b = float(n[1])
c = float(n[2])
d = float(n[3])

# 使用 map 的简化写法
# 五个整数用空格隔开
a,b,c,d,e = map(int, input().split())

# 六个小数用空格隔开
a,b,c,d,e,f = map(float, input().split())